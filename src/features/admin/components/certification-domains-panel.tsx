"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CertificationDomain } from "@/features/learning/types/domain";
import { ApiError } from "@/lib/api";

import {
  useCreateCertificationDomain,
  useDeleteCertificationDomain,
  useUpdateCertificationDomain,
} from "../hooks/use-admin-certifications";
import type { AdminCertificationDomainInput } from "../types/certification";

const EMPTY_FORM: AdminCertificationDomainInput = {
  name: "",
  description: "",
  displayOrder: 1,
  parentDomainId: null,
};

function handleApiError(err: unknown, fallback: string) {
  const msg = err instanceof ApiError ? (err.problem.detail ?? err.problem.title) : fallback;
  toast.error(msg);
}

export function CertificationDomainsPanel({
  certificationId,
  domains,
}: {
  certificationId: number;
  domains: CertificationDomain[];
}) {
  const [draft, setDraft] = useState<AdminCertificationDomainInput>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<AdminCertificationDomainInput>(EMPTY_FORM);

  const createDomain = useCreateCertificationDomain();
  const updateDomain = useUpdateCertificationDomain();
  const deleteDomain = useDeleteCertificationDomain();

  async function submitCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createDomain.mutateAsync({
        certificationId,
        payload: {
          ...draft,
          name: draft.name.trim(),
          description: draft.description?.trim() || undefined,
          parentDomainId: draft.parentDomainId ?? null,
        },
      });
      toast.success("Đã thêm domain");
      setDraft(EMPTY_FORM);
    } catch (err) {
      handleApiError(err, "Không thêm được domain");
    }
  }

  function beginEdit(domain: CertificationDomain) {
    setEditingId(domain.id);
    setEditDraft({
      name: domain.name,
      description: domain.description ?? "",
      displayOrder: domain.displayOrder ?? 1,
      parentDomainId: domain.parentDomainId ?? null,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(EMPTY_FORM);
  }

  async function submitEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editingId == null) return;
    try {
      await updateDomain.mutateAsync({
        domainId: editingId,
        payload: {
          ...editDraft,
          name: editDraft.name.trim(),
          description: editDraft.description?.trim() || undefined,
          parentDomainId: editDraft.parentDomainId ?? null,
        },
      });
      toast.success("Đã cập nhật domain");
      cancelEdit();
    } catch (err) {
      handleApiError(err, "Không cập nhật được domain");
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Xác nhận xoá domain này?")) return;
    try {
      await deleteDomain.mutateAsync(id);
      toast.success("Đã xoá domain");
      if (editingId === id) cancelEdit();
    } catch (err) {
      handleApiError(err, "Không xoá được domain");
    }
  }

  const rootDomains = domains
    .filter((d) => d.parentDomainId == null)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return (
    <section className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5">
      <div>
        <h2 className="text-base font-semibold">Domain</h2>
        <p className="text-muted-foreground text-xs">
          {domains.length} domain. Trọng số được tính tự động khi tạo kế hoạch học tập.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">STT</TableHead>
            <TableHead>Tên domain</TableHead>
            <TableHead>Trọng số</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead className="w-32" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rootDomains.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground py-6 text-center">
                Chưa có domain nào.
              </TableCell>
            </TableRow>
          ) : (
            rootDomains.map((domain) => (
              <TableRow key={domain.id}>
                <TableCell className="font-mono text-xs">{domain.displayOrder ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{domain.name}</span>
                    {domain.description ? (
                      <span className="text-muted-foreground max-w-md truncate text-xs">
                        {domain.description}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {domain.weightPercentage ? `${domain.weightPercentage}%` : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {domain.parentDomainId ? `#${domain.parentDomainId}` : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => beginEdit(domain)}
                    >
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="xs"
                      disabled={deleteDomain.isPending}
                      onClick={() => handleDelete(domain.id)}
                    >
                      Xoá
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {editingId != null ? (
        <form
          onSubmit={submitEdit}
          className="border-border flex flex-col gap-3 rounded-lg border border-dashed p-4"
        >
          <h3 className="text-sm font-semibold">Sửa domain #{editingId}</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1 md:col-span-2">
              <Label htmlFor="edit-domain-name">Tên *</Label>
              <Input
                id="edit-domain-name"
                required
                maxLength={255}
                value={editDraft.name}
                onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-domain-order">Thứ tự hiển thị *</Label>
              <Input
                id="edit-domain-order"
                type="number"
                min={1}
                required
                value={editDraft.displayOrder}
                onChange={(e) =>
                  setEditDraft((d) => ({ ...d, displayOrder: Number(e.target.value) || 1 }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-domain-parent">Parent domain ID</Label>
              <Input
                id="edit-domain-parent"
                type="number"
                min={1}
                value={editDraft.parentDomainId ?? ""}
                onChange={(e) =>
                  setEditDraft((d) => ({
                    ...d,
                    parentDomainId: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <Label htmlFor="edit-domain-desc">Mô tả</Label>
              <textarea
                id="edit-domain-desc"
                rows={3}
                maxLength={1000}
                value={editDraft.description ?? ""}
                onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-3 py-2 text-sm shadow-xs focus-visible:ring-3 focus-visible:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
              Huỷ
            </Button>
            <Button type="submit" size="sm" disabled={updateDomain.isPending}>
              {updateDomain.isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={submitCreate}
          className="border-border flex flex-col gap-3 rounded-lg border border-dashed p-4"
        >
          <h3 className="text-sm font-semibold">Thêm domain</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1 md:col-span-2">
              <Label htmlFor="new-domain-name">Tên *</Label>
              <Input
                id="new-domain-name"
                required
                maxLength={255}
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="new-domain-order">Thứ tự hiển thị *</Label>
              <Input
                id="new-domain-order"
                type="number"
                min={1}
                required
                value={draft.displayOrder}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, displayOrder: Number(e.target.value) || 1 }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="new-domain-parent">Parent domain ID</Label>
              <Input
                id="new-domain-parent"
                type="number"
                min={1}
                value={draft.parentDomainId ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    parentDomainId: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <Label htmlFor="new-domain-desc">Mô tả</Label>
              <textarea
                id="new-domain-desc"
                rows={3}
                maxLength={1000}
                value={draft.description ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-3 py-2 text-sm shadow-xs focus-visible:ring-3 focus-visible:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Button type="submit" size="sm" disabled={createDomain.isPending}>
              {createDomain.isPending ? "Đang thêm..." : "Thêm domain"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
