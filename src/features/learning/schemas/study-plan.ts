import { z } from "zod";

export const EXPERIENCE_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;

export const WEEKDAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

function isFutureDate(value: string): boolean {
  if (!value) return false;
  const target = new Date(`${value}T00:00:00`);
  if (Number.isNaN(target.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return target.getTime() > today.getTime();
}

export const createStudyPlanSchema = z
  .object({
    certificationId: z
      .number({ message: "Vui lòng chọn chứng chỉ" })
      .int()
      .positive("Vui lòng chọn chứng chỉ"),
    examDate: z
      .string()
      .min(1, "Vui lòng chọn ngày thi")
      .refine(isFutureDate, "Ngày thi phải ở tương lai"),
    dailyStudyMinutes: z
      .number({ message: "Vui lòng nhập số phút" })
      .int()
      .min(15, "Tối thiểu 15 phút/ngày")
      .max(480, "Tối đa 480 phút/ngày"),
    studyDaysPerWeek: z.number().int().min(1).max(7),
    preferredStudyDays: z.array(z.enum(WEEKDAYS)).optional(),
    experienceLevel: z.enum(EXPERIENCE_LEVELS, { message: "Vui lòng chọn trình độ" }),
  })
  .refine(
    (data) => !data.preferredStudyDays || data.preferredStudyDays.length <= data.studyDaysPerWeek,
    {
      message: "Số ngày ưu tiên không được vượt quá số ngày học/tuần",
      path: ["preferredStudyDays"],
    },
  );

export type CreateStudyPlanInput = z.infer<typeof createStudyPlanSchema>;
