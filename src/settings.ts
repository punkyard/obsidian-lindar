import { App, ColorComponent, PluginSettingTab, Setting } from "obsidian";
import LinearCalendarPlugin from "./main";
import { LinearCalendarSettings } from "./types";

let laneCapDebounceTimer: number | null = null;

export const DEFAULT_SETTINGS: LinearCalendarSettings = {
	eventsFolder: "yearly-events",
	defaultColor: "#4f46e5",
	motto: "",
	maxVisibleEventLanes: 0,
	adaptMonthLanesToEvents: false,
};

export class LinearCalendarSettingTab extends PluginSettingTab {
	plugin: LinearCalendarPlugin;

	constructor(app: App, plugin: LinearCalendarPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("p", {
			text: "⚠️ Early development — expect breaking changes",
		});

		new Setting(containerEl)
			.setName("Event notes folder")
			.setDesc("Folder used to store calendar event notes.")
			.addText((text) =>
				text
					.setPlaceholder("Example: yearly-events")
					.setValue(this.plugin.settings.eventsFolder)
					.onChange(async (value) => {
						this.plugin.settings.eventsFolder = value.trim() || DEFAULT_SETTINGS.eventsFolder;
						await this.plugin.saveSettings();
					})
			);

		let colorPicker: ColorComponent | null = null;
		new Setting(containerEl)
			.setName("Default event color")
			.setDesc("Used as the default color when creating events.")
			.addExtraButton((button) => {
				button
					.setIcon("reset")
					.setTooltip("Reset default event color")
					.onClick(async () => {
						this.plugin.settings.defaultColor = DEFAULT_SETTINGS.defaultColor;
						await this.plugin.saveSettings();
						colorPicker?.setValue(DEFAULT_SETTINGS.defaultColor);
						this.plugin.refreshCalendar();
					});
			})
			.addColorPicker((color) => {
				colorPicker = color;
				color.setValue(this.plugin.settings.defaultColor).onChange(async (value) => {
					this.plugin.settings.defaultColor = value;
					await this.plugin.saveSettings();
					this.plugin.refreshCalendar();
				});
			});

		new Setting(containerEl)
			.setName("Motto")
			.setDesc("Message shown in the year view.")
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.motto)
					.setValue(this.plugin.settings.motto)
					.onChange(async (value) => {
						this.plugin.settings.motto = value.trim();
						await this.plugin.saveSettings();
						this.plugin.refreshCalendar();
					})
			);

		new Setting(containerEl)
			.setName("Visible event lanes per month")
			.setDesc("Choose how many event lanes are displayed (may require scroll). Keep 0 for responsive month rows.")
			.addText((text) => {
				text
					.setPlaceholder(String(DEFAULT_SETTINGS.maxVisibleEventLanes))
					.setValue(String(this.plugin.settings.maxVisibleEventLanes))
					.onChange((value) => {
						const trimmed = value.trim();
						if (trimmed.length > 0 && !/^\d+$/.test(trimmed)) return;

						const newValue = trimmed.length === 0
							? DEFAULT_SETTINGS.maxVisibleEventLanes
							: Number.parseInt(trimmed, 10);
						if (!Number.isFinite(newValue) || newValue < 0) return;

						if (laneCapDebounceTimer) {
								window.clearTimeout(laneCapDebounceTimer);
							}

							laneCapDebounceTimer = window.setTimeout(() => {
							void this.updateMaxVisibleEventLanes(newValue);
						}, 500);
					});
			});

		new Setting(containerEl)
			.setName("Expand months to fit events")
			.setDesc("When enabled, each month expands to show all event lanes. When disabled, busy months stay responsive and scroll inside the month row.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.adaptMonthLanesToEvents).onChange((value) => {
					void this.updateAdaptMonthLanesToEvents(value);
				})
			);
	}

	private async updateAdaptMonthLanesToEvents(value: boolean): Promise<void> {
		this.plugin.settings.adaptMonthLanesToEvents = value;
		await this.plugin.saveSettings();
		this.plugin.refreshCalendar();
	}

	private async updateMaxVisibleEventLanes(value: number): Promise<void> {
		this.plugin.settings.maxVisibleEventLanes = value;
		await this.plugin.saveSettings();
		this.plugin.refreshCalendar();
	}
}
