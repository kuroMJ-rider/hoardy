import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const isDev =
    process.env.NEXT_PUBLIC_HOARDY_DEV === "true" &&
    !!process.env.NEXT_PUBLIC_HOARDY_DEV_USER_ID;
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  let supabase;
  let userId: string | null = null;

  try {
    if (isDev) {
      userId = process.env.NEXT_PUBLIC_HOARDY_DEV_USER_ID ?? null;
      supabase = hasServiceKey
        ? createServiceClient()
        : await createClient();
    } else {
      supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    }
  } catch {
    return NextResponse.json({ archives: [] });
  }

  if (!userId) {
    return NextResponse.json({ archives: [] });
  }

  const { data, error } = await supabase
    .from("archives")
    .select("id, url, title, summary, site_name, favicon_url, created_at, drawer_id, drawers(name, icon)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("🔥 archives 조회 에러:", error.message);
    return NextResponse.json({ archives: [] });
  }

  return NextResponse.json({ archives: data ?? [] });
}
