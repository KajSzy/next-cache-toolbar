"use server";

// All server actions live in this single module: when helpers are shared between
// several "use server" modules, bunchee exports them from a "use server" chunk and
// Next.js registers them as (non-async) server actions.

import { existsSync, promises } from "node:fs";
import { ZodError } from "zod";
import { getUseCacheEntries } from "../use-cache/entries";
import { purgeUseCacheEntries } from "../use-cache/registry";
import { getFetchCachePath } from "../utils/fetch-cache-path";
import {
	type NextCacheFileData,
	nextCacheFileSchema,
} from "./cache-entries-schema";
import type { CachePanelEntry } from "./cache-panel-entry";

const getCacheFiles = async (distDir: string) => {
	const cachePath = getFetchCachePath(distDir);
	if (!existsSync(cachePath)) {
		return;
	}
	const files = await promises.readdir(cachePath);

	const cacheFiles = new Map<string, NextCacheFileData>();

	for (const file of files) {
		// ignore tags-manifest file
		if (file.match(/manifest/)) {
			continue;
		}
		try {
			const fileContent = await promises
				.readFile(`${cachePath}/${file}`)
				.catch((err) => {
					throw Error(`Error reading file ${file}`, {
						cause: err,
					});
				});

			const fileStats = await promises
				.stat(`${cachePath}/${file}`)
				.catch((err) => {
					throw Error(`Error reading file ${file}`, {
						cause: err,
					});
				});

			const jsonData = JSON.parse(fileContent.toString());

			const cacheEntry = nextCacheFileSchema.parse(jsonData);
			// mtime, not birthtime: Next.js rewrites the same file when an entry is revalidated
			cacheFiles.set(file, { ...cacheEntry, timestamp: fileStats.mtime });
		} catch (error) {
			if (error instanceof ZodError) {
				const issues = error.issues;
				console.error(`File ${file} do not match the schema`, issues);
			}
			console.error(`Error parsing ${file}`);
		}
	}

	return Array.from(cacheFiles.entries());
};

const toCachePanelEntry = ([file, cacheEntry]: [
	string,
	NextCacheFileData,
]): CachePanelEntry => ({
	id: file,
	source: cacheEntry.data.url === "unstable_cache" ? "unstable_cache" : "fetch",
	label: cacheEntry.data.url,
	revalidate: cacheEntry.revalidate,
	tags: cacheEntry.tags,
	timestamp: cacheEntry.timestamp,
	body: cacheEntry.data.body,
});

/**
 * Returns data cache entries (`fetch`, `unstable_cache`) stored on disk together
 * with "use cache" entries recorded in memory.
 */
export const getCacheEntries = async (
	distDir: string,
): Promise<CachePanelEntry[]> => {
	const [files, useCacheEntries] = await Promise.all([
		getCacheFiles(distDir),
		getUseCacheEntries(distDir),
	]);
	return [...(files ?? []).map(toCachePanelEntry), ...(useCacheEntries ?? [])];
};

export const purgeCache = async (distDir: string) => {
	purgeUseCacheEntries();
	await promises.rm(getFetchCachePath(distDir), {
		recursive: true,
		force: true,
	});
};
