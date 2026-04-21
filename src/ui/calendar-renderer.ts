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
	onDateClick?: (dateStr: string) => void,
	onEventClick?: (event: LindarEvent) => void
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
		renderMonthRow(monthsGrid, year, month, events, onDateClick, onEventClick);
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
	onDateClick?: (dateStr: string) => void,
	onEventClick?: (event: LindarEvent) => void
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

		// Click handler
		if (onDateClick) {
			cell.addClass("lindar-cell-clickable");
			cell.addEventListener("click", (e) => {
				if ((e.target as HTMLElement).closest(".lindar-event-bar")) return;
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

	renderMonthEventBars(monthRow, year, month, daysInMonth, firstDayOffset, events, onEventClick);
}

function renderMonthEventBars(
	monthRow: HTMLElement,
	year: number,
	month: number,
	daysInMonth: number,
	firstDayOffset: number,
	events: LindarEvent[],
	onEventClick?: (event: LindarEvent) => void
): void {
	const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
	const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

	const monthEvents = events
		.filter((event) => event.start <= monthEnd && event.end >= monthStart)
		.sort((a, b) => {
			if (a.start !== b.start) return a.start.localeCompare(b.start);
			if (a.end !== b.end) return a.end.localeCompare(b.end);
			return a.title.localeCompare(b.title);
		});

	if (monthEvents.length === 0) {
		monthRow.style.setProperty("--lindar-event-lanes", "0");
		return;
	}

	const eventsLayer = monthRow.createDiv("lindar-events-layer");
	const laneLastEndCol: number[] = [];

	for (const event of monthEvents) {
		const visibleStart = event.start < monthStart ? monthStart : event.start;
		const visibleEnd = event.end > monthEnd ? monthEnd : event.end;

		const startDay = dateDayInMonth(visibleStart);
		const endDay = dateDayInMonth(visibleEnd);
		if (!Number.isFinite(startDay) || !Number.isFinite(endDay) || endDay < startDay) continue;

		const startCol = firstDayOffset + startDay;
		const endColExclusive = firstDayOffset + endDay + 1;

		let laneIndex = laneLastEndCol.findIndex((lastEndCol) => startCol > lastEndCol);
		if (laneIndex === -1) {
			laneIndex = laneLastEndCol.length;
			laneLastEndCol.push(endColExclusive - 1);
		} else {
			laneLastEndCol[laneIndex] = endColExclusive - 1;
		}

		const bar = eventsLayer.createDiv("lindar-event-bar");
		bar.setText(event.title);
		bar.style.setProperty("--event-color", event.color);
		bar.style.gridColumn = `${startCol} / ${endColExclusive}`;
		bar.style.gridRow = String(laneIndex + 1);
		bar.setAttribute("title", `${event.title} (${event.start} → ${event.end})`);

		if (event.start < monthStart) bar.addClass("lindar-event-continues-left");
		if (event.end > monthEnd) bar.addClass("lindar-event-continues-right");

		bar.addEventListener("click", (e) => {
			e.stopPropagation();
			onEventClick?.(event);
		});
	}

	monthRow.style.setProperty("--lindar-event-lanes", String(Math.max(1, laneLastEndCol.length)));
}

function dateDayInMonth(dateStr: string): number {
	const dayPart = Number(dateStr.slice(8, 10));
	return Number.isFinite(dayPart) ? dayPart : NaN;
}
