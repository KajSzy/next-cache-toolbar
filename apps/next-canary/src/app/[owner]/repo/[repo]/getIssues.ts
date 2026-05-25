import { searchIssuesByRepo } from "~/github-api/search-issues";

/**
 * This function uses next cache built-into fetch call
 */
export const getIssues = (owner: string, repo: string) =>
	searchIssuesByRepo(owner, repo, {
		init: {
			next: {
				tags: ["issues", owner, repo],
				revalidate: 3600,
			},
		},
	});
