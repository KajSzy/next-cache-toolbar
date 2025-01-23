"use client";

import * as serverActions from "@/actions/purge-cache";
import { Button } from "@/components/ui/button";
import { BombIcon } from "lucide-react";
import { useCachePanelContext } from "./cache-panel-context";

export function CachePurgeButton() {
	const { setEntries } = useCachePanelContext();

	const purgeCache = () => {
		serverActions.purgeCache().then(() => {
			setEntries([]);
		});
	};

	return (
		<Button variant="outline" size="icon" onClick={purgeCache}>
			<BombIcon className="nct-h-4 nct-w-4" />
		</Button>
	);
}
