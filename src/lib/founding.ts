export interface FoundingAssessment {
  active: boolean;
  expires_at: string | null;
  redemption_count: number;
  max_redemptions: number;
  alreadyRedeemed: boolean;
}

export function normalizeFoundingCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function isFoundingCodeShape(code: string) {
  return /^FOUNDING-[A-Z0-9]{4,16}$/.test(code);
}

export function generateFoundingCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  let suffix = "";
  for (const byte of bytes) suffix += alphabet[byte % alphabet.length];
  return `FOUNDING-${suffix}`;
}

export function assessFoundingCode(input: FoundingAssessment, now = new Date()): { ok: true } | { ok: false; reason: string } {
  if (!input.active) return { ok: false, reason: "That code is no longer active." };
  if (input.expires_at && new Date(input.expires_at).getTime() < now.getTime()) {
    return { ok: false, reason: "That code has expired." };
  }
  if (input.alreadyRedeemed) return { ok: false, reason: "You already used this code." };
  if (input.redemption_count >= input.max_redemptions) return { ok: false, reason: "That code has been fully redeemed." };
  return { ok: true };
}

export function planRank(plan: "free" | "pro" | "lifetime") {
  if (plan === "lifetime") return 2;
  if (plan === "pro") return 1;
  return 0;
}
