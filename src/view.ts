import { ItemView, WorkspaceLeaf } from "obsidian";
import type LindarPlugin from "./main";

export const VIEW_TYPE_LINDAR = "lindar-calendar-view";

export class LindarView extends ItemView {
	private readonly plugin: LindarPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: LindarPlugin) {
		super(leaf);
		this.plugin = plugin;
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

		contentEl.createEl("h2", { text: "linDar" });
		contentEl.createEl("p", {
			text: "Calendar view scaffold is ready. Yearly grid rendering comes next.",
		});
		contentEl.createEl("p", {
			text: this.plugin.settings.motto,
			cls: "lindar-motto",
		});
	}

	async onClose(): Promise<void> {
		this.contentEl.empty();
	}
}
