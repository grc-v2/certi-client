"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

import { useCompleteTask, useTaskDetail } from "../hooks/use-study-plan-tasks";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chưa làm",
  IN_PROGRESS: "Đang làm",
  COMPLETED: "Hoàn thành",
  SKIPPED: "Bỏ qua",
};

const STATUS_CLASSES: Record<string, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  IN_PROGRESS: "bg-primary/10 text-primary",
  PENDING: "bg-muted text-muted-foreground",
  SKIPPED: "bg-muted text-muted-foreground",
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  return y && m && d ? `${d}/${m}/${y}` : value;
}

function Section({ title, items }: { title: string; items: string[] | null | undefined }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="text-muted-foreground flex list-disc flex-col gap-1 pl-5 text-sm">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

interface TaskDetailPanelProps {
  planId: number;
  taskId: number;
  defaultActualMinutes?: number;
  onClose: () => void;
}

export function TaskDetailPanel({
  planId,
  taskId,
  defaultActualMinutes,
  onClose,
}: TaskDetailPanelProps) {
  const { data, isLoading, error } = useTaskDetail(planId, taskId);
  const completeMutation = useCompleteTask();
  const [actualMinutes, setActualMinutes] = useState<string>(
    defaultActualMinutes ? String(defaultActualMinutes) : "",
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (data?.actualMinutes) {
      setActualMinutes(String(data.actualMinutes));
    } else if (data?.estimatedMinutes && !actualMinutes) {
      setActualMinutes(String(data.estimatedMinutes));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const completed = data?.status === "COMPLETED";

  async function handleComplete() {
    setSubmitError(null);
    const minutes = Number(actualMinutes);
    if (!Number.isFinite(minutes) || minutes < 1) {
      setSubmitError("Nhập thời gian thực tế tối thiểu 1 phút.");
      return;
    }
    try {
      await completeMutation.mutateAsync({ planId, taskId, actualMinutes: minutes });
      toast.success("Đã đánh dấu nhiệm vụ hoàn thành.");
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.problem.detail ?? err.problem.title);
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Không thể hoàn thành nhiệm vụ.");
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-background border-border flex h-full w-full max-w-md flex-col overflow-y-auto border-l shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="border-border flex items-start justify-between gap-3 border-b p-5">
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {data?.taskType ?? "Nhiệm vụ"} · {formatDate(data?.scheduledDate)}
            </p>
            <h2 className="text-lg leading-tight font-semibold">
              {data?.title ?? (isLoading ? "Đang tải..." : "Nhiệm vụ")}
            </h2>
            {data?.domainName ? (
              <p className="text-muted-foreground text-xs">{data.domainName}</p>
            ) : null}
          </div>
          <Button variant="ghost" size="icon-sm" type="button" onClick={onClose} aria-label="Đóng">
            ✕
          </Button>
        </header>

        {isLoading ? (
          <p className="text-muted-foreground p-5 text-sm">Đang tải chi tiết nhiệm vụ...</p>
        ) : error ? (
          <p className="text-destructive p-5 text-sm">
            {error instanceof ApiError
              ? (error.problem.detail ?? error.problem.title)
              : error.message}
          </p>
        ) : data ? (
          <div className="flex flex-1 flex-col gap-5 p-5">
            <div className="flex flex-wrap gap-2 text-xs">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-medium",
                  STATUS_CLASSES[data.status] ?? "bg-muted text-muted-foreground",
                )}
              >
                {STATUS_LABELS[data.status] ?? data.status}
              </span>
              {data.estimatedMinutes ? (
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                  Dự kiến: {data.estimatedMinutes} phút
                </span>
              ) : null}
              {data.actualMinutes ? (
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                  Thực tế: {data.actualMinutes} phút
                </span>
              ) : null}
            </div>

            {data.description ? (
              <p className="text-sm whitespace-pre-line">{data.description}</p>
            ) : null}

            <Section title="Kiến thức trọng tâm" items={data.keyKnowledge} />
            <Section title="Mục tiêu học tập" items={data.learningObjectives} />
            <Section title="Mẹo làm bài" items={data.examTips} />

            {!completed ? (
              <section className="border-border bg-card mt-auto flex flex-col gap-3 rounded-xl border p-4">
                <FormField
                  label="Thời gian thực tế (phút)"
                  htmlFor="actualMinutes"
                  error={submitError ?? undefined}
                  hint="Ghi nhận thời gian bạn đã dành cho nhiệm vụ này"
                >
                  <Input
                    id="actualMinutes"
                    type="number"
                    min={1}
                    value={actualMinutes}
                    onChange={(e) => setActualMinutes(e.target.value)}
                  />
                </FormField>
                <Button
                  type="button"
                  onClick={handleComplete}
                  disabled={completeMutation.isPending}
                >
                  {completeMutation.isPending ? "Đang lưu..." : "Đánh dấu hoàn thành"}
                </Button>
              </section>
            ) : (
              <p className="text-muted-foreground mt-auto rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-400">
                Nhiệm vụ này đã được hoàn thành.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
