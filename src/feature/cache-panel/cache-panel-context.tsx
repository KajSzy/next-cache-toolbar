"use client";

import type { NextCacheFileData } from "@/actions/cache-entries-schema";
import React, { createContext, useMemo, useState } from "react";

// TODO: store panel open/close in local storage

export type CacheEntriesSorting = {
	key: "url" | "revalidate" | "tags" | "timestamp";
	direction: "asc" | "desc";
};

export type CacheEntriesFilter = Partial<Record<"url" | "tags", string>>;

interface CachePanelContextProps {
	// panel open state
	isOpen: boolean;
	toggleOpen: () => void;
	// entries
	entries: [string, NextCacheFileData][];
	setEntries: (value: [string, NextCacheFileData][]) => void;
	// sorting value
	sorting?: CacheEntriesSorting;
	setSorting: (value?: CacheEntriesSorting) => void;
	// filter by property
	filters?: CacheEntriesFilter;
	addFilter: (key: keyof CacheEntriesFilter, value: string) => void;
	clearFilter: (key: keyof CacheEntriesFilter) => void;
}

const CachePanelContext = createContext<CachePanelContextProps>({
	entries: [],
	isOpen: false,
	setEntries: () => {},
	toggleOpen: () => {},
	setSorting: () => {},
	addFilter: () => {},
	clearFilter: () => {},
});

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

export const useCachePanelContext = () => React.useContext(CachePanelContext);

export const CachePanelContextProvider = (
	props: React.PropsWithChildren<{
		entries: Array<[string, NextCacheFileData]>;
	}>,
) => {
	const [isOpen, setIsOpen] = useState(false);
	const [entries, setEntries] = useState(props.entries);
	const [filters, setFilters] = useState<CachePanelContextProps["filters"]>();
	const [sorting, setSorting] =
		useState<CachePanelContextProps["sorting"]>(undefined);

	const toggleOpen = () => {
		setIsOpen(!isOpen);
	};

	const addFilter = (key: keyof CacheEntriesFilter, value: string) => {
		setFilters((prev) => {
			if (!prev) {
				return {
					[key]: value,
				};
			}
			return {
				...prev,
				[key]: value,
			};
		});
	};

	const clearFilter = (key: keyof CacheEntriesFilter) => {
		setFilters((prev) => {
			if (!prev) {
				return;
			}
			delete prev[key];
			return prev;
		});
	};

	const derivedEntries = useMemo(() => {
		let copiedEntries = entries.slice();

		if (filters) {
			copiedEntries = copiedEntries.filter((entry) => {
				const { tags: tagsFilter, url: urlFilter } = filters;
				if (tagsFilter && !entry[1].tags.some((tag) => tag.match(tagsFilter))) {
					return false;
				}
				if (urlFilter && !entry[1].data.url.match(urlFilter)) {
					return false;
				}
				return true;
			});
		}

		if (!sorting) {
			return copiedEntries;
		}

		const { key, direction } = sorting;
		return copiedEntries.toSorted((a, b) => {
			return (
				sortCacheEntryByKey(key, a[1], b[1]) * (direction === "asc" ? 1 : -1)
			);
		});
	}, [entries, sorting, filters]);

	return (
		<CachePanelContext.Provider
			value={{
				isOpen,
				toggleOpen,
				setSorting,
				sorting,
				entries: derivedEntries,
				setEntries,
				filters,
				addFilter,
				clearFilter,
			}}
		>
			{props.children}
		</CachePanelContext.Provider>
	);
};
