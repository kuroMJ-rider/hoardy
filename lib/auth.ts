import { createClient } from "@/lib/supabase/client";

export type OAuthProvider = "google" | "kakao";

/** 로그아웃 */
export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

/** OAuth 로그인 (구글 또는 카카오) */
export async function signInWithOAuth(provider: OAuthProvider): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
      scopes: provider === "kakao" ? "profile_nickname profile_image account_email" : undefined,
    },
  });
  return { error: error ? new Error(error.message) : null };
}
