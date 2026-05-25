import { repoSchema } from "@/utils/schemas";
import { unstable_cacheTag as cacheTag } from "next/cache";

/**
 * This function uses unstable_cacheTag function to store result of a function
 */
export async function getMostPopularRepositories(owner: string) {
  "use cache";
  cacheTag("repos", owner);
  // cacheLife("minutes");

  try {
    console.log(`Fetching repositories from GitHub API for ${owner}`);
    const url = new URL("https://api.github.com/search/repositories");
    url.searchParams.set("q", `org:${owner}`);
    url.searchParams.set("sort", "stars");
    url.searchParams.set("direction", "desc");
    url.searchParams.set("per_page", "5");
    const result = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    });
    if (!result.ok) {
      throw Error("Error fetching repositories", {
        cause: result.statusText,
      });
    }
    const data = await result.json();
    return repoSchema.array().parse(data.items);
  } catch (error) {
    console.error(error);
    throw Error("Error fetching issues");
  }
}
