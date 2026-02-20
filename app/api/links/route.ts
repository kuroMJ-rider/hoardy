import { digestLink } from "@/lib/digest";
import { getApiAuth } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  url: z.string().url(),
  drawer_id: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const auth = await getApiAuth();
  if (!auth) {
    return NextResponse.json({ error: "로그인이 필요해." }, { status: 401 });
  }

  const { supabase, userId } = auth;

  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "URL이 필요해. 형식을 확인해줘." },
        { status: 400 }
      );
    }

    const { url, drawer_id } = parsed.data;

    const { data: link, error } = await supabase
      .from("archives")
      .insert({ url, drawer_id: drawer_id || null, user_id: userId })
      .select("id")
      .single();

    if (error) {
      console.error("🔥 Supabase insert 에러:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    void digestLink(supabase, link.id, url, drawer_id ?? null, userId);

    return NextResponse.json({
      message: "나중에 진짜 읽을 거지?",
      id: link.id,
    });
  } catch (error) {
    console.error("🔥 links API 에러:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "예상치 못한 오류" },
      { status: 500 }
    );
  }
}
