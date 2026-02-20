"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 300);

    const closeTimer = setTimeout(() => {
      onClose();
      setIsExiting(false);
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-zinc-800/95 px-6 py-4 text-mint shadow-[0_0_24px_rgba(152,255,152,0.3)] backdrop-blur-sm transition-all duration-300 ${
        isExiting ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <p className="text-lg font-medium">🦖 {message}</p>
    </div>
  );
}
