"use client";

import React, { createContext, useState } from "react";

export type CacheEntriesSorting = {
	key: "url" | "revalidate" | "tags" | "timestamp";
	direction: "asc" | "desc";
};

interface CachePanelContextProps {
	// panel open state
	isOpen: boolean;
	toggleOpen: () => void;
	// sorting value
	sorting?: CacheEntriesSorting;
	setSorting: (value?: CacheEntriesSorting) => void;
}

const CachePanelContext = createContext<CachePanelContextProps>({
	isOpen: false,
	toggleOpen: () => {},
	setSorting: () => {},
});

export const useCachePanelContext = () => React.useContext(CachePanelContext);

export const CachePanelContextProvider = ({
	children,
}: React.PropsWithChildren) => {
	const [isOpen, setIsOpen] = useState(false);
	const [sorting, setSorting] =
		useState<CachePanelContextProps["sorting"]>(undefined);

	const toggleOpen = () => {
		setIsOpen(!isOpen);
	};

	return (
		<CachePanelContext.Provider
			value={{ isOpen, toggleOpen, setSorting, sorting }}
		>
			{children}
		</CachePanelContext.Provider>
	);
};
