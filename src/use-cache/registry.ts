/**
 * Records "use cache" entries by wrapping the cache handlers Next.js keeps on
 * `globalThis`. The default handler is an in-memory LRU hidden in a closure, so
 * the only way to see its entries is to observe `get`/`set` calls.
 *
 * Everything lives on `globalThis` because Next.js, the instrumentation hook and
 * the toolbar server actions can be evaluated as different module instances.
 */

// Mirrors the CacheHandler interface from `next/dist/server/lib/cache-handlers/types`
type CacheEntry = {
	value: ReadableStream<Uint8Array>;
	tags: string[];
	stale: number;
	timestamp: number;
	expire: number;
	revalidate: number;
};

type CacheHandler = {
	get(cacheKey: string, softTags: string[]): Promise<CacheEntry | undefined>;
	set(cacheKey: string, pendingEntry: Promise<CacheEntry>): Promise<void>;
	updateTags(tags: string[], durations?: { expire?: number }): Promise<void>;
	[key: string]: unknown;
};

export type RecordedUseCacheEntry = {
	cacheKey: string;
	/** names of the cache handlers (`default`, `remote`, custom) the entry was stored in */
	handlers: string[];
	tags: string[];
	/** [ms since epoch] */
	timestamp: number;
	/** [seconds] */
	revalidate: number;
	/** [seconds] */
	expire: number;
	/** [seconds] */
	stale: number;
	/** size of the serialized value in bytes */
	size: number;
	/** serialized React Flight payload, `undefined` when bigger than the limit */
	value: Uint8Array | undefined;
	hits: number;
	misses: number;
	/** [ms since epoch] */
	lastAccessedAt: number | undefined;
	/** the handler returned nothing for this key (expired, evicted or revalidated) */
	missing: boolean;
};

type UseCacheRegistry = {
	entries: Map<string, RecordedUseCacheEntry>;
	/** tag -> [ms since epoch] of the last `revalidateTag`/`updateTag` call */
	revalidatedTags: Map<string, number>;
	/** entries created before this moment are treated as missing */
	purgedAt: number;
};

const HANDLERS_MAP_SYMBOL = Symbol.for("@next/cache-handlers-map");
const REGISTRY_SYMBOL = Symbol.for("next-cache-toolbar.use-cache-registry");
const INSTRUMENTED_SYMBOL = Symbol.for("next-cache-toolbar.instrumented");

const MAX_ENTRIES = 500;
const MAX_VALUE_SIZE = 1024 * 1024;

// Redirect entries used by Next.js for root params, not real cache entries
const ROOT_PARAM_TAG_PREFIX = "_N_RP_";

type GlobalWithRegistry = typeof globalThis & {
	[HANDLERS_MAP_SYMBOL]?: Map<string, CacheHandler>;
	[REGISTRY_SYMBOL]?: UseCacheRegistry;
};

const globalRef = globalThis as GlobalWithRegistry;

type InstrumentedHandler = CacheHandler & {
	[INSTRUMENTED_SYMBOL]?: { kinds: Set<string> };
};

export const getUseCacheRegistry = (): UseCacheRegistry => {
	globalRef[REGISTRY_SYMBOL] ??= {
		entries: new Map(),
		revalidatedTags: new Map(),
		purgedAt: 0,
	};
	return globalRef[REGISTRY_SYMBOL];
};

const readStream = async (stream: ReadableStream<Uint8Array>) => {
	const reader = stream.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;
	for (
		let chunk = await reader.read();
		!chunk.done;
		chunk = await reader.read()
	) {
		size += chunk.value.byteLength;
		// keep reading past the limit to know the size, but stop buffering
		if (size <= MAX_VALUE_SIZE) {
			chunks.push(chunk.value);
		}
	}
	if (size > MAX_VALUE_SIZE) {
		return { size, value: undefined };
	}
	const value = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		value.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return { size, value };
};

// Cache handlers `tee()` their streams. Cancelling one branch of a tee resolves
// only once the other branch is cancelled too, so the promise is never awaited.
const discardStream = (stream: ReadableStream<Uint8Array>) => {
	stream.cancel().catch(() => {});
};

const evictOldestEntries = (registry: UseCacheRegistry) => {
	if (registry.entries.size <= MAX_ENTRIES) {
		return;
	}
	const byAge = Array.from(registry.entries.values()).sort(
		(a, b) => a.timestamp - b.timestamp,
	);
	for (const entry of byAge.slice(0, registry.entries.size - MAX_ENTRIES)) {
		registry.entries.delete(entry.cacheKey);
	}
};

const recordEntry = async (
	handler: InstrumentedHandler,
	cacheKey: string,
	entry: CacheEntry,
	stream: ReadableStream<Uint8Array>,
) => {
	if (entry.tags.some((tag) => tag.startsWith(ROOT_PARAM_TAG_PREFIX))) {
		discardStream(stream);
		return;
	}
	const { size, value } = await readStream(stream);
	const registry = getUseCacheRegistry();
	const previous = registry.entries.get(cacheKey);
	registry.entries.set(cacheKey, {
		cacheKey,
		handlers: Array.from(handler[INSTRUMENTED_SYMBOL]?.kinds ?? []),
		tags: entry.tags,
		timestamp: entry.timestamp,
		revalidate: entry.revalidate,
		expire: entry.expire,
		stale: entry.stale,
		size,
		value,
		hits: previous?.hits ?? 0,
		misses: previous?.misses ?? 0,
		lastAccessedAt: previous?.lastAccessedAt,
		missing: false,
	});
	evictOldestEntries(registry);
};

const instrumentHandler = (kind: string, handler: InstrumentedHandler) => {
	const instrumented = handler[INSTRUMENTED_SYMBOL];
	if (instrumented) {
		instrumented.kinds.add(kind);
		return;
	}
	handler[INSTRUMENTED_SYMBOL] = { kinds: new Set([kind]) };

	const originalGet = handler.get.bind(handler);
	const originalSet = handler.set.bind(handler);
	const originalUpdateTags = handler.updateTags.bind(handler);

	handler.get = async (cacheKey, softTags) => {
		const registry = getUseCacheRegistry();
		let entry = await originalGet(cacheKey, softTags);
		// entries created before a purge from the toolbar are ignored,
		// so Next.js regenerates them and calls `set` with a fresh entry
		if (entry && entry.timestamp <= registry.purgedAt) {
			discardStream(entry.value);
			entry = undefined;
		}
		const recorded = registry.entries.get(cacheKey);
		if (recorded) {
			recorded.lastAccessedAt = Date.now();
			if (entry) {
				recorded.hits++;
				recorded.missing = false;
			} else {
				recorded.misses++;
				recorded.missing = true;
			}
		}
		return entry;
	};

	handler.set = (cacheKey, pendingEntry) => {
		const tappedEntry = pendingEntry.then((entry) => {
			const [value, copy] = entry.value.tee();
			entry.value = value;
			recordEntry(handler, cacheKey, entry, copy).catch((error) => {
				console.error("[next-cache-toolbar] failed to record entry", error);
			});
			return entry;
		});
		return originalSet(cacheKey, tappedEntry);
	};

	handler.updateTags = async (tags, durations) => {
		const registry = getUseCacheRegistry();
		const now = Date.now();
		for (const tag of tags) {
			registry.revalidatedTags.set(tag, now);
		}
		return originalUpdateTags(tags, durations);
	};
};

/**
 * Wraps every "use cache" handler registered by Next.js. Safe to call many times.
 * Returns `false` when "use cache" is not available (Next.js < 15, `cacheComponents` disabled)
 * or Next.js did not initialize its handlers yet.
 */
export const instrumentUseCacheHandlers = () => {
	const handlersMap = globalRef[HANDLERS_MAP_SYMBOL];
	if (!handlersMap) {
		return false;
	}
	for (const [kind, handler] of handlersMap) {
		instrumentHandler(kind, handler);
	}
	// handlers configured later through `setCacheHandler`
	const instrumentedMap = handlersMap as Map<string, CacheHandler> & {
		[INSTRUMENTED_SYMBOL]?: boolean;
	};
	if (!instrumentedMap[INSTRUMENTED_SYMBOL]) {
		instrumentedMap[INSTRUMENTED_SYMBOL] = true;
		const originalMapSet = handlersMap.set.bind(handlersMap);
		handlersMap.set = (kind, handler) => {
			instrumentHandler(kind, handler);
			return originalMapSet(kind, handler);
		};
	}
	return true;
};

/**
 * Instruments the handlers as soon as Next.js creates them. Meant to be called
 * from `instrumentation.ts`, which runs before the first request, so entries
 * created before the toolbar is rendered are recorded as well.
 */
export const registerUseCacheInstrumentation = () => {
	if (instrumentUseCacheHandlers()) {
		return;
	}
	let handlersMap: Map<string, CacheHandler> | undefined;
	Object.defineProperty(globalRef, HANDLERS_MAP_SYMBOL, {
		configurable: true,
		enumerable: false,
		get: () => handlersMap,
		set: (value: Map<string, CacheHandler>) => {
			handlersMap = value;
			// the map is still empty here, patching its `set` covers the handlers
			// Next.js adds right after creating it
			instrumentUseCacheHandlers();
		},
	});
};

export const purgeUseCacheEntries = () => {
	const registry = getUseCacheRegistry();
	registry.purgedAt = Date.now();
	registry.entries.clear();
};
