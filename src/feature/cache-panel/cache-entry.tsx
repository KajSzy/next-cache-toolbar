"use client";

import type { CachePanelEntry } from "@/actions/cache-panel-entry";
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
	cacheEntry: CachePanelEntry;
};

const getEntryRevalidateLeft = (cacheEntry: CachePanelEntry) => {
	if (!cacheEntry.revalidate) {
		return;
	}
	const msDiff = new Date().getTime() - cacheEntry.timestamp.getTime();
	return Math.floor(cacheEntry.revalidate - msDiff / 1000);
};

const getEntryStatus = (cacheEntry: CachePanelEntry) => {
	if (cacheEntry.useCache?.revalidatedAt) {
		return "REVALIDATED";
	}
	if (cacheEntry.useCache?.missing) {
		return "MISSING";
	}
	const revalidateLeft = getEntryRevalidateLeft(cacheEntry);
	if (revalidateLeft !== undefined && revalidateLeft < 0) {
		return "STALE";
	}
};

const getUseCacheDetails = ({ useCache }: CachePanelEntry) =>
	useCache && {
		function: useCache.functionName ?? useCache.functionId,
		file: useCache.file,
		arguments: useCache.args,
		handlers: useCache.handlers,
		cacheLife: {
			stale: useCache.stale,
			expire: useCache.expire,
		},
		size: `${useCache.size} bytes`,
		hits: useCache.hits,
		misses: useCache.misses,
		lastAccessedAt: useCache.lastAccessedAt?.toLocaleString(),
		revalidatedAt: useCache.revalidatedAt?.toLocaleString(),
	};

export const CacheEntry = (props: Props) => {
	const cacheEntryRevalidateLeft = getEntryRevalidateLeft(props.cacheEntry);
	const status = getEntryStatus(props.cacheEntry);
	const useCacheDetails = getUseCacheDetails(props.cacheEntry);

	return (
		<TableRow>
			<TableCell
				className="nct-truncate nct-max-w-[25vw]"
				title={props.cacheEntry.label}
			>
				{props.cacheEntry.label}
			</TableCell>
			<TableCell>
				<Badge variant="secondary">{props.cacheEntry.source}</Badge>
			</TableCell>
			<TableCell title={cacheEntryRevalidateLeft?.toString() ?? "-"}>
				{status ? (
					<Badge>{status}</Badge>
				) : (
					(props.cacheEntry.revalidate ?? "-")
				)}
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
						{props.cacheEntry.label}
					</DialogTitle>
					<DialogDescription className="nct-hidden">
						{props.cacheEntry.label}
					</DialogDescription>
					{useCacheDetails && (
						<div className="nct-flex nct-items-center nct-space-x-2">
							<JsonView src={useCacheDetails} collapsed={1} />
						</div>
					)}
					<div className="nct-flex nct-items-center nct-space-x-2">
						<JsonView src={props.cacheEntry.body} collapsed={1} />
					</div>
				</DialogContent>
			</Dialog>
		</TableRow>
	);
};
