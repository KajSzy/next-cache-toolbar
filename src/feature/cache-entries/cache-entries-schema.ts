import { z } from "zod";

export const nextCacheFileSchema = z.object({
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

export type NextCacheFileData = z.infer<typeof nextCacheFileSchema>;
