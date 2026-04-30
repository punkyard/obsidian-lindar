import { App, normalizePath, parseYaml, TFile, TFolder } from "obsidian";
import type { LinearCalendarEvent } from "../types";

export async function saveEvent(
	app: App,
	eventsFolder: string,
	event: LinearCalendarEvent
): Promise<void> {
	const folder = normalizePath(eventsFolder);

	if (!app.vault.getAbstractFileByPath(folder)) {
		await app.vault.createFolder(folder);
	}

	const desiredFilePath = buildEventFilePath(folder, event);
	const filePath = ensureUniqueEventFilePath(app, desiredFilePath);
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
	event: LinearCalendarEvent
): Promise<void> {
	const content = buildEventNote(event);

	if (event.filePath) {
		const existingFile = app.vault.getAbstractFileByPath(event.filePath);
		if (existingFile instanceof TFile) {
			const folder = normalizePath(eventsFolder);
			const desiredFilePath = buildEventFilePath(folder, event);
			const newFilePath = ensureUniqueEventFilePath(app, desiredFilePath, existingFile.path);

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
): Promise<LinearCalendarEvent[]> {
	const folder = normalizePath(eventsFolder);
	const abstractFile = app.vault.getAbstractFileByPath(folder);

	if (!(abstractFile instanceof TFolder)) {
		return [];
	}

	const events: LinearCalendarEvent[] = [];

	for (const child of abstractFile.children) {
		if (!(child instanceof TFile) || child.extension !== "md") continue;

		const content = await app.vault.cachedRead(child);
		const fm = extractFrontmatter(content);

		if (!fm) continue;

		const allDay = frontmatterBoolean(fm.allDay);
		if (allDay === false) continue;

		const eventMarker = frontmatterBoolean(fm.event);
		if (eventMarker === false) continue;

		const startDate = frontmatterString(fm.date, frontmatterString(fm.start, ""));
		if (!startDate) continue;

		const endDate = frontmatterString(fm.endDate, frontmatterString(fm.end, startDate));

		events.push({
			id: frontmatterString(fm.uid, frontmatterString(fm.id, child.basename)),
			title: frontmatterString(fm.title, "Untitled"),
			start: startDate,
			end: endDate,
			color: frontmatterString(fm.color, "#4f46e5"),
			type: optionalFrontmatterString(fm.type),
			participants: frontmatterStringList(fm.participants),
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

function frontmatterBoolean(value: unknown): boolean | undefined {
	if (typeof value === "boolean") {
		return value;
	}

	if (typeof value === "string") {
		if (value === "true") return true;
		if (value === "false") return false;
	}

	return undefined;
}

function frontmatterStringList(value: unknown): string[] | undefined {
	if (Array.isArray(value)) {
		const items = value
			.map((item) => optionalFrontmatterString(item)?.trim())
			.filter((item): item is string => Boolean(item));
		return items.length > 0 ? items : undefined;
	}

	const single = optionalFrontmatterString(value)?.trim();
	if (!single) return undefined;

	const parts = single
		.split(/\r?\n|,/)
		.map((item) => item.trim())
		.filter(Boolean);

	return parts.length > 0 ? parts : undefined;
}

function buildEventNote(event: LinearCalendarEvent): string {
	const lines: string[] = [
		"---",
		`uid: ${yamlString(event.id)}`,
		"event: true",
		"allDay: true",
		`title: ${yamlString(event.title)}`,
		`date: ${event.start}`,
		`endDate: ${event.end}`,
		`color: "${event.color}"`,
	];

	if (event.type) {
		lines.push(`type: ${yamlString(event.type)}`);
	}

	if (event.participants && event.participants.length > 0) {
		lines.push("participants:");
		for (const participant of event.participants) {
			lines.push(`  - ${yamlString(participant)}`);
		}
	}

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

function normalizeDateStamp(value: string): string {
	return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "0000-00-00";
}

function buildEventFilePath(folder: string, event: LinearCalendarEvent): string {
	const safeName = sanitizeFileName(event.title);
	const dateStamp = normalizeDateStamp(event.start);
	const fileName = `${dateStamp}-${safeName}.md`;
	return normalizePath(`${folder}/${fileName}`);
}

function ensureUniqueEventFilePath(app: App, desiredPath: string, preservePath?: string): string {
	const basePath = desiredPath.replace(/\.md$/i, "");
	let candidatePath = desiredPath;
	let index = 2;

	for (;;) {
		const existing = app.vault.getAbstractFileByPath(candidatePath);
		if (!(existing instanceof TFile) || existing.path === preservePath) {
			return candidatePath;
		}
		candidatePath = `${basePath}-${index}.md`;
		index++;
	}
}

export function generateEventId(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
