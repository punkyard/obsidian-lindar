/**
 * Calendar renderer: builds the DOM grid for a yearly horizontal view.
 * One row per month, days flowing horizontally.
 * Saturday and Sunday have weekend styling.
 */

import { getDaysInMonth, getFirstDayOfWeek, isToday, isWeekend, getWeekdayLabels, getMonthNameShort, getWeekNumber, isMonday } from "../utils/dates";
import type { LindarEvent } from "../types";

const MAX_COLS = 37; // 6 (max offset) + 31 (max days in month)

export function renderCalendar(
	container: HTMLElement,
	year: number,
	events: LindarEvent[],
	motto: string,
	onDateClick?: (dateStr: string) => void
): void {
	container.empty();
	container.addClass("lindar-calendar");
	void motto;

	const wrapper = container.createDiv("lindar-wrapper");

	// Top weekday row
	renderWeekdayRow(wrapper, "lindar-header-row lindar-header-row-top");

	const monthsGrid = wrapper.createDiv("lindar-months-grid");

	// 12 month rows
	for (let month = 1; month <= 12; month++) {
		renderMonthRow(monthsGrid, year, month, events, onDateClick);
	}

	// Bottom weekday row (repeated day line)
	renderWeekdayRow(wrapper, "lindar-header-row lindar-header-row-bottom");
}

function renderWeekdayRow(wrapper: HTMLElement, className: string): void {
	const headerRow = wrapper.createDiv(className);
	headerRow.createDiv("lindar-weekday-side");

	const weekdayLabels = getWeekdayLabels();
	for (let i = 0; i < MAX_COLS; i++) {
		const dayIndex = i % 7;
		const cell = headerRow.createDiv("lindar-weekday-cell");
		cell.setText(weekdayLabels[dayIndex] || "");
		if (isWeekend(dayIndex)) {
			cell.addClass("lindar-weekend");
		}
	}

	headerRow.createDiv("lindar-weekday-side");
}

function renderMonthRow(
	wrapper: HTMLElement,
	year: number,
	month: number,
	events: LindarEvent[],
	onDateClick?: (dateStr: string) => void
): void {
	const monthRow = wrapper.createDiv("lindar-month-row");

	// Month label (sticky left)
	const monthLabel = monthRow.createDiv("lindar-month-label");
	monthLabel.setText(getMonthNameShort(month));

	const daysInMonth = getDaysInMonth(year, month);
	const firstDayOffset = getFirstDayOfWeek(year, month);

	for (let i = 0; i < firstDayOffset; i++) {
		monthRow.createDiv("lindar-cell lindar-empty");
	}

	for (let day = 1; day <= daysInMonth; day++) {
		const cell = monthRow.createDiv("lindar-cell");
		const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
		cell.setAttribute("data-date", dateStr);

		const dayOfWeek = (firstDayOffset + day - 1) % 7;

		if (isMonday(dayOfWeek)) {
			const weekNum = getWeekNumber(year, month, day);
			const weekDisplay = cell.createDiv("lindar-week-number");
			weekDisplay.setText(String(weekNum));
		}

		const dateNumber = cell.createDiv("lindar-date-number");
		dateNumber.setText(String(day));

		if (isToday(year, month, day)) {
			cell.addClass("lindar-today");
		}

		if (isWeekend(dayOfWeek)) {
			cell.addClass("lindar-weekend");
		}

		// Render event chips (single-day and multi-day)
		const dayEvents = events.filter((e) => e.start <= dateStr && e.end >= dateStr);
		for (const ev of dayEvents) {
			const chip = cell.createDiv("lindar-event-chip");
			chip.setText(ev.title);
			chip.style.setProperty("--chip-color", ev.color);
			chip.setAttribute("title", `${ev.title} (${ev.start} → ${ev.end})`);
		}

		// Click handler
		if (onDateClick) {
			cell.addClass("lindar-cell-clickable");
			cell.addEventListener("click", (e) => {
				if ((e.target as HTMLElement).closest(".lindar-event-chip")) return;
				onDateClick(dateStr);
			});
		}
	}

	const totalCells = firstDayOffset + daysInMonth;
	const remainingCells = MAX_COLS - totalCells;
	for (let i = 0; i < remainingCells; i++) {
		monthRow.createDiv("lindar-cell lindar-empty");
	}

	// Repeat month label on right (sticky right)
	const monthLabelRight = monthRow.createDiv("lindar-month-label lindar-month-label-right");
	monthLabelRight.setText(getMonthNameShort(month));
}
