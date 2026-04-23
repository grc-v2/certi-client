"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";

import { useCertifications } from "../hooks/use-certifications";
import { CERTIFICATION_LEVELS, DIFFICULTY_LEVELS } from "../schemas/filters";

import { CertificationCard } from "./certification-card";
import { PaginationControls } from "./pagination-controls";

const PAGE_SIZE = 12;

function parsePage(raw: string | null): number {
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export function CertificationListView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const keyword = searchParams.get("keyword") ?? "";
  const provider = searchParams.get("provider") ?? "";
  const level = searchParams.get("level") ?? "";
  const difficultyLevel = searchParams.get("difficultyLevel") ?? "";
  const page = parsePage(searchParams.get("page"));

  const [keywordDraft, setKeywordDraft] = useState(keyword);
  const [providerDraft, setProviderDraft] = useState(provider);

  const params = useMemo(
    () => ({
      keyword: keyword || undefined,
      provider: provider || undefined,
      level: level || undefined,
      difficultyLevel: difficultyLevel || undefined,
      page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      sortDirection: "DESC" as const,
    }),
    [keyword, provider, level, difficultyLevel, page],
  );

  const { data, isLoading, isFetching, error } = useCertifications(params);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>, resetPage = true) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value && value.length > 0) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      }
      if (resetPage) next.delete("page");
      startTransition(() => {
        const qs = next.toString();
        router.replace(qs ? `/certifications?${qs}` : "/certifications");
      });
    },
    [router, searchParams],
  );

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParams({ keyword: keywordDraft.trim(), provider: providerDraft.trim() });
  }

  function handleReset() {
    setKeywordDraft("");
    setProviderDraft("");
    startTransition(() => router.replace("/certifications"));
  }

  function handlePageChange(nextPage: number) {
    updateParams({ page: String(nextPage) }, false);
  }

  const certifications = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const apiMessage =
    error instanceof ApiError
      ? (error.problem.detail ?? error.problem.title)
      : error instanceof Error
        ? error.message
        : null;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Thư viện chứng chỉ</h1>
        <p className="text-muted-foreground text-sm">
          Khám phá và chuẩn bị cho các chứng chỉ công nghệ hàng đầu.
        </p>
      </header>

      <form
        onSubmit={handleSearch}
        className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1 lg:col-span-2">
            <label className="text-muted-foreground text-xs font-medium" htmlFor="filter-keyword">
              Từ khoá
            </label>
            <Input
              id="filter-keyword"
              value={keywordDraft}
              onChange={(e) => setKeywordDraft(e.target.value)}
              placeholder="Tên chứng chỉ, mã chứng chỉ..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-xs font-medium" htmlFor="filter-provider">
              Nhà cung cấp
            </label>
            <Input
              id="filter-provider"
              value={providerDraft}
              onChange={(e) => setProviderDraft(e.target.value)}
              placeholder="AWS, Azure, GCP..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-xs font-medium" htmlFor="filter-level">
              Cấp độ
            </label>
            <select
              id="filter-level"
              value={level}
              onChange={(e) => updateParams({ level: e.target.value })}
              className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-lg border px-3 text-sm shadow-xs focus-visible:ring-3 focus-visible:outline-none"
            >
              <option value="">Tất cả</option>
              {CERTIFICATION_LEVELS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label
              className="text-muted-foreground text-xs font-medium"
              htmlFor="filter-difficulty"
            >
              Độ khó
            </label>
            <select
              id="filter-difficulty"
              value={difficultyLevel}
              onChange={(e) => updateParams({ difficultyLevel: e.target.value })}
              className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-lg border px-3 text-sm shadow-xs focus-visible:ring-3 focus-visible:outline-none"
            >
              <option value="">Tất cả</option>
              {DIFFICULTY_LEVELS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2 lg:col-span-3 lg:justify-end">
            <Button type="submit" disabled={isFetching}>
              {isFetching ? "Đang tìm..." : "Tìm kiếm"}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Đặt lại
            </Button>
          </div>
        </div>
      </form>

      {apiMessage ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
        >
          {apiMessage}
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-muted-foreground py-12 text-center text-sm">Đang tải chứng chỉ...</p>
      ) : certifications.length === 0 ? (
        <div className="border-border bg-card flex flex-col items-center gap-2 rounded-2xl border p-10 text-center">
          <p className="font-medium">Không tìm thấy chứng chỉ nào</p>
          <p className="text-muted-foreground text-sm">
            Thử điều chỉnh bộ lọc hoặc xoá từ khoá để xem thêm kết quả.
          </p>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((item) => (
              <CertificationCard key={item.id} certification={item} />
            ))}
          </section>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </main>
  );
}
