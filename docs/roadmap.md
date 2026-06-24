# Roadmap

## Upcoming

### v0.2 — List & Unscheduled tabs
- List tab: flat chronological events, month-grouped, filter, click-to-open
- Unscheduled tab: tagged-but-undated notes with inline date picker

### v0.3 — Tag-based discovery
- `#event` tag as first-class discovery (alongside folder)
- `event: true` optional in tag mode

### v0.4 — CalDAV sync (exploratory)
- Two-way sync with remote calendars
- iCal feed import

---
## Completed phases

### Phase 1 — scaffold
- [x] Start from the official Obsidian sample plugin structure
- [x] Create `manifest.json`, `package.json`, `tsconfig.json`, `esbuild.config.mjs`, `versions.json`
- [x] Add `LICENSE`
- [x] Create plugin entry point in `src/main.ts`, settings model, shared types
- [x] Keep `main.ts` minimal and move feature logic into focused modules under `src/`
- [x] Add strict TypeScript settings and Obsidian typings
- [x] Implement settings persistence with `loadData()` and `saveData()`
- [x] Register a custom Obsidian view for the calendar
- [x] Add a ribbon icon and command to open Linear Calendar
- [x] Run `npm install` and confirm `npm run dev` rebuilds successfully
- [x] Test the plugin inside a separate development vault

### Phase 2 — base calendar view
- [x] Render the yearly view with 12 month rows
- [x] Add correct day offsets for every month
- [x] Align weekday headers with the date grid
- [x] Make the month column sticky on the left
- [x] Make the header sticky on top
- [x] Apply the 96vh layout, add horizontal scrolling
- [x] Highlight today
- [x] Add light/dark theme styling
- [x] Add year navigation controls, display customizable motto

### Phase 3 — event creation and storage
- [x] Open a popup when the user clicks a date cell
- [x] Add title, start date, end date, color, and notes fields
- [x] Use the native color input when supported by the OS
- [x] Save events as Markdown notes with YAML frontmatter
- [x] Load saved events back into the calendar view
- [x] Render single-day and multi-day events as colored event bars
- [x] Edit and delete existing events from the calendar
- [x] Improve event bar spacing, contrast, and overflow behavior

### Phase 4 — multi-day events and layout
- [x] Render multi-day events as continuous bars
- [x] Support events spanning weeks and months
- [x] Handle overlapping events with sensible lane stacking
- [x] Finalize month event lane scroll interaction
- [x] Add adaptive lane height / month-specific scrolling
- [x] Fix empty-event-list tail area wheel propagation

## Polish backlog

### Phase 5 — polish
- [ ] Add hover details / tooltip behavior
- [ ] Improve spacing, typography, borders, and color balance
- [ ] Auto-scroll the view so today is visible when useful
- [ ] Handle leap years and edge cases gracefully
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
- [ ] Fork `obsidianmd/obsidian-releases`
- [ ] Add the plugin entry to `community-plugins.json`
- [ ] Ensure the submitted description matches `manifest.json` exactly
- [ ] Open the community plugin PR using the plugin submission template
- [ ] Complete the release checklist and respond to validation feedback

## Release readiness checklist

- [ ] `README.md` clearly explains what the plugin does and how to use it
- [ ] `LICENSE` is present and matches **MIT**
- [ ] `manifest.json` contains the correct `id`, `name`, `version`, `author`, `description`, `minAppVersion`, and `isDesktopOnly`
- [ ] `versions.json` exists and includes an entry for the current release version
- [ ] `main.js` is built and committed for release artifacts
- [ ] `styles.css` is included if custom styling is required
- [ ] `package.json` scripts support `npm run dev` and `npm run build`
- [ ] The plugin builds cleanly with `npm run build`
- [ ] The plugin has been validated manually in a dev vault
- [ ] Release tag matches `manifest.json` version exactly and uses no `v` prefix
- [ ] GitHub release assets include `main.js`, `manifest.json`, and optional `styles.css`
- [ ] Community submission PR is prepared with a matching description and metadata
- [ ] `community-plugins.json` entry uses the exact same plugin `id`
- [ ] Submitted description matches `manifest.json` description exactly
- [ ] PR is opened against `obsidianmd/obsidian-releases` with the plugin template
- [ ] Submission checklist is fully completed
- [ ] Any validation failures are fixed by pushing another commit to the PR branch
