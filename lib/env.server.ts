import "server-only";
import { isProductionSite, isSupabaseConfigured } from "./env";

// Server-only secrets and delivery configuration. Never import from client code.

export const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const inquiryConfig = {
  resendApiKey: process.env.RESEND_API_KEY || "",
  to: process.env.INQUIRY_TO_EMAIL || "",
  from: process.env.INQUIRY_FROM_EMAIL || "",
  dailyCap: clampInt(process.env.INQUIRY_DAILY_CAP, 80, 1, 1000),
};

/** Inquiries are saved for Admin → Inquiries when the server has the Supabase secret key. */
export const isInquiryStorageConfigured = Boolean(isSupabaseConfigured && serviceRoleKey);

/** Optional email alert: requires a provider key, a recipient and a sender. */
export const isInquiryDeliveryConfigured = Boolean(inquiryConfig.resendApiKey && inquiryConfig.to && inquiryConfig.from);

const DEV_SIGNING_SECRET = "jfl-dev-only-signing-secret-do-not-use-in-production";

/**
 * HMAC secret for inquiry form tokens and IP hashing. Required whenever real
 * inquiries are accepted (saved or emailed) and on the production site; a fixed
 * development value is used only in demo mode.
 */
export function getSigningSecret(): string {
  const secret = process.env.INQUIRY_SIGNING_SECRET || "";
  if (secret.length >= 32) return secret;
  if (isInquiryStorageConfigured || isInquiryDeliveryConfigured || isProductionSite) {
    throw new Error("INQUIRY_SIGNING_SECRET must be set (32+ characters) when inquiries are saved or emailed.");
  }
  return DEV_SIGNING_SECRET;
}

function clampInt(raw: string | undefined, fallback: number, min: number, max: number) {
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
}
