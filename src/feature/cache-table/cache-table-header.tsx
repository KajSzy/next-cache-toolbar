import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CachePanelHead } from "./cache-panel-head";

export const CacheTableHeader = (props: React.PropsWithChildren) => {
	return (
		<TableHeader className="nct-sticky nct-top-0 nct-bg-background">
			<TableRow>
				<CachePanelHead sortingProperty="url" className="nct-w-[300px]">
					URL
				</CachePanelHead>
				<CachePanelHead sortingProperty="revalidate">Revalidate</CachePanelHead>
				<CachePanelHead sortingProperty="tags">Tags</CachePanelHead>
				<CachePanelHead sortingProperty="timestamp" className="nct-w-[300px]">
					Timestamp
				</CachePanelHead>
				<TableHead>
					<div className="nct-flex nct-items-center nct-justify-end nct-gap-2">
						{props.children}
						{/* <RefreshDataButton />
						<CachePanelTrigger>
							<PanelBottomCloseIcon />
						</CachePanelTrigger> */}
					</div>
				</TableHead>
			</TableRow>
		</TableHeader>
	);
};
