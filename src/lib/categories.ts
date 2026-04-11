export const CATEGORIES = [
  "General",
  // Relationships
  "Relationships",
  "Breakup",
  "Family Conflict",
  "Trust Issues",
  // Mental Health
  "Anxiety & Stress",
  "Depression",
  "Loneliness & Isolation",
  "Self-Esteem & Identity",
  "Grief & Loss",
  // Life Challenges
  "Work & Career Stress",
  "Burnout & Exhaustion",
  "Addiction & Recovery",
  "Moving On",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Category groupings for the filter bar */
export const CATEGORY_GROUPS = {
  "All Topics": null as unknown as readonly string[],
  Relationships: ["Relationships", "Breakup", "Family Conflict", "Trust Issues"] as const,
  "Mental Health": ["Anxiety & Stress", "Depression", "Loneliness & Isolation", "Self-Esteem & Identity", "Grief & Loss"] as const,
  "Life Challenges": ["Work & Career Stress", "Burnout & Exhaustion", "Addiction & Recovery", "Moving On"] as const,
} as const;
