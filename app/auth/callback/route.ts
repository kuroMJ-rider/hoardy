import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { DEFAULT_DRAWERS } from "@/lib/constants";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // setAll is handled by middleware for Server Components
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;

      try {
        const serviceClient = createServiceClient();

        const m = user.user_metadata ?? {};
        const nickname =
          (m.nickname as string) ??
          (m.full_name as string) ??
          (m.name as string) ??
          null;
        const avatarUrl =
          (m.avatar_url as string) ?? (m.picture as string) ?? null;

        await serviceClient.from("profiles").upsert(
          {
            id: user.id,
            email: user.email ?? null,
            nickname,
            avatar_url: avatarUrl,
          },
          { onConflict: "id" }
        );

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

      const redirectTo = new URL(next, origin);
      redirectTo.searchParams.set("welcome", "1");
      return NextResponse.redirect(redirectTo);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
