import { z } from "zod";

export const repoSchema = z.object({
	id: z.number(),
	name: z.string(),
	owner: z.object({
		login: z.string(),
	}),
	html_url: z.string(),
	description: z.string(),
	fork: z.boolean(),
	url: z.string(),
	stargazers_count: z.number(),
	forks_count: z.number(),
});

export const issueSchema = z.object({
	url: z.string(),
	comments: z.number(),
	created_at: z.string(),
	user: z.object({
		login: z.string(),
		avatar_url: z.string(),
	}),
	number: z.number(),
	state: z.string(),
	title: z.string(),
	html_url: z.string(),
	id: z.number(),
});

export type Repo = z.infer<typeof repoSchema>;
export type Issue = z.infer<typeof issueSchema>;
