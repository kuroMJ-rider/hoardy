import { getApiAuth } from "@/lib/api-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await getApiAuth();
  if (!auth) return NextResponse.json({ archives: [] });

  const { supabase, userId } = auth;

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
