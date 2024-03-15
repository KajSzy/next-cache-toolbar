import { getIssues } from "@/actions/repositories";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

type Props = {
	params: {
		owner: string;
		repo: string;
	};
};

export default async function Home({ params }: Props) {
	const issues = await getIssues(params.owner, params.repo);

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<Link href="/" className="hover:underline">
						<Button variant="link">
							<ChevronLeft className=" h-4 w-4" />
							back
						</Button>
					</Link>
					<div>
						{params.owner} / {params.repo}
					</div>
				</CardTitle>
				<CardDescription>5 most recent issues</CardDescription>
			</CardHeader>
			<CardContent className="space-y-2">
				<div className="flex flex-col gap-2">
					{issues.map((issue) => (
						<Link
							className="flex items-center gap-4 hover:underline"
							key={issue.id}
							href={issue.url}
						>
							<div>{issue.title}</div>
							<div className="text-sm ml-auto">#{issue.number}</div>
						</Link>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
