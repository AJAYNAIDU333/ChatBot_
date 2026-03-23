export type ResponseColor = 'blue' | 'yellow' | 'orange' | 'white' | 'grey' | 'black' | 'red' | 'green' | 'amber';

function parseDeadlineHours(input: string): number | null {
  const deadlinePatterns = [
    /by\s+(\d{1,2})\s*(am|pm)/i,
    /deadline\s+(\d+)\s*h/i,
    /in\s+(\d+)\s*hours?/i,
    /(\d+)\s*hours?\s*(left|remaining)/i,
    /within\s+(\d+)\s*hours?/i,
  ];

  for (const pattern of deadlinePatterns) {
    const match = input.match(pattern);
    if (match) {
      if (match[2] && (match[2].toLowerCase() === 'am' || match[2].toLowerCase() === 'pm')) {
        const hour = parseInt(match[1]);
        const isPM = match[2].toLowerCase() === 'pm';
        const targetHour = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
        const now = new Date();
        const currentHour = now.getHours() + now.getMinutes() / 60;
        let diff = targetHour - currentHour;
        if (diff < 0) diff += 24;
        return diff;
      }
      return parseInt(match[1]);
    }
  }
  return null;
}

function hasTaskAndDeadline(input: string): boolean {
  return /\b(deadline|by\s+\d|due|until|before|by\s+\d+\s*(am|pm))\b/i.test(input);
}

function isJustANumber(input: string): boolean {
  return /^\s*-?\d+\s*$/.test(input);
}

/**
 * Priority 2: Last 2 digits determine grayscale
 * - ends in 00 → White
 * - ends in 50 → Grey
 * - ends in 99 or the number is exactly 100 → Black
 */
function getNumberColor(num: number): ResponseColor {
  const absNum = Math.abs(num);
  const last2 = absNum % 100;

  if (last2 === 0) return 'white';   // ends in 00
  if (last2 === 50) return 'grey';   // ends in 50
  if (last2 === 99 || absNum === 100) return 'black'; // ends in 99, or exactly 100

  // For other numbers, interpolate: closer to 00=white, 50=grey, 99=black
  if (last2 < 25) return 'white';
  if (last2 < 75) return 'grey';
  return 'black';
}

/**
 * Color Logic Waterfall:
 * Priority 1: Task + Deadline → Blue (>=24h), Yellow (12-24h implied, >=2h), Orange (<2h)
 * Priority 2: Input is just a number → Grayscale by last 2 digits
 * Priority 3: Sentiment (determined by AI) → Red/Green/Amber
 */
export function determineColor(input: string): ResponseColor {
  const trimmed = input.trim();

  // Priority 1: Task + Deadline
  if (hasTaskAndDeadline(trimmed)) {
    const hours = parseDeadlineHours(trimmed);
    if (hours !== null) {
      if (hours >= 24) return 'blue';
      if (hours >= 2) return 'yellow';
      return 'orange';  // < 2 hours
    }
    // Has deadline keyword but can't parse exact hours — default yellow (middle urgency)
    return 'yellow';
  }

  // Priority 2: Just a number → grayscale
  if (isJustANumber(trimmed)) {
    const num = parseInt(trimmed);
    return getNumberColor(num);
  }

  // Priority 3: Sentiment — return placeholder, AI will override
  return 'amber';
}

export function getColorClass(color: ResponseColor): string {
  const map: Record<ResponseColor, string> = {
    blue: 'text-response-blue',
    yellow: 'text-response-yellow',
    orange: 'text-response-orange',
    white: 'text-response-white',
    grey: 'text-response-grey',
    black: 'text-response-black',
    red: 'text-response-red',
    green: 'text-response-green',
    amber: 'text-response-amber',
  };
  return map[color];
}

export function getBorderColorClass(color: ResponseColor): string {
  const map: Record<ResponseColor, string> = {
    blue: 'border-l-[hsl(var(--response-blue))]',
    yellow: 'border-l-[hsl(var(--response-yellow))]',
    orange: 'border-l-[hsl(var(--response-orange))]',
    white: 'border-l-[hsl(var(--response-white))]',
    grey: 'border-l-[hsl(var(--response-grey))]',
    black: 'border-l-[hsl(var(--response-black))]',
    red: 'border-l-[hsl(var(--response-red))]',
    green: 'border-l-[hsl(var(--response-green))]',
    amber: 'border-l-[hsl(var(--response-amber))]',
  };
  return map[color];
}
