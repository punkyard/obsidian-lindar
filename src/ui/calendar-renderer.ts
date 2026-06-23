/**
 * Calendar renderer: builds the DOM grid for a yearly horizontal view.
 * One row per month, days flowing horizontally.
 * Saturday/Sunday have weekend styling, Wednesday has muted highlight.
 */

import { getContrastTextColor, getEventColorTone } from "../utils/colors";
import { getDaysInMonth, getFirstDayOfWeek, isToday, isWeekend, isWednesday, getWeekdayLabels, getWeekdayLabelsMobile, getMonthNameShort, getMonthNameShortMobile, getWeekNumber, isMonday } from "../utils/dates";
import type { LinearCalendarEvent } from "../types";

const MAX_COLS = 37; // 6 (max offset) + 31 (max days in month)
const MONTH_BASE_HEIGHT = 24;
const EVENT_LANE_HEIGHT = 14;
const EVENT_LANE_GAP = 1;

export interface CalendarLayoutOptions {
	maxVisibleEventLanes: number;
	adaptMonthLanesToEvents: boolean;
	responsiveMonthRowHeight: number;
	responsiveLaneLimit: number;
}

export function renderCalendar(
	container: HTMLElement,
	year: number,
	events: LinearCalendarEvent[],
	onDateClick?: (dateStr: string) => void,
	onEventClick?: (event: LinearCalendarEvent) => void,
	onEventCmdClick?: (event: LinearCalendarEvent) => void,
	options?: CalendarLayoutOptions
): void {
	container.empty();
	container.addClass("linear-calendar-calendar");
	const layoutOptions = options ?? {
		maxVisibleEventLanes: 0,
		adaptMonthLanesToEvents: false,
		responsiveMonthRowHeight: MONTH_BASE_HEIGHT,
		responsiveLaneLimit: 1,
	};

	container.classList.toggle("linear-calendar-mode-adaptive", layoutOptions.adaptMonthLanesToEvents);
	container.classList.toggle("linear-calendar-mode-compact", !layoutOptions.adaptMonthLanesToEvents);

	const wrapper = container.createDiv("linear-calendar-wrapper");
	if (layoutOptions.adaptMonthLanesToEvents) {
		wrapper.addClass("linear-calendar-wrapper-scrollable-months");
	} else {
		wrapper.addClass("linear-calendar-wrapper-compact-months");
	}

	// Top weekday row
	renderWeekdayRow(wrapper, "linear-calendar-header-row linear-calendar-header-row-top");

	const monthsGrid = wrapper.createDiv("linear-calendar-months-grid");

	// 12 month rows
	for (let month = 1; month <= 12; month++) {
		renderMonthRow(monthsGrid, year, month, events, layoutOptions, onDateClick, onEventClick, onEventCmdClick);
	}

	// Bottom weekday row (repeated day line)
	renderWeekdayRow(wrapper, "linear-calendar-header-row linear-calendar-header-row-bottom");
}

function renderWeekdayRow(wrapper: HTMLElement, className: string): void {
	const headerRow = wrapper.createDiv(className);
	headerRow.createDiv("linear-calendar-weekday-side");

	const weekdayLabels = getWeekdayLabels();
	const weekdayLabelsMobile = getWeekdayLabelsMobile();
	for (let i = 0; i < MAX_COLS; i++) {
		const dayIndex = i % 7;
		const cell = headerRow.createDiv("linear-calendar-weekday-cell");
		cell.setText(weekdayLabels[dayIndex] || "");
		cell.setAttribute("data-mb", weekdayLabelsMobile[dayIndex] || "");
		if (isWeekend(dayIndex)) {
			cell.addClass("linear-calendar-weekend");
			if (dayIndex === 5) cell.addClass("linear-calendar-weekend-start");
			if (dayIndex === 6) cell.addClass("linear-calendar-weekend-end");
		}
		if (isWednesday(dayIndex)) {
			cell.addClass("linear-calendar-wednesday");
		}
	}

	headerRow.createDiv("linear-calendar-weekday-side");
}

function renderMonthRow(
	wrapper: HTMLElement,
	year: number,
	month: number,
	events: LinearCalendarEvent[],
	layoutOptions: CalendarLayoutOptions,
	onDateClick?: (dateStr: string) => void,
	onEventClick?: (event: LinearCalendarEvent) => void,
	onEventCmdClick?: (event: LinearCalendarEvent) => void
): void {
	const monthRow = wrapper.createDiv("linear-calendar-month-row");

	// Month label (sticky left)
	const monthLabel = monthRow.createDiv("linear-calendar-month-label");
	monthLabel.setText(getMonthNameShort(month));
	monthLabel.setAttribute("data-mb", getMonthNameShortMobile(month));

	const daysInMonth = getDaysInMonth(year, month);
	const firstDayOffset = getFirstDayOfWeek(year, month);

	for (let i = 0; i < firstDayOffset; i++) {
		monthRow.createDiv("linear-calendar-cell linear-calendar-empty");
	}

	for (let day = 1; day <= daysInMonth; day++) {
		const cell = monthRow.createDiv("linear-calendar-cell");
		const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
		cell.setAttribute("data-date", dateStr);

		const dayOfWeek = (firstDayOffset + day - 1) % 7;

		if (isMonday(dayOfWeek)) {
			const weekNum = getWeekNumber(year, month, day);
			const weekDisplay = cell.createDiv("linear-calendar-week-number");
			weekDisplay.setText(String(weekNum));
		}

		const dateNumber = cell.createDiv("linear-calendar-date-number");
		dateNumber.setText(String(day));

		if (isToday(year, month, day)) {
			cell.addClass("linear-calendar-today");
		}

		if (isWeekend(dayOfWeek)) {
			cell.addClass("linear-calendar-weekend");
			if (dayOfWeek === 5) cell.addClass("linear-calendar-weekend-start");
			if (dayOfWeek === 6) cell.addClass("linear-calendar-weekend-end");
		}
		if (isWednesday(dayOfWeek)) {
			cell.addClass("linear-calendar-wednesday");
		}

		// Click handler
		if (onDateClick) {
			cell.addClass("linear-calendar-cell-clickable");
			cell.addEventListener("click", (e) => {
				if ((e.target as HTMLElement).closest(".linear-calendar-event-bar")) return;
				onDateClick(dateStr);
			});
		}
	}

	const totalCells = firstDayOffset + daysInMonth;
	const remainingCells = MAX_COLS - totalCells;
	for (let i = 0; i < remainingCells; i++) {
		monthRow.createDiv("linear-calendar-cell linear-calendar-empty");
	}

	// Repeat month label on right (sticky right)
	const monthLabelRight = monthRow.createDiv("linear-calendar-month-label linear-calendar-month-label-right");
	monthLabelRight.setText(getMonthNameShort(month));
	monthLabelRight.setAttribute("data-mb", getMonthNameShortMobile(month));

	const {
		eventsLayer,
		totalLanes,
		eventSpanStartCol,
		eventSpanEndCol,
	} = renderMonthEventBars(monthRow, year, month, daysInMonth, firstDayOffset, events, onEventClick, onEventCmdClick);
	const visibleLanes = getVisibleLanes(totalLanes, layoutOptions);
	const rowHeightLanes = getRowHeightLanes(visibleLanes, totalLanes, layoutOptions);
	applyMonthRowLayout(monthRow, visibleLanes, rowHeightLanes, totalLanes, layoutOptions);

	if (eventsLayer && totalLanes > visibleLanes && !layoutOptions.adaptMonthLanesToEvents) {
		eventsLayer.addClass("linear-calendar-events-layer-scrollable");
		monthRow.addClass("linear-calendar-month-row-scrollable");
		monthRow.addEventListener("wheel", (event) => {
			if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
			const deltaY = event.deltaY;
			const calendarScroller = monthRow.closest(".linear-calendar-calendar-container");

			const scrollCalendar = () => {
				if (!(calendarScroller instanceof HTMLElement)) return;
				calendarScroller.scrollTop += deltaY;
				event.preventDefault();
			};

			const rowRect = monthRow.getBoundingClientRect();
			const gridLeft = rowRect.left + 60;
			const gridRight = rowRect.right - 60;

			if (event.clientX < gridLeft || event.clientX > gridRight) {
				scrollCalendar();
				return;
			}

			const colWidth = (gridRight - gridLeft) / MAX_COLS;
			const relativeX = event.clientX - gridLeft;
			const hoveredCol = Math.floor(relativeX / colWidth) + 1;
			const scrollStartCol = eventSpanStartCol ?? (firstDayOffset + 1);
			const scrollEndCol = eventSpanEndCol ?? (firstDayOffset + daysInMonth);

			// Outside the active event span, let the calendar scroll.
			if (hoveredCol < scrollStartCol || hoveredCol > scrollEndCol) {
				scrollCalendar();
				return;
			}

			const maxScrollTop = Math.max(0, eventsLayer.scrollHeight - eventsLayer.clientHeight);

			// Short/non-scrollable event list: let calendar/page scroll.
			if (maxScrollTop <= 0) {
				scrollCalendar();
				return;
			}

			const nextScrollTop = Math.min(maxScrollTop, Math.max(0, eventsLayer.scrollTop + deltaY));

			// Already at scroll boundary: pass through to outer calendar.
			if (nextScrollTop === eventsLayer.scrollTop) {
				scrollCalendar();
				return;
			}

			eventsLayer.scrollTop = nextScrollTop;
			event.preventDefault();
		}, { passive: false });
	}
}

function renderMonthEventBars(
	monthRow: HTMLElement,
	year: number,
	month: number,
	daysInMonth: number,
	firstDayOffset: number,
	events: LinearCalendarEvent[],
	onEventClick?: (event: LinearCalendarEvent) => void,
	onEventCmdClick?: (event: LinearCalendarEvent) => void
): {
	eventsLayer: HTMLElement | null;
	totalLanes: number;
	eventSpanStartCol: number | null;
	eventSpanEndCol: number | null;
} {
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
		return {
			eventsLayer: null,
			totalLanes: 0,
			eventSpanStartCol: null,
			eventSpanEndCol: null,
		};
	}

	const eventsLayer = monthRow.createDiv("linear-calendar-events-layer");
	const laneLastEndCol: number[] = [];
	let minEventCol: number | null = null;
	let maxEventCol: number | null = null;

	for (const event of monthEvents) {
		const visibleStart = event.start < monthStart ? monthStart : event.start;
		const visibleEnd = event.end > monthEnd ? monthEnd : event.end;

		const startDay = dateDayInMonth(visibleStart);
		const endDay = dateDayInMonth(visibleEnd);
		if (!Number.isFinite(startDay) || !Number.isFinite(endDay) || endDay < startDay) continue;

		const startCol = firstDayOffset + startDay;
		const endColExclusive = firstDayOffset + endDay + 1;
		minEventCol = minEventCol === null ? startCol : Math.min(minEventCol, startCol);
		maxEventCol = maxEventCol === null ? endColExclusive - 1 : Math.max(maxEventCol, endColExclusive - 1);

		let laneIndex = laneLastEndCol.findIndex((lastEndCol) => startCol > lastEndCol);
		if (laneIndex === -1) {
			laneIndex = laneLastEndCol.length;
			laneLastEndCol.push(endColExclusive - 1);
		} else {
			laneLastEndCol[laneIndex] = endColExclusive - 1;
		}

		const bar = eventsLayer.createDiv("linear-calendar-event-bar");
		bar.setText(event.title);
		bar.setAttribute("data-event-id", event.id);
		const barTone = getEventColorTone(event.color);
		bar.addClass(barTone === "dark" ? "linear-calendar-event-bar-dark" : "linear-calendar-event-bar-light");
		const textColor = getContrastTextColor(event.color);
		bar.style.setProperty("--event-color", event.color);
		bar.style.setProperty("--event-text-color", textColor);
		bar.style.color = textColor;
		bar.style.gridColumn = `${startCol} / ${endColExclusive}`;
		bar.style.gridRow = String(laneIndex + 1);
		bar.setAttribute("title", `${event.title} (${event.start} → ${event.end})`);

		if (event.start < monthStart) bar.addClass("linear-calendar-event-continues-left");
		if (event.end > monthEnd) bar.addClass("linear-calendar-event-continues-right");

		bar.addEventListener("mouseenter", () => {
			toggleLinkedEventBarHoverState(bar, event.id, true);
		});

		bar.addEventListener("mouseleave", () => {
			toggleLinkedEventBarHoverState(bar, event.id, false);
		});

		bar.addEventListener("click", (e) => {
			e.stopPropagation();
			if (e.metaKey && onEventCmdClick) {
				onEventCmdClick(event);
			} else {
				onEventClick?.(event);
			}
		});
	}

	return {
		eventsLayer,
		totalLanes: laneLastEndCol.length,
		eventSpanStartCol: minEventCol,
		eventSpanEndCol: maxEventCol,
	};
}

function toggleLinkedEventBarHoverState(sourceBar: HTMLElement, eventId: string, isHovered: boolean): void {
	if (!eventId) return;

	const calendarRoot = sourceBar.closest(".linear-calendar-calendar");
	const scope = calendarRoot instanceof HTMLElement ? calendarRoot : sourceBar.ownerDocument;
	if (!scope) return;

	const allBars = scope.querySelectorAll(".linear-calendar-event-bar[data-event-id]");
	allBars.forEach((bar) => {
		if (!bar.instanceOf(HTMLElement)) return;
		if (bar.getAttribute("data-event-id") !== eventId) return;
		bar.classList.toggle("linear-calendar-event-bar-linked-hover", isHovered);
	});
}

function getVisibleLanes(totalLanes: number, options: CalendarLayoutOptions): number {
	if (totalLanes === 0) return 0;
	if (options.adaptMonthLanesToEvents) return totalLanes;

	const laneLimit = options.maxVisibleEventLanes > 0
		? options.maxVisibleEventLanes
		: options.responsiveLaneLimit;

	return Math.min(totalLanes, Math.max(1, laneLimit));
}

function getRowHeightLanes(visibleLanes: number, totalLanes: number, options: CalendarLayoutOptions): number {
	// Responsive mode (0): all months uniform height = responsiveLaneLimit regardless of event count
	if (options.maxVisibleEventLanes === 0 && !options.adaptMonthLanesToEvents) {
		return options.responsiveLaneLimit;
	}
	// Adaptive mode: each month expands to fit all its event lanes
	if (options.adaptMonthLanesToEvents) {
		return totalLanes;
	}
	// Fixed cap mode: height matches the visible capped lanes
	return visibleLanes;
}

function applyMonthRowLayout(
	monthRow: HTMLElement,
	visibleLanes: number,
	rowHeightLanes: number,
	totalLanes: number,
	layoutOptions: CalendarLayoutOptions
): void {
	const heightGaps = Math.max(0, rowHeightLanes - 1);
	const fallbackHeight = MONTH_BASE_HEIGHT + rowHeightLanes * EVENT_LANE_HEIGHT + heightGaps * EVENT_LANE_GAP;
	const rowHeight = layoutOptions.maxVisibleEventLanes === 0 && !layoutOptions.adaptMonthLanesToEvents
		? layoutOptions.responsiveMonthRowHeight
		: fallbackHeight;

	monthRow.style.setProperty("--linear-calendar-visible-event-lanes", String(visibleLanes));
	monthRow.style.setProperty("--linear-calendar-visible-event-gaps", String(Math.max(0, visibleLanes - 1)));
	monthRow.style.setProperty("--linear-calendar-total-event-lanes", String(Math.max(1, totalLanes)));
	monthRow.style.height = `${rowHeight}px`;
	monthRow.style.minHeight = `${rowHeight}px`;
}

function dateDayInMonth(dateStr: string): number {
	const dayPart = Number(dateStr.slice(8, 10));
	return Number.isFinite(dayPart) ? dayPart : NaN;
}
