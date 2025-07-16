import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const alerts = [
    {
      coin: "bitcoin",
      price: 60345,
      funding: -0.0011,
      oi_change: 3.2,
      recommendation: "LONG"
    }
  ];

  for (const alert of alerts) {
    await supabase.from("alerts").insert([{
      ...alert,
      user_id: "your-user-id"
    }]);
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
