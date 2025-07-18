import {supabase} from "@/lib/supabaseClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function logEvent(level: "info" | "warn" | "error", message: string, coin?: string, details?: any) {
  await supabase.from("logs").insert([{ level, message, coin, details }]);
}