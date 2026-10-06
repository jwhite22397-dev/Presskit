import { isDemoMode } from "@/lib/env";
import { assessFoundingCode, isFoundingCodeShape, normalizeFoundingCode, planRank } from "@/lib/founding";
import { isAdminUser } from "@/lib/server-env";
import { createServiceSupabase } from "@/lib/supabase/server";
import type { Plan } from "@/types";
import { readState, updateState, type FoundingCode } from "@/server/demo-store";

export async function createFoundingCode(actorId: string, input: { code: string; entitlement: "pro" | "lifetime"; maxRedemptions: number; expiresAt: string | null }) {
  if (!isAdminUser(actorId)) return { ok: false as const, error: "Admin access required." };
  const code = normalizeFoundingCode(input.code);
  if (!isFoundingCodeShape(code)) return { ok: false as const, error: "Use a code like FOUNDING-AB12." };
  if (!Number.isInteger(input.maxRedemptions) || input.maxRedemptions < 1 || input.maxRedemptions > 500) {
    return { ok: false as const, error: "Set a redemption limit between 1 and 500." };
  }
  if (isDemoMode()) {
    const created = await updateState((state) => {
      if (state.foundingCodes.some((item) => item.code === code)) return null;
      const row: FoundingCode = {
        id: crypto.randomUUID(),
        code,
        entitlement: input.entitlement,
        max_redemptions: input.maxRedemptions,
        redemption_count: 0,
        expires_at: input.expiresAt,
        active: true,
        created_by: actorId,
        created_at: new Date().toISOString(),
      };
      state.foundingCodes.push(row);
      return row;
    });
    if (!created) return { ok: false as const, error: "That code already exists." };
    return { ok: true as const, code };
  }
  try {
    const admin = createServiceSupabase();
    const { error } = await admin.from("founding_codes").insert({
      code,
      entitlement: input.entitlement,
      max_redemptions: input.maxRedemptions,
      expires_at: input.expiresAt,
      created_by: actorId,
    });
    if (error) return { ok: false as const, error: error.code === "23505" ? "That code already exists." : error.message };
    return { ok: true as const, code };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Could not create the code." };
  }
}

export async function listFoundingCodes(actorId: string) {
  if (!isAdminUser(actorId)) return [];
  if (isDemoMode()) {
    const state = await readState();
    return state.foundingCodes.map((code) => ({
      ...code,
      redeemers: state.foundingRedemptions
        .filter((item) => item.code_id === code.id)
        .map((item) => state.users.find((user) => user.id === item.user_id)?.email ?? item.user_id),
    }));
  }
  const admin = createServiceSupabase();
  const { data: codes } = await admin.from("founding_codes").select("*").order("created_at", { ascending: false });
  const { data: redemptions } = await admin.from("founding_redemptions").select("code_id, user_id");
  return (codes ?? []).map((code) => ({
    id: code.id as string,
    code: code.code as string,
    entitlement: code.entitlement as "pro" | "lifetime",
    max_redemptions: code.max_redemptions as number,
    redemption_count: code.redemption_count as number,
    expires_at: (code.expires_at as string | null) ?? null,
    active: Boolean(code.active),
    created_by: (code.created_by as string | null) ?? null,
    created_at: code.created_at as string,
    redeemers: (redemptions ?? []).filter((item) => item.code_id === code.id).map((item) => item.user_id as string),
  }));
}

export async function redeemFoundingCode(userId: string, currentPlan: Plan, rawCode: string) {
  const code = normalizeFoundingCode(rawCode);
  if (!isFoundingCodeShape(code)) return { ok: false as const, error: "Enter a code like FOUNDING-AB12." };
  if (isDemoMode()) {
    return updateState((state) => {
      const user = state.users.find((item) => item.id === userId);
      const row = state.foundingCodes.find((item) => item.code === code);
      if (!user || !row) return { ok: false as const, error: "That code is not valid." };
      const decision = assessFoundingCode({
        active: row.active,
        expires_at: row.expires_at,
        redemption_count: row.redemption_count,
        max_redemptions: row.max_redemptions,
        alreadyRedeemed: state.foundingRedemptions.some((item) => item.code_id === row.id && item.user_id === userId),
      });
      if (!decision.ok) return { ok: false as const, error: decision.reason };
      if (planRank(user.plan) >= planRank(row.entitlement)) {
        return { ok: false as const, error: "Your plan already includes this." };
      }
      user.plan = row.entitlement;
      user.plan_source = "founding";
      user.subscription_status = "active";
      user.updated_at = new Date().toISOString();
      state.sites.forEach((site) => {
        if (site.user_id === userId) site.public_plan = row.entitlement;
      });
      row.redemption_count += 1;
      state.foundingRedemptions.push({
        id: crypto.randomUUID(),
        code_id: row.id,
        user_id: userId,
        redeemed_at: new Date().toISOString(),
      });
      return { ok: true as const, entitlement: row.entitlement };
    });
  }
  try {
    const admin = createServiceSupabase();
    const { data: row } = await admin.from("founding_codes").select("*").eq("code", code).maybeSingle();
    if (!row) return { ok: false as const, error: "That code is not valid." };
    const { data: prior } = await admin.from("founding_redemptions").select("id").eq("code_id", row.id).eq("user_id", userId).maybeSingle();
    const decision = assessFoundingCode({
      active: Boolean(row.active),
      expires_at: (row.expires_at as string | null) ?? null,
      redemption_count: row.redemption_count as number,
      max_redemptions: row.max_redemptions as number,
      alreadyRedeemed: Boolean(prior),
    });
    if (!decision.ok) return { ok: false as const, error: decision.reason };
    const entitlement = row.entitlement as "pro" | "lifetime";
    if (planRank(currentPlan) >= planRank(entitlement)) return { ok: false as const, error: "Your plan already includes this." };
    const { error: profileError } = await admin.from("profiles").update({
      plan: entitlement,
      plan_source: "founding",
      subscription_status: "active",
    }).eq("id", userId);
    if (profileError) return { ok: false as const, error: profileError.message };
    const { error: redemptionError } = await admin.from("founding_redemptions").insert({ code_id: row.id, user_id: userId });
    if (redemptionError) return { ok: false as const, error: redemptionError.message };
    await admin.from("founding_codes").update({ redemption_count: (row.redemption_count as number) + 1 }).eq("id", row.id);
    return { ok: true as const, entitlement };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Could not redeem that code." };
  }
}
