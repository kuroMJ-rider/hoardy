import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Hoardy",
  description:
    "지식은 쌓아둘 때가 아니라, 필요할 때 바로 꺼낼 수 있을 때 비로소 내 것이 됩니다.",
  openGraph: {
    title: "About | Hoardy",
    description:
      "지식은 쌓아둘 때가 아니라, 필요할 때 바로 꺼낼 수 있을 때 비로소 내 것이 됩니다.",
    images: [{ url: "/hoardy_assets/hoardy_idle.png", width: 512, height: 512 }],
  },
};

const SECTIONS = [
  {
    id: "about",
    badge: "About Hoardy",
    title: "무분별한 링크를, 정제된 지식으로.",
    body: `'Hoarding(축적)'에서 이름을 딴 호디는 당신이 던진 링크를 씹고, 소화하고, 분류합니다.
탭 100개를 열어두는 습관 대신, 호디에게 맡기세요.
읽지 않은 북마크는 결국 잊힙니다. 하지만 호디가 소화한 지식은 당신의 것으로 남습니다.`,
    icon: "🦖",
  },
  {
    id: "brain",
    badge: "Second Brain",
    title: "뇌는 기억하는 곳이 아니라, 아이디어를 만드는 곳입니다.",
    body: `외우는 건 호디가 합니다. 요약, 분류, 정리 — 정보의 노동은 AI에게.
당신은 '생각'과 '연결'에만 집중하세요.
호디는 단순한 북마크가 아닙니다. 당신의 두 번째 뇌입니다.`,
    icon: "🧠",
  },
  {
    id: "anthropology",
    badge: "Private Anthropology",
    title: "나를 연구하는 작은 인류학.",
    body: `내가 무엇을 읽었는지는, 내가 누구인지를 보여주는 가장 정교한 데이터셋입니다.
호디는 당신의 수집 궤적을 분석하여 관심사의 변화, 성장의 패턴을 객관적으로 보여줍니다.
주간 인류학 리포트로 한 주를 돌아보세요. 데이터 속에 숨은 '나'를 발견할 수 있습니다.`,
    icon: "📊",
  },
  {
    id: "private",
    badge: "Zero Social Policy",
    title: "공유 버튼 따위 없습니다.",
    body: `호디에는 팔로우도, 좋아요도, 공유 기능도 없습니다.
타인에게 보여주기 위한 전시용 링크가 아니라, 오직 '미래의 나'를 위한 투자입니다.
가장 솔직한 지적 성장은 아무도 보지 않는 곳에서 시작됩니다.
여기는 당신만의 안전한 지식 창고입니다.`,
    icon: "🔒",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-zinc-100">
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 py-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(152,255,152,0.04)_0%,transparent_70%)]" />

        <img
          src="/hoardy_assets/hoardy_idle_transparent.png"
          alt="호디"
          className="relative mb-8 h-40 w-40 object-contain sm:h-48 sm:w-48"
        />

        <h1 className="relative mx-auto max-w-2xl text-2xl font-bold leading-snug tracking-tight sm:text-3xl md:text-4xl">
          지식은 쌓아둘 때가 아니라,{" "}
          <span className="text-mint">
            필요할 때 바로 꺼낼 수 있을 때
          </span>{" "}
          비로소 내 것이 됩니다.
        </h1>

        <p className="relative mt-6 max-w-lg text-sm leading-relaxed text-zinc-500 sm:text-base">
          흩어진 정보는 소음일 뿐이지만, 정제된 기록은 자산이 됩니다.
        </p>
      </section>

      <div className="mx-auto max-w-3xl px-6">
        {SECTIONS.map((s, i) => (
          <section
            key={s.id}
            className={`border-t border-zinc-800/50 py-20 ${
              i === SECTIONS.length - 1 ? "border-b" : ""
            }`}
          >
            <span className="mb-4 inline-block rounded-full bg-mint/10 px-3 py-1 text-xs font-semibold text-mint">
              {s.icon} {s.badge}
            </span>
            <h2 className="mb-6 text-xl font-bold leading-snug sm:text-2xl">
              {s.title}
            </h2>
            <div className="space-y-4">
              {s.body.split("\n").map((line, j) => (
                <p
                  key={j}
                  className="text-sm leading-relaxed text-zinc-400 sm:text-base"
                >
                  {line}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="py-20 text-center">
        <p className="mb-6 text-sm text-zinc-600">
          호디는 당신의 지식을 소화하고 있습니다.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-mint px-6 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
        >
          내 서랍장으로 가기 →
        </Link>
      </section>
    </main>
  );
}
