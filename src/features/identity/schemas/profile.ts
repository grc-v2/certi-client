import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().trim().max(200).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  timezone: z.string().trim().max(50).optional().or(z.literal("")),
  preferredLanguage: z.string().trim().max(10).optional().or(z.literal("")),
  professionalInfo: z.record(z.string(), z.unknown()).optional(),
  learningPreferences: z.record(z.string(), z.unknown()).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
