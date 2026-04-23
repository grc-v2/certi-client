"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { PageResponse } from "@/lib/api";

import * as certApi from "../api/certifications";
import type { CertificationSearchParams } from "../api/certifications";
import type { Certification, CertificationDetail } from "../types/certification";
import type { CertificationDomain } from "../types/domain";

export const CERTIFICATION_QUERY_KEYS = {
  all: ["learning", "certifications"] as const,
  list: (params: CertificationSearchParams) =>
    [...CERTIFICATION_QUERY_KEYS.all, "list", params] as const,
  detail: (slug: string) => [...CERTIFICATION_QUERY_KEYS.all, "detail", slug] as const,
  domains: (slug: string) => [...CERTIFICATION_QUERY_KEYS.all, "domains", slug] as const,
};

export function useCertifications(params: CertificationSearchParams) {
  return useQuery<PageResponse<Certification>>({
    queryKey: CERTIFICATION_QUERY_KEYS.list(params),
    queryFn: () => certApi.listCertifications(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useCertification(slug: string | undefined) {
  return useQuery<CertificationDetail>({
    queryKey: CERTIFICATION_QUERY_KEYS.detail(slug ?? ""),
    queryFn: () => certApi.getCertificationBySlug(slug as string),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}

export function useCertificationDomains(slug: string | undefined) {
  return useQuery<CertificationDomain[]>({
    queryKey: CERTIFICATION_QUERY_KEYS.domains(slug ?? ""),
    queryFn: () => certApi.getCertificationDomains(slug as string),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}
