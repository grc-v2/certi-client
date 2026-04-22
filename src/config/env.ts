import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_INTERNAL_BASE_URL: z.url().optional(),
  SESSION_COOKIE_NAME: z.string().default("certi_session"),
  REFRESH_COOKIE_NAME: z.string().default("certi_refresh"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.url(),
  NEXT_PUBLIC_OAUTH_GOOGLE_URL: z.url().optional(),
  NEXT_PUBLIC_OAUTH_GITHUB_URL: z.url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default("CertiMaster"),
});

const clientRaw = {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_OAUTH_GOOGLE_URL: process.env.NEXT_PUBLIC_OAUTH_GOOGLE_URL,
  NEXT_PUBLIC_OAUTH_GITHUB_URL: process.env.NEXT_PUBLIC_OAUTH_GITHUB_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
};

const clientParsed = clientSchema.safeParse(clientRaw);
if (!clientParsed.success) {
  console.error("Invalid client environment variables:", z.treeifyError(clientParsed.error));
  throw new Error("Invalid client environment variables. See .env.example.");
}

export const clientEnv = clientParsed.data;

export function getServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() must only be called on the server.");
  }
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid server environment variables:", z.treeifyError(parsed.error));
    throw new Error("Invalid server environment variables. See .env.example.");
  }
  return parsed.data;
}
