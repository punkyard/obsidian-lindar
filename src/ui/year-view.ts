import { ItemView, WorkspaceLeaf } from "obsidian";
import type LindarPlugin from "../main";
import { renderCalendar } from "./calendar-renderer";
import { EventModal } from "./event-modal";
import { deleteEvent, generateEventId, loadEvents, saveEvent, updateEvent } from "../events/event-store";
import type { LindarEvent } from "../types";
import { getContrastTextColor } from "../utils/colors";

export const VIEW_TYPE_LINDAR = "lindar-year-view";

export class LindarYearView extends ItemView {
	private readonly plugin: LindarPlugin;
	private currentYear: number;
	private resizeObserver: ResizeObserver | null = null;
	private lastCalendarSize = "";
	private yearDropdown: HTMLElement | null = null;
	private removeYearDropdownListener: (() => void) | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: LindarPlugin) {
		super(leaf);
		this.plugin = plugin;
		this.currentYear = new Date().getFullYear();
	}

	getViewType(): string {
		return VIEW_TYPE_LINDAR;
	}

	getDisplayText(): string {
		return "linDar";
	}

	getIcon(): string {
		return "calendar";
	}

	async onOpen(): Promise<void> {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("lindar-view");

		const navBar = contentEl.createDiv("lindar-nav-bar");
		const yearControls = navBar.createDiv("lindar-year-controls");

		const prevBtn = yearControls.createEl("button");
		prevBtn.setText("←");
		prevBtn.setAttribute("aria-label", "Previous year");
		prevBtn.setAttribute("title", "Previous year");
		prevBtn.onclick = () => this.previousYear();

		const yearBtn = yearControls.createEl("button", { cls: "lindar-year-btn" });
		yearBtn.setText(String(this.currentYear));
		yearBtn.setAttribute("aria-label", "Select year");
		yearBtn.setAttribute("title", "Select year");
		yearBtn.onclick = () => this.showYearDropdown(yearBtn);

		const todayBtn = yearControls.createEl("button");
		todayBtn.setText("today");
		todayBtn.setAttribute("aria-label", "Today");
		todayBtn.setAttribute("title", "Go to current year");
		todayBtn.onclick = () => {
			this.currentYear = new Date().getFullYear();
			this.updateDisplay();
		};

		const nextBtn = yearControls.createEl("button");
		nextBtn.setText("→");
		nextBtn.setAttribute("aria-label", "Next year");
		nextBtn.setAttribute("title", "Next year");
		nextBtn.onclick = () => this.nextYear();

		const mottoDisplay = navBar.createDiv("lindar-motto-display");
		mottoDisplay.setText(this.plugin.settings.motto || "");

		const calendarContainer = contentEl.createDiv("lindar-calendar-container");
		this.renderCurrentCalendar(calendarContainer);

		this.resizeObserver = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) return;

			const nextSize = `${Math.round(entry.contentRect.width)}x${Math.round(entry.contentRect.height)}`;
			if (nextSize === this.lastCalendarSize) return;
			this.lastCalendarSize = nextSize;

			if (this.plugin.settings.maxVisibleEventLanes === 0 || this.plugin.settings.adaptMonthLanesToEvents) {
				this.renderCurrentCalendar(calendarContainer);
			}
		});
		this.resizeObserver.observe(calendarContainer);
	}

	async onClose(): Promise<void> {
		this.closeYearDropdown();
		this.resizeObserver?.disconnect();
		this.resizeObserver = null;
		this.contentEl.empty();
	}

	private previousYear(): void {
		this.currentYear--;
		this.updateDisplay();
	}

	private nextYear(): void {
		this.currentYear++;
		this.updateDisplay();
	}

	private updateDisplay(): void {
		const yearBtn = this.contentEl.querySelector(".lindar-year-btn");
		if (yearBtn instanceof HTMLElement) {
			yearBtn.setText(String(this.currentYear));
		}

		this.closeYearDropdown();

		const calendarContainer = this.contentEl.querySelector(".lindar-calendar-container");
		if (calendarContainer instanceof HTMLElement) {
			this.renderCurrentCalendar(calendarContainer);
		}
	}

	private showYearDropdown(element: HTMLElement): void {
		if (this.yearDropdown?.parentElement) {
			this.closeYearDropdown();
			return;
		}

		const currentYear = this.currentYear;
		const startYear = currentYear - 10;
		const endYear = currentYear + 10;

		const dropdown = document.createElement("div");
		dropdown.classList.add("lindar-year-dropdown");

		const scrollContainer = document.createElement("div");
		scrollContainer.classList.add("lindar-year-dropdown-scroll");

		for (let year = endYear; year >= startYear; year--) {
			const option = document.createElement("div");
			option.classList.add("lindar-year-option");
			if (year === currentYear) {
				option.classList.add("lindar-year-current");
			}
			option.textContent = String(year);
			option.onclick = (event) => {
				event.stopPropagation();
				this.currentYear = year;
				this.updateDisplay();
			};
			scrollContainer.appendChild(option);
		}

		dropdown.appendChild(scrollContainer);
		dropdown.addEventListener("click", (event) => event.stopPropagation());

		const parentEl = element.parentElement;
		if (!parentEl) return;
		parentEl.appendChild(dropdown);
		this.yearDropdown = dropdown;

		// Align dropdown horizontally under the year button
		const btnRect = element.getBoundingClientRect();
		const parentRect = parentEl.getBoundingClientRect();
		const center = btnRect.left - parentRect.left + btnRect.width / 2;
		dropdown.style.left = `${center}px`;
		dropdown.style.transform = "translateX(-50%)";

		// Scroll so current year is centered
		const currentOption = scrollContainer.querySelector(".lindar-year-current");
		if (currentOption instanceof HTMLElement) {
			setTimeout(() => currentOption.scrollIntoView({ block: "center" }), 0);
		}

		const closeDropdown = (event: MouseEvent) => {
			const target = event.target;
			if (target instanceof Node && dropdown.contains(target)) {
				return;
			}
			if (target instanceof Node && element.contains(target)) {
				return;
			}
			this.closeYearDropdown();
		};

		setTimeout(() => {
			document.addEventListener("click", closeDropdown);
		}, 100);

		this.removeYearDropdownListener = () => {
			document.removeEventListener("click", closeDropdown);
		};
	}

	private closeYearDropdown(): void {
		this.removeYearDropdownListener?.();
		this.removeYearDropdownListener = null;

		if (this.yearDropdown?.parentElement) {
			this.yearDropdown.remove();
		}

		this.yearDropdown = null;
	}

	refresh(): void {
		const calendarContainer = this.contentEl.querySelector(".lindar-calendar-container");
		if (calendarContainer instanceof HTMLElement) {
			this.renderCurrentCalendar(calendarContainer);
		}
	}

	private renderCurrentCalendar(container: HTMLElement): void {
		void this.loadAndRender(container);
	}

	private async loadAndRender(container: HTMLElement): Promise<void> {
		const events = await loadEvents(this.plugin.app, this.plugin.settings.eventsFolder);
		container.style.setProperty("--lindar-today-color", this.plugin.settings.defaultColor);
		container.style.setProperty("--lindar-today-text-color", getContrastTextColor(this.plugin.settings.defaultColor));
		const responsiveMonthRowHeight = this.getResponsiveMonthRowHeight(container);
		const responsiveLaneLimit = this.getResponsiveLaneLimit(container);
		renderCalendar(
			container,
			this.currentYear,
			events,
			(dateStr) => this.openCreateEventModal(dateStr),
			(event) => this.openEditEventModal(event),
			{
				maxVisibleEventLanes: this.plugin.settings.maxVisibleEventLanes,
				adaptMonthLanesToEvents: this.plugin.settings.adaptMonthLanesToEvents,
				responsiveMonthRowHeight,
				responsiveLaneLimit,
			}
		);
	}

	private getResponsiveMonthRowHeight(container: HTMLElement): number {
		const weekdayRowsHeight = 36;
		const monthCount = 12;
		const minMonthHeight = 24;
		const availableHeight = Math.max(0, container.clientHeight - weekdayRowsHeight);
		const perMonthHeight = availableHeight > 0 ? availableHeight / monthCount : minMonthHeight;
		return Math.max(minMonthHeight, Math.floor(perMonthHeight));
	}

	private getResponsiveLaneLimit(container: HTMLElement): number {
		if (this.plugin.settings.maxVisibleEventLanes > 0) {
			return this.plugin.settings.maxVisibleEventLanes;
		}

		const perMonthHeight = this.getResponsiveMonthRowHeight(container);
		const monthChromeHeight = 22;
		const laneStep = 16;
		const computed = Math.floor((perMonthHeight - monthChromeHeight) / laneStep);

		return Math.max(1, computed);
	}

	private openCreateEventModal(dateStr: string): void {
		new EventModal(
			this.plugin.app,
			dateStr,
			this.plugin.settings.defaultColor,
			async (data) => {
				const event: LindarEvent = {
					id: generateEventId(),
					title: data.title,
					start: data.start,
					end: data.end,
					color: data.color,
					notes: data.notes || undefined,
				};
				await saveEvent(this.plugin.app, this.plugin.settings.eventsFolder, event);
				const calendarContainer = this.contentEl.querySelector(".lindar-calendar-container");
				if (calendarContainer instanceof HTMLElement) {
					this.renderCurrentCalendar(calendarContainer);
				}
			}
		).open();
	}

	private openEditEventModal(event: LindarEvent): void {
		new EventModal(
			this.plugin.app,
			event.start,
			this.plugin.settings.defaultColor,
			async (data) => {
				const updatedEvent: LindarEvent = {
					...event,
					title: data.title,
					start: data.start,
					end: data.end,
					color: data.color,
					notes: data.notes || undefined,
				};
				await updateEvent(this.plugin.app, this.plugin.settings.eventsFolder, updatedEvent);
				const calendarContainer = this.contentEl.querySelector(".lindar-calendar-container");
				if (calendarContainer instanceof HTMLElement) {
					this.renderCurrentCalendar(calendarContainer);
				}
			},
			event,
			async () => {
				if (!event.filePath) return;
				await deleteEvent(this.plugin.app, event.filePath);
				const calendarContainer = this.contentEl.querySelector(".lindar-calendar-container");
				if (calendarContainer instanceof HTMLElement) {
					this.renderCurrentCalendar(calendarContainer);
				}
			}
		).open();
	}
}