import { getMostPopularRepositories } from "@/actions/repositories";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StarIcon } from "lucide-react";
import Link from "next/link";

const getNextJSCacheIssues = async () => {
	try {
		const url = new URL("https://api.github.com/repos/vercel/next.js/issues");
		url.searchParams.append("q", "is:open is:issue cache");
		const result = await fetch(url, {
			headers: {
				Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
			},
			next: {
				revalidate: 86400,
				tags: ["issues"],
			},
		});
		return result.json();
	} catch (error) {
		console.error(error);
		throw Error("Error fetching issues");
	}
};

const getClosedIssues = async () => {
	try {
		const url = new URL("https://api.github.com/repos/vercel/next.js/issues");
		url.searchParams.append("q", "is:close is:issue cache");
		const result = await fetch(url, {
			headers: {
				Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
			},
			next: {
				revalidate: 30,
			},
		});
		return result.json();
	} catch (error) {
		console.error(error);
		throw Error("Error fetching issues");
	}
};

const orgsToFetchRepos = ["vercel", "facebook", "shadcn-ui", "pmndrs"];

export default async function Home() {
	const repos = await Promise.all(
		orgsToFetchRepos.map(getMostPopularRepositories),
	);

	return (
		<Tabs defaultValue="vercel" className="w-[520px]">
			<TabsList
				className="grid w-full"
				style={{
					gridTemplateColumns: `repeat(${orgsToFetchRepos.length}, minmax(0, 1fr))`,
				}}
			>
				{orgsToFetchRepos.map((org) => (
					<TabsTrigger key={org} value={org}>
						{org}
					</TabsTrigger>
				))}
			</TabsList>
			{orgsToFetchRepos.map((org, index) => (
				<TabsContent key={org} value={org}>
					<Card>
						<CardHeader>
							<CardTitle>{org}</CardTitle>
							<CardDescription>
								{repos[index].length} most starred {org} repos
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex flex-col gap-2">
								{repos[index].map((repo) => (
									<Link
										className="flex items-center hover:underline"
										key={repo.id}
										href={`/${org}/repo/${repo.name}`}
									>
										<div className="text-xl">{repo.name}</div>
										<div className="flex items-center ml-auto">
											<div>{repo.stargazers_count}</div>
											<StarIcon width={18} height={18} />
										</div>
									</Link>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			))}
		</Tabs>
	);
}
