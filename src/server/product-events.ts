import { isDemoMode } from "@/lib/env";
import type { ProductEventName, ProductProperties } from "@/lib/product-analytics";
import { createServiceSupabase } from "@/lib/supabase/server";
import { updateState, type ProductEventRecord } from "@/server/demo-store";

export async function persistProductEvent(name: ProductEventName, properties: ProductProperties) {
  const row: ProductEventRecord = {
    id: crypto.randomUUID(),
    name,
    properties,
    created_at: new Date().toISOString(),
  };
  if (isDemoMode()) {
    await updateState((state) => {
      state.productEvents.push(row);
      if (state.productEvents.length > 20000) state.productEvents = state.productEvents.slice(-15000);
    });
    return;
  }
  try {
    const admin = createServiceSupabase();
    await admin.from("product_events").insert({ name, properties });
  } catch (error) {
    console.info(JSON.stringify({ source: "presskit.product", persist: "skipped", reason: error instanceof Error ? error.message : "unavailable" }));
  }
}
