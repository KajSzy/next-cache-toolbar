import { Layers3Icon, PanelBottomCloseIcon } from "lucide-react";
import { Suspense } from "react";
import { getCacheEntries } from "./actions/cache-actions";
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

// Reading cache entries is uncached I/O. With `cacheComponents` enabled it has to
// happen inside <Suspense>, otherwise the toolbar would block the whole route.
// Kept async so the public type stays the same: React 18 projects suppress the
// async component type error with `@ts-expect-error`, which fails when unused.
export async function NextCacheToolbar(props: Props) {
	return (
		<Suspense fallback={null}>
			<NextCacheToolbarContent {...props} />
		</Suspense>
	);
}

async function NextCacheToolbarContent({
	autoRefresh = false,
	interval = 10000,
	purgeButton = false,
	distDir = ".next",
}: Props) {
	const entries = await getCacheEntries(distDir);

	return (
		<div id="next-cache-toolbar" className="nct-text-primary nct-font-mono">
			<CachePanelContextProvider entries={entries}>
				<CachePanelTrigger
					rounded="full"
					className="nct-fixed nct-bottom-4 nct-right-4 nct-bg-gradient-to-r nct-from-fuchsia-500 nct-to-cyan-500"
				>
					<Layers3Icon />
				</CachePanelTrigger>
				<CacheTable>
					<TableHeader className="nct-sticky nct-top-0 nct-bg-background">
						<TableRow>
							<CachePanelHead
								sortingProperty="label"
								className="nct-w-[300px]"
								withFilter
							>
								URL / Function
							</CachePanelHead>
							<CachePanelHead sortingProperty="source">Source</CachePanelHead>
							<CachePanelHead sortingProperty="revalidate">
								Revalidate (s)
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
									{purgeButton && <CachePurgeButton distDir={distDir} />}
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
