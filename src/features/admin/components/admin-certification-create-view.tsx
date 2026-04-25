"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";

import { useCreateCertification } from "../hooks/use-admin-certifications";
import type { CertificationUpsertInput } from "../types/certification";

import { CertificationForm } from "./certification-form";

export function AdminCertificationCreateView() {
  const router = useRouter();
  const createCertification = useCreateCertification();

  async function handleSubmit(payload: CertificationUpsertInput) {
    try {
      const cert = await createCertification.mutateAsync(payload);
      toast.success("Đã tạo chứng chỉ");
      router.replace(`/admin/certifications/${cert.slug}`);
    } catch (err) {
      const msg = err instanceof ApiError ? (err.problem.detail ?? err.problem.title) : "Lỗi";
      toast.error(msg);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/certifications"
          className="text-muted-foreground text-xs hover:underline"
        >
          ← Quay lại danh sách
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Tạo chứng chỉ</h1>
        <p className="text-muted-foreground text-sm">
          Tạo bản nháp, cấu hình domain trước khi chuyển sang trạng thái ACTIVE.
        </p>
      </div>

      <CertificationForm
        submitLabel="Tạo"
        isSubmitting={createCertification.isPending}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/certifications")}
      />
    </div>
  );
}
