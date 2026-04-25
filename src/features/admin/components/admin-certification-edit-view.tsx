"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ApiError } from "@/lib/api";

import {
  useAdminCertification,
  useDeleteCertification,
  useUpdateCertification,
  useUpdateCertificationStatus,
} from "../hooks/use-admin-certifications";
import {
  CERTIFICATION_STATUSES,
  type CertificationLevel,
  type CertificationStatus,
  type CertificationUpsertInput,
} from "../types/certification";

import { CertificationDomainsPanel } from "./certification-domains-panel";
import { CertificationForm } from "./certification-form";
import { CertificationStatusBadge } from "./certification-status-badge";

export function AdminCertificationEditView({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: cert, isLoading, error } = useAdminCertification(slug);
  const updateCertification = useUpdateCertification();
  const updateStatus = useUpdateCertificationStatus();
  const deleteCertification = useDeleteCertification();

  const apiMessage =
    error instanceof ApiError
      ? (error.problem.detail ?? error.problem.title)
      : error instanceof Error
        ? error.message
        : null;

  if (isLoading) {
    return <p className="text-muted-foreground py-10 text-center text-sm">Đang tải...</p>;
  }

  if (apiMessage) {
    return (
      <div
        role="alert"
        className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
      >
        {apiMessage}
      </div>
    );
  }

  if (!cert) {
    return <p className="text-muted-foreground py-10 text-center text-sm">Không tìm thấy.</p>;
  }

  const initialValue: CertificationUpsertInput = {
    name: cert.name,
    code: cert.code,
    provider: cert.provider ?? "",
    description: cert.description ?? "",
    level: (cert.level ?? "") as CertificationLevel | "",
    durationMinutes: cert.durationMinutes ?? null,
    passingScore: cert.passingScore ?? null,
    totalQuestions: cert.totalQuestions ?? null,
    price: cert.price ?? null,
    status: (cert.status as CertificationStatus) ?? "DRAFT",
  };

  async function handleSubmit(payload: CertificationUpsertInput) {
    if (!cert) return;
    try {
      await updateCertification.mutateAsync({ id: cert.id, payload });
      toast.success("Đã cập nhật chứng chỉ");
    } catch (err) {
      const msg = err instanceof ApiError ? (err.problem.detail ?? err.problem.title) : "Lỗi";
      toast.error(msg);
    }
  }

  async function handleStatusChange(nextStatus: string) {
    if (!cert || nextStatus === cert.status) return;
    try {
      await updateStatus.mutateAsync({ id: cert.id, status: nextStatus });
      toast.success(`Đã chuyển trạng thái sang ${nextStatus}`);
    } catch (err) {
      const msg = err instanceof ApiError ? (err.problem.detail ?? err.problem.title) : "Lỗi";
      toast.error(msg);
    }
  }

  async function handleDelete() {
    if (!cert) return;
    if (!window.confirm("Xác nhận xoá chứng chỉ? Thao tác sẽ đánh dấu DELETED.")) return;
    try {
      await deleteCertification.mutateAsync(cert.id);
      toast.success("Đã xoá chứng chỉ");
      router.replace("/admin/certifications");
    } catch (err) {
      const msg = err instanceof ApiError ? (err.problem.detail ?? err.problem.title) : "Lỗi";
      toast.error(msg);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/certifications"
            className="text-muted-foreground text-xs hover:underline"
          >
            ← Quay lại danh sách
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{cert.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 font-mono text-xs">
              {cert.code}
            </span>
            <CertificationStatusBadge status={cert.status} />
            {cert.provider ? (
              <span className="text-muted-foreground text-xs">· {cert.provider}</span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <label className="text-muted-foreground text-xs" htmlFor="status-workflow">
              Trạng thái
            </label>
            <Select
              id="status-workflow"
              value={cert.status}
              disabled={updateStatus.isPending}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="h-8 w-auto min-w-[140px]"
            >
              {CERTIFICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={deleteCertification.isPending}
            onClick={handleDelete}
          >
            Xoá
          </Button>
        </div>
      </div>

      <CertificationForm
        initialValue={initialValue}
        submitLabel="Lưu thay đổi"
        isSubmitting={updateCertification.isPending}
        onSubmit={handleSubmit}
      />

      <CertificationDomainsPanel certificationId={cert.id} domains={cert.domains ?? []} />
    </div>
  );
}
