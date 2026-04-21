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
	motto: string
): void {
	container.empty();
	container.addClass("lindar-calendar");
	void events;
	void motto;

	const wrapper = container.createDiv("lindar-wrapper");

	// Top weekday row
	renderWeekdayRow(wrapper, "lindar-header-row lindar-header-row-top");

	const monthsGrid = wrapper.createDiv("lindar-months-grid");

	// 12 month rows
	for (let month = 1; month <= 12; month++) {
		renderMonthRow(monthsGrid, year, month);
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
	month: number
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
