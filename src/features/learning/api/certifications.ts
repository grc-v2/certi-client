import { api } from "@/lib/api";
import type { PageResponse } from "@/lib/api";

import type { Certification, CertificationDetail } from "../types/certification";
import type { CertificationDomain } from "../types/domain";

export interface CertificationSearchParams {
  keyword?: string;
  provider?: string;
  level?: string;
  difficultyLevel?: string;
  status?: string;
  providerId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}

export async function listCertifications(
  params: CertificationSearchParams = {},
): Promise<PageResponse<Certification>> {
  const { data } = await api.get<PageResponse<Certification>>("/api/v1/certifications", {
    params,
  });
  return data;
}

export async function getCertificationBySlug(slug: string): Promise<CertificationDetail> {
  const { data } = await api.get<CertificationDetail>(`/api/v1/certifications/${slug}`);
  return data;
}

export async function getCertificationDomains(slug: string): Promise<CertificationDomain[]> {
  const { data } = await api.get<CertificationDomain[]>(`/api/v1/certifications/${slug}/domains`);
  return data;
}

export async function searchCertificationsFullText(
  query: string,
  page = 0,
  size = 10,
): Promise<PageResponse<Certification>> {
  const { data } = await api.get<PageResponse<Certification>>("/api/v1/certifications/search", {
    params: { q: query, page, size },
  });
  return data;
}
