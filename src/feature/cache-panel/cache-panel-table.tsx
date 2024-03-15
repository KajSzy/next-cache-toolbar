"use client";

import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { CacheEntry } from "./cache-entry";
import { useCachePanelContext } from "./cache-panel-context";

export const CachePanelTable = () => {
  const { entries } = useCachePanelContext();

  return (
    <TableBody>
      {entries.length === 0 && (
        <TableRow>
          <TableCell>No cache entries</TableCell>
        </TableRow>
      )}
      {entries.map(([file, cacheEntry]) => (
        <CacheEntry key={file} cacheEntry={cacheEntry} />
      ))}
    </TableBody>
  );
};
