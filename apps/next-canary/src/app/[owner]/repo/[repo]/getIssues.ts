import { issueSchema } from "@/utils/schemas";

/**
 * This function uses next cache built-into fetch call
 */
export const getIssues = async (owner: string, repo: string) => {
  try {
    console.log(`Fetching issues from GitHub API for ${owner}/${repo}`);
    const url = new URL("https://api.github.com/search/issues");
    url.searchParams.set("q", `type:issue is:open org:${owner} repo:${repo}`);
    url.searchParams.set("sort", "stars");
    url.searchParams.set("direction", "desc");
    url.searchParams.set("per_page", "5");
    const result = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
      next: {
        tags: ["issues", owner, repo],
        revalidate: 3600,
      },
    });
    if (!result.ok) {
      throw Error("Error fetching repositories", {
        cause: result.statusText,
      });
    }
    const data = await result.json();
    return {
      total_count: data.total_count,
      issues: issueSchema.array().parse(data.items),
    };
  } catch (error) {
    console.error(error);
    throw Error("Error fetching issues");
  }
};
