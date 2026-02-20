import { DEFAULT_DRAWERS } from "@/lib/constants";
import { getApiAuth } from "@/lib/api-auth";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await getApiAuth();
  if (!auth) return NextResponse.json({ drawers: DEFAULT_DRAWERS });

  const { supabase, userId } = auth;
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  const { data, error } = await supabase
    .from("drawers")
    .select("id, name, icon, instruction")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ drawers: DEFAULT_DRAWERS });
  }

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
      .upsert(toUpsert, { onConflict: "user_id,name", ignoreDuplicates: true });

    if (!upsertError) {
      const { data: newData } = await serviceClient
        .from("drawers")
        .select("id, name, icon, instruction")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true });

      return NextResponse.json({ drawers: newData ?? [], initialized: true });
    }
  }

  if (!data?.length) {
    return NextResponse.json({ drawers: DEFAULT_DRAWERS });
  }

  return NextResponse.json({ drawers: data });
}
