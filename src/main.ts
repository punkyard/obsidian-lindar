import { Plugin, WorkspaceLeaf } from "obsidian";
import { DEFAULT_SETTINGS, LinearCalendarSettingTab } from "./settings";
import type { LinearCalendarSettings } from "./types";
import { LinearCalendarYearView, VIEW_TYPE_LINEAR_CALENDAR } from "./ui/year-view";

export default class LinearCalendarPlugin extends Plugin {
	settings!: LinearCalendarSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.registerView(VIEW_TYPE_LINEAR_CALENDAR, (leaf) => new LinearCalendarYearView(leaf, this));

			this.addRibbonIcon("calendar", "Lindar", () => {
			void this.activateView();
		});

		this.addCommand({
			id: "open-linear-view",
			name: "Open",
			callback: () => {
				void this.activateView();
			},
		});

		this.addSettingTab(new LinearCalendarSettingTab(this.app, this));
	}

	onunload(): void {}

	async activateView(): Promise<void> {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = workspace.getLeavesOfType(VIEW_TYPE_LINEAR_CALENDAR)[0] ?? null;

		if (!leaf) {
			leaf = workspace.getLeaf(false);
			await leaf.setViewState({ type: VIEW_TYPE_LINEAR_CALENDAR, active: true });
		}

		if (leaf) {
			void workspace.revealLeaf(leaf);
		}
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<LinearCalendarSettings>);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	refreshCalendar(): void {
		this.app.workspace.getLeavesOfType(VIEW_TYPE_LINEAR_CALENDAR).forEach((leaf) => {
			if (leaf.view instanceof LinearCalendarYearView) {
				leaf.view.refresh();
			}
		});
	}
}
