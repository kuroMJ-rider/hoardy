import { digestLink } from "@/lib/digest";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  url: z.string().url(),
  drawer_id: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const isDev =
    process.env.NEXT_PUBLIC_HOARDY_DEV === "true" &&
    !!process.env.NEXT_PUBLIC_HOARDY_DEV_USER_ID;

  // [진단] Dev 모드에서 RLS 우회를 위해 Service Role Key 필요
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (isDev && !hasServiceKey) {
    console.warn(
      "⚠️ SUPABASE_SERVICE_ROLE_KEY가 없음. .env.local에 추가하면 RLS 없이 저장됩니다."
    );
  }

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
  } catch (err) {
    console.error("🔥 503 원인 - Supabase 연결 실패:", err);
    return NextResponse.json(
      { error: "Supabase 설정이 필요해. .env.local을 확인해줘." },
      { status: 503 }
    );
  }
  if (!userId) {
    console.error("🔥 user_id 없음 - 로그인 또는 NEXT_PUBLIC_HOARDY_DEV_USER_ID 설정 필요");
    return NextResponse.json(
      { error: "로그인이 필요해." },
      { status: 401 }
    );
  }

  console.log("[진단] user_id:", userId);

  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "URL이 필요해. 형식을 확인해줘." },
        { status: 400 }
      );
    }

    const { url, drawer_id } = parsed.data;
    console.log("1. 요청 수신:", url);
    console.log("2. 본문 추출 완료");

    console.log("3. DB Insert Start");
    const insertPayload = {
      url,
      drawer_id: drawer_id || null,
      user_id: userId,
    };
    console.log("[진단] insert payload:", { url: url.slice(0, 60), drawer_id: insertPayload.drawer_id, user_id: insertPayload.user_id });

    const { data: link, error } = await supabase
      .from("archives")
      .insert(insertPayload)
      .select("id")
      .single();

    console.log("3. DB Insert End", error ? `[실패] ${error.message}` : `[성공] id=${link?.id}`);

    if (error) {
      console.error("🔥 Supabase insert 에러:", error.message, error.details);
      const hint =
        isDev && !hasServiceKey
          ? " .env.local에 SUPABASE_SERVICE_ROLE_KEY를 추가하면 RLS를 우회할 수 있습니다."
          : "";
      return NextResponse.json(
        { error: error.message + hint },
        { status: 500 }
      );
    }

    console.log("4. AI 소화(digest) 비동기 시작");
    void digestLink(supabase, link.id, url, drawer_id ?? null, userId);

    return NextResponse.json({
      message: "나중에 진짜 읽을 거지?",
      id: link.id,
    });
  } catch (error) {
    console.error("🔥 상세 에러 발생:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "예상치 못한 오류" },
      { status: 500 }
    );
  }
}
