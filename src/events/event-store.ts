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
		const existingByPath = app.vault.getAbstractFileByPath(event.filePath);
		if (existingByPath instanceof TFile) {
			await app.vault.modify(existingByPath, content);
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
			id: String(fm.id ?? child.basename),
			title: String(fm.title ?? "Untitled"),
			start: String(fm.start ?? ""),
			end: String(fm.end ?? fm.start ?? ""),
			color: String(fm.color ?? "#4f46e5"),
			notes: fm.notes ? String(fm.notes) : undefined,
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
		const parsed = parseYaml(yaml);
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
		await app.vault.trash(file, true);
	}
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
