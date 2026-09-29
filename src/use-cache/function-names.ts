import { existsSync, promises } from "node:fs";
import path from "node:path";
import { getServerDistDir } from "../utils/server-dist-dir";

export type UseCacheFunctionInfo = {
	name: string;
	/** source file, relative to the project (or monorepo) root */
	file?: string;
};

const NAMES_CACHE_SYMBOL = Symbol.for("next-cache-toolbar.use-cache-names");

type NamesCache = {
	/** chunk path -> mtime of the version that was already scanned */
	scannedChunks: Map<string, number>;
	names: Map<string, string>;
};

const globalRef = globalThis as typeof globalThis & {
	[NAMES_CACHE_SYMBOL]?: NamesCache;
};

const getNamesCache = () => {
	globalRef[NAMES_CACHE_SYMBOL] ??= {
		scannedChunks: new Map(),
		names: new Map(),
	};
	return globalRef[NAMES_CACHE_SYMBOL];
};

type ServerReferenceManifest = {
	node?: Record<string, { filename?: string; exportedName?: string }>;
};

const readManifest = async (serverDir: string) => {
	try {
		const content = await promises.readFile(
			path.join(serverDir, "server-reference-manifest.json"),
			"utf8",
		);
		return (JSON.parse(content) as ServerReferenceManifest).node ?? {};
	} catch {
		return {};
	}
};

const listJsFiles = async (directory: string): Promise<string[]> => {
	if (!existsSync(directory)) {
		return [];
	}
	const dirents = await promises.readdir(directory, {
		withFileTypes: true,
		recursive: true,
	});
	return dirents
		.filter((dirent) => dirent.isFile() && dirent.name.endsWith(".js"))
		.map((dirent) => path.join(dirent.parentPath ?? dirent.path, dirent.name));
};

// The Next.js compiler turns every "use cache" function into
//   registerServerReference($$RSC_SERVER_CACHE_0, "<id>", null);
//   Object["defineProperty"]($$RSC_SERVER_CACHE_0, "name", { value: "<original name>" });
const FUNCTION_NAME_PATTERN =
	/registerServerReference\W*\(\s*(\$\$RSC_SERVER_CACHE_\d+)\s*,\s*"([0-9a-f]+)"[^;]*;\s*Object(?:\["defineProperty"\]|\.defineProperty)\(\s*\1\s*,\s*"name"\s*,\s*\{\s*value:\s*"([^"]*)"/g;

const scanChunksForNames = async (serverDir: string) => {
	const cache = getNamesCache();
	const chunks = [
		...(await listJsFiles(path.join(serverDir, "chunks"))),
		...(await listJsFiles(path.join(serverDir, "app"))),
	];
	for (const chunk of chunks) {
		try {
			const { mtimeMs } = await promises.stat(chunk);
			if (cache.scannedChunks.get(chunk) === mtimeMs) {
				continue;
			}
			cache.scannedChunks.set(chunk, mtimeMs);
			const content = await promises.readFile(chunk, "utf8");
			if (!content.includes("$$RSC_SERVER_CACHE_")) {
				continue;
			}
			for (const match of content.matchAll(FUNCTION_NAME_PATTERN)) {
				const [, , id, name] = match;
				if (id && name) {
					cache.names.set(id, name);
				}
			}
		} catch {
			// chunks can be removed by the compiler while we are reading them
		}
	}
};

/**
 * Maps "use cache" function ids to their names and source files, using the
 * server reference manifest and the compiled server chunks. Best effort: ids
 * that cannot be resolved are left out.
 */
export const resolveUseCacheFunctions = async (
	distDir: string,
	functionIds: string[],
) => {
	const serverDir = path.join(getServerDistDir(distDir), "server");
	const cache = getNamesCache();

	if (functionIds.some((id) => !cache.names.has(id))) {
		await scanChunksForNames(serverDir);
	}

	const manifest = await readManifest(serverDir);
	const result = new Map<string, UseCacheFunctionInfo>();
	for (const id of functionIds) {
		const reference = manifest[id];
		const exportedName = reference?.exportedName?.startsWith(
			"$$RSC_SERVER_CACHE_",
		)
			? undefined
			: reference?.exportedName;
		const name = cache.names.get(id) ?? exportedName;
		if (name || reference?.filename) {
			result.set(id, { name: name ?? "anonymous", file: reference?.filename });
		}
	}
	return result;
};
