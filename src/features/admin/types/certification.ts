export type CertificationStatus = "DRAFT" | "ACTIVE" | "RETIRING" | "RETIRED";

export const CERTIFICATION_STATUSES: CertificationStatus[] = [
  "DRAFT",
  "ACTIVE",
  "RETIRING",
  "RETIRED",
];

export type CertificationLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export const CERTIFICATION_LEVELS: CertificationLevel[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
];

export interface CertificationUpsertInput {
  name: string;
  code: string;
  provider?: string;
  description?: string;
  level?: CertificationLevel | "";
  durationMinutes?: number | null;
  passingScore?: string | null;
  totalQuestions?: number | null;
  price?: string | null;
  status?: CertificationStatus;
}

export interface AdminCertificationDomainInput {
  name: string;
  description?: string;
  displayOrder: number;
  parentDomainId?: number | null;
}
