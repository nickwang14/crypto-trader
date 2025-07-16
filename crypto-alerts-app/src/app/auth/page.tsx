// app/auth/page.tsx
"use client";
import { supabase } from "@/lib/supabaseClient";

const login = async () => {
  await supabase.auth.signInWithOtp({ email: "hello@nickwang14.com" });
};