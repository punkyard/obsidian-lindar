# linDar

catch: Yearly horizontal linear calendar plugin for Obsidian, designed for long-horizon planning

Yet another calendar plugin for Obsidian, but:

- yearly
- horizontal
- linear

Because:

> Life is bigger than a week.

⚠️ **linDar is in early development.**

## Overview

`linDar` is a yearly horizontal linear calendar plugin for Obsidian.

The goal is simple: show the whole year at once, with **one line per month**, **days flowing horizontally**, and enough visual clarity to make longer time horizons feel natural again.

This project is inspired by Nick Milo's call for a more useful yearly calendar view, and by the broader idea that our planning tools should help us think beyond the current week or month.

## Target experience

The plugin is being designed around these principles:

- one row per month
- horizontal scrolling across the full yearly grid
- weekday headers aligned with each date column
- sticky month labels on the left
- a clean, elegant layout that feels at home in Obsidian
- fast event creation directly from the calendar
- beautiful, highly visible multi-day event bars

## Planned feature set

### Calendar layout

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

### Event creation

- **Click a date cell** to open a popup and create an event
- **Click-drag across cells** to create a multi-day selection
- **Start and end dates** editable in the popup
- **Native OS color picker** when available, with a curated palette fallback
- **Single-day and multi-day events** rendered directly on the grid
- **Cross-week, cross-month, and cross-row continuity** for longer events
- **Multiple events per day** displayed cleanly without turning the grid into soup
- **Edit and delete existing events** from the same popup

### Storage model

- **Events stored as Markdown notes** inside the vault
- one event note per event, using YAML frontmatter metadata
- event notes remain searchable, linkable, and portable
- configurable events folder path in plugin settings

Example event note shape:

```yaml
---
lindar-event: true
title: Birthday party
start: 2026-04-20
end: 2026-04-22
color: "#e74c3c"
---
Optional notes about the event...
```

### Future extensions

These are intentionally **not part of v1**, but remain relevant longer-term ideas:

- CalDAV synchronization
- per-user `.ics` export
- secure sharing links
- authentication
- private and family event permissions

## Technical direction

The plugin is planned as a standard Obsidian community plugin:

- **TypeScript**
- **esbuild**
- **npm**
- **Obsidian Plugin API**
- modular source structure under `src/`
- pure Obsidian/DOM UI approach rather than a heavy web framework

## Development setup

The expected development flow follows the standard Obsidian community plugin workflow.

### Prerequisites

- `git`
- Node.js (current LTS recommended)
- `npm`
- Obsidian
- a separate Obsidian vault for plugin development

### Recommended project bootstrap

The safest starting point is the official Obsidian sample plugin structure, then adapt it for `linDar`:

- clone or copy the sample plugin into `.obsidian/plugins/lindar`
- rename the plugin folder to match the final plugin `id`
- update `manifest.json` with the correct plugin metadata
- keep source files under `src/`
- keep `main.ts` focused on plugin lifecycle and registration

### Local development loop

From the plugin folder:

- run `npm install`
- run `npm run dev`
- let the build watch process regenerate `main.js` on changes
- reload Obsidian after manifest changes
- enable the plugin in **Settings → Community plugins**

### Expected project files

The roadmap assumes a typical Obsidian plugin layout like:

- `src/main.ts` — plugin entry point
- `src/settings.ts` — settings model and defaults
- `src/types.ts` — shared calendar and event types
- `manifest.json` — plugin metadata
- `package.json` — scripts and dependencies
- `tsconfig.json` — TypeScript configuration
- `esbuild.config.mjs` — bundling configuration
- `versions.json` — plugin version compatibility map
- `README.md` — user-facing documentation
- `LICENSE` — GPL license text

### Development expectations

- test inside a separate development vault, not a primary vault
- prefer modular files over a large `main.ts`
- use Obsidian APIs for settings, commands, views, and cleanup registration
- keep startup work light and defer heavy rendering until needed
- avoid network behavior in v1 unless clearly documented and user-controlled

## Roadmap

### Phase 1 — scaffold

- [x] Start from the official Obsidian sample plugin structure
- [x] Create `manifest.json`
- [x] Create `package.json`
- [x] Create `tsconfig.json`
- [x] Create `esbuild.config.mjs`
- [x] Add `versions.json`
- [x] Add `LICENSE`
- [x] Create plugin entry point in `src/main.ts`
- [x] Create settings model in `src/settings.ts`
- [x] Create shared types in `src/types.ts`
- [x] Keep `main.ts` minimal and move feature logic into focused modules under `src/`
- [x] Add strict TypeScript settings and Obsidian typings
- [x] Implement settings persistence with `loadData()` and `saveData()`
- [x] Register a custom Obsidian view for the calendar
- [x] Add a ribbon icon and command to open linDar
- [x] Run `npm install` and confirm `npm run dev` rebuilds successfully
- [x] Test the plugin inside a separate development vault

### Phase 2 — base calendar view

- [x] Render the yearly view with 12 month rows
- [x] Add correct day offsets for every month
- [x] Align weekday headers with the date grid
- [x] Make the month column sticky on the left
- [x] Make the header sticky on top
- [x] Apply the 96vh layout
- [x] Add horizontal scrolling
- [x] Highlight today
- [x] Add light/dark theme styling
- [x] Add year navigation controls
- [x] Display the customizable motto

### Phase 3 — event creation

- [ ] Open a popup when the user clicks a date cell
- [ ] Add title, start date, end date, color, and notes fields
- [ ] Use the native color input when supported by the OS
- [ ] Save events as Markdown notes with YAML frontmatter
- [ ] Load saved events back into the calendar view
- [ ] Render single-day event chips inside cells

### Phase 4 — multi-day events

- [ ] Add click-drag range selection
- [ ] Pre-fill the popup with the selected date range
- [ ] Render multi-day events as continuous colored bars
- [ ] Support events spanning weeks and months
- [ ] Handle overlapping events with sensible lane stacking

### Phase 5 — polish

- [ ] Edit existing events from the calendar
- [ ] Delete events cleanly
- [ ] Add hover details / tooltip behavior
- [ ] Improve spacing, typography, borders, and color balance
- [ ] Auto-scroll the view so today is visible when useful
- [ ] Handle leap years and edge cases gracefully
- [ ] Finalize installation instructions and README usage guidance
- [ ] Verify manual install works with `main.js`, `manifest.json`, and optional `styles.css`
- [ ] Test reload/unload cleanup and command stability
- [ ] Self-review against Obsidian developer policies and plugin guidelines
- [ ] Test on macOS, Windows, and Linux where possible

### Phase 6 — release and submission

- [ ] Bump `manifest.json` version using SemVer
- [ ] Update `versions.json` to map plugin version to minimum app version
- [ ] Ensure `manifest.json` includes stable `id`, `name`, `version`, `author`, `description`, `minAppVersion`, and `isDesktopOnly`
- [ ] Build release artifacts and verify `main.js` is bundled correctly
- [ ] Create a GitHub release whose tag exactly matches `manifest.json` version, with no `v` prefix
- [ ] Upload `main.js`, `manifest.json`, and optional `styles.css` as individual release assets
- [ ] Confirm the repository includes `README.md` and `LICENSE`
- [ ] Verify README clearly describes the plugin purpose and usage
- [ ] Fork `obsidianmd/obsidian-releases`
- [ ] Add the plugin entry to `community-plugins.json`
- [ ] Ensure the submitted description matches `manifest.json` exactly
- [ ] Open the community plugin PR using the plugin submission template
- [ ] Complete the release checklist and respond to validation feedback

## Future release checklist

When `linDar` is ready for release, this is the practical checklist to complete before submission:

### Repository readiness

- [ ] `README.md` clearly explains what the plugin does and how to use it
- [ ] `LICENSE` is present and matches **GPL-3.0-or-later**
- [ ] `manifest.json` contains the correct `id`, `name`, `version`, `author`, `description`, `minAppVersion`, and `isDesktopOnly`
- [ ] the plugin folder name matches the manifest `id` during local development

### Build and test readiness

- [ ] `npm install` completes successfully
- [ ] `npm run dev` rebuilds without errors
- [ ] production build generates a working `main.js`
- [ ] plugin loads correctly in Obsidian from `.obsidian/plugins/lindar`
- [ ] commands, settings, and custom views register and unload cleanly
- [ ] manual testing is done on macOS, plus Windows and Linux where possible

### Release readiness

- [ ] GitHub release tag matches `manifest.json` version exactly
- [ ] release tag does **not** use a `v` prefix
- [ ] `main.js` is uploaded as an individual release asset
- [ ] `manifest.json` is uploaded as an individual release asset
- [ ] `styles.css` is uploaded too if the plugin ships styles
- [ ] `versions.json` is updated for the released version

### Community submission readiness

- [ ] `community-plugins.json` entry uses the exact same plugin `id`
- [ ] submitted description matches `manifest.json` description exactly
- [ ] PR is opened against `obsidianmd/obsidian-releases` with the plugin template
- [ ] submission checklist is fully completed
- [ ] any validation failures are fixed by pushing another commit to the PR branch

## Design notes

The visual target is:

- precise grid
- date numbers aligned at the top-right of cells
- restrained borders for readability
- strong event color contrast
- enough density to see the year, without sacrificing legibility

In short: it has to look good.

## Future features

- daily notes compatibility: insert and read events in daily notes within a designated block (default 'Agenda')
- choose where to save: dedicated folder (default: 'AGENDA')
- choose event format: file or list block
- switch to vertical view
- switch to month, week, day views
- sync with calDav

## License

This project is licensed under **[GPL-3.0](LICENSE)-or-later**.

In practical terms, that means distributed modifications and derivative versions must also remain open source under GPL-compatible terms.

---

<p align="center"><sub>made with ⏳ by <a href="https://github.com/punkyard">punkyard</a></sub></p>
