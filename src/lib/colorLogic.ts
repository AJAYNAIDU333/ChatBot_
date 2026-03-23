export type ResponseColor = "blue" | "yellow" | "orange" | "white" | "grey" | "black" | "red" | "green" | "amber";

/**
 * Priority 1: Time Parsing Logic
 * Logic to handle "by [Time]", "next week", and "in [X] hours".
 */
function parseDeadlineHours(input: string): number | null {
  const lowerInput = input.toLowerCase();

  // 1. Handle long-term keywords
  if (lowerInput.includes("next week") || lowerInput.includes("days")) {
    return 168; // Returns > 24 hours to trigger Blue
  }

  // 2. Handle "in X hours" (Fix for the 48 hours bug)
  const hoursPattern = /(?:in\s+)?(\d+)\s*hours?/i;
  const hoursMatch = lowerInput.match(hoursPattern);
  if (hoursMatch) {
    return parseInt(hoursMatch[1]);
  }

  // 3. Handle specific time formats (e.g., "by 1:45 AM")
  const timePattern = /(?:by|at|deadline)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const match = lowerInput.match(timePattern);

  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const ampm = match[3];

    // Standardize to 24-hour format
    if (ampm === "pm" && hours < 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;

    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    // If target has passed today (e.g., it's 2pm and you say 1pm), assume tomorrow
    if (target < now) {
      target.setDate(target.getDate() + 1);
    }

    const diffInMs = target.getTime() - now.getTime();
    return diffInMs / (1000 * 60 * 60);
  }

  return null;
}

/**
 * Checks if the input contains a Task or Deadline keyword
 */
function hasTaskAndDeadline(input: string): boolean {
  return /\b(deadline|by|due|until|before|next week|at|in|hours)\b/i.test(input);
}

/**
 * Priority 2: Grayscale logic for Numbers
 * Ensures 100/1100 are Black, 750 is Grey, 0 is White.
 */
function getNumberColor(num: number): ResponseColor {
  const absNum = Math.abs(num);
  const last2 = absNum % 100;

  // Multiples of 100 (100, 1100) or ends in 99 -> BLACK
  if ((absNum > 0 && last2 === 0) || last2 === 99) {
    return "black";
  }
  // Ends in 50 -> GREY
  if (last2 === 50) return "grey";
  // Exactly 0 -> WHITE
  if (absNum === 0) return "white";

  // Grayscale fallback
  if (last2 < 25) return "white";
  if (last2 < 75) return "grey";
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
  if (hasTaskAndDeadline(trimmed)) {
    const hours = parseDeadlineHours(trimmed);

    if (hours !== null) {
      if (hours < 2) return "orange"; // Urgent: < 2h
      if (hours < 24) return "yellow"; // Near-term: 2h - 24h
      return "blue"; // Long-term: >= 24h
    }
    return "blue";
  }

  // 2. Priority Two: Just a Number
  if (/^\s*-?\d+\s*$/.test(trimmed)) {
    return getNumberColor(parseInt(trimmed));
  }

  // 3. Priority Three: Sentiment
  return "amber";
}

/**
 * WCAG 2.0 AA Contrast Mapping (4.5:1 ratio)
 * Pairs background colors with high-contrast text.
 */
export function getColorClass(color: ResponseColor): string {
  const map: Record<ResponseColor, string> = {
    blue: "text-white bg-blue-700",
    yellow: "text-black bg-yellow-400",
    orange: "text-white bg-orange-700",
    white: "text-black bg-white border border-slate-200",
    grey: "text-white bg-slate-500",
    black: "text-white bg-black",
    red: "text-white bg-red-800",
    green: "text-white bg-green-800",
    amber: "text-white bg-amber-700",
  };
  return map[color];
}

export function getBorderColorClass(color: ResponseColor): string {
  const map: Record<ResponseColor, string> = {
    blue: "border-l-blue-900",
    yellow: "border-l-yellow-600",
    orange: "border-l-orange-900",
    white: "border-l-slate-300",
    grey: "border-l-slate-700",
    black: "border-l-slate-900",
    red: "border-l-red-950",
    green: "border-l-green-950",
    amber: "border-l-amber-900",
  };
  return map[color];
}
