/**
 * UTC ISO 문자열을 한국 시간(KST, UTC+9)으로 포맷
 * Supabase created_at 등 UTC 저장값 표시용
 */
function formatInKST(
  utcIsoString: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!utcIsoString) return "";
  const date = new Date(utcIsoString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    ...options,
  });
}

/** KST 날짜만 (예: 2026. 2. 19.) */
export function formatDateKST(utcIsoString: string | null | undefined): string {
  return formatInKST(utcIsoString, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/** KST 날짜+시간 (예: 2026. 2. 19. 오후 10:30:00) */
export function formatDateTimeKST(
  utcIsoString: string | null | undefined
): string {
  return formatInKST(utcIsoString, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}
