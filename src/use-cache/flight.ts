/**
 * Minimal React Flight (RSC payload) decoder used to display "use cache" values.
 *
 * "use cache" entries store the serialized return value as a Flight stream. The
 * real decoder (`react-server-dom-webpack/client`) needs Next.js internals and
 * client manifests, while the toolbar only needs a readable preview, so this
 * decoder turns rows into plain JSON: references are resolved, dates become ISO
 * strings, React elements become `{ type, key, props }` objects and client
 * components are shown by their export name.
 *
 * Row format: `<hex id>:<tag?><json>\n`, or `<hex id>:<tag><hex length>,<bytes>`
 * for text and typed array rows.
 */

type Row = { tag: string; payload: string };

const BINARY_ROW_TAGS = new Set("TAOoUSsLlGgMmVb");

const textDecoder = new TextDecoder();

const COLON = 0x3a;
const COMMA = 0x2c;
const NEW_LINE = 0x0a;

const parseRows = (bytes: Uint8Array) => {
	const rows = new Map<number, Row[]>();
	let index = 0;

	while (index < bytes.length) {
		const colonIndex = bytes.indexOf(COLON, index);
		if (colonIndex === -1) {
			break;
		}
		const idText = textDecoder.decode(bytes.subarray(index, colonIndex));
		// rows like `:N<timestamp>` or `:W[...]` (dev only) have no id
		const id = idText === "" ? -1 : Number.parseInt(idText, 16);
		const tag = String.fromCharCode(bytes[colonIndex + 1] ?? 0);

		let payload: string;
		if (BINARY_ROW_TAGS.has(tag)) {
			const commaIndex = bytes.indexOf(COMMA, colonIndex);
			const length = Number.parseInt(
				textDecoder.decode(bytes.subarray(colonIndex + 2, commaIndex)),
				16,
			);
			payload = textDecoder.decode(
				bytes.subarray(commaIndex + 1, commaIndex + 1 + length),
			);
			index = commaIndex + 1 + length;
		} else {
			let lineEnd = bytes.indexOf(NEW_LINE, colonIndex);
			if (lineEnd === -1) {
				lineEnd = bytes.length;
			}
			const line = textDecoder.decode(bytes.subarray(colonIndex + 1, lineEnd));
			index = lineEnd + 1;
			// JSON never starts with an uppercase letter, so it has to be a row tag
			if (/^[A-Z]/.test(line)) {
				payload = line.slice(1);
			} else {
				rows.set(id, [...(rows.get(id) ?? []), { tag: "", payload: line }]);
				continue;
			}
		}
		rows.set(id, [...(rows.get(id) ?? []), { tag, payload }]);
	}

	return rows;
};

const safeJsonParse = (text: string): unknown => {
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
};

/** resolves `<hex row id>` or `<hex row id>:<path>:<to>:<value>` */
type ReferenceResolver = (reference: string) => unknown;

/**
 * Decodes `$`-prefixed Flight values. Shared by the payload decoder and the
 * cache key arguments, which are encoded with the same conventions (`encodeReply`).
 */
export const reviveFlightValue = (
	value: unknown,
	resolveReference: ReferenceResolver = () => "[reference]",
): unknown => {
	if (Array.isArray(value)) {
		// React element: ["$", type, key, props, ...dev only owner/stack]
		if (value[0] === "$" && value.length >= 4) {
			const type = reviveFlightValue(value[1], resolveReference);
			return {
				// client components are already formatted as `<module#export>`
				type:
					typeof type === "string" && !type.startsWith("<")
						? `<${type}>`
						: type,
				key: value[2],
				props: reviveFlightValue(value[3], resolveReference),
			};
		}
		return value.map((item) => reviveFlightValue(item, resolveReference));
	}
	if (value !== null && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [
				key,
				reviveFlightValue(item, resolveReference),
			]),
		);
	}
	if (typeof value !== "string" || !value.startsWith("$")) {
		return value;
	}

	const marker = value[1];
	const rest = value.slice(2);

	switch (marker) {
		case "$":
			return value.slice(1);
		case "D":
			return rest;
		case "n":
			return `${rest}n`;
		case "u":
			return value === "$undefined" ? undefined : value;
		case "N":
			return value === "$NaN" ? Number.NaN : value;
		case "I":
			return value === "$Infinity" ? Number.POSITIVE_INFINITY : value;
		case "-":
			if (value === "$-Infinity") return Number.NEGATIVE_INFINITY;
			if (value === "$-0") return -0;
			return value;
		case "@":
		case "L":
		case "Y":
			return resolveReference(rest);
		case "Q":
			return { Map: resolveReference(rest) };
		case "W":
			return { Set: resolveReference(rest) };
		case "K":
			return { FormData: resolveReference(rest) };
		case "S":
			return `Symbol(${rest})`;
		case "E":
		case "h":
			return "[Function]";
		case "F":
			return "[Server Function]";
		case "T":
			return "[Temporary Reference]";
		case "Z":
			return "[Error]";
		case "B":
			return "[Blob]";
		default:
			// "$1f" is a plain reference to another row
			if (/^[0-9a-f]+(:.*)?$/.test(value.slice(1))) {
				return resolveReference(value.slice(1));
			}
			return value;
	}
};

// "[project]/node_modules/.pnpm/next@16/node_modules/next/dist/client/link.js [app-client] (ecmascript)"
// -> "next/dist/client/link.js"
const formatModuleId = (moduleId: unknown) =>
	String(moduleId)
		.replace(/ \[.*$/, "")
		.replace(/^.*node_modules\//, "")
		.replace(/^\[project\]\//, "");

const decodeRows = (rows: Map<number, Row[]>) => {
	const resolved = new Map<string, unknown>();
	const resolving = new Set<string>();

	const resolveRow = (row: Row, path: string[]): unknown => {
		switch (row.tag) {
			case "": {
				// walk the raw JSON, so references to a part of a row that is still
				// being resolved (e.g. the same object used twice) work
				let value = safeJsonParse(row.payload);
				for (const segment of path) {
					if (typeof value === "string" && value.startsWith("$")) {
						value = reviveFlightValue(value, resolveReference);
					}
					value =
						value !== null && typeof value === "object"
							? (value as Record<string, unknown>)[segment]
							: undefined;
				}
				return reviveFlightValue(value, resolveReference);
			}
			case "T":
				return row.payload;
			case "I": {
				// client reference: [moduleId, chunks, exportName]
				const metadata = safeJsonParse(row.payload);
				const [moduleId, , exportName] = Array.isArray(metadata)
					? metadata
					: [];
				return `<${formatModuleId(moduleId)}#${exportName || "default"}>`;
			}
			case "E":
				return { error: safeJsonParse(row.payload) };
			default:
				return `[${row.tag} row]`;
		}
	};

	const resolveReference = (reference: string): unknown => {
		if (resolved.has(reference)) {
			return resolved.get(reference);
		}
		if (resolving.has(reference)) {
			return "[Circular]";
		}
		const [id, ...path] = reference.split(":");
		const row = rows
			.get(Number.parseInt(id ?? "", 16))
			?.findLast((candidate) => candidate.tag !== "D");
		if (!row) {
			return "[Missing]";
		}
		resolving.add(reference);
		const result = resolveRow(row, path);
		resolving.delete(reference);
		resolved.set(reference, result);
		return result;
	};

	return resolveReference("0");
};

export const decodeFlightPayload = (bytes: Uint8Array): unknown => {
	try {
		return decodeRows(parseRows(bytes));
	} catch (error) {
		return {
			error: "Unable to decode the cache entry",
			payload: textDecoder.decode(bytes),
		};
	}
};
