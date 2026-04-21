import { App, normalizePath, parseYaml, TFile, TFolder } from "obsidian";
import type { LindarEvent } from "../types";

export async function saveEvent(
	app: App,
	eventsFolder: string,
	event: LindarEvent
): Promise<void> {
	const folder = normalizePath(eventsFolder);

	if (!app.vault.getAbstractFileByPath(folder)) {
		await app.vault.createFolder(folder);
	}

	const safeName = sanitizeFileName(event.title);
	const fileName = `${safeName}-${event.id}.md`;
	const filePath = normalizePath(`${folder}/${fileName}`);
	const content = buildEventNote(event);

	const existing = app.vault.getAbstractFileByPath(filePath);
	if (existing instanceof TFile) {
		await app.vault.modify(existing, content);
	} else {
		await app.vault.create(filePath, content);
	}
}

export async function updateEvent(
	app: App,
	eventsFolder: string,
	event: LindarEvent
): Promise<void> {
	const content = buildEventNote(event);

	if (event.filePath) {
		const existingFile = app.vault.getAbstractFileByPath(event.filePath);
		if (existingFile instanceof TFile) {
			const folder = normalizePath(eventsFolder);
			const safeName = sanitizeFileName(event.title);
			const newFilePath = normalizePath(`${folder}/${safeName}-${event.id}.md`);

			if (existingFile.path !== newFilePath) {
				await app.fileManager.renameFile(existingFile, newFilePath);
				const renamedFile = app.vault.getAbstractFileByPath(newFilePath);
				if (renamedFile instanceof TFile) {
					await app.vault.modify(renamedFile, content);
				}
			} else {
				await app.vault.modify(existingFile, content);
			}
			return;
		}
	}

	await saveEvent(app, eventsFolder, event);
}

export async function loadEvents(
	app: App,
	eventsFolder: string
): Promise<LindarEvent[]> {
	const folder = normalizePath(eventsFolder);
	const abstractFile = app.vault.getAbstractFileByPath(folder);

	if (!(abstractFile instanceof TFolder)) {
		return [];
	}

	const events: LindarEvent[] = [];

	for (const child of abstractFile.children) {
		if (!(child instanceof TFile) || child.extension !== "md") continue;

		const content = await app.vault.cachedRead(child);
		const fm = extractFrontmatter(content);

		if (!fm || fm["lindar-event"] !== true) continue;

		events.push({
			id: frontmatterString(fm.id, child.basename),
			title: frontmatterString(fm.title, "Untitled"),
			start: frontmatterString(fm.start, ""),
			end: frontmatterString(fm.end, frontmatterString(fm.start, "")),
			color: frontmatterString(fm.color, "#4f46e5"),
			notes: optionalFrontmatterString(fm.notes),
			filePath: child.path,
		});
	}

	return events;
}

function extractFrontmatter(content: string): Record<string, unknown> | null {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	const yaml = match?.[1];
	if (!yaml) return null;

	try {
		const parsed: unknown = parseYaml(yaml);
		if (parsed && typeof parsed === "object") {
			return parsed as Record<string, unknown>;
		}
		return null;
	} catch {
		return null;
	}
}

export async function deleteEvent(
	app: App,
	filePath: string
): Promise<void> {
	const file = app.vault.getAbstractFileByPath(filePath);
	if (file instanceof TFile) {
		await app.fileManager.trashFile(file);
	}
}

function frontmatterString(value: unknown, fallback: string): string {
	if (typeof value === "string") {
		return value;
	}

	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}

	return fallback;
}

function optionalFrontmatterString(value: unknown): string | undefined {
	if (typeof value === "string") {
		return value;
	}

	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}

	return undefined;
}

function buildEventNote(event: LindarEvent): string {
	const lines: string[] = [
		"---",
		"lindar-event: true",
		`id: ${event.id}`,
		`title: ${yamlString(event.title)}`,
		`start: ${event.start}`,
		`end: ${event.end}`,
		`color: "${event.color}"`,
	];

	if (event.notes) {
		lines.push(`notes: ${yamlString(event.notes)}`);
	}

	lines.push("---", "");

	if (event.notes) {
		lines.push(event.notes);
	}

	return lines.join("\n");
}

function yamlString(value: string): string {
	if (/[:#"'\n\\]/.test(value)) {
		return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
	}
	return value;
}

function sanitizeFileName(title: string): string {
	return (
		title
			.replace(/[\\/:*?"<>|]/g, "-")
			.replace(/\s+/g, "-")
			.toLowerCase()
			.slice(0, 40) || "event"
	);
}

export function generateEventId(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
