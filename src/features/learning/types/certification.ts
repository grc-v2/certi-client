import type { CertificationDomain } from "./domain";
import type { Exam } from "./exam";

export type CertificationStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | string;

export interface Certification {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  name: string;
  code: string;
  slug: string;
  tagline?: string | null;
  provider?: string | null;
  level?: string | null;
  difficultyLevel?: string | null;
  description?: string | null;
  overview?: string | null;
  durationMinutes?: number | null;
  totalQuestions?: number | null;
  passingScore?: string | null;
  price?: string | null;
  examPriceUsd?: string | null;
  averagePrepWeeks?: number | null;
  status: CertificationStatus;
}

export interface CertificationDetail extends Certification {
  domains: CertificationDomain[];
  exams: Exam[];
}
