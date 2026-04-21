import { App, PluginSettingTab, Setting } from "obsidian";
import LindarPlugin from "./main";
import { LindarSettings } from "./types";

let laneCapDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export const DEFAULT_SETTINGS: LindarSettings = {
	eventsFolder: "lindar-events",
	defaultColor: "#4f46e5",
	motto: "Life is bigger than a week",
	maxVisibleEventLanes: 0,
	adaptMonthLanesToEvents: false,
};

export class LindarSettingTab extends PluginSettingTab {
	plugin: LindarPlugin;

	constructor(app: App, plugin: LindarPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Event notes folder")
			.setDesc("Folder used to store calendar event notes.")
			.addText((text) =>
				text
					.setPlaceholder("Example: lindar-events")
					.setValue(this.plugin.settings.eventsFolder)
					.onChange(async (value) => {
						this.plugin.settings.eventsFolder = value.trim() || DEFAULT_SETTINGS.eventsFolder;
						await this.plugin.saveSettings();
					})
			);

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
						this.display();
						this.plugin.refreshCalendar();
					});
			})
			.addColorPicker((color) => {
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
						this.plugin.settings.motto = value.trim() || DEFAULT_SETTINGS.motto;
						await this.plugin.saveSettings();
						this.plugin.refreshCalendar();
					})
			);

		new Setting(containerEl)
			.setName("Visible event lanes per month")
			.setDesc("Use 0 for responsive auto sizing. Use 1, 2, 3, or more to cap visible lanes before a month row scrolls internally.")
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
							clearTimeout(laneCapDebounceTimer);
						}

						laneCapDebounceTimer = setTimeout(() => {
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
