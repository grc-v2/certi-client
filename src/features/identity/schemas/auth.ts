import { z } from "zod";

export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,50}$/;
export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/;

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

export const registerSchema = z
  .object({
    email: z.string().trim().email("Invalid email format").max(255),
    username: z
      .string()
      .trim()
      .regex(USERNAME_PATTERN, "3-50 characters; letters, numbers, underscore, hyphen only"),
    password: z
      .string()
      .regex(PASSWORD_PATTERN, "At least 8 chars with upper, lower, number, special character"),
    confirmPassword: z.string(),
    fullName: z.string().trim().min(2).max(255),
    phone: z
      .string()
      .trim()
      .regex(PHONE_PATTERN, "Invalid phone number format")
      .optional()
      .or(z.literal("")),
    acceptTerms: z.literal(true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z
      .string()
      .regex(PASSWORD_PATTERN, "At least 8 chars with upper, lower, number, special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
