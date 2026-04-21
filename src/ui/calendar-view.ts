import { ItemView, WorkspaceLeaf } from "obsidian";
import type LindarPlugin from "../main";
import { renderCalendar } from "./calendar-renderer";
import { EventModal } from "./event-modal";
import { deleteEvent, loadEvents, saveEvent, updateEvent, generateEventId } from "../events/event-store";
import type { LindarEvent } from "../types";

export const VIEW_TYPE_LINDAR = "lindar-calendar-view";

export class LindarView extends ItemView {
	private readonly plugin: LindarPlugin;
	private currentYear: number;
	private resizeObserver: ResizeObserver | null = null;

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
		contentEl.style.padding = "0";
		contentEl.style.overflow = "hidden";
		contentEl.style.boxSizing = "border-box";

		// Navigation bar: year controls left, motto right
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

		const nextBtn = yearControls.createEl("button");
		nextBtn.setText("→");
		nextBtn.setAttribute("aria-label", "Next year");
		nextBtn.setAttribute("title", "Next year");
		nextBtn.onclick = () => this.nextYear();

		const mottoDisplay = navBar.createDiv("lindar-motto-display");
		mottoDisplay.setText(this.plugin.settings.motto || "");

		// Calendar container
		const calendarContainer = contentEl.createDiv("lindar-calendar-container");

		// Render the calendar
		this.renderCurrentCalendar(calendarContainer);

		// Keep wrapper height pinned to visible area (excludes scrollbar)
		this.resizeObserver = new ResizeObserver(() => this.fitWrapperHeight(calendarContainer));
		this.resizeObserver.observe(calendarContainer);
		this.fitWrapperHeight(calendarContainer);
	}

	async onClose(): Promise<void> {
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
		const yearBtn = this.contentEl.querySelector(".lindar-year-btn") as HTMLElement;
		if (yearBtn) {
			yearBtn.setText(String(this.currentYear));
		}
		const calendarContainer = this.contentEl.querySelector(".lindar-calendar-container") as HTMLElement;
		if (calendarContainer) {
			this.renderCurrentCalendar(calendarContainer);
		}
	}

	private showYearDropdown(element: HTMLElement): void {
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
			option.onclick = () => {
				this.currentYear = year;
				this.updateDisplay();
				dropdown.remove();
			};
			scrollContainer.appendChild(option);
		}

		dropdown.appendChild(scrollContainer);
		element.parentElement?.appendChild(dropdown);

		// Close dropdown when clicking outside
		const closeDropdown = () => {
			if (dropdown.parentElement) {
				dropdown.remove();
			}
			document.removeEventListener("click", closeDropdown);
		};
		setTimeout(() => {
			document.addEventListener("click", closeDropdown);
		}, 100);
	}

	private fitWrapperHeight(container: HTMLElement): void {
		const wrapper = container.querySelector(".lindar-wrapper") as HTMLElement;
		if (wrapper) {
			wrapper.style.height = `${container.clientHeight}px`;
		}
	}

	private renderCurrentCalendar(container: HTMLElement): void {
		void this.loadAndRender(container);
	}

	private async loadAndRender(container: HTMLElement): Promise<void> {
		const events = await loadEvents(this.plugin.app, this.plugin.settings.eventsFolder);
		renderCalendar(
			container,
			this.currentYear,
			events,
			this.plugin.settings.motto,
			(dateStr) => this.openCreateEventModal(dateStr),
			(event) => this.openEditEventModal(event)
		);
		this.fitWrapperHeight(container);
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
				const calendarContainer = this.contentEl.querySelector(".lindar-calendar-container") as HTMLElement;
				if (calendarContainer) {
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
				const calendarContainer = this.contentEl.querySelector(".lindar-calendar-container") as HTMLElement;
				if (calendarContainer) {
					this.renderCurrentCalendar(calendarContainer);
				}
			},
			event,
			async () => {
				if (!event.filePath) return;
				await deleteEvent(this.plugin.app, event.filePath);
				const calendarContainer = this.contentEl.querySelector(".lindar-calendar-container") as HTMLElement;
				if (calendarContainer) {
					this.renderCurrentCalendar(calendarContainer);
				}
			}
		).open();
	}
}
