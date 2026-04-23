import { z } from "zod";

export const DIFFICULTY_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;
export const CERTIFICATION_LEVELS = [
  "FOUNDATIONAL",
  "ASSOCIATE",
  "PROFESSIONAL",
  "SPECIALTY",
  "EXPERT",
] as const;

export const certificationFilterSchema = z.object({
  keyword: z.string().trim().optional(),
  provider: z.string().trim().optional(),
  level: z.string().trim().optional(),
  difficultyLevel: z.string().trim().optional(),
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(50).default(12),
  sortBy: z.string().default("createdAt"),
  sortDirection: z.enum(["ASC", "DESC"]).default("DESC"),
});

export type CertificationFilterInput = z.infer<typeof certificationFilterSchema>;
