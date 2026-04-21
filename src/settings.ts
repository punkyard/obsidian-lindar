import { App, PluginSettingTab, Setting } from "obsidian";
import LindarPlugin from "./main";
import { LindarSettings } from "./types";

export const DEFAULT_SETTINGS: LindarSettings = {
	eventsFolder: "lindar-events",
	defaultColor: "#4f46e5",
	motto: "Life is bigger than a week",
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
			.setName("Events folder")
			.setDesc("Folder used to store linDar event notes.")
			.addText((text) =>
				text
					.setPlaceholder("lindar-events")
					.setValue(this.plugin.settings.eventsFolder)
					.onChange(async (value) => {
						this.plugin.settings.eventsFolder = value.trim() || DEFAULT_SETTINGS.eventsFolder;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Default event color")
			.setDesc("Used as the default color when creating events.")
			.addColorPicker((color) =>
				color.setValue(this.plugin.settings.defaultColor).onChange(async (value) => {
					this.plugin.settings.defaultColor = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Motto")
			.setDesc("Message shown in the calendar view.")
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.motto)
					.setValue(this.plugin.settings.motto)
					.onChange(async (value) => {
						this.plugin.settings.motto = value.trim() || DEFAULT_SETTINGS.motto;
						await this.plugin.saveSettings();
					})
			);

	}
}
