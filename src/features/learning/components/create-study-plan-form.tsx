"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { applyApiErrorToForm } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

import { toCreatePayload } from "../api/study-plans";
import { useCertifications } from "../hooks/use-certifications";
import { useCreateStudyPlan } from "../hooks/use-study-plans";
import {
  createStudyPlanSchema,
  EXPERIENCE_LEVELS,
  WEEKDAYS,
  type CreateStudyPlanInput,
} from "../schemas/study-plan";

const EXPERIENCE_LABELS: Record<(typeof EXPERIENCE_LEVELS)[number], string> = {
  BEGINNER: "Mới bắt đầu",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Nâng cao",
  EXPERT: "Chuyên gia",
};

const WEEKDAY_LABELS: Record<(typeof WEEKDAYS)[number], string> = {
  MONDAY: "T2",
  TUESDAY: "T3",
  WEDNESDAY: "T4",
  THURSDAY: "T5",
  FRIDAY: "T6",
  SATURDAY: "T7",
  SUNDAY: "CN",
};

function defaultExamDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toISOString().slice(0, 10);
}

export function CreateStudyPlanForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetCertificationId = Number(searchParams.get("certificationId") ?? "") || undefined;

  const [topLevelError, setTopLevelError] = useState<string | null>(null);
  const [certKeyword, setCertKeyword] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setError,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateStudyPlanInput>({
    resolver: zodResolver(createStudyPlanSchema),
    defaultValues: {
      certificationId: presetCertificationId ?? 0,
      examDate: defaultExamDate(),
      dailyStudyMinutes: 60,
      studyDaysPerWeek: 5,
      preferredStudyDays: [],
      experienceLevel: "INTERMEDIATE",
    },
  });

  const certificationsQuery = useCertifications({
    keyword: certKeyword || undefined,
    page: 0,
    size: 20,
    sortBy: "name",
    sortDirection: "ASC",
  });
  const certificationOptions = certificationsQuery.data?.content ?? [];
  const selectedCertId = watch("certificationId");
  const selectedCert = useMemo(
    () => certificationOptions.find((c) => c.id === selectedCertId),
    [certificationOptions, selectedCertId],
  );
  const preferredDays = watch("preferredStudyDays") ?? [];
  const studyDaysPerWeek = watch("studyDaysPerWeek") ?? 5;

  const createMutation = useCreateStudyPlan();

  async function onSubmit(values: CreateStudyPlanInput) {
    setTopLevelError(null);
    try {
      const plan = await createMutation.mutateAsync(toCreatePayload(values));
      toast.success("Đã tạo kế hoạch ôn thi.");
      router.push(`/my-prep/${plan.id}`);
    } catch (error) {
      setTopLevelError(applyApiErrorToForm(error, setError));
    }
  }

  function toggleDay(day: (typeof WEEKDAYS)[number]) {
    const next = preferredDays.includes(day)
      ? preferredDays.filter((d) => d !== day)
      : [...preferredDays, day];
    setValue("preferredStudyDays", next, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <nav className="text-muted-foreground flex items-center gap-2 text-xs">
        <Link href="/my-prep" className="hover:text-foreground">
          Kế hoạch ôn thi
        </Link>
        <span>/</span>
        <span className="text-foreground">Tạo mới</span>
      </nav>

      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Tạo kế hoạch ôn thi</h1>
        <p className="text-muted-foreground text-sm">
          Chọn chứng chỉ, ngày thi và nhịp học để chúng tôi xây dựng lộ trình phù hợp.
        </p>
      </header>

      {topLevelError ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
        >
          {topLevelError}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="border-border bg-card flex flex-col gap-6 rounded-2xl border p-6"
      >
        <FormField
          label="Chứng chỉ"
          htmlFor="cert-keyword"
          error={errors.certificationId?.message}
          hint={selectedCert ? `Đang chọn: ${selectedCert.code} — ${selectedCert.name}` : undefined}
        >
          <Input
            id="cert-keyword"
            placeholder="Tìm theo tên hoặc mã chứng chỉ..."
            value={certKeyword}
            onChange={(e) => setCertKeyword(e.target.value)}
          />
          <div className="border-border bg-background mt-2 flex max-h-56 flex-col overflow-y-auto rounded-lg border">
            {certificationsQuery.isLoading ? (
              <p className="text-muted-foreground p-3 text-xs">Đang tải...</p>
            ) : certificationOptions.length === 0 ? (
              <p className="text-muted-foreground p-3 text-xs">Không có chứng chỉ phù hợp.</p>
            ) : (
              certificationOptions.map((cert) => {
                const active = cert.id === selectedCertId;
                return (
                  <button
                    key={cert.id}
                    type="button"
                    onClick={() =>
                      setValue("certificationId", cert.id, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "hover:bg-muted flex flex-col gap-0.5 border-b px-3 py-2 text-left text-sm last:border-b-0",
                      active && "bg-primary/5",
                    )}
                  >
                    <span className="text-muted-foreground text-xs">
                      {cert.provider ?? "—"} · {cert.code}
                    </span>
                    <span className={cn("font-medium", active && "text-primary")}>{cert.name}</span>
                  </button>
                );
              })
            )}
          </div>
        </FormField>

        <FormField label="Ngày thi" htmlFor="examDate" error={errors.examDate?.message}>
          <Input
            id="examDate"
            type="date"
            aria-invalid={errors.examDate ? "true" : undefined}
            {...register("examDate")}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Thời gian học/ngày (phút)"
            htmlFor="dailyStudyMinutes"
            error={errors.dailyStudyMinutes?.message}
            hint="Từ 15 đến 480 phút"
          >
            <Input
              id="dailyStudyMinutes"
              type="number"
              min={15}
              max={480}
              step={5}
              aria-invalid={errors.dailyStudyMinutes ? "true" : undefined}
              {...register("dailyStudyMinutes", { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label="Số ngày học/tuần"
            htmlFor="studyDaysPerWeek"
            error={errors.studyDaysPerWeek?.message}
          >
            <Input
              id="studyDaysPerWeek"
              type="number"
              min={1}
              max={7}
              aria-invalid={errors.studyDaysPerWeek ? "true" : undefined}
              {...register("studyDaysPerWeek", { valueAsNumber: true })}
            />
          </FormField>
        </div>

        <FormField
          label="Ngày học ưu tiên (tuỳ chọn)"
          error={errors.preferredStudyDays?.message}
          hint={`Tối đa ${studyDaysPerWeek} ngày`}
        >
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => {
              const active = preferredDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {WEEKDAY_LABELS[day]}
                </button>
              );
            })}
          </div>
        </FormField>

        <FormField label="Trình độ hiện tại" error={errors.experienceLevel?.message}>
          <Controller
            control={control}
            name="experienceLevel"
            render={({ field }) => (
              <div className="grid gap-2 sm:grid-cols-2">
                {EXPERIENCE_LEVELS.map((level) => {
                  const active = field.value === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => field.onChange(level)}
                      className={cn(
                        "border-border rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                        active
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/40 bg-background",
                      )}
                    >
                      <span className={cn("block font-medium", active && "text-primary")}>
                        {EXPERIENCE_LABELS[level]}
                      </span>
                      <span className="text-muted-foreground block text-xs">{level}</span>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </FormField>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" render={<Link href="/my-prep" />}>
            Huỷ
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Đang tạo..." : "Tạo kế hoạch"}
          </Button>
        </div>
      </form>
    </main>
  );
}
