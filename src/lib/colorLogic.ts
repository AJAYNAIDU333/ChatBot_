export type ResponseColor = 'blue' | 'yellow' | 'orange' | 'white' | 'grey' | 'black' | 'red' | 'green' | 'amber';

export interface BubbleStyle {
  bg: string;
  text: string;
  border: string;
}

const BUBBLE_STYLES: Record<ResponseColor, BubbleStyle> = {
  blue:   { bg: 'bg-[#1D4ED8]',  text: 'text-white', border: 'border-l-[#1D4ED8]' },
  yellow: { bg: 'bg-yellow-500',  text: 'text-black', border: 'border-l-yellow-500' },
  orange: { bg: 'bg-[#C2410C]',  text: 'text-white', border: 'border-l-[#C2410C]' },
  white:  { bg: 'bg-[#FFFFFF]',  text: 'text-black', border: 'border border-slate-300' },
  grey:   { bg: 'bg-[#64748B]',  text: 'text-white', border: 'border-l-[#64748B]' },
  black:  { bg: 'bg-[#000000]',  text: 'text-white', border: 'border-l-[#000000]' },
  red:    { bg: 'bg-[#991B1B]',  text: 'text-white', border: 'border-l-[#991B1B]' },
  green:  { bg: 'bg-[#166534]',  text: 'text-white', border: 'border-l-[#166534]' },
  amber:  { bg: 'bg-amber-600',  text: 'text-white', border: 'border-l-amber-600' },
};

export function getBubbleStyle(color: ResponseColor): BubbleStyle {
  return BUBBLE_STYLES[color];
}

// --- Priority 1: Deadline detection ---

function parseTimeWithoutDateHours(input: string): number | null {
  const match = input.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const isPM = match[3].toLowerCase() === 'pm';

  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;

  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minutes, 0, 0);

  // Time-only input means "today" first; if passed, assume tomorrow.
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return (target.getTime() - now.getTime()) / (1000 * 60 * 60);
}

function parseDeadlineHours(input: string): number | null {
  const lower = input.toLowerCase();

  if (/next\s+(week|month|year)/i.test(lower)) return 168;
  if (/\btomorrow\b/i.test(lower)) return 30;

  const patterns = [
    /deadline\s+(\d+)\s*h/i,
    /in\s+(\d+)\s*hours?/i,
    /(\d+)\s*hours?\s*(left|remaining)/i,
    /within\s+(\d+)\s*hours?/i,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return parseInt(match[1], 10);
  }

  return null;
}

function hasDeadlineKeyword(input: string): boolean {
  return /\b(by|at|deadline)\b/i.test(input);
}

function hasClockTime(input: string): boolean {
  return /\b\d{1,2}(?::\d{2})?\s*(am|pm)\b/i.test(input);
}

function getDeadlineColor(input: string): ResponseColor | null {
  if (!hasDeadlineKeyword(input) && !hasClockTime(input)) return null;

  const timeHours = parseTimeWithoutDateHours(input);
  if (timeHours !== null) {
    return timeHours < 2 ? 'orange' : 'blue';
  }

  const hours = parseDeadlineHours(input);
  if (hours !== null) {
    if (hours > 24) return 'blue';
    if (hours < 2) return 'orange';
    return 'yellow';
  }

  return 'blue';
}

// --- Priority 2: Trailing number detection ---

function extractTrailingNumber(input: string): number | null {
  const match = input.trim().match(/(\d+)\s*$/);
  return match ? parseInt(match[1]) : null;
}

function getNumberColor(num: number): ResponseColor {
  const last2 = Math.abs(num) % 100;

  if (last2 === 0) return 'black';
  if (last2 === 50) return 'grey';
  if (last2 % 10 === 0) return 'white';

  // Interpolate: closer to 0→black, closer to 50→grey
  if (last2 < 25) return 'black';
  if (last2 < 75) return 'grey';
  return 'black';
}

// --- Main deterministic waterfall ---

export function determineColor(input: string): ResponseColor {
  const trimmed = input.trim();

  // Priority 1: Deadline
  const deadlineColor = getDeadlineColor(trimmed);
  if (deadlineColor) return deadlineColor;

  // Priority 2: Input ends with a number
  const trailingNum = extractTrailingNumber(trimmed);
  if (trailingNum !== null) {
    return getNumberColor(trailingNum);
  }

  // Priority 3: Sentiment — AI will provide
  return 'amber';
}
