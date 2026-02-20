import { getApiAuth } from "@/lib/api-auth";
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

  const auth = await getApiAuth();
  if (!auth) {
    return NextResponse.json(
      { success: false, error: "로그인이 필요해요." },
      { status: 401 }
    );
  }

  const { supabase, userId } = auth;

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
