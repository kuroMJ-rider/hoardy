"use client";

import { useState } from "react";

export type HoardyState = "idle" | "eating" | "hungry" | "digesting" | "vomiting";

// 투명 배경 PNG — 앱 그라데이션 배경과 자연스럽게 합성
const MASCOT_IMAGES: Record<HoardyState, string> = {
  idle: "/hoardy_assets/hoardy_idle_transparent.png",
  eating: "/hoardy_assets/hoardy_eating_transparent.png",
  hungry: "/hoardy_assets/hoardy_hungry_transparent.png",
  digesting: "/hoardy_assets/hoardy_digesting_transparent.png",
  vomiting: "/hoardy_assets/hoardy_vomiting_transparent.png",
};

const LINK_ICON = "/hoardy_assets/link_icon_transparent.png";

interface HoardyCharacterProps {
  state?: HoardyState;
  size?: number;
  isInteracting?: boolean;
  /** 칩이 선택된 상태 = 호디가 '기대하는 표정'(hungry) 유지 */
  hasChipSelected?: boolean;
}

export function HoardyCharacter({
  state = "idle",
  size = 224,
  isInteracting,
  hasChipSelected = false,
}: HoardyCharacterProps) {
  const [useSvgFallback, setUseSvgFallback] = useState(false);

  // 칩 선택 시 '기대하는 표정'(hungry) 유지 (프롬프트: Hoardy Interaction)
  const displayState =
    hasChipSelected && state === "idle" ? "hungry" : state;
  const imgSrc = MASCOT_IMAGES[displayState] || MASCOT_IMAGES.idle;

  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-500 ${
          state === "eating" || state === "digesting"
            ? "scale-[1.8] opacity-90"
            : "scale-110 opacity-40"
        }`}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #98FF98 0%, #FF69B4 50%, transparent 70%)",
        }}
        aria-hidden
      />

      <div
        className={`relative transition-transform duration-200 ${
          state === "eating" || state === "digesting"
            ? "scale-110"
            : isInteracting
              ? "scale-105"
              : "scale-100"
        }`}
        style={{ width: size, height: size }}
      >
        {useSvgFallback ? (
          <SvgFallback state={displayState} size={size} />
        ) : (
          <img
            src={imgSrc}
            alt="호디 - 링크를 기다리는 호디"
            width={size}
            height={size}
            className="h-full w-full object-contain drop-shadow-[0_0_24px_rgba(152,255,152,0.4)]"
            onError={() => setUseSvgFallback(true)}
          />
        )}

        {state === "eating" && (
          <div
            className="absolute left-1/2 top-0 animate-link-drop"
            style={{ width: size * 0.2, height: size * 0.2 }}
            aria-hidden
          >
            <img src={LINK_ICON} alt="" className="h-full w-full object-contain" />
          </div>
        )}
      </div>
    </div>
  );
}

const MOUTH_SCALES: Record<HoardyState, number> = {
  eating: 0.2,
  hungry: 0.6,
  idle: 1,
  digesting: 1,
  vomiting: 1,
};

function SvgFallback({ state, size }: { state: HoardyState; size: number }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="drop-shadow-[0_0_24px_rgba(152,255,152,0.4)]"
      width={size}
      height={size}
      aria-label="호디 - 링크를 기다리는 호디"
    >
      <rect
        x="12"
        y="12"
        width="176"
        height="176"
        rx="32"
        ry="32"
        fill="#98FF98"
        stroke="#FF69B4"
        strokeWidth="8"
      />
      <circle cx="65" cy="70" r="22" fill="#98FF98" stroke="#FF69B4" strokeWidth="4" />
      <circle cx="65" cy="70" r="14" fill="#FF69B4" />
      <circle cx="65" cy="70" r="5" fill="#98FF98" />
      <circle cx="135" cy="70" r="22" fill="#98FF98" stroke="#FF69B4" strokeWidth="4" />
      <circle cx="135" cy="70" r="14" fill="#FF69B4" />
      <circle cx="135" cy="70" r="5" fill="#98FF98" />
      <path
        d="M60 118 L75 108 L95 112 L100 108 L105 112 L125 108 L140 118 L135 155 L65 155 Z"
        fill="#FF69B4"
      />
      <path d="M78 115 L88 128 L98 115 Z" fill="#FF69B4" />
      <path d="M102 115 L112 128 L122 115 Z" fill="#FF69B4" />
      <g
        transform={`translate(100, 138) scale(${MOUTH_SCALES[state] ?? 1})`}
      >
        <ellipse cx="-6" cy="0" rx="14" ry="9" fill="none" stroke="#FF69B4" strokeWidth="6" />
        <ellipse cx="6" cy="2" rx="14" ry="9" fill="none" stroke="#FF69B4" strokeWidth="6" />
      </g>
    </svg>
  );
}
