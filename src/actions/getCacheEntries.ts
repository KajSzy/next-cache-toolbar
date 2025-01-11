"use server";

import { existsSync, promises } from "node:fs";
import { ZodError } from "zod";
import {
	type NextCacheFileData,
	nextCacheFileSchema,
} from "./cache-entries-schema";

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
			const fileContent = await promises
				.readFile(`${cachePath}/${file}`)
				.catch((err) => {
					throw Error(`Error reading file ${file}`, {
						cause: err,
					});
				});

			const jsonData = JSON.parse(fileContent.toString());

			const cacheEntry = nextCacheFileSchema.parse(jsonData);
			cacheFiles.set(file, cacheEntry);
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
