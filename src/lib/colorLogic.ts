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

function parseDeadlineHours(input: string): number | null {
  const lower = input.toLowerCase();

  // "next week" or "next month" → >24h
  if (/next\s+(week|month|year)/i.test(lower)) return 168;

  // "tomorrow" → >24h
  if (/\btomorrow\b/i.test(lower)) return 30;

  const patterns = [
    /by\s+(\d{1,2}):?(\d{2})?\s*(am|pm)/i,
    /at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)/i,
    /deadline\s+(\d+)\s*h/i,
    /in\s+(\d+)\s*hours?/i,
    /(\d+)\s*hours?\s*(left|remaining)/i,
    /within\s+(\d+)\s*hours?/i,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      if (match[3] && /^(am|pm)$/i.test(match[3])) {
        let hour = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const isPM = match[3].toLowerCase() === 'pm';
        if (isPM && hour !== 12) hour += 12;
        if (!isPM && hour === 12) hour = 0;
        const targetMinutes = hour * 60 + minutes;
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        let diff = targetMinutes - currentMinutes;
        if (diff < 0) diff += 24 * 60;
        return diff / 60;
      }
      return parseInt(match[1]);
    }
  }
  return null;
}

function hasDeadlineKeyword(input: string): boolean {
  return /\b(by|at|deadline)\b/i.test(input);
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
  if (hasDeadlineKeyword(trimmed)) {
    const hours = parseDeadlineHours(trimmed);
    if (hours !== null) {
      if (hours > 24) return 'blue';
      if (hours < 2) return 'orange';
      return 'blue'; // 2-24hrs still blue per spec (>24 or "next week")
    }
    return 'blue'; // has keyword but can't parse → default blue
  }

  // Priority 2: Input ends with a number
  const trailingNum = extractTrailingNumber(trimmed);
  if (trailingNum !== null) {
    return getNumberColor(trailingNum);
  }

  // Priority 3: Sentiment — AI will provide
  return 'amber';
}
