import { z } from "zod";

const stringToJSONSchema = z.string().transform((str, ctx) => {
	try {
		return JSON.parse(str) as unknown;
	} catch (e) {
		ctx.addIssue({
			code: "custom",
			message: "Encoded body is not in JSON format",
			path: ["data", "body"],
		});
		return z.NEVER;
	}
});

const unstableCacheFileSchema = z.object({
	data: z.object({
		body: z.string(),
		headers: z.object({}).transform(() => null),
		status: z.number(),
		url: z.literal(""),
	}),
	kind: z.union([z.literal("FETCH"), z.unknown()]),
	revalidate: z.number().optional(),
	tags: z.array(z.string()).optional().default([]),
});

const fetchCacheFileSchema = z.object({
	data: z.object({
		body: z.string(),
		headers: z.record(z.string(), z.string()),
		status: z.number(),
		url: z.string().url(),
	}),
	kind: z.union([z.literal("FETCH"), z.unknown()]),
	revalidate: z.number().optional(),
	tags: z.array(z.string()).optional().default([]),
});

export const nextCacheFileSchema = z
	.union([unstableCacheFileSchema, fetchCacheFileSchema])
	.transform((cacheEntry) => {
		const body =
			cacheEntry.data.url !== ""
				? stringToJSONSchema.parse(atob(cacheEntry.data.body))
				: stringToJSONSchema.parse(cacheEntry.data.body);
		return {
			...cacheEntry,
			timestamp: cacheEntry.data.headers?.date
				? new Date(cacheEntry.data.headers?.date)
				: new Date(),
			data: {
				...cacheEntry.data,
				url:
					cacheEntry.data.url === "" ? "unstable_cache" : cacheEntry.data.url,
				body,
			},
		};
	});

export type NextCacheFileData = z.infer<typeof nextCacheFileSchema>;
