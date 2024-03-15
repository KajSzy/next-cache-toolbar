"use client";

import { NextCacheFileData } from "@/actions/cache-entries-schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TableCell, TableRow } from "@/components/ui/table";
import { Braces } from "lucide-react";
import JsonView from "react18-json-view";

type Props = {
  cacheEntry: NextCacheFileData;
};

const getEntryRevalidateLeft = (cacheEntry: NextCacheFileData) => {
  if (!cacheEntry.data?.headers.date || !cacheEntry.revalidate) {
    return;
  }
  const cacheEntryDate = new Date(cacheEntry.data?.headers.date);
  const msDiff = new Date().getTime() - cacheEntryDate.getTime();
  return Math.floor(cacheEntry.revalidate - msDiff / 1000);
};

export const CacheEntry = (props: Props) => {
  const cacheEntryRevalidateLeft = getEntryRevalidateLeft(props.cacheEntry);

  const isStale = cacheEntryRevalidateLeft
    ? cacheEntryRevalidateLeft < 0
    : false;

  return (
    <TableRow>
      <TableCell className="nct-truncate nct-max-w-[25vw]">
        {props.cacheEntry.data?.url}
      </TableCell>
      <TableCell title={cacheEntryRevalidateLeft?.toString() ?? "-"}>
        {isStale ? <Badge>STALE</Badge> : props.cacheEntry.revalidate ?? "-"}
      </TableCell>
      <TableCell className="nct-break-before-all">
        {props.cacheEntry.tags.join("\n")}
      </TableCell>
      <TableCell>{props.cacheEntry.data?.headers.date}</TableCell>
      <Dialog>
        <DialogTrigger asChild>
          <TableCell className="nct-flex nct-justify-center">
            <Button variant="ghost" size="icon">
              <Braces size={16} />
            </Button>
          </TableCell>
        </DialogTrigger>
        <DialogContent className="sm:nct-max-w-3xl nct-max-h-[65vh] nct-overflow-y-auto nct-overflow-x-hidden">
          <div className="nct-flex nct-items-center nct-space-x-2">
            <JsonView src={props.cacheEntry.data.body} />
          </div>
        </DialogContent>
      </Dialog>
    </TableRow>
  );
};
