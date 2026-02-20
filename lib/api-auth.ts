import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const isDev =
  process.env.NEXT_PUBLIC_HOARDY_DEV === "true" &&
  !!process.env.NEXT_PUBLIC_HOARDY_DEV_USER_ID;

const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

interface AuthResult {
  supabase: SupabaseClient;
  userId: string;
}

/**
 * API 라우트용 인증 헬퍼.
 * 성공 시 { supabase, userId }를, 실패 시 null을 반환합니다.
 */
export async function getApiAuth(): Promise<AuthResult | null> {
  try {
    if (isDev) {
      const userId = process.env.NEXT_PUBLIC_HOARDY_DEV_USER_ID ?? null;
      if (!userId) return null;
      const supabase = hasServiceKey
        ? createServiceClient()
        : await createClient();
      return { supabase, userId };
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id ?? null;
    if (!userId) return null;
    return { supabase, userId };
  } catch {
    return null;
  }
}
