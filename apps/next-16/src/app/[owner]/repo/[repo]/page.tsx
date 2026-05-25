import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { issueSchema } from "@/utils/schemas";
import {
	AlertCircle,
	Calendar,
	ChevronLeft,
	MessageCircle,
} from "lucide-react";
import Link from "next/link";

const getIssues = async (owner: string, repo: string) => {
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

type Props = {
	params: Promise<{
		owner: string;
		repo: string;
	}>;
};

export async function generateMetadata({ params }: Props) {
	const { owner, repo } = await params;
	return {
		title: `${owner}/${repo} issues`,
		description: `Recent issues for ${owner}/${repo}`,
	};
}

export const dynamic = "force-dynamic";

export default async function Home({ params }: Props) {
	const { owner, repo } = await params;
	const { issues, total_count } = await getIssues(owner, repo);

	return (
		<>
			<div className="container mx-auto p-4">
				<h1 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-1">
					<Link href="/">
						<ChevronLeft size={24} className="mr-1" />
					</Link>
					Recent Issues for {owner}/{repo} (total issues: {total_count})
				</h1>

				<p className="text-lg text-blue-700 mb-4">
					We are fetching the most recent issues reported in this repository.
					<br />
					Under the hood we are using `next` properties passed to native `fetch`
					<br />
					All data is cached for 3600 seconds with tags `issues`, `owner` and
					`repo`.
					<br />
					You can click on the issue number to navigate to the issue page.
				</p>
				<div className="space-y-4">
					{issues.map((issue) => (
						<Card key={issue.id}>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<a
										href={issue.html_url}
										target="_blank"
										rel="noopener noreferrer"
										className="hover:underline"
									>
										#{issue.number}: {issue.title}
									</a>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center space-x-4 text-sm text-gray-500">
									<span className="flex items-center">
										<AlertCircle size={16} className="mr-1" />
										{issue.state}
									</span>
									<span className="flex items-center">
										<Calendar size={16} className="mr-1" />
										{new Date(issue.created_at).toLocaleDateString()}
									</span>
									<span className="flex items-center">
										<MessageCircle size={16} className="mr-1" />
										{issue.comments}
									</span>
								</div>
								<div className="mt-2 flex items-center">
									<img
										src={issue.user.avatar_url}
										alt={issue.user.login}
										className="w-6 h-6 rounded-full mr-2"
									/>
									<span className="text-sm text-gray-600">
										{issue.user.login}
									</span>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</>
	);
}
