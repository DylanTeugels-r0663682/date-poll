import "server-only";
import { randomBytes, timingSafeEqual } from "crypto";

export function generateSlug(): string {
  return randomBytes(6).toString("base64url");
}

export function generateAdminToken(): string {
  return randomBytes(24).toString("base64url");
}

export function tokensMatch(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
