"use client";

import type { CachePanelEntry } from "@/actions/cache-panel-entry";
import React, { createContext, useMemo, useState } from "react";

// TODO: store panel open/close in local storage

export type CacheEntriesSorting = {
	key: "label" | "source" | "revalidate" | "tags" | "timestamp";
	direction: "asc" | "desc";
};

export type CacheEntriesFilter = Partial<Record<"label" | "tags", string>>;

interface CachePanelContextProps {
	// panel open state
	isOpen: boolean;
	toggleOpen: () => void;
	// entries
	entries: CachePanelEntry[];
	setEntries: (value: CachePanelEntry[]) => void;
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
	a: CachePanelEntry,
	b: CachePanelEntry,
) => {
	switch (key) {
		case "label":
			return a.label.localeCompare(b.label);
		case "source":
			return a.source.localeCompare(b.source);
		case "revalidate":
			return (a.revalidate ?? 0) - (b.revalidate ?? 0);
		case "tags":
			if (a.tags.length === 0 || b.tags.length === 0) {
				return 0;
			}
			return a.tags[0]?.localeCompare(b.tags[0] ?? "") ?? 0;
		case "timestamp":
			return b.timestamp.getTime() - a.timestamp.getTime();
	}
};

export const useCachePanelContext = () => React.useContext(CachePanelContext);

export const CachePanelContextProvider = (
	props: React.PropsWithChildren<{
		entries: CachePanelEntry[];
	}>,
) => {
	const [isOpen, setIsOpen] = useState(false);
	const [entries, setEntries] = useState(props.entries);
	const [filters, setFilters] = useState<CachePanelContextProps["filters"]>();
	const [sorting, setSorting] =
		useState<CachePanelContextProps["sorting"]>(undefined);

	const toggleOpen = () => {
		setIsOpen(!isOpen);
		localStorage.setItem("cache-panel-open", (!isOpen).toString());
	};

	React.useEffect(() => {
		if (typeof window !== "undefined") {
			setIsOpen(localStorage.getItem("cache-panel-open") === "true");
		}
	}, []);

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
			const { [key]: _removed, ...rest } = prev;
			return rest;
		});
	};

	const derivedEntries = useMemo(() => {
		let copiedEntries = entries.slice();

		if (filters) {
			copiedEntries = copiedEntries.filter((entry) => {
				const { tags: tagsFilter, label: labelFilter } = filters;
				if (tagsFilter && !entry.tags.some((tag) => tag.match(tagsFilter))) {
					return false;
				}
				if (labelFilter && !entry.label.match(labelFilter)) {
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
			return sortCacheEntryByKey(key, a, b) * (direction === "asc" ? 1 : -1);
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
