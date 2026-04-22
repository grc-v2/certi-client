"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { applyApiErrorToForm } from "@/lib/api/errors";

import { useMyProfile, useUpdateMyProfile, useUploadAvatar } from "../hooks/use-profile";
import { updateProfileSchema, type UpdateProfileInput } from "../schemas/profile";

export function ProfileView() {
  const { data: profile, isLoading } = useMyProfile();
  const updateMutation = useUpdateMyProfile();
  const uploadMutation = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [topLevelError, setTopLevelError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      timezone: "",
      preferredLanguage: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.displayName ?? "",
        bio: profile.bio ?? "",
        timezone: profile.timezone ?? "",
        preferredLanguage: profile.preferredLanguage ?? "",
      });
    }
  }, [profile, reset]);

  async function onSubmit(values: UpdateProfileInput) {
    setTopLevelError(null);
    try {
      await updateMutation.mutateAsync(values);
      toast.success("Cập nhật hồ sơ thành công.");
    } catch (error) {
      setTopLevelError(applyApiErrorToForm(error, setError));
    }
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh đại diện không được vượt quá 5MB.");
      return;
    }
    try {
      await uploadMutation.mutateAsync(file);
      toast.success("Cập nhật ảnh đại diện thành công.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải ảnh lên.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-destructive text-sm">Không thể tải hồ sơ.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Hồ sơ của tôi</h1>
        <p className="text-muted-foreground text-sm">
          Quản lý thông tin hiển thị và tuỳ chọn học tập.
        </p>
      </header>

      <section className="border-border bg-card flex items-center gap-4 rounded-2xl border p-6">
        <div className="bg-primary text-primary-foreground flex size-16 items-center justify-center overflow-hidden rounded-full text-xl font-semibold">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="size-full object-cover"
            />
          ) : (
            profile.fullName
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join("")
          )}
        </div>
        <div className="flex flex-1 flex-col">
          <p className="text-base font-medium">{profile.fullName}</p>
          <p className="text-muted-foreground text-xs">{profile.email}</p>
          <p className="text-muted-foreground text-xs">@{profile.username}</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? "Đang tải..." : "Đổi ảnh đại diện"}
          </Button>
        </div>
      </section>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border-border bg-card flex flex-col gap-5 rounded-2xl border p-6"
        noValidate
      >
        <h2 className="text-lg font-semibold">Thông tin hiển thị</h2>

        {topLevelError ? (
          <div
            role="alert"
            className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
          >
            {topLevelError}
          </div>
        ) : null}

        <FormField label="Tên hiển thị" htmlFor="displayName" error={errors.displayName?.message}>
          <Input
            id="displayName"
            aria-invalid={errors.displayName ? "true" : undefined}
            {...register("displayName")}
          />
        </FormField>

        <FormField label="Giới thiệu" htmlFor="bio" error={errors.bio?.message}>
          <textarea
            id="bio"
            rows={4}
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 flex w-full rounded-lg border px-3 py-2 text-sm shadow-xs focus-visible:ring-3 focus-visible:outline-none aria-invalid:ring-3"
            aria-invalid={errors.bio ? "true" : undefined}
            {...register("bio")}
          />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Múi giờ" htmlFor="timezone" error={errors.timezone?.message}>
            <Input
              id="timezone"
              placeholder="Asia/Ho_Chi_Minh"
              aria-invalid={errors.timezone ? "true" : undefined}
              {...register("timezone")}
            />
          </FormField>
          <FormField
            label="Ngôn ngữ ưu tiên"
            htmlFor="preferredLanguage"
            error={errors.preferredLanguage?.message}
          >
            <Input
              id="preferredLanguage"
              placeholder="vi"
              aria-invalid={errors.preferredLanguage ? "true" : undefined}
              {...register("preferredLanguage")}
            />
          </FormField>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            Mức độ hoàn thành hồ sơ: {profile.completenessScore}%
          </p>
          <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
            {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </main>
  );
}
