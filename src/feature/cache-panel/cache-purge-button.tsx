"use client";

import * as serverActions from "@/actions/purge-cache";
import { Button } from "@/components/ui/button";
import { BombIcon } from "lucide-react";
import { useCachePanelContext } from "./cache-panel-context";

type Props = {
	distDir: string;
};

export function CachePurgeButton({ distDir }: Props) {
	const { setEntries } = useCachePanelContext();

	const purgeCache = () => {
		serverActions.purgeCache(distDir).then(() => {
			setEntries([]);
		});
	};

	return (
		<Button variant="outline" size="icon" onClick={purgeCache}>
			<BombIcon className="nct-h-4 nct-w-4" />
		</Button>
	);
}
