import { App, Modal } from "obsidian";
import type { LindarEvent } from "../types";

export interface EventFormData {
	title: string;
	start: string;
	end: string;
	color: string;
	type: string;
	participants: string[];
	notes: string;
}

export class EventModal extends Modal {
	private readonly initialDate: string;
	private readonly defaultColor: string;
	private readonly onSave: (data: EventFormData) => Promise<void> | void;
	private readonly onDelete?: () => Promise<void> | void;
	private readonly existingEvent?: LindarEvent;

	private _titleInput!: HTMLInputElement;
	private _startInput!: HTMLInputElement;
	private _endInput!: HTMLInputElement;
	private _colorInput!: HTMLInputElement;
	private _typeInput!: HTMLInputElement;
	private _participantsInput!: HTMLTextAreaElement;
	private _notesInput!: HTMLTextAreaElement;

	constructor(
		app: App,
		initialDate: string,
		defaultColor: string,
		onSave: (data: EventFormData) => Promise<void> | void,
		existingEvent?: LindarEvent,
		onDelete?: () => Promise<void> | void
	) {
		super(app);
		this.initialDate = initialDate;
		this.defaultColor = defaultColor;
		this.onSave = onSave;
		this.existingEvent = existingEvent;
		this.onDelete = onDelete;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.addClass("lindar-event-modal");

		contentEl.createEl("h2", {
			text: this.existingEvent ? "Edit event" : "New event",
		});

		const form = contentEl.createEl("form");
		form.addEventListener("submit", (e) => {
			e.preventDefault();
			this.submit();
		});

		// Title
		const titleGroup = form.createDiv("lindar-modal-field");
		titleGroup.createEl("label", {
			text: "Title",
			attr: { for: "lindar-title" },
		});
		const titleInput = titleGroup.createEl("input", {
			attr: {
				type: "text",
				id: "lindar-title",
				placeholder: "Event title",
				required: "true",
			},
		});
		titleInput.value = this.existingEvent?.title ?? "";
		this._titleInput = titleInput;

		// Start date
		const startGroup = form.createDiv("lindar-modal-field");
		startGroup.createEl("label", {
			text: "Start",
			attr: { for: "lindar-start" },
		});
		const startInput = startGroup.createEl("input", {
			attr: { type: "date", id: "lindar-start", required: "true" },
		});
		startInput.value = this.existingEvent?.start ?? this.initialDate;
		this._startInput = startInput;

		// End date
		const endGroup = form.createDiv("lindar-modal-field");
		endGroup.createEl("label", {
			text: "End",
			attr: { for: "lindar-end" },
		});
		const endInput = endGroup.createEl("input", {
			attr: { type: "date", id: "lindar-end", required: "true" },
		});
		endInput.value = this.existingEvent?.end ?? this.initialDate;
		this._endInput = endInput;

		// Keep end >= start
		startInput.addEventListener("change", () => {
			if (endInput.value < startInput.value) {
				endInput.value = startInput.value;
			}
		});

		// Color
		const colorGroup = form.createDiv(
			"lindar-modal-field lindar-modal-field-color"
		);
		colorGroup.createEl("label", {
			text: "Color",
			attr: { for: "lindar-color" },
		});
		const colorInput = colorGroup.createEl("input", {
			attr: { type: "color", id: "lindar-color" },
		});
		colorInput.value = this.existingEvent?.color ?? this.defaultColor;
		this._colorInput = colorInput;

		// Type
		const typeGroup = form.createDiv("lindar-modal-field");
		typeGroup.createEl("label", {
			text: "Type",
			attr: { for: "lindar-type" },
		});
		const typeInput = typeGroup.createEl("input", {
			attr: {
				type: "text",
				id: "lindar-type",
				placeholder: "appointment, call, meal, meeting…",
				list: "lindar-event-types",
			},
		});
		typeInput.value = this.existingEvent?.type ?? "";
		this._typeInput = typeInput;

		const typeSuggestions = form.createEl("datalist", {
			attr: { id: "lindar-event-types" },
		});
		for (const type of ["appointment", "call", "meal", "meeting", "travel", "deadline", "task", "reminder", "other"]) {
			typeSuggestions.createEl("option", { attr: { value: type } });
		}

		// Participants
		const participantsGroup = form.createDiv("lindar-modal-field");
		participantsGroup.createEl("label", {
			text: "Participants",
			attr: { for: "lindar-participants" },
		});
		const participantsInput = participantsGroup.createEl("textarea", {
			attr: {
				id: "lindar-participants",
				placeholder: "One participant per line",
				rows: "3",
			},
		});
		participantsInput.value = this.existingEvent?.participants?.join("\n") ?? "";
		this._participantsInput = participantsInput;

		// Notes
		const notesGroup = form.createDiv("lindar-modal-field");
		notesGroup.createEl("label", {
			text: "Notes",
			attr: { for: "lindar-notes" },
		});
		const notesInput = notesGroup.createEl("textarea", {
			attr: {
				id: "lindar-notes",
				placeholder: "Optional notes…",
				rows: "3",
			},
		});
		notesInput.value = this.existingEvent?.notes ?? "";
		this._notesInput = notesInput;

		// Buttons
		const buttons = form.createDiv("lindar-modal-buttons");
		const saveBtn = buttons.createEl("button", {
			text: this.existingEvent ? "Save" : "Create",
			attr: { type: "submit" },
		});
		saveBtn.addClass("mod-cta");

		const cancelBtn = buttons.createEl("button", {
			text: "Cancel",
			attr: { type: "button" },
		});
		cancelBtn.onclick = () => this.close();

		if (this.existingEvent && this.onDelete) {
			const deleteBtn = buttons.createEl("button", {
				text: "Delete",
				attr: { type: "button" },
			});
			deleteBtn.addClass("lindar-delete-btn");
			deleteBtn.onclick = () => {
				void this.onDelete?.();
				this.close();
			};
		}

		setTimeout(() => titleInput.focus(), 50);
	}

	private submit(): void {
		const title = this._titleInput.value.trim();
		if (!title) return;

		void this.onSave({
			title,
			start: this._startInput.value,
			end: this._endInput.value || this._startInput.value,
			color: this._colorInput.value,
			type: this._typeInput.value.trim(),
			participants: this._participantsInput.value
				.split(/\r?\n/)
				.map((participant) => participant.trim())
				.filter(Boolean),
			notes: this._notesInput.value.trim(),
		});
		this.close();
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
