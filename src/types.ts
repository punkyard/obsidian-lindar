export interface LinearCalendarEvent {
	id: string;
	title: string;
	start: string;
	end: string;
	color: string;
	type?: string;
	participants?: string[];
	notes?: string;
	filePath?: string;
}

export interface LinearCalendarSettings {
	eventsFolder: string;
	defaultColor: string;
	motto: string;
	maxVisibleEventLanes: number;
	adaptMonthLanesToEvents: boolean;
}
