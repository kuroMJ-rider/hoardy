"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { signOut as authSignOut } from "@/lib/auth";

const LOGO_SRC = "/images/logo-color.png";

function getDisplayName(user: { user_metadata?: Record<string, unknown> }): string {
  const m = user.user_metadata ?? {};
  return (
    (m.nickname as string) ??
    (m.full_name as string) ??
    (m.name as string) ??
    (m.email as string) ??
    "유저"
  );
}

function getAvatarUrl(user: { user_metadata?: Record<string, unknown> }): string | null {
  const m = user.user_metadata ?? {};
  return (m.avatar_url as string) ?? (m.picture as string) ?? null;
}

export function AppHeader({
  user,
  onSignOut,
}: {
  user: { user_metadata?: Record<string, unknown> } | null;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const avatarUrl = user ? getAvatarUrl(user) : null;
  const name = user ? getDisplayName(user) : "유저";

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-zinc-800/20 bg-transparent backdrop-blur-sm">
      <div className="mx-auto flex min-h-16 max-w-lg items-center justify-between px-4 sm:min-h-[4.5rem] md:min-h-20">
        <Link
          href="/about"
          className="-ml-2 flex items-center p-2 transition-opacity hover:opacity-80"
          aria-label="호디 소개"
        >
          <img
            src={LOGO_SRC}
            alt="호디"
            className="h-12 w-auto object-contain sm:h-14 md:h-16"
          />
        </Link>
        {user && (
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full p-1.5 transition-colors hover:bg-zinc-800"
            aria-label="프로필 메뉴"
            aria-expanded={open}
            aria-haspopup="true"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint/20 text-sm font-medium text-mint">
                {name.charAt(0)}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 min-w-[140px] rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-xl">
              <p className="truncate px-3 py-2 text-xs text-zinc-400">{name}</p>
              <button
                type="button"
                onClick={async () => {
                  setOpen(false);
                  await authSignOut();
                  onSignOut();
                }}
                className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </header>
  );
}
