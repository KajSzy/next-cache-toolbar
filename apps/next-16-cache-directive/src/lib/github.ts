import { cacheLife, cacheTag } from "next/cache";
import { searchIssuesByRepo } from "~/github-api/search-issues";
import { searchRepositoriesByOrg } from "~/github-api/search-repositories";

/**
 * Function level "use cache": one cache entry per `owner` argument,
 * stored by the `default` cache handler.
 */
export async function getMostPopularRepositories(owner: string) {
	"use cache";
	cacheLife("minutes");
	cacheTag("repos", `repos:${owner}`);

	return searchRepositoriesByOrg(owner);
}

/**
 * "use cache: remote" stores entries in the `remote` cache handler.
 * Without a custom `cacheHandlers.remote` it shares the in-memory default one.
 */
export async function getRepositoryIssues(owner: string, repo: string) {
	"use cache: remote";
	cacheLife("hours");
	cacheTag("issues", `issues:${owner}/${repo}`);

	return searchIssuesByRepo(owner, repo);
}
