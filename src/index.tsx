import { Layers3Icon, PanelBottomCloseIcon } from "lucide-react";
import { getCacheFiles } from "./actions/getCacheEntries";
import { TableHead, TableHeader, TableRow } from "./components/ui/table";
import { CachePanelContextProvider } from "./feature/cache-panel/cache-panel-context";
import { CachePanelTable } from "./feature/cache-panel/cache-panel-table";
import { CachePanelTrigger } from "./feature/cache-panel/cache-panel-trigger";
import { CacheTable } from "./feature/cache-panel/cache-panel-wrapper";
import { CachePurgeButton } from "./feature/cache-panel/cache-purge-button";
import { RefreshDataButton } from "./feature/cache-panel/cache-refresh-data";
import { CachePanelHead } from "./feature/cache-table/cache-panel-head";

type Props = {
	/**
	 * If true, the cache table will automatically refresh when the pathname changes.
	 * @default false
	 */
	autoRefresh?: boolean;
	/**
	 * The interval in milliseconds to refresh the cache table.
	 * @default 10000
	 */
	interval?: number;
	/**
	 * If true, the purge button will be shown.
	 * @default false
	 */
	purgeButton?: boolean;
	/**
	 * Output path for next build, should be in sync with `distDir` parameter from next.config
	 * @default ".next"
	 */
	distDir?: string;
};

export async function NextCacheToolbar({
	autoRefresh = false,
	interval = 10000,
	purgeButton = false,
	distDir = ".next",
}: Props) {
	const files = await getCacheFiles(distDir);

	return (
		<div id="next-cache-toolbar" className="nct-text-primary nct-font-mono">
			<CachePanelContextProvider entries={files ?? []}>
				<CachePanelTrigger className="nct-fixed nct-rounded-full nct-bottom-4 nct-right-4 nct-bg-gradient-to-r nct-from-fuchsia-500 nct-to-cyan-500">
					<Layers3Icon />
				</CachePanelTrigger>
				<CacheTable>
					<TableHeader className="nct-sticky nct-top-0 nct-bg-background">
						<TableRow>
							<CachePanelHead
								sortingProperty="url"
								className="nct-w-[300px]"
								withFilter
							>
								URL
							</CachePanelHead>
							<CachePanelHead sortingProperty="revalidate">
								Revalidate (ms)
							</CachePanelHead>
							<CachePanelHead sortingProperty="tags" withFilter>
								Tags
							</CachePanelHead>
							<CachePanelHead
								sortingProperty="timestamp"
								className="nct-w-[300px]"
							>
								Timestamp
							</CachePanelHead>
							<TableHead>
								<div className="nct-flex nct-items-center nct-justify-end nct-gap-2">
									<RefreshDataButton
										enabled={autoRefresh}
										interval={interval}
										distDir={distDir}
									/>
									{purgeButton && <CachePurgeButton />}
									<CachePanelTrigger>
										<PanelBottomCloseIcon />
									</CachePanelTrigger>
								</div>
							</TableHead>
						</TableRow>
					</TableHeader>
					<CachePanelTable />
				</CacheTable>
			</CachePanelContextProvider>
		</div>
	);
}
