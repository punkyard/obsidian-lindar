export interface LindarEvent {
	id: string;
	title: string;
	start: string;
	end: string;
	color: string;
	notes?: string;
	filePath?: string;
}

export interface LindarSettings {
	eventsFolder: string;
	defaultColor: string;
	motto: string;
}
