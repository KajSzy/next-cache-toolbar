"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/utils/cn";
import { ArrowDownAZIcon, ArrowUpAZIcon, FilterIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  CacheEntriesSorting,
  useCachePanelContext,
} from "../cache-panel/cache-panel-context";

type TableHeadProps = Omit<React.ComponentProps<typeof TableHead>, "onClick">;

type Props = TableHeadProps &
  React.PropsWithChildren<{
    sortingProperty: CacheEntriesSorting["key"];
    withFilter?: boolean;
  }>;

export const CachePanelHead = ({
  sortingProperty,
  children,
  className,
  withFilter = false,
  ...props
}: Props) => {
  const { setSorting, sorting, filters, addFilter, clearFilter } =
    useCachePanelContext();
  const [filterInputVisible, setFilterInputVisible] = useState(false);

  const inputRef = useCallback((node: HTMLInputElement | null) => {
    if (!node) {
      return;
    }
    node.focus();
  }, []);

  const sortingDirection = useMemo(() => {
    if (!sorting || sorting.key !== sortingProperty) {
      return;
    }
    return sorting.direction;
  }, [sorting, sortingProperty]);

  const filterValue = useMemo(() => {
    if (sortingProperty !== "url" && sortingProperty !== "tags") {
      return;
    }
    return filters?.[sortingProperty] ?? "";
  }, [sortingProperty, filters]);

  const shouldRenderFilterIcon =
    !filterInputVisible && withFilter && filterValue;

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

  const onFilterInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (sortingProperty !== "url" && sortingProperty !== "tags") {
      return;
    }

    // clear value on esc
    if (event.key === "Escape") {
      clearFilter(sortingProperty);
      setFilterInputVisible(false);
    }
  };

  const onFilterInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (sortingProperty !== "url" && sortingProperty !== "tags") {
      return;
    }

    addFilter(sortingProperty, event.target.value);
  };

  const onFilterInputBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (sortingProperty !== "url" && sortingProperty !== "tags") {
      return;
    }

    if (event.target.value === "") {
      setFilterInputVisible(false);
    }
  };

  return (
    <TableHead className={cn("group", className)} {...props} aria-sort="ascending">
      <div
        className={cn(
          "nct-flex nct-items-center nct-gap-2 nct-py-2",
          sorting?.key === sortingProperty && "nct-underline"
        )}
      >
        <Button
          variant="link"
          size="sm"
          className={cn('nct-px-0')}
          onClick={onHeadClick}
          onKeyDown={onHeadClick}
        >
          {children}
        </Button>
        {sortingDirection === "asc" && <ArrowDownAZIcon />}
        {sortingDirection === "desc" && <ArrowUpAZIcon />}
        {withFilter && (
          <div className="ml-auto">
            {!filterInputVisible && (
              <Button
                variant="ghost"
                size="icon"
                className={cn()}
                onClick={() => setFilterInputVisible(true)}
              >
                <FilterIcon />
              </Button>
            )}
            {filterInputVisible && (
              <Input
                onKeyDown={onFilterInputKeyDown}
                value={filterValue}
                onChange={onFilterInputChange}
                onBlur={onFilterInputBlur}
                ref={inputRef}
              />
            )}
          </div>
        )}
      </div>
    </TableHead>
  );
};
