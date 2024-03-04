"use client";

import { TableBody } from "@/components/ui/table";
import { useMemo } from "react";
import { NextCacheFileData } from "../cache-entries/cache-entries-schema";
import { CacheEntry } from "../cache-entry/cache-entry";
import {
	CacheEntriesSorting,
	useCachePanelContext,
} from "./cache-panel-context";

type Props = {
	entries: [string, NextCacheFileData][];
};

const sortCacheEntryByKey = (
	key: CacheEntriesSorting["key"],
	a: NextCacheFileData,
	b: NextCacheFileData,
) => {
	switch (key) {
		case "url":
			if (!a.data || !b.data) {
				return 0;
			}
			return a.data.url.localeCompare(b.data.url);
		case "revalidate":
			return (a.revalidate ?? 0) - (b.revalidate ?? 0);
		case "tags":
			if (a.tags.length === 0 || b.tags.length === 0) {
				return 0;
			}
			return a.tags[0]?.localeCompare(b.tags[0] ?? "") ?? 0;
		case "timestamp": {
			if (!a.data?.headers.date || !b.data?.headers.date) {
				return 0;
			}
			return (
				new Date(b.data.headers.date).getTime() -
				new Date(a.data.headers.date).getTime()
			);
		}
	}
};

export const CachePanelTable = ({ entries }: Props) => {
	const { sorting } = useCachePanelContext();

	const sortedEntries = useMemo(() => {
		if (!sorting) {
			return entries;
		}

		const { key, direction } = sorting;
		return entries.toSorted((a, b) => {
			return (
				sortCacheEntryByKey(key, a[1], b[1]) * (direction === "asc" ? 1 : -1)
			);
		});
	}, [entries, sorting]);

	return (
		<TableBody>
			{sortedEntries.length === 0 && <div>No cache entries</div>}
			{sortedEntries.map(([file, cacheEntry]) => (
				<CacheEntry key={file} cacheEntry={cacheEntry} />
			))}
		</TableBody>
	);
};
