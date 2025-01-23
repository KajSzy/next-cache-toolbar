"use client";

import { Table } from "@/components/ui/table";
import type React from "react";
import { useCachePanelContext } from "./cache-panel-context";

export const CacheTable = (props: React.PropsWithChildren) => {
	const { isOpen } = useCachePanelContext();

	if (!isOpen) {
		return null;
	}

	return (
		<div className="nct-fixed nct-bottom-0 nct-inset-x-0 nct-z-50 nct-bg-background nct-overflow-x-auto nct-h-[480px]">
			<Table>{props.children}</Table>
		</div>
	);
};
