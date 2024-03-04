"use server";

import { existsSync } from "fs";
import { readFile, readdir } from "fs/promises";
import { z } from "zod";

const cachePath = ".next/cache/fetch-cache";

const nextCacheFileSchema = z.object({
	data: z
		.object({
			body: z.string(),
			headers: z.record(z.string(), z.string()),
			status: z.number(),
			url: z.string(),
		})
		.optional(),
	kind: z.union([z.literal("FETCH"), z.unknown()]),
	revalidate: z.number().optional(),
	tags: z.array(z.string()).optional().default([]),
});

type NextCacheFileData = z.infer<typeof nextCacheFileSchema>;

export const readCacheFiles = async () => {
	if (!existsSync(cachePath)) {
		return;
	}
	try {
		const files = await readdir(cachePath);

		const cacheFiles = new Map<string, NextCacheFileData>();

		for (const file of files) {
			const fileContent = await readFile(`${cachePath}/${file}`);
			const body = JSON.parse(fileContent.toString());
			cacheFiles.set(file, nextCacheFileSchema.parse(body));
		}

		return cacheFiles;
	} catch (error) {
		console.error(error);
		throw Error("Error reading cache files");
	}
};
