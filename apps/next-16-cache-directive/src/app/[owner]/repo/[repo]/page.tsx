import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRepositoryIssues } from "@/lib/github";
import {
	AlertCircle,
	Calendar,
	ChevronLeft,
	MessageCircle,
} from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";

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

async function Issues({ params }: Props) {
	const { owner, repo } = await params;

	// `owner` and `repo` are captured from the closure and become part of the
	// cache key, next to the `label` argument.
	const getIssuesSummary = async (label: string) => {
		"use cache";
		cacheLife("hours");
		cacheTag("issues-summary");

		const { total_count } = await getRepositoryIssues(owner, repo);
		return `${label}: ${owner}/${repo} has ${total_count} open issues`;
	};

	const [{ issues }, summary] = await Promise.all([
		getRepositoryIssues(owner, repo),
		getIssuesSummary("summary"),
	]);

	return (
		<>
			<h1 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-1">
				<Link href="/">
					<ChevronLeft size={24} className="mr-1" />
				</Link>
				{summary}
			</h1>

			<p className="text-lg text-blue-700 mb-4">
				Issues are cached with `"use cache: remote"` for an hour with tags
				`issues` and `issues:[owner]/[repo]`.
				<br />
				The heading comes from an inline `"use cache"` function that captures
				`owner` and `repo` from its closure.
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
						</CardContent>
					</Card>
				))}
			</div>
		</>
	);
}

export default function RepoPage(props: Props) {
	return (
		<div className="container mx-auto p-4">
			<Suspense fallback={<p className="text-blue-700">Loading...</p>}>
				<Issues params={props.params} />
			</Suspense>
		</div>
	);
}
