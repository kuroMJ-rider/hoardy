export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(180deg, #1a2f1a 0%, #2a1a2f 100%), radial-gradient(ellipse 80% 50% at 50% 0%, rgba(152,255,152,0.15) 0%, transparent 50%)",
      }}
    >
      <h1 className="text-4xl font-bold text-mint">404</h1>
      <p className="mt-2 text-zinc-400">여긴 없는 페이지야.</p>
      <a
        href="/"
        className="mt-6 rounded-xl bg-mint/20 px-6 py-3 text-mint transition hover:bg-mint/30"
      >
        홈으로 돌아가기
      </a>
    </div>
  );
}
