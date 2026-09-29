import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitFork, Star } from "lucide-react";
import { cacheLife } from "next/cache";
import Link from "next/link";
import type { Repo } from "~/github-api/schemas";

/**
 * Component level "use cache": the rendered JSX is cached per `repo` prop.
 */
export async function RepoCard({ repo }: { repo: Repo }) {
	"use cache";
	cacheLife("hours");

	return (
		<Card>
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
	);
}
