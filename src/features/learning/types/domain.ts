export interface CertificationDomain {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  code?: string | null;
  description?: string | null;
  weightPercentage?: string | null;
  displayOrder?: number | null;
  certificationId: number;
  parentDomainId?: number | null;
  children?: CertificationDomain[];
  status: string;
}
