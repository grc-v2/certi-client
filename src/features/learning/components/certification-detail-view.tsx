"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

import { useCertification } from "../hooks/use-certifications";

import { DomainTree } from "./domain-tree";
import { ExamList } from "./exam-list";

type Tab = "overview" | "domains" | "exams";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Tổng quan" },
  { id: "domains", label: "Domains" },
  { id: "exams", label: "Bài thi" },
];

const LEVEL_LABELS: Record<string, string> = {
  FOUNDATIONAL: "Cơ bản",
  ASSOCIATE: "Associate",
  PROFESSIONAL: "Professional",
  SPECIALTY: "Specialty",
  EXPERT: "Expert",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: "Mới bắt đầu",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Nâng cao",
  EXPERT: "Chuyên gia",
};

function formatPrice(price: string | null | undefined): string | null {
  if (!price) return null;
  const amount = Number(price);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function formatScore(score: string | null | undefined): string | null {
  if (!score) return null;
  const num = Number(score);
  if (!Number.isFinite(num)) return null;
  return `${num}%`;
}

function MetadataItem({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === "" || value === undefined) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function CertificationDetailView({ slug }: { slug: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  const { data, isLoading, error } = useCertification(slug);

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-muted-foreground text-sm">Đang tải thông tin chứng chỉ...</p>
      </main>
    );
  }

  if (error || !data) {
    const detail =
      error instanceof ApiError
        ? (error.problem.detail ?? error.problem.title)
        : "Không tìm thấy chứng chỉ.";
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Không tải được chứng chỉ</h1>
        <p className="text-muted-foreground text-sm">{detail}</p>
        <Button variant="outline" render={<Link href="/certifications" />}>
          Quay lại danh sách
        </Button>
      </main>
    );
  }

  const level = data.level ? (LEVEL_LABELS[data.level] ?? data.level) : null;
  const difficulty = data.difficultyLevel
    ? (DIFFICULTY_LABELS[data.difficultyLevel] ?? data.difficultyLevel)
    : null;
  const price = formatPrice(data.price);
  const examPrice = formatPrice(data.examPriceUsd);
  const passingScore = formatScore(data.passingScore);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <nav className="text-muted-foreground flex items-center gap-2 text-xs">
        <Link href="/certifications" className="hover:text-foreground">
          Chứng chỉ
        </Link>
        <span>/</span>
        <span className="text-foreground">{data.code}</span>
      </nav>

      <header className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {data.provider ?? "—"}
            </span>
            {level ? (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                {level}
              </span>
            ) : null}
            {difficulty ? (
              <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                {difficulty}
              </span>
            ) : null}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{data.name}</h1>
          <p className="text-muted-foreground text-sm">{data.code}</p>
        </div>
        {data.tagline ? <p className="text-base">{data.tagline}</p> : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetadataItem
            label="Thời lượng"
            value={data.durationMinutes ? `${data.durationMinutes} phút` : null}
          />
          <MetadataItem label="Số câu hỏi" value={data.totalQuestions ?? null} />
          <MetadataItem label="Điểm đậu" value={passingScore} />
          <MetadataItem
            label="Thời gian ôn"
            value={data.averagePrepWeeks ? `${data.averagePrepWeeks} tuần` : null}
          />
          <MetadataItem label="Giá (VND)" value={price} />
          <MetadataItem label="Phí thi (USD)" value={examPrice} />
        </div>
      </header>

      <div className="border-border flex gap-2 border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "relative -mb-px px-4 py-2 text-sm transition-colors",
              tab === t.id
                ? "text-foreground border-primary border-b-2 font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <section className="border-border bg-card rounded-2xl border p-6">
        {tab === "overview" ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {data.overview ? (
              <p className="text-sm leading-relaxed whitespace-pre-line">{data.overview}</p>
            ) : data.description ? (
              <p className="text-sm leading-relaxed whitespace-pre-line">{data.description}</p>
            ) : (
              <p className="text-muted-foreground text-sm">Chưa có nội dung tổng quan.</p>
            )}
          </div>
        ) : tab === "domains" ? (
          <DomainTree domains={data.domains ?? []} />
        ) : (
          <ExamList exams={data.exams ?? []} />
        )}
      </section>
    </main>
  );
}
