"use client";

import { TableHead } from "@/components/ui/table";
import { cn } from "@/utils/cn";
import { ArrowDownAZIcon, ArrowUpAZIcon } from "lucide-react";
import { useMemo } from "react";
import {
  CacheEntriesSorting,
  useCachePanelContext,
} from "./cache-panel-context";

type TableHeadProps = Omit<React.ComponentProps<typeof TableHead>, "onClick">;

type Props = TableHeadProps &
  React.PropsWithChildren<{
    sortingProperty: CacheEntriesSorting["key"];
  }>;

export const CachePanelHead = ({
  sortingProperty,
  children,
  ...props
}: Props) => {
  const { setSorting, sorting } = useCachePanelContext();

  const sortingDirection = useMemo(() => {
    if (!sorting || sorting.key !== sortingProperty) {
      return;
    }
    return sorting.direction;
  }, [sorting, sortingProperty]);

  const onHeadClick = () => {
    if (sorting && sorting.key === sortingProperty) {
      setSorting({
        key: sortingProperty,
        direction: sorting.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSorting({
        key: sortingProperty,
        direction: "asc",
      });
    }
  };

  return (
    <TableHead onClick={onHeadClick} {...props}>
      <div
        className={cn(
          "nct-flex nct-items-center nct-gap-2",
          sorting?.key === sortingProperty && "nct-underline"
        )}
      >
        {children}
        {sortingDirection === "asc" && <ArrowDownAZIcon />}
        {sortingDirection === "desc" && <ArrowUpAZIcon />}
      </div>
    </TableHead>
  );
};
