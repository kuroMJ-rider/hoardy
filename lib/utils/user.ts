type UserLike = { user_metadata?: Record<string, unknown> };

export function getDisplayName(user: UserLike, fallback = ""): string {
  const m = user.user_metadata ?? {};
  return (
    (m.nickname as string) ??
    (m.full_name as string) ??
    (m.name as string) ??
    (m.email as string) ??
    fallback
  );
}

export function getAvatarUrl(user: UserLike): string | null {
  const m = user.user_metadata ?? {};
  return (m.avatar_url as string) ?? (m.picture as string) ?? null;
}
