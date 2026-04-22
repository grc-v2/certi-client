import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiError } from "./types";

/**
 * Map BE ProblemDetail fieldErrors onto a react-hook-form instance.
 * Returns the top-level problem message as a fallback.
 */
export function applyApiErrorToForm<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): string {
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error.message : "Đã có lỗi xảy ra.";
  }
  const fieldErrors = error.fieldErrors;
  if (fieldErrors) {
    for (const [field, messages] of Object.entries(fieldErrors)) {
      const message = Array.isArray(messages) ? messages[0] : String(messages);
      setError(field as Path<T>, { type: "server", message });
    }
  }
  return error.problem.detail ?? error.problem.title ?? "Đã có lỗi xảy ra.";
}
