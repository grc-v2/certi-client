"use client";

import { useQuery } from "@tanstack/react-query";

import * as examsApi from "../api/exams";
import type { Exam } from "../types/exam";

export const EXAM_QUERY_KEYS = {
  byCertification: (certificationId: number) =>
    ["learning", "exams", "certification", certificationId] as const,
};

export function useExamsByCertification(certificationId: number | undefined) {
  return useQuery<Exam[]>({
    queryKey: EXAM_QUERY_KEYS.byCertification(certificationId ?? 0),
    queryFn: () => examsApi.getExamsByCertification(certificationId as number),
    enabled: typeof certificationId === "number" && certificationId > 0,
    staleTime: 60_000,
  });
}
