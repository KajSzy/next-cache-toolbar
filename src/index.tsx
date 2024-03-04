"use server";

import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Braces, PanelBottomCloseIcon } from "lucide-react";
import { getCacheFiles } from "./feature/cache-entries/getCacheEntries";
import { CachePanelContextProvider } from "./feature/cache-panel-context/cache-panel-context";
import { CachePanelHead } from "./feature/cache-panel-context/cache-panel-head";
import { CachePanelTable } from "./feature/cache-panel-context/cache-panel-table";
import { CachePanelTrigger } from "./feature/cache-panel-context/cache-panel-trigger";
import { CacheTable } from "./feature/cache-panel-context/cache-panel-wrapper";
import { RefreshDataButton } from "./feature/refresh-data-button/refresh-data-button";

export async function NextCacheToolbar() {
	const files = await getCacheFiles();

	const cacheEntries = Array.from(files?.entries() ?? []);

	return (
		<div id="next-cache-toolbar">
			<CachePanelContextProvider>
				<CachePanelTrigger className="nct-fixed nct-rounded-full nct-bottom-4 nct-right-4 nct-bg-gradient-to-r nct-from-fuchsia-500 nct-to-cyan-500">
					<Braces />
				</CachePanelTrigger>
				<CacheTable>
					<TableHeader className="nct-sticky nct-top-0 nct-bg-background">
						<TableRow>
							<CachePanelHead sortingProperty="url" className="nct-w-[300px]">
								URL
							</CachePanelHead>
							<CachePanelHead sortingProperty="revalidate">
								Revalidate
							</CachePanelHead>
							<CachePanelHead sortingProperty="tags">Tags</CachePanelHead>
							<CachePanelHead
								sortingProperty="timestamp"
								className="nct-w-[300px]"
							>
								Timestamp
							</CachePanelHead>
							<TableHead>
								<div className="nct-flex nct-items-center nct-justify-end nct-gap-2">
									<RefreshDataButton />
									<CachePanelTrigger>
										<PanelBottomCloseIcon />
									</CachePanelTrigger>
								</div>
							</TableHead>
						</TableRow>
					</TableHeader>
					<CachePanelTable entries={cacheEntries} />
				</CacheTable>
			</CachePanelContextProvider>
		</div>
	);
}
