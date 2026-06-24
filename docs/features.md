# Features

## Target experience

- one row per month
- horizontal scrolling across the full yearly grid
- weekday headers aligned with each date column
- sticky month labels on the left
- a clean, elegant layout that feels at home in Obsidian
- fast event creation directly from the calendar
- beautiful, highly visible multi-day event bars

## Calendar layout

- **Yearly horizontal linear calendar** with one row per month
- **Dates arranged horizontally** across each month row
- **Weekday headers** repeating across the top and aligned to date positions
- **Sticky year header** and **sticky month column**
- **96vh layout** for an immersive full-page view
- **Horizontal scrolling** for the grid
- **Today highlight** so the current date stands out immediately
- **Light and dark theme support** using Obsidian theme variables
- **Customizable motto** shown in the view
- **Year navigation** to move backward and forward across years

## Event creation

- **Click a date cell** to open a popup and create an event
- **Click-drag across cells** to create a multi-day selection
- **Start and end dates** editable in the popup
- **Free-text event type** with lightweight suggestions like `appointment`, `call`, `meal`, or `meeting`
- **Participants list** captured directly in the popup, one per line
- **Native OS color picker** when available, with a curated palette fallback
- **Single-day and multi-day events** rendered directly on the grid
- **Cross-week, cross-month, and cross-row continuity** for longer events
- **Multiple events per day** displayed cleanly without turning the grid into soup
- **Edit and delete existing events** from the same popup

## Storage model

- **Events stored as Markdown notes** inside the vault
- one event note per event, using YAML frontmatter metadata
- event notes remain searchable, linkable, and portable
- configurable events folder path in plugin settings

Example event note shape:

```yaml
---
uid: abc123
event: true
allDay: true
title: Birthday party
date: 2026-04-20
endDate: 2026-04-22
color: "#e74c3c"
type: appointment
participants:
    - Alice
    - Bob
---
Optional notes about the event...
```

## Event frontmatter

- `uid`: stable internal event id
- `event: true`: explicit marker for Lindar event notes
- `allDay: true`: current storage mode for yearly bar rendering
- `title`: visible label in the calendar
- `date`: start date in `YYYY-MM-DD`
- `endDate`: inclusive end date in `YYYY-MM-DD`
- `color`: event bar color
- `type`: optional free-text classifier
- `participants`: optional YAML list of people involved
- note body: optional notes/details

`type` stays intentionally free-form. Use values like:

- `appointment`
- `call`
- `meal`
- `meeting`
- `travel`
- `deadline`

...or any label matching your own workflow.

Existing older event notes without `event`, `type`, or `participants` remain compatible.

## Compatibility notes

- Older event notes continue loading even if they only have legacy fields.
- `event: false` is treated as a deliberate opt-out and will not be loaded.
- `participants` can be stored as a YAML list; empty values are ignored.

## Technical direction

- **TypeScript**
- **esbuild**
- **npm**
- **Obsidian Plugin API**
- modular source structure under `src/`
- pure Obsidian/DOM UI approach rather than a heavy web framework
