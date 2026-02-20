import { createBrowserClient } from "@supabase/ssr";

/** Client Component용 Supabase 클라이언트 (OAuth 등) */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL와 NEXT_PUBLIC_SUPABASE_ANON_KEY가 필요해.");
  }
  return createBrowserClient(url, key);
}
