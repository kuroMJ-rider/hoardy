"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { AppHeader } from "@/components/app-header";
import { ArchiveDashboard } from "@/components/archive-dashboard";
import { AuthLogin } from "@/components/auth-login";
import { HoardyCharacter, type HoardyState } from "@/components/hoardy-character";
import { LinkInput } from "@/components/link-input";
import { SpeechBubble } from "@/components/speech-bubble";
import { createClient } from "@/lib/supabase/client";
import { getDisplayName } from "@/lib/utils/user";

const isDev =
  process.env.NEXT_PUBLIC_HOARDY_DEV === "true" &&
  !!process.env.NEXT_PUBLIC_HOARDY_DEV_USER_ID;

export default function Home() {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<{ user_metadata?: Record<string, unknown> } | null>(null);
  const [mascotState, setMascotState] = useState<HoardyState>("idle");
  const [isInteracting, setIsInteracting] = useState(false);
  const [selectedDrawerId, setSelectedDrawerId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [archives, setArchives] = useState<Array<{
    id: string;
    url: string;
    title: string | null;
    summary: string | null;
    site_name: string | null;
    favicon_url: string | null;
    created_at: string;
    drawer_id: string | null;
    drawers?: { name: string; icon: string | null } | { name: string; icon: string | null }[] | null;
  }>>([]);
  const [archivesLoading, setArchivesLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    if (params.get("welcome") === "1") {
      const name = getDisplayName(user);
      setToast({
        message: name ? `${name}님, 호디에게 어서 와!` : "환영해요, 호디의 지식 창고에 어서 와!",
        visible: true,
      });
      window.history.replaceState({}, "", "/");
    }
  }, [user]);

  useEffect(() => {
    if (!user && !isDev) return;
    fetch("/api/archives")
      .then((res) => res.ok ? res.json() : { archives: [] })
      .then((data) => setArchives(data?.archives ?? []))
      .catch(() => setArchives([]))
      .finally(() => setArchivesLoading(false));
  }, [refreshKey, user]);

  const drawerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of archives) {
      const id = a.drawer_id ?? "__none__";
      counts[id] = (counts[id] ?? 0) + 1;
    }
    return counts;
  }, [archives]);

  const handleLinkSubmit = useCallback(
    async (url: string, options?: { drawer_id?: string }) => {
      setMascotState("eating");
      try {
        const res = await fetch("/api/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            drawer_id: options?.drawer_id,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const hint = data._debug?.hint ? `\n\n${data._debug.hint}` : "";
          throw new Error((data.error ?? "저장 실패") + hint);
        }

        setToast({
          message: data.message ?? "나중에 진짜 읽을 거지?",
          visible: true,
        });
        setRefreshKey((k) => k + 1);
      } catch {
        setMascotState("vomiting");
        setTimeout(() => setMascotState("idle"), 1500);
        return;
      }
      setTimeout(() => setMascotState("digesting"), 700);
      setTimeout(() => setMascotState("idle"), 3400);
    },
    []
  );

  useEffect(() => {
    if (!user && !isDev) return;
    const params = new URLSearchParams(window.location.search);
    const addUrl = params.get("add_url");
    if (addUrl) {
      window.history.replaceState({}, "", "/");
      handleLinkSubmit(addUrl);
    }
  }, [user, handleLinkSubmit]);

  if (authLoading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-mint" />
      </main>
    );
  }

  if (!isDev && !user) {
    return (
      <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-y-auto bg-zinc-950 px-4 py-8">
        <AppHeader user={null} onSignOut={() => {}} />
        <div className="mb-6 pt-14">
          <HoardyCharacter state="idle" />
        </div>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-100">호디</h1>
          <p className="mt-2 text-sm text-zinc-500">링크를 저장하고 AI가 소화해줘요</p>
        </div>
        <AuthLogin />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center overflow-y-auto overflow-x-hidden bg-zinc-950 px-4 py-8">
      <AppHeader
        user={user}
        onSignOut={() => window.location.reload()}
      />
      <div className="flex w-full max-w-lg flex-col items-center gap-6 pt-14 text-center">
        <div className="relative mt-4">
          <SpeechBubble
            message={toast?.message ?? ""}
            isVisible={toast?.visible ?? false}
            onClose={() => setToast(null)}
          />
          <HoardyCharacter
            state={mascotState}
            isInteracting={isInteracting}
            hasChipSelected={selectedDrawerId !== null}
          />
        </div>

        <LinkInput
          onSubmit={handleLinkSubmit}
          selectedDrawerId={selectedDrawerId}
          onDrawerSelect={setSelectedDrawerId}
          onDrawerInteraction={() => {
            setIsInteracting(true);
            setTimeout(() => setIsInteracting(false), 300);
          }}
          drawerCounts={drawerCounts}
        />
      </div>

      <ArchiveDashboard
        archives={archives}
        loading={archivesLoading}
        onDelete={(id) => setArchives((prev) => prev.filter((a) => a.id !== id))}
      />

    </main>
  );
}
