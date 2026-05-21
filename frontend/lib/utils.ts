import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const RATING_COLORS: Record<number, string> = {
  1:  "#ef4444",
  2:  "#f87171",
  3:  "#fb923c",
  4:  "#f97316",
  5:  "#eab308",
  6:  "#facc15",
  7:  "#a3e635",
  8:  "#4ade80",
  9:  "#34d399",
  10: "#2dd4bf",
};

export function ratingColor(rating: number): string {
  return RATING_COLORS[Math.round(rating)] ?? "#fbbf24";
}
