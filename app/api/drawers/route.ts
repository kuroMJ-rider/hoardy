import { DEFAULT_DRAWERS } from "@/lib/constants";
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
    return NextResponse.json({ drawers: DEFAULT_DRAWERS });
  }

  if (!userId) {
    return NextResponse.json({ drawers: DEFAULT_DRAWERS });
  }

  const { data, error } = await supabase
    .from("drawers")
    .select("id, name, icon, instruction")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ drawers: DEFAULT_DRAWERS });
  }

  // 신규 유저: 서랍 0개 → 기본 서랍 4개 bulk upsert (중복 시 무시)
  if (!data?.length && hasServiceKey) {
    const serviceClient = createServiceClient();
    const toUpsert = DEFAULT_DRAWERS.map((d, i) => ({
      id: crypto.randomUUID(),
      user_id: userId,
      name: d.name,
      icon: d.icon,
      instruction: d.instruction,
      is_default: i === 0,
    }));

    const { error: upsertError } = await serviceClient
      .from("drawers")
      .upsert(toUpsert, {
        onConflict: "user_id,name",
        ignoreDuplicates: true,
      });

    if (!upsertError) {
      const { data: newData } = await serviceClient
        .from("drawers")
        .select("id, name, icon, instruction")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true });

      return NextResponse.json({
        drawers: newData ?? [],
        initialized: true,
      });
    }
  }

  if (!data?.length) {
    return NextResponse.json({ drawers: DEFAULT_DRAWERS });
  }

  return NextResponse.json({ drawers: data });
}
