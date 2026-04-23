"use client";

import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: PaginationControlsProps) {
  const start = totalElements === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-muted-foreground text-xs">
        Hiển thị {start}-{end} trên {totalElements} kết quả
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page <= 0}
        >
          Trước
        </Button>
        <span className="text-muted-foreground text-xs">
          Trang {totalPages === 0 ? 0 : page + 1} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={totalPages === 0 || page >= totalPages - 1}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}
