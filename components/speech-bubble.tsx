"use client";

import { useEffect, useState } from "react";

interface SpeechBubbleProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function SpeechBubble({
  message,
  isVisible,
  onClose,
  duration = 3500,
}: SpeechBubbleProps) {
  const [phase, setPhase] = useState<"enter" | "visible" | "exit" | "hidden">(
    "hidden"
  );

  useEffect(() => {
    if (!isVisible) {
      setPhase("hidden");
      return;
    }

    setPhase("enter");
    const enterTimer = setTimeout(() => setPhase("visible"), 50);

    const exitTimer = setTimeout(() => {
      setPhase("exit");
    }, duration - 400);

    const closeTimer = setTimeout(() => {
      setPhase("hidden");
      onClose();
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [isVisible, duration, onClose]);

  if (phase === "hidden") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`absolute -top-4 left-1/2 z-50 w-max max-w-[280px] -translate-x-1/2 -translate-y-full transition-all duration-300 ${
        phase === "enter"
          ? "translate-y-0 scale-95 opacity-0"
          : phase === "exit"
            ? "-translate-y-[calc(100%+4px)] scale-95 opacity-0"
            : "-translate-y-[calc(100%+4px)] scale-100 opacity-100"
      }`}
    >
      <div className="animate-bounce-slow rounded-2xl border border-mint/30 bg-zinc-900/95 px-4 py-3 shadow-[0_0_20px_rgba(152,255,152,0.15)] backdrop-blur-sm">
        <p className="text-center text-sm leading-relaxed text-mint">
          🦖 {message}
        </p>
      </div>
      {/* 말풍선 꼬리 */}
      <div className="mx-auto flex justify-center">
        <div
          className="h-0 w-0 border-x-[8px] border-t-[10px] border-x-transparent border-t-zinc-900/95"
          aria-hidden
        />
      </div>
    </div>
  );
}
