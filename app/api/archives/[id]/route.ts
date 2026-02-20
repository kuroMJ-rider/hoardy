import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, error: "삭제할 아카이브 ID가 필요해요." },
      { status: 400 }
    );
  }

  const isDev =
    process.env.NEXT_PUBLIC_HOARDY_DEV === "true" &&
    !!process.env.NEXT_PUBLIC_HOARDY_DEV_USER_ID;
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  let supabase;
  let userId: string | null = null;

  try {
    if (isDev) {
      userId = process.env.NEXT_PUBLIC_HOARDY_DEV_USER_ID ?? null;
      supabase = hasServiceKey ? createServiceClient() : await createClient();
    } else {
      supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "인증 처리 중 오류가 발생했어요." },
      { status: 500 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "로그인이 필요해요." },
      { status: 401 }
    );
  }

  const { error } = await supabase
    .from("archives")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("🔥 archive 삭제 에러:", error.message);
    return NextResponse.json(
      { success: false, error: "삭제에 실패했어요." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
