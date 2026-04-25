import { forwardRef } from "react";

import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      data-slot="select"
      className={cn(
        "border-input bg-background flex h-9 w-full appearance-none rounded-lg border px-3 py-1 pr-8 text-sm shadow-xs transition-colors",
        "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2212%22%20height=%2212%22%20fill=%22none%22%20viewBox=%220%200%2024%2024%22%20stroke=%22currentColor%22%20stroke-width=%222%22%3E%3Cpath%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%20d=%22M19%209l-7%207-7-7%22/%3E%3C/svg%3E')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-3",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export { Select };
