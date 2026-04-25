export type QuestionStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "DEPRECATED" | "REPORTED";

export const QUESTION_STATUSES: QuestionStatus[] = [
  "DRAFT",
  "REVIEW",
  "PUBLISHED",
  "DEPRECATED",
  "REPORTED",
];

export type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE";

export const QUESTION_TYPES: QuestionType[] = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"];

export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export const QUESTION_DIFFICULTIES: QuestionDifficulty[] = ["EASY", "MEDIUM", "HARD"];

export interface AdminQuestionOption {
  id?: number;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface AdminQuestionSummary {
  id: number;
  type: QuestionType | string;
  content: string;
  difficulty?: QuestionDifficulty | string | null;
  points?: number | null;
  timeLimitSeconds?: number | null;
  domainId?: number | null;
  domainName?: string | null;
  certificationId?: number | null;
  certificationCode?: string | null;
  status: QuestionStatus | string;
  questionCode?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminQuestionDetail extends AdminQuestionSummary {
  explanation?: string | null;
  referenceUrl?: string | null;
  options: AdminQuestionOption[];
}

export interface AdminQuestionUpsertInput {
  domainId: number;
  type: QuestionType;
  content: string;
  explanation?: string;
  difficulty?: QuestionDifficulty | "";
  points?: number | null;
  timeLimitSeconds?: number | null;
  referenceUrl?: string;
  options: AdminQuestionOption[];
}

export interface AdminQuestionSearchParams {
  keyword?: string;
  domainId?: number | null;
  certificationId?: number | null;
  type?: QuestionType | "";
  difficulty?: QuestionDifficulty | "";
  status?: QuestionStatus | "";
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}
