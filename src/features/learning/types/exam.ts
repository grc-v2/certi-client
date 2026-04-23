export type ExamType = "PRACTICE" | "MOCK" | "FINAL" | "DIAGNOSTIC" | "TOPIC_WISE";

export interface Exam {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  title: string;
  type: ExamType | string;
  description?: string | null;
  durationMinutes?: number | null;
  totalQuestions?: number | null;
  passingScore?: number | null;
  status: string;
  certificationId: number;
  certificationName?: string | null;
}
