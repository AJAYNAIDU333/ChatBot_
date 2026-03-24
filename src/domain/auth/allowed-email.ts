/**
 * Validates that the address is a single @petasight.com mailbox (not subdomain tricks).
 */
export function isAllowedEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const match = normalized.match(/^[^\s@]+@([a-z0-9.-]+\.[a-z]{2,})$/i);
  if (!match) return false;
  return match[1] === "petasight.com";
}
