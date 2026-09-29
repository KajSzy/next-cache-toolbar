import { getMostPopularRepositories } from "@/lib/github";
import { getLuckyNumbers, getServerInfo } from "@/lib/server-info";
import { connection } from "next/server";
import { Suspense } from "react";
import { refreshRepositories, refreshServerInfo } from "./actions";
import { RepoCard } from "./repo-card";

const orgsToFetchRepos = ["vercel", "facebook", "shadcn-ui", "pmndrs"];

async function ServerInfo() {
	const info = await getServerInfo();
	const luckyNumbers = await getLuckyNumbers(info.random);

	return (
		<div className="mb-6 rounded-lg border p-4 text-sm text-gray-700">
			<p>
				Server info generated at{" "}
				<strong>{info.generatedAt.toLocaleTimeString()}</strong> (Node{" "}
				{info.nodeVersion}), random value <strong>{info.random}</strong>, lucky
				numbers <strong>{luckyNumbers.join(", ")}</strong>
			</p>
			<form action={refreshServerInfo} className="mt-2">
				<button type="submit" className="underline text-blue-700">
					updateTag("server-info")
				</button>
			</form>
		</div>
	);
}

async function Repositories() {
	// Render at request time so `next build` does not call the GitHub API.
	// Cached entries are still created, in memory, on the first request.
	await connection();

	const repos = await Promise.all(
		orgsToFetchRepos.map(getMostPopularRepositories),
	).then((res) =>
		res.flat().toSorted((a, b) => b.stargazers_count - a.stargazers_count),
	);

	return (
		<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
			{repos.map((repo) => (
				<RepoCard key={repo.id} repo={repo} />
			))}
		</div>
	);
}

export default function Home() {
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4 text-blue-700">
				"use cache" directive
			</h1>
			<p className="text-lg text-blue-700 mb-4">
				Every piece of data on this page is cached with the `"use cache"`
				directive, so all entries live in the in-memory `"use cache"` cache
				handlers rather than in `.next/cache/fetch-cache`.
				<br />
				`getServerInfo` and `getLuckyNumbers` use a file level directive,
				`getMostPopularRepositories` is cached per organization with tags
				`repos` and `repos:[owner]` and every `RepoCard` component is cached per
				`repo` prop.
				<br />
				Click on a repository to see `"use cache: remote"` and a cached function
				that captures variables from its closure.
			</p>
			<ServerInfo />
			<form action={refreshRepositories} className="mb-4">
				<button type="submit" className="underline text-blue-700">
					updateTag("repos")
				</button>
			</form>
			<Suspense fallback={<p className="text-blue-700">Loading...</p>}>
				<Repositories />
			</Suspense>
		</div>
	);
}
