"use client";

import { generateAnonymousName } from "@/lib/anonymous-names";

const STORAGE_KEY = "amoho_anon_name";

export function getAnonName(): string {
  if (typeof window === "undefined") {
    return generateAnonymousName();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return stored;
  }

  const name = generateAnonymousName();
  localStorage.setItem(STORAGE_KEY, name);
  return name;
}
