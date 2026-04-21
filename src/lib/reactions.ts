"use client";

const STORAGE_KEY = "amoho_reactions";

export function getReactions(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore parse errors
  }

  return {};
}

export function toggleReaction(postId: string, type: "heart" | "cry"): string | null {
  const reactions = getReactions();
  const key = `${postId}_${type}`;

  if (reactions[key]) {
    delete reactions[key];
  } else {
    reactions[key] = type;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(reactions));
  return reactions[key] || null;
}

export function hasReacted(postId: string, type: "heart" | "cry"): boolean {
  const reactions = getReactions();
  return !!reactions[`${postId}_${type}`];
}
