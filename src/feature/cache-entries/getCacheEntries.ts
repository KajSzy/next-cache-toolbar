import { existsSync, promises } from "fs";
import { ZodError } from "zod";
import { NextCacheFileData, nextCacheFileSchema } from "./cache-entries-schema";

const cachePath = ".next/cache/fetch-cache";

export const getCacheFiles = async () => {
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
			const fileContent = await promises.readFile(`${cachePath}/${file}`);
			const cacheEntry = nextCacheFileSchema.parse(
				JSON.parse(fileContent.toString()),
			);
			cacheFiles.set(file, cacheEntry);
		} catch (error) {
			if (error instanceof ZodError) {
				const issues = error.issues;
				console.error(`File ${file} do not match the schema`, issues);
				continue;
			}
			console.error(`Error parsing ${file}`);
		}
	}

	return cacheFiles;
};
