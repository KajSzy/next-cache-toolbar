export type CacheEntrySource = "fetch" | "unstable_cache" | "use cache";

/**
 * Common shape of every row displayed by the toolbar, regardless of the cache
 * it comes from.
 */
export type CachePanelEntry = {
	/** unique id: file name for the data cache, cache key for "use cache" */
	id: string;
	source: CacheEntrySource;
	/** URL for `fetch`, function call for "use cache" */
	label: string;
	/** [seconds] */
	revalidate?: number;
	tags: string[];
	timestamp: Date;
	body: unknown;
	/** "use cache" only */
	useCache?: {
		functionId: string;
		functionName?: string;
		file?: string;
		args: unknown[];
		handlers: string[];
		/** [seconds] */
		expire: number;
		/** [seconds] */
		stale: number;
		size: number;
		hits: number;
		misses: number;
		lastAccessedAt?: Date;
		/** a tag of the entry was revalidated after the entry was created */
		revalidatedAt?: Date;
		/** the cache handler no longer returns the entry (expired or evicted) */
		missing: boolean;
	};
};
