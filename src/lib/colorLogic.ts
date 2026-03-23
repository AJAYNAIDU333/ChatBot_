export type ResponseColor = 'blue' | 'yellow' | 'orange' | 'white' | 'grey' | 'black' | 'red' | 'green' | 'amber';

function parseDeadlineHours(input: string): number | null {
  // Match patterns like "by 2pm", "by 14:00", "deadline 3 hours", "in 2 hours"
  const deadlinePatterns = [
    /by\s+(\d{1,2})\s*(am|pm)/i,
    /deadline\s+(\d+)\s*h/i,
    /in\s+(\d+)\s*hours?/i,
    /(\d+)\s*hours?\s*(left|remaining)/i,
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

function hasDeadlineKeyword(input: string): boolean {
  return /\b(deadline|by\s+\d|due|until|before)\b/i.test(input);
}

function isJustANumber(input: string): boolean {
  return /^\s*\d+\s*$/.test(input);
}

function getNumberColor(num: number): ResponseColor {
  if (num % 100 === 0 && num % 99 !== 0) return 'white';
  if (num === 99 || num === 100) return 'black';
  if (num % 50 === 0) return 'grey';
  // Check ends in 00
  const str = num.toString();
  if (str.endsWith('00')) return 'white';
  if (str.endsWith('50')) return 'grey';
  if (str.endsWith('99') || str.endsWith('100')) return 'black';
  return 'white'; // default for numbers
}

export function determineColor(input: string): ResponseColor {
  const trimmed = input.trim();

  // Rule 1: Task with deadline
  if (hasDeadlineKeyword(trimmed)) {
    const hours = parseDeadlineHours(trimmed);
    if (hours !== null) {
      if (hours < 2) return 'orange';
      if (hours < 12) return 'yellow';
      return 'blue';
    }
    // Has deadline keyword but can't parse hours - default to yellow
    return 'yellow';
  }

  // Rule 2: Just a number
  if (isJustANumber(trimmed)) {
    const num = parseInt(trimmed);
    return getNumberColor(num);
  }

  // Rule 3: Sentiment (default)
  return 'amber'; // Will be overridden by AI sentiment
}

export function getColorClass(color: ResponseColor): string {
  const map: Record<ResponseColor, string> = {
    blue: 'text-response-blue',
    yellow: 'text-response-yellow',
    orange: 'text-response-orange',
    white: 'text-response-white',
    grey: 'text-response-grey',
    black: 'text-response-black bg-foreground/10',
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
