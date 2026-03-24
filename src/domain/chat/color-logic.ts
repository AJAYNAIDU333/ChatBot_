export type ResponseColor =
  | "blue"
  | "yellow"
  | "orange"
  | "white"
  | "grey"
  | "black"
  | "red"
  | "rose"
  | "green"
  | "greenSoft"
  | "amber";

/**
 * Priority 1: Time Parsing Logic
 */
function parseDeadlineHours(input: string): number | null {
  const lowerInput = input.toLowerCase();

  // 1. Handle long-term keywords
  if (lowerInput.includes("next week") || lowerInput.includes("days")) {
    return 168; 
  }

  // 2. Handle "in X hours"
  const hoursPattern = /(?:in\s+)?(\d+)\s*hours?/i;
  const hoursMatch = lowerInput.match(hoursPattern);
  if (hoursMatch) {
    return parseInt(hoursMatch[1], 10);
  }

  // 3. Handle specific time formats (e.g., "by 1:30 PM")
  // Includes robust keywords to avoid false positives on standard prepositions
  const timePattern = /(?:by|at|due|deadline|until|before)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const match = lowerInput.match(timePattern);

  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const ampm = match[3];

    // Standardize to 24-hour format
    if (ampm === "pm" && hours < 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;

    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    // If target has passed today, assume tomorrow
    if (target < now) {
      target.setDate(target.getDate() + 1);
    }

    const diffInMs = target.getTime() - now.getTime();
    return diffInMs / (1000 * 60 * 60);
  }

  return null;
}

/**
 * Priority 2: Grayscale logic for Numbers
 * 100 → black; …00 (except 100) → white; 50 → grey
 * 01–24 → white, 25–49 → grey, 51–74 → grey, 75–99 → black.
 */
function getNumberColor(num: number): ResponseColor {
  const absNum = Math.abs(num);
  const last2 = absNum % 100;

  if (last2 === 50) return "grey";
  if (absNum === 100) return "black";
  if (last2 === 0) return "white";

  if (last2 >= 1 && last2 <= 24) return "white";
  if (last2 >= 25 && last2 <= 49) return "grey";
  if (last2 >= 51 && last2 <= 74) return "grey";
  if (last2 >= 75 && last2 <= 99) return "black";

  return "black";
}

/**
 * THE WATERFALL ENGINE:
 * 1. Deadline Priority (Time-based)
 * 2. Number Priority (Math-based)
 * 3. Sentiment Fallback (AI-based)
 */
export function determineColor(input: string): ResponseColor {
  const trimmed = input.trim();

  // 1. Priority One: Deadlines
  // Directly parses the hours. If it returns null, it's not a real deadline.
  const hours = parseDeadlineHours(trimmed);
  if (hours !== null) {
    if (hours < 2) return "orange";
    if (hours < 24) return "yellow";
    return "blue";
  }

  // 2. Priority Two: Numbers
  // Only triggers if the input is purely numerical
  if (/^\s*-?\d+\s*$/.test(trimmed)) {
    return getNumberColor(parseInt(trimmed, 10));
  }

  // 3. Priority Three: Sentiment Fallback
  // Hands off control to the Gemini LM for sentiment analysis
  return "amber";
}

/** True when assistant bubble color should come from model tone */
export function usesModelToneColor(hint: ResponseColor): boolean {
  return hint === "amber";
}

/**
 * WCAG 2.0 AA Contrast Mapping (≥ 4.5:1 ratio)
 * Uses Tailwind arbitrary values `[#ff4d00]` for exact branding.
 */
export function getColorClass(color: ResponseColor): string {
  const map: Record<ResponseColor, string> = {
    blue: "!text-white bg-blue-800",
    orange: "!text-neutral-950 bg-[#ff4d00]", // Custom Hex + Dark Text for WCAG AA
    black: "!text-white bg-neutral-950",
    red: "!text-white bg-red-900",
    rose: "!text-red-950 bg-red-200",
    green: "!text-white bg-green-800",
    greenSoft: "!text-emerald-950 bg-emerald-200",
    amber: "!text-amber-950 bg-amber-200",
    grey: "!text-white bg-slate-600",
    yellow: "!text-yellow-950 bg-yellow-400",
    white: "!text-neutral-900 bg-white border border-neutral-300",
  };
  return map[color];
}

/**
 * Foreground for assistant markdown typography.
 */
export function getAssistantContentTextClass(color: ResponseColor): string {
  const map: Record<ResponseColor, string> = {
    blue: "!text-white",
    orange: "!text-neutral-950", // Custom Hex needs dark text
    black: "!text-white",
    red: "!text-white",
    rose: "!text-red-950",
    green: "!text-white",
    greenSoft: "!text-emerald-950",
    amber: "!text-amber-950",
    grey: "!text-white",
    yellow: "!text-yellow-950",
    white: "!text-neutral-900",
  };
  return map[color];
}

export function getBorderColorClass(color: ResponseColor): string {
  const map: Record<ResponseColor, string> = {
    blue: "border-l-blue-950",
    yellow: "border-l-yellow-700",
    orange: "border-l-[#cc3d00]", // Slightly darker shade of #ff4d00 for the border
    white: "border-l-neutral-400",
    grey: "border-l-slate-800",
    black: "border-l-black",
    red: "border-l-red-950",
    rose: "border-l-red-700",
    green: "border-l-green-950",
    greenSoft: "border-l-emerald-800",
    amber: "border-l-amber-800",
  };
  return map[color];
}