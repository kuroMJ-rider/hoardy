"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const URL_REGEX = /https?:\/\/[^\s]+/g;

function ShareHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const raw = searchParams.get("url") || searchParams.get("text") || "";
    const match = raw.match(URL_REGEX);
    const url = match ? match[0] : null;

    if (url) {
      router.replace(`/?add_url=${encodeURIComponent(url)}`);
    } else {
      router.replace("/");
    }
  }, [searchParams, router]);

  return null;
}

export default function ShareTargetPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="text-center">
        <div className="mb-4 text-4xl animate-bounce">🦖</div>
        <p className="text-sm text-zinc-400">
          호디가 링크를 소화할 준비를 하고 있어요...
        </p>
      </div>
      <Suspense>
        <ShareHandler />
      </Suspense>
    </main>
  );
}
