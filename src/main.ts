import { Plugin, WorkspaceLeaf } from "obsidian";
import { DEFAULT_SETTINGS, LindarSettingTab } from "./settings";
import type { LindarSettings } from "./types";
import { LindarYearView, VIEW_TYPE_LINDAR } from "./ui/year-view";

export default class LindarPlugin extends Plugin {
	settings!: LindarSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.registerView(VIEW_TYPE_LINDAR, (leaf) => new LindarYearView(leaf, this));

		this.addRibbonIcon("calendar", "Open year view", () => {
			void this.activateView();
		});

		this.addCommand({
			id: "open-lindar-view",
			name: "Open year view",
			callback: () => {
				void this.activateView();
			},
		});

		this.addSettingTab(new LindarSettingTab(this.app, this));
	}

	onunload(): void {}

	async activateView(): Promise<void> {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = workspace.getLeavesOfType(VIEW_TYPE_LINDAR)[0] ?? null;

		if (!leaf) {
			leaf = workspace.getLeaf(false);
			await leaf.setViewState({ type: VIEW_TYPE_LINDAR, active: true });
		}

		if (leaf) {
			void workspace.revealLeaf(leaf);
		}
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<LindarSettings>);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	refreshCalendar(): void {
		this.app.workspace.getLeavesOfType(VIEW_TYPE_LINDAR).forEach((leaf) => {
			if (leaf.view instanceof LindarYearView) {
				leaf.view.refresh();
			}
		});
	}
}
