import { generateAnonymousName } from "./anonymous-names";

const STORAGE_KEY = "amoho_anon_name";

export function getAnonymousName(): string {
  if (typeof window === "undefined") return "";

  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  // First visit — generate and save
  const name = generateAnonymousName();
  localStorage.setItem(STORAGE_KEY, name);
  return name;
}
