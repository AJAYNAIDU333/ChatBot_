export type ResponseColor = "blue" | "yellow" | "orange" | "white" | "grey" | "black" | "red" | "green" | "amber";

/**
 * Priority 1: Time Parsing Logic
 * Calculates the difference between NOW and the Deadline.
 */
function parseDeadlineHours(input: string): number | null {
  const lowerInput = input.toLowerCase();

  // Handle relative long-term deadlines
  if (lowerInput.includes("next week") || lowerInput.includes("days")) {
    return 168; // > 24 hours (Blue)
  }

  // Handle specific time formats (e.g., "by 1:00 PM", "at 5pm", "deadline 13:00")
  const timePattern = /(?:by|at|deadline)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const match = input.match(timePattern);

  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const ampm = match[3]?.toLowerCase();

    // Standardize to 24-hour format
    if (ampm === "pm" && hours < 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;

    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    // If the target time has already passed today, assume it's for tomorrow
    if (target < now) {
      target.setDate(target.getDate() + 1);
    }

    const diffInMs = target.getTime() - now.getTime();
    return diffInMs / (1000 * 60 * 60); // Return difference in hours
  }

  return null;
}

/**
 * Checks if the input is a Task with a Deadline keyword
 */
function hasTaskAndDeadline(input: string): boolean {
  return /\b(deadline|by|due|until|before|next week|at\s+\d)\b/i.test(input);
}

/**
 * Priority 2: Grayscale logic for Numbers
 */
function getNumberColor(num: number): ResponseColor {
  const absNum = Math.abs(num);
  const last2 = absNum % 100;

  // 1. PRIORITY: Multiples of 100 (100, 1100, 2500) or ends in 99
  // We check absNum > 0 so that '0' itself stays White.
  if ((absNum > 0 && last2 === 0) || last2 === 99 || absNum === 100) {
    return "black";
  }

  // 2. PRIORITY: Ends in 50 (750, 50, 1050)
  if (last2 === 50) {
    return "grey";
  }

  // 3. PRIORITY: Zero or base cases
  if (absNum === 0) {
    return "white";
  }

  // 4. FALLBACK: Grayscale gradient logic
  if (last2 < 25) return "white";
  if (last2 < 75) return "grey";
  return "black";
}

/**
 * THE WATERFALL ENGINE
 */
export function determineColor(input: string): ResponseColor {
  const trimmed = input.trim();

  // 1. Priority One: Deadlines (Blue/Yellow/Orange)
  if (hasTaskAndDeadline(trimmed)) {
    const hours = parseDeadlineHours(trimmed);
    if (hours !== null) {
      if (hours >= 24) return "blue";
      if (hours < 2) return "orange";
      return "yellow";
    }
    return "blue";
  }

  // 2. Priority Two: Just a Number (White/Grey/Black)
  if (/^\s*-?\d+\s*$/.test(trimmed)) {
    return getNumberColor(parseInt(trimmed));
  }

  // 3. Priority Three: Sentiment (Default to Amber for AI to override)
  return "amber";
}

/**
 * WCAG 2.0 Compliant Tailwind Mapping
 * Ensures 4.5:1 Contrast Ratio
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
