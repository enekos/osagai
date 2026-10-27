const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY = 86_400_000;

function utc(date: string): Date | null {
	const [, y, m, d] = ISO.exec(date)?.map(Number) ?? [];
	if (y === undefined || m === undefined || d === undefined) return null;
	const at = new Date(Date.UTC(y, m - 1, d));
	return at.getUTCDate() === d && at.getUTCMonth() === m - 1 ? at : null;
}

function parse(date: string): Date {
	const at = utc(date);
	if (!at) throw new RangeError(`Not a YYYY-MM-DD date: ${date}`);
	return at;
}

function iso(d: Date): string {
	return d.toISOString().slice(0, 10);
}

export function isDate(value: unknown): value is string {
	return typeof value === 'string' && utc(value) !== null;
}

export function today(): string {
	const now = new Date();
	return iso(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

export function addDays(date: string, days: number): string {
	return iso(new Date(parse(date).getTime() + days * DAY));
}

export function addMonths(date: string, months: number): string {
	const d = parse(date);
	const first = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
	const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
	first.setUTCDate(Math.min(d.getUTCDate(), last));
	return iso(first);
}

export function startOfMonth(date: string): string {
	return `${date.slice(0, 8)}01`;
}

export function clampDate(date: string, min?: string | null, max?: string | null): string {
	if (min && date < min) return min;
	if (max && date > max) return max;
	return date;
}

export function weekday(date: string): number {
	return parse(date).getUTCDay();
}

export function monthGrid(date: string, weekStart = 1): string[] {
	const first = startOfMonth(date);
	const lead = (weekday(first) - weekStart + 7) % 7;
	const start = addDays(first, -lead);
	return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function formatDate(date: string, options: Intl.DateTimeFormatOptions, locale?: string): string {
	return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(parse(date));
}

export function weekdayNames(weekStart = 1, locale?: string, width: 'narrow' | 'short' | 'long' = 'short'): string[] {
	const sunday = Date.UTC(2023, 0, 1);
	const fmt = new Intl.DateTimeFormat(locale, { weekday: width, timeZone: 'UTC' });
	return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(sunday + ((i + weekStart) % 7) * DAY)));
}
