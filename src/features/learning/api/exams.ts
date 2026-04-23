import { api } from "@/lib/api";

import type { Exam } from "../types/exam";

export async function getExamsByCertification(certificationId: number): Promise<Exam[]> {
  const { data } = await api.get<Exam[]>(`/api/v1/exams/certification/${certificationId}`);
  return data;
}
