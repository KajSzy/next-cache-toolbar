import { getGithubAuthHeaders } from "./auth";
import { type Issue, issueSchema } from "./schemas";
import type { GithubSearchOptions } from "./types";

const GITHUB_API = "https://api.github.com";

export type IssuesSearchResult = {
	total_count: number;
	issues: Issue[];
};

export async function searchIssuesByRepo(
	owner: string,
	repo: string,
	options?: GithubSearchOptions,
): Promise<IssuesSearchResult> {
	const perPage = options?.perPage ?? 5;

	console.log(`Fetching issues from GitHub API for ${owner}/${repo}`);

	const url = new URL(`${GITHUB_API}/search/issues`);
	url.searchParams.set("q", `type:issue is:open org:${owner} repo:${repo}`);
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
		throw new Error("Error fetching issues", {
			cause: result.statusText,
		});
	}

	const data = await result.json();
	return {
		total_count: data.total_count,
		issues: issueSchema.array().parse(data.items),
	};
}
