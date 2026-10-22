const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar date as YYYY-MM-DD. */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDaysISO(days: number, from: Date = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
  return toISODate(d);
}

/** Parses a strict YYYY-MM-DD string into a local Date, or null if it isn't a real calendar day. */
export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

/** Whole days from today to the given YYYY-MM-DD (negative = in the past). */
export function daysFromToday(value: string): number | null {
  const date = parseISODate(value);
  if (!date) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((date.getTime() - today.getTime()) / 86_400_000);
}

/** "21 Oct 2026" */
export function formatDate(value: string): string {
  const date = value.length === 10 ? parseISODate(value) : new Date(value);
  if (!date || Number.isNaN(date.getTime())) return value;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "19 Oct 2026, 09:12" */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${formatDate(iso)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** "Today", "Tomorrow", "In 3 days", "Expired" — for best-before hints. */
export function describeBestBefore(value: string): string | null {
  const days = daysFromToday(value);
  if (days === null) return null;
  if (days < 0) return 'Past best-before';
  if (days === 0) return 'Best before today';
  if (days === 1) return 'Best before tomorrow';
  return `Best before in ${days} days`;
}
