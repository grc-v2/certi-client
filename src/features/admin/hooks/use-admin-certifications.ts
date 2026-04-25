"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PageResponse } from "@/lib/api";
import type { CertificationSearchParams } from "@/features/learning/api/certifications";
import type { Certification, CertificationDetail } from "@/features/learning/types/certification";
import type { CertificationDomain } from "@/features/learning/types/domain";

import * as certApi from "../api/admin-certifications";
import type {
  AdminCertificationDomainInput,
  CertificationUpsertInput,
} from "../types/certification";

export const ADMIN_CERT_QUERY_KEYS = {
  all: ["admin", "certifications"] as const,
  list: (params: CertificationSearchParams) =>
    [...ADMIN_CERT_QUERY_KEYS.all, "list", params] as const,
  detail: (slug: string) => [...ADMIN_CERT_QUERY_KEYS.all, "detail", slug] as const,
};

export function useAdminCertifications(params: CertificationSearchParams) {
  return useQuery<PageResponse<Certification>>({
    queryKey: ADMIN_CERT_QUERY_KEYS.list(params),
    queryFn: () => certApi.listAdminCertifications(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useAdminCertification(slug: string | undefined) {
  return useQuery<CertificationDetail>({
    queryKey: ADMIN_CERT_QUERY_KEYS.detail(slug ?? ""),
    queryFn: () => certApi.getAdminCertification(slug as string),
    enabled: Boolean(slug),
    staleTime: 15_000,
  });
}

export function useCreateCertification() {
  const queryClient = useQueryClient();
  return useMutation<Certification, Error, CertificationUpsertInput>({
    mutationFn: certApi.createCertification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CERT_QUERY_KEYS.all });
    },
  });
}

export function useUpdateCertification() {
  const queryClient = useQueryClient();
  return useMutation<Certification, Error, { id: number; payload: CertificationUpsertInput }>({
    mutationFn: ({ id, payload }) => certApi.updateCertification(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CERT_QUERY_KEYS.all });
    },
  });
}

export function useUpdateCertificationStatus() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: number; status: string }>({
    mutationFn: ({ id, status }) => certApi.updateCertificationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CERT_QUERY_KEYS.all });
    },
  });
}

export function useDeleteCertification() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: certApi.deleteCertification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CERT_QUERY_KEYS.all });
    },
  });
}

export function useCreateCertificationDomain() {
  const queryClient = useQueryClient();
  return useMutation<
    CertificationDomain,
    Error,
    { certificationId: number; payload: AdminCertificationDomainInput }
  >({
    mutationFn: ({ certificationId, payload }) =>
      certApi.createCertificationDomain(certificationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CERT_QUERY_KEYS.all });
    },
  });
}

export function useUpdateCertificationDomain() {
  const queryClient = useQueryClient();
  return useMutation<
    CertificationDomain,
    Error,
    { domainId: number; payload: AdminCertificationDomainInput }
  >({
    mutationFn: ({ domainId, payload }) => certApi.updateCertificationDomain(domainId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CERT_QUERY_KEYS.all });
    },
  });
}

export function useDeleteCertificationDomain() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: certApi.deleteCertificationDomain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CERT_QUERY_KEYS.all });
    },
  });
}
