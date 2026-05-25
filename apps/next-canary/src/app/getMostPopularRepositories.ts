import { searchRepositoriesByOrg } from "~/github-api/search-repositories";
import { cacheTag } from "next/cache";

/**
 * This function uses cacheTag to tag the result of a cached function
 */
export async function getMostPopularRepositories(owner: string) {
	"use cache";
	cacheTag("repos", owner);

	return searchRepositoriesByOrg(owner);
}
