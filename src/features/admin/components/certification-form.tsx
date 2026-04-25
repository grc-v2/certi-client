"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

import {
  CERTIFICATION_LEVELS,
  CERTIFICATION_STATUSES,
  type CertificationLevel,
  type CertificationStatus,
  type CertificationUpsertInput,
} from "../types/certification";

export interface CertificationFormProps {
  initialValue?: CertificationUpsertInput;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (payload: CertificationUpsertInput) => void | Promise<void>;
  onCancel?: () => void;
}

const EMPTY: CertificationUpsertInput = {
  name: "",
  code: "",
  provider: "",
  description: "",
  level: "",
  durationMinutes: null,
  passingScore: null,
  totalQuestions: null,
  price: null,
  status: "DRAFT",
};

function toIntOrNull(value: string): number | null {
  if (!value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.floor(n) : null;
}

function toDecimalOrNull(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? trimmed : null;
}

export function CertificationForm({
  initialValue,
  submitLabel,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: CertificationFormProps) {
  const [form, setForm] = useState<CertificationUpsertInput>({ ...EMPTY, ...initialValue });

  function update<K extends keyof CertificationUpsertInput>(
    key: K,
    value: CertificationUpsertInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSubmit({
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      provider: form.provider?.trim() || undefined,
      description: form.description?.trim() || undefined,
      level: form.level || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1 md:col-span-2">
          <Label htmlFor="cert-name">Tên chứng chỉ *</Label>
          <Input
            id="cert-name"
            required
            maxLength={255}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="cert-code">Mã *</Label>
          <Input
            id="cert-code"
            required
            maxLength={50}
            pattern="[A-Z0-9-]+"
            value={form.code}
            onChange={(e) => update("code", e.target.value.toUpperCase())}
            placeholder="AWS-SAA-C03"
          />
          <span className="text-muted-foreground text-xs">Chỉ chữ in hoa, số, dấu gạch ngang.</span>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="cert-provider">Nhà cung cấp</Label>
          <Input
            id="cert-provider"
            maxLength={100}
            value={form.provider ?? ""}
            onChange={(e) => update("provider", e.target.value)}
            placeholder="AWS, Microsoft, Google..."
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="cert-level">Cấp độ</Label>
          <Select
            id="cert-level"
            value={form.level ?? ""}
            onChange={(e) => update("level", e.target.value as CertificationLevel | "")}
          >
            <option value="">—</option>
            {CERTIFICATION_LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="cert-status">Trạng thái</Label>
          <Select
            id="cert-status"
            value={form.status ?? "DRAFT"}
            onChange={(e) => update("status", e.target.value as CertificationStatus)}
          >
            {CERTIFICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="cert-duration">Thời lượng (phút)</Label>
          <Input
            id="cert-duration"
            type="number"
            min={1}
            max={600}
            value={form.durationMinutes ?? ""}
            onChange={(e) => update("durationMinutes", toIntOrNull(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="cert-total-questions">Tổng số câu hỏi</Label>
          <Input
            id="cert-total-questions"
            type="number"
            min={1}
            max={500}
            value={form.totalQuestions ?? ""}
            onChange={(e) => update("totalQuestions", toIntOrNull(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="cert-passing">Điểm đạt</Label>
          <Input
            id="cert-passing"
            type="number"
            step="0.01"
            min={0}
            max={1000}
            value={form.passingScore ?? ""}
            onChange={(e) => update("passingScore", toDecimalOrNull(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="cert-price">Giá</Label>
          <Input
            id="cert-price"
            type="number"
            step="0.01"
            min={0}
            value={form.price ?? ""}
            onChange={(e) => update("price", toDecimalOrNull(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <Label htmlFor="cert-description">Mô tả</Label>
          <textarea
            id="cert-description"
            rows={4}
            maxLength={5000}
            value={form.description ?? ""}
            onChange={(e) => update("description", e.target.value)}
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-3 py-2 text-sm shadow-xs focus-visible:ring-3 focus-visible:outline-none"
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Huỷ
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang lưu..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
