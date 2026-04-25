import { api } from "@/lib/api";
import type { PageResponse } from "@/lib/api";
import type { CertificationSearchParams } from "@/features/learning/api/certifications";
import type { Certification, CertificationDetail } from "@/features/learning/types/certification";
import type { CertificationDomain } from "@/features/learning/types/domain";

import type {
  AdminCertificationDomainInput,
  CertificationUpsertInput,
} from "../types/certification";

const BASE = "/api/v1/admin/certifications";

// Admin listing reuses the public list endpoint; include status filter (DRAFT, RETIRED...)
export async function listAdminCertifications(
  params: CertificationSearchParams = {},
): Promise<PageResponse<Certification>> {
  const { data } = await api.get<PageResponse<Certification>>("/api/v1/certifications", {
    params,
  });
  return data;
}

export async function getAdminCertification(slug: string): Promise<CertificationDetail> {
  const { data } = await api.get<CertificationDetail>(`/api/v1/certifications/${slug}`);
  return data;
}

export async function createCertification(
  payload: CertificationUpsertInput,
): Promise<Certification> {
  const { data } = await api.post<Certification>(BASE, payload);
  return data;
}

export async function updateCertification(
  id: number,
  payload: CertificationUpsertInput,
): Promise<Certification> {
  const { data } = await api.put<Certification>(`${BASE}/${id}`, payload);
  return data;
}

export async function updateCertificationStatus(id: number, status: string): Promise<void> {
  await api.patch(`${BASE}/${id}/status`, null, { params: { status } });
}

export async function deleteCertification(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}

// Domain management
export async function createCertificationDomain(
  certificationId: number,
  payload: AdminCertificationDomainInput,
): Promise<CertificationDomain> {
  const { data } = await api.post<CertificationDomain>(
    `${BASE}/${certificationId}/domains`,
    payload,
  );
  return data;
}

export async function updateCertificationDomain(
  domainId: number,
  payload: AdminCertificationDomainInput,
): Promise<CertificationDomain> {
  const { data } = await api.put<CertificationDomain>(`/api/v1/admin/domains/${domainId}`, payload);
  return data;
}

export async function deleteCertificationDomain(domainId: number): Promise<void> {
  await api.delete(`/api/v1/admin/domains/${domainId}`);
}
