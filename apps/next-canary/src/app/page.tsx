import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { repoSchema } from "@/utils/schemas";
import { GitFork, Star } from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";

const orgsToFetchRepos = ["vercel", "facebook", "shadcn-ui", "pmndrs"];

const getMostPopularRepositories = (owner: string) =>
	unstable_cache(
		async () => {
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
		},
		[owner],
		{
			revalidate: 30,
			tags: ["repos", owner],
		},
	)();

export const dynamic = "force-dynamic";

export default async function Home() {
	const repos = await Promise.all(
		orgsToFetchRepos.map(getMostPopularRepositories),
	).then((res) =>
		res.flat().toSorted((a, b) => b.stargazers_count - a.stargazers_count),
	);

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4 text-blue-700">
				List of repositories from GitHub
			</h1>
			<p className="text-lg text-blue-700 mb-4">
				We are fetching the most starred repositories for few organizations.{" "}
				<br />
				We query for 5 repositories from each organization and cache them
				individually.
				<br />
				Under the hood we are using `unstable_cache` to cache the response for
				30 seconds with tags `repos` and `owner`. <br />
				You can click on the repository name to navigate to the repository page
				where different cache mechanisms is used.
			</p>
			<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
				{repos.map((repo) => (
					<Card key={repo.id}>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<Link
									className="truncate hover:underline"
									href={`/${repo.owner.login}/repo/${repo.name}`}
								>
									{repo.owner.login}/{repo.name}
								</Link>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-gray-600 mb-2">
								{repo.description || "No description available"}
							</p>
							<div className="flex items-center space-x-4 text-sm text-gray-500">
								<span className="flex items-center">
									<Star size={16} className="mr-1" />
									{repo.stargazers_count}
								</span>
								<span className="flex items-center">
									<GitFork size={16} className="mr-1" />
									{repo.forks_count}
								</span>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
