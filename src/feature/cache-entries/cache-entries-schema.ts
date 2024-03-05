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

export const nextCacheFileSchema = z
	.object({
		data: z.object({
			body: z.string(),
			headers: z.record(z.string(), z.string()),
			status: z.number(),
			url: z.string(),
		}),
		kind: z.union([z.literal("FETCH"), z.unknown()]),
		revalidate: z.number().optional(),
		tags: z.array(z.string()).optional().default([]),
	})
	.transform((cacheEntry) => {
		const body = stringToJSONSchema.parse(atob(cacheEntry.data.body));

		return {
			...cacheEntry,
			data: {
				...cacheEntry.data,
				body,
			},
		};
	});

export type NextCacheFileData = z.infer<typeof nextCacheFileSchema>;
