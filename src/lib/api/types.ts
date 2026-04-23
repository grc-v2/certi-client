export interface ApiResponseMetadata {
  id: string;
  version: string;
  timestamp: string;
  domain: string;
  service: string;
  correlationId: string;
  statusCode: number;
  success: true;
}

export interface ApiResponse<T> {
  data: T;
  metadata: ApiResponseMetadata;
}

export interface ProblemDetail {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  fieldErrors?: Record<string, string[]>;
  correlationId?: string;
  timestamp?: string;
}

export interface PageRequest {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export class ApiError extends Error {
  readonly problem: ProblemDetail;
  readonly status: number;

  constructor(problem: ProblemDetail) {
    super(problem.detail ?? problem.title);
    this.name = "ApiError";
    this.problem = problem;
    this.status = problem.status;
  }

  get fieldErrors(): Record<string, string[]> | undefined {
    return this.problem.fieldErrors;
  }
}
