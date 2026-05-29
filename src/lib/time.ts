/*
 * Date helpers. Streak math uses local YYYY-MM-DD strings — never Unix
 * offsets — to dodge the daylight-saving "lost an hour" bug (§13).
 */

/** Returns YYYY-MM-DD for the given timestamp, in the user's local timezone. */
export function localDateString(ts: number = Date.now()): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Adds `days` (can be negative) to an ISO date string and returns the new string. */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  // Use midday to avoid DST-edge weirdness — adding 24h on a DST day shifts by 23h or 25h.
  const ms = new Date(y, m - 1, d, 12, 0, 0, 0).getTime();
  return localDateString(ms + days * 86_400_000);
}

/** Compares two ISO date strings lexicographically (works because of YYYY-MM-DD format). */
export function compareDates(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Local hour (0..23), used by the "streak at risk" toast logic. */
export function localHour(ts: number = Date.now()): number {
  return new Date(ts).getHours();
}
