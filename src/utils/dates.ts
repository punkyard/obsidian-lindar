/**
 * Date utility functions for calendar rendering.
 * Week starts on Monday (hardcoded).
 */

export function getDaysInMonth(year: number, month: number): number {
	return new Date(year, month, 0).getDate();
}

/**
 * Get the offset (0-6) for the first day of a month.
 * 0 = Monday, 6 = Sunday
 */
export function getFirstDayOfWeek(year: number, month: number): number {
	const first = new Date(year, month - 1, 1);
	// JS getDay: 0=Sunday, 1=Monday, ..., 6=Saturday
	// We want: 0=Monday, 1=Tuesday, ..., 6=Sunday
	const jsDay = first.getDay();
	return jsDay === 0 ? 6 : jsDay - 1;
}

export function isToday(year: number, month: number, day: number): boolean {
	const today = new Date();
	return (
		today.getFullYear() === year &&
		today.getMonth() + 1 === month &&
		today.getDate() === day
	);
}

/**
 * Check if day of week (0-6, where 0=Monday, 6=Sunday) is a weekend.
 * Weekends: Saturday (5) and Sunday (6)
 */
export function isWeekend(dayOfWeek: number): boolean {
	return dayOfWeek === 5 || dayOfWeek === 6;
}

export function isWednesday(dayOfWeek: number): boolean {
	return dayOfWeek === 2;
}

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const WEEKDAY_LABELS_MOBILE = ["M", "T", "W", "T", "F", "S", "S"];

export function getWeekdayLabels(): string[] {
	return WEEKDAY_LABELS;
}

export function getWeekdayLabelsMobile(): string[] {
	return WEEKDAY_LABELS_MOBILE;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES_MOBILE = ["Ja", "Fe", "Ma", "Ap", "Ma", "Ju", "Ju", "Au", "Se", "Oc", "No", "De"];

export function getMonthNameShort(month: number): string {
	return MONTH_NAMES[month - 1] || "";
}

export function getMonthNameShortMobile(month: number): string {
	return MONTH_NAMES_MOBILE[month - 1] || "";
}

/**
 * Get ISO week number for a given date (Monday as first day of week)
 * @returns Week number (1-53)
 */
export function getWeekNumber(year: number, month: number, day: number): number {
	const date = new Date(year, month - 1, day);

	// Adjust date to Thursday of the same week (ISO 8601)
	const dayOfWeek = date.getDay(); // 0 = Sunday
	const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
	const thursday = new Date(date.setDate(diff + 3));

	// Days since 4 January in the year
	const yearStart = new Date(thursday.getFullYear(), 0, 4);
	const daysDiff = (thursday.getTime() - yearStart.getTime()) / 86400000;

	return Math.floor(daysDiff / 7) + 1;
}

export function isMonday(dayOfWeek: number): boolean {
	return dayOfWeek === 0;
}
