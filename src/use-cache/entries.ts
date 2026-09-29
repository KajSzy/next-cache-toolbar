import type { CachePanelEntry } from "../actions/cache-panel-entry";
import { parseUseCacheKey } from "./cache-key";
import { decodeFlightPayload } from "./flight";
import { resolveUseCacheFunctions } from "./function-names";
import { getUseCacheRegistry, instrumentUseCacheHandlers } from "./registry";

const MAX_LABEL_ARGS_LENGTH = 60;

const formatArgs = (args: unknown[]) => {
	const formatted = args
		.map((arg) => JSON.stringify(arg) ?? String(arg))
		.join(", ");
	return formatted.length > MAX_LABEL_ARGS_LENGTH
		? `${formatted.slice(0, MAX_LABEL_ARGS_LENGTH)}…`
		: formatted;
};

/**
 * Returns "use cache" entries recorded since the toolbar instrumented the
 * Next.js cache handlers, or `undefined` when "use cache" is not available.
 */
export const getUseCacheEntries = async (
	distDir: string,
): Promise<CachePanelEntry[] | undefined> => {
	if (!instrumentUseCacheHandlers()) {
		return;
	}
	const registry = getUseCacheRegistry();
	const recordedEntries = Array.from(registry.entries.values());
	const parsedKeys = new Map(
		recordedEntries.map((entry) => [
			entry.cacheKey,
			parseUseCacheKey(entry.cacheKey),
		]),
	);
	const functions = await resolveUseCacheFunctions(
		distDir,
		Array.from(
			new Set(
				Array.from(parsedKeys.values()).flatMap((key) =>
					key ? [key.functionId] : [],
				),
			),
		),
	);

	return recordedEntries.map((entry) => {
		const key = parsedKeys.get(entry.cacheKey);
		const fn = key ? functions.get(key.functionId) : undefined;
		const functionName = fn?.name ?? key?.functionId.slice(0, 8);
		const revalidatedAt = Math.max(
			0,
			...entry.tags.map((tag) => registry.revalidatedTags.get(tag) ?? 0),
		);

		return {
			id: entry.cacheKey,
			source: "use cache",
			label: key ? `${functionName}(${formatArgs(key.args)})` : entry.cacheKey,
			revalidate: entry.revalidate,
			tags: entry.tags,
			timestamp: new Date(entry.timestamp),
			body: entry.value
				? decodeFlightPayload(entry.value)
				: `Value not recorded, entry is bigger than 1MB (${entry.size} bytes)`,
			useCache: {
				functionId: key?.functionId ?? "unknown",
				functionName: fn?.name,
				file: fn?.file,
				args: key?.args ?? [],
				handlers: entry.handlers,
				expire: entry.expire,
				stale: entry.stale,
				size: entry.size,
				hits: entry.hits,
				misses: entry.misses,
				lastAccessedAt: entry.lastAccessedAt
					? new Date(entry.lastAccessedAt)
					: undefined,
				revalidatedAt:
					revalidatedAt > entry.timestamp ? new Date(revalidatedAt) : undefined,
				missing: entry.missing,
			},
		};
	});
};
