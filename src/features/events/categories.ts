export const EVENT_CATEGORIES = [
  "Music",
  "Sports",
  "Tech",
  "Food",
  "Art",
  "Community",
  "Education",
  "Other",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];
