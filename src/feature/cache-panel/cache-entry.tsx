"use client";

import type { NextCacheFileData } from "@/actions/cache-entries-schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { TableCell, TableRow } from "@/components/ui/table";
import JsonView from "react18-json-view";

type Props = {
	cacheEntry: NextCacheFileData;
};

const getEntryRevalidateLeft = (cacheEntry: NextCacheFileData) => {
	if (!cacheEntry.data?.headers?.date || !cacheEntry.revalidate) {
		return;
	}
	const cacheEntryDate = new Date(cacheEntry.data?.headers.date);
	const msDiff = new Date().getTime() - cacheEntryDate.getTime();
	return Math.floor(cacheEntry.revalidate - msDiff / 1000);
};

export const CacheEntry = (props: Props) => {
	const cacheEntryRevalidateLeft = getEntryRevalidateLeft(props.cacheEntry);

	const isStale = cacheEntryRevalidateLeft
		? cacheEntryRevalidateLeft < 0
		: false;

	return (
		<TableRow>
			<TableCell className="nct-truncate nct-max-w-[25vw]">
				{props.cacheEntry.data.url}
			</TableCell>
			<TableCell title={cacheEntryRevalidateLeft?.toString() ?? "-"}>
				{isStale ? <Badge>STALE</Badge> : (props.cacheEntry.revalidate ?? "-")}
			</TableCell>
			<TableCell className="nct-break-before-all">
				[{props.cacheEntry.tags.join(",")}]
			</TableCell>
			<TableCell>{props.cacheEntry.timestamp.toLocaleString()}</TableCell>
			<Dialog>
				<DialogTrigger asChild>
					<TableCell className="nct-flex nct-justify-center">
						<Button>show content</Button>
					</TableCell>
				</DialogTrigger>
				<DialogContent className="sm:nct-max-w-3xl nct-max-h-[65vh] nct-overflow-y-auto nct-overflow-x-hidden">
					<DialogTitle className="nct-hidden">
						{props.cacheEntry.data.url}
					</DialogTitle>
					<DialogDescription className="nct-hidden">
						{props.cacheEntry.data.url}
					</DialogDescription>
					<div className="nct-flex nct-items-center nct-space-x-2">
						<JsonView src={props.cacheEntry.data.body} collapsed={1} />
					</div>
				</DialogContent>
			</Dialog>
		</TableRow>
	);
};
