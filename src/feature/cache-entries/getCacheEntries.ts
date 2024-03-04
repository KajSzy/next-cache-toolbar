import { existsSync } from "fs";
import { readFile, readdir } from "fs/promises";
import { NextCacheFileData, nextCacheFileSchema } from "./cache-entries-schema";

const cachePath = ".next/cache/fetch-cache";

export const getCacheFiles = async () => {
	if (!existsSync(cachePath)) {
		return;
	}
	try {
		const files = await readdir(cachePath);

		const cacheFiles = new Map<string, NextCacheFileData>();

		for (const file of files) {
			const fileContent = await readFile(`${cachePath}/${file}`);
			const body = JSON.parse(fileContent.toString());
			const cacheEntry = nextCacheFileSchema.parse(body);
			if (!cacheEntry.data) {
				continue;
			}
			cacheFiles.set(file, cacheEntry);
		}

		return cacheFiles;
	} catch (error) {
		console.error(error);
		throw Error("Error reading cache files");
	}
};
