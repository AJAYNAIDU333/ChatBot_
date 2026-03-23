export type ResponseColor = 'blue' | 'yellow' | 'orange' | 'white' | 'grey' | 'black' | 'red' | 'green' | 'amber';

export interface BubbleStyle {
  bg: string;
  text: string;
  border: string;
}

const BUBBLE_STYLES: Record<ResponseColor, BubbleStyle> = {
  blue:   { bg: 'bg-blue-700',    text: 'text-white', border: 'border-l-blue-700' },
  yellow: { bg: 'bg-yellow-500',  text: 'text-black', border: 'border-l-yellow-500' },
  orange: { bg: 'bg-orange-700',  text: 'text-white', border: 'border-l-orange-700' },
  white:  { bg: 'bg-white',       text: 'text-black', border: 'border-l-slate-200' },
  grey:   { bg: 'bg-slate-500',   text: 'text-white', border: 'border-l-slate-500' },
  black:  { bg: 'bg-black',       text: 'text-white', border: 'border-l-black' },
  red:    { bg: 'bg-red-800',     text: 'text-white', border: 'border-l-red-800' },
  green:  { bg: 'bg-green-800',   text: 'text-white', border: 'border-l-green-800' },
  amber:  { bg: 'bg-amber-600',   text: 'text-white', border: 'border-l-amber-600' },
};

export function getBubbleStyle(color: ResponseColor): BubbleStyle {
  return BUBBLE_STYLES[color];
}

// --- Priority 1: Deadline detection ---

function parseDeadlineHours(input: string): number | null {
  const patterns = [
    /by\s+(\d{1,2})\s*(am|pm)/i,
    /at\s+(\d{1,2})\s*(am|pm)/i,
    /deadline\s+(\d+)\s*h/i,
    /in\s+(\d+)\s*hours?/i,
    /(\d+)\s*hours?\s*(left|remaining)/i,
    /within\s+(\d+)\s*hours?/i,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      if (match[2] && /^(am|pm)$/i.test(match[2])) {
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

function hasDeadlineKeyword(input: string): boolean {
  return /\b(by|at|deadline)\b/i.test(input);
}

// --- Priority 2: Number detection ---

function isJustANumber(input: string): boolean {
  return /^\s*-?\d+\s*$/.test(input);
}

function getNumberColor(num: number): ResponseColor {
  const absNum = Math.abs(num);
  const last2 = absNum % 100;

  if (last2 === 0) return 'white';
  if (last2 === 50) return 'grey';
  if (last2 === 99 || absNum === 100) return 'black';

  if (last2 < 25) return 'white';
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
      if (hours >= 24) return 'blue';
      if (hours >= 2) return 'yellow';
      return 'orange';
    }
    return 'yellow'; // has keyword but can't parse hours
  }

  // Priority 2: Number
  if (isJustANumber(trimmed)) {
    return getNumberColor(parseInt(trimmed));
  }

  // Priority 3: Sentiment — AI will provide
  return 'amber';
}
