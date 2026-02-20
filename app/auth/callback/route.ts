import { createServerClient } from "@supabase/ssr";
import { DEFAULT_DRAWERS } from "@/lib/constants";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  const redirectTo = new URL(next, requestUrl.origin);
  if (code) {
    redirectTo.searchParams.set("welcome", "1");
  }
  const response = NextResponse.redirect(redirectTo);

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data } = await supabase.auth.exchangeCodeForSession(code);
    const user = data.user;

    if (user) {
      try {
        const serviceClient = createServiceClient();

        // 1. Profile Sync: public.profiles에 upsert
        const m = user.user_metadata ?? {};
        const nickname =
          (m.nickname as string) ??
          (m.full_name as string) ??
          (m.name as string) ??
          null;
        const avatarUrl = (m.avatar_url as string) ?? (m.picture as string) ?? null;
        await serviceClient.from("profiles").upsert(
          {
            id: user.id,
            email: user.email ?? null,
            nickname,
            avatar_url: avatarUrl,
          },
          { onConflict: "id" }
        );

        // 2. Drawer Init: 서랍 0개면 기본 4개 생성
        const { data: drawers } = await serviceClient
          .from("drawers")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);
        if (!drawers?.length) {
          const toUpsert = DEFAULT_DRAWERS.map((d, i) => ({
            id: crypto.randomUUID(),
            user_id: user.id,
            name: d.name,
            icon: d.icon,
            instruction: d.instruction,
            is_default: i === 0,
          }));
          await serviceClient.from("drawers").upsert(toUpsert, {
            onConflict: "user_id,name",
            ignoreDuplicates: true,
          });
        }
      } catch (err) {
        console.error("🔥 auth callback sync 에러:", err);
      }
    }
  }
  return response;
}
