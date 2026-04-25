import { forwardRef } from "react";

import { cn } from "@/lib/utils";

const Table = forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(function Table(
  { className, ...props },
  ref,
) {
  return (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
});

const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function TableHeader({ className, ...props }, ref) {
  return <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />;
});

const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function TableBody({ className, ...props }, ref) {
  return <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
});

const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  function TableRow({ className, ...props }, ref) {
    return (
      <tr
        ref={ref}
        className={cn(
          "hover:bg-muted/40 data-[state=selected]:bg-muted border-b transition-colors",
          className,
        )}
        {...props}
      />
    );
  },
);

const TableHead = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  function TableHead({ className, ...props }, ref) {
    return (
      <th
        ref={ref}
        className={cn(
          "text-muted-foreground h-10 px-3 text-left align-middle text-xs font-medium [&:has([role=checkbox])]:pr-0",
          className,
        )}
        {...props}
      />
    );
  },
);

const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  function TableCell({ className, ...props }, ref) {
    return (
      <td
        ref={ref}
        className={cn("px-3 py-2 align-middle [&:has([role=checkbox])]:pr-0", className)}
        {...props}
      />
    );
  },
);

const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(function TableCaption({ className, ...props }, ref) {
  return (
    <caption ref={ref} className={cn("text-muted-foreground mt-4 text-sm", className)} {...props} />
  );
});

export { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow };
