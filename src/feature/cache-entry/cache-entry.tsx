"use client";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useMemo } from "react";
import { NextCacheFileData } from "../cache-entries/cache-entries-schema";

type Props = {
	cacheEntry: NextCacheFileData;
};

export const CacheEntry = (props: Props) => {
	const cacheEntryRevalidateLeft = useMemo(() => {
		if (!props.cacheEntry.data?.headers.date || !props.cacheEntry.revalidate) {
			return;
		}
		const cacheEntryDate = new Date(props.cacheEntry.data?.headers.date);
		const msDiff = new Date().getTime() - cacheEntryDate.getTime();
		return Math.floor(props.cacheEntry.revalidate - msDiff / 1000);
	}, [props.cacheEntry.data?.headers.date, props.cacheEntry.revalidate]);

	const isStale = cacheEntryRevalidateLeft
		? cacheEntryRevalidateLeft < 0
		: false;

	return (
		<TableRow>
			<TableCell className="nct-truncate nct-max-w-[25vw]">
				{props.cacheEntry.data?.url}
			</TableCell>
			<TableCell title={cacheEntryRevalidateLeft?.toString() ?? "-"}>
				{isStale ? <Badge>STALE</Badge> : props.cacheEntry.revalidate ?? "-"}
			</TableCell>
			<TableCell className="nct-break-before-all">
				{props.cacheEntry.tags.join("\n")}
			</TableCell>
			<TableCell>{props.cacheEntry.data?.headers.date}</TableCell>
			{/* TODO: add body preview */}
			{/* <TableCell className="nct-flex nct-justify-center">
				<Button variant="ghost" size="icon">
					<Braces size={16} />
				</Button>
			</TableCell> */}
		</TableRow>
	);
};
