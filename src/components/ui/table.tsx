import * as React from "react";

import { cn } from "@/utils/cn";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={cn("nct-w-full nct-caption-bottom nct-text-sm", className)}
    {...props}
  />
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("[&_tr]:nct-border-b", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:nct-border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "nct-border-t nct-bg-muted/50 nct-font-medium [&>tr]:last:nct-border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "nct-border-b nct-transition-colors hover:nct-bg-muted/50 data-[state=selected]:nct-bg-muted",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableHeaderCellElement,
  React.ThHTMLAttributes<HTMLTableHeaderCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "nct-h-12 nct-px-4 nct-text-left nct-align-middle nct-font-medium nct-text-muted-foreground [&:has([role=checkbox])]:nct-pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableHeaderCellElement,
  React.TdHTMLAttributes<HTMLTableHeaderCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "nct-p-4 nct-align-middle [&:has([role=checkbox])]:nct-pr-0",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("nct-mt-4 nct-text-sm nct-text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
