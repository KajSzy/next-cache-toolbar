import { getGithubAuthHeaders } from "./auth";
import { type Repo, repoSchema } from "./schemas";
import type { GithubSearchOptions } from "./types";

const GITHUB_API = "https://api.github.com";

export async function searchRepositoriesByOrg(
	owner: string,
	options?: GithubSearchOptions,
): Promise<Repo[]> {
	const perPage = options?.perPage ?? 5;

	console.log(`Fetching repositories from GitHub API for ${owner}`);

	const url = new URL(`${GITHUB_API}/search/repositories`);
	url.searchParams.set("q", `org:${owner}`);
	url.searchParams.set("sort", "stars");
	url.searchParams.set("direction", "desc");
	url.searchParams.set("per_page", String(perPage));

	const result = await fetch(url, {
		...options?.init,
		headers: {
			...getGithubAuthHeaders(),
			...options?.init?.headers,
		},
	});

	if (!result.ok) {
		throw new Error("Error fetching repositories", {
			cause: result.statusText,
		});
	}

	const data = await result.json();
	return repoSchema.array().parse(data.items);
}
