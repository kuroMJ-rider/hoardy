import { getApiAuth } from "@/lib/api-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await getApiAuth();
  if (!auth) return NextResponse.json({ total: 0, byDrawer: [] });

  const { supabase, userId } = auth;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("archives")
    .select("id, drawer_id, drawers(name, icon)")
    .eq("user_id", userId)
    .gte("created_at", sevenDaysAgo);

  if (error) {
    console.error("🔥 weekly stats 에러:", error.message);
    return NextResponse.json({ total: 0, byDrawer: [] });
  }

  const rows = data ?? [];
  const counts: Record<string, { name: string; icon: string; count: number }> = {};

  for (const row of rows) {
    const drawerId = row.drawer_id ?? "__none__";
    const drawerRaw = row.drawers;
    const drawer = drawerRaw
      ? Array.isArray(drawerRaw) ? drawerRaw[0] : drawerRaw
      : null;

    if (!counts[drawerId]) {
      counts[drawerId] = {
        name: drawer?.name ?? "미분류",
        icon: drawer?.icon ?? "📁",
        count: 0,
      };
    }
    counts[drawerId].count++;
  }

  const byDrawer = Object.entries(counts)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ total: rows.length, byDrawer });
}
