# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

## [Unreleased]

### Added
- Documentation split: `docs/` folder with feature, dev, roadmap, design pages
- Early development warning in settings tab

## [0.1.9] - 2026-06-24

### Added
- Open note button in event modal
- cmd+click on calendar event opens note file

### Fixed
- Open note button alignment (grouped right after Delete, not far-right)
- Notes/description field renamed from `notes` to `description` (frontmatter + type)

### Changed
- UI polish: weekend bg visibility, Wednesday highlight, header rounding, mobile labels, hover fix
- Version bumped to 0.1.9 (manifest, package, versions.json)

## [0.1.8] - 2026-06-13

### Fixed
- Replace deprecated `display()` with `ColorComponent.setValue()` (#22 #23)

## [0.1.7] - 2026-06-13

### Added
- Artifact attestation for `styles.css` in release workflow (#20 #21)

## [0.1.6] - 2026-06-13

### Changed
- Default events folder renamed from `linDar-events` to `yearly-events` (#18 #19)

## [0.1.5] - 2026-06-13

### Added
- Assets folder (`hero.png`, `event-details.png`) tracked in git (#9 #10)

### Fixed
- Address review errors and warnings from Obsidian community review (#11 #12 #13 #14 #16)

## [0.1.4] - 2026-06-13

### Changed
- License replaced from GPL-3.0 to MIT (#7 #8)
- Plugin name set to **Lindar** (#5 #6)

## [0.1.3] - 2026-06-13

### Fixed
- Manifest `id` set to `lindar` (#3 #4)
- Plugin `id` renamed from `linear-calendar` to `lindar` (#1 #2)

### Added
- Release workflow (`.github/workflows/release.yml`)

## [0.1.2] - 2026-04-30

### Changed
- Plugin renamed from **linDar** to **Linear Calendar** across all source files, CSS classes, identifiers, assets, and documentation.

## [0.1.1] - 2026-04-23

### Added
- Event metadata schema fields: `event: true`, optional `type`, optional `participants`
- Event modal inputs for free-text `type` and line-based `participants`
- Storage and loading support for `type` and `participants` in frontmatter

### Changed
- Year view create/edit flow now preserves and persists event metadata
- README and contributor notes refined

### Compatibility
- Older event notes without `event`, `type`, or `participants` remain supported
- Notes with `event: false` are intentionally skipped

## [0.1.0] - 2026-04-21

### Added
- Phase 1 scaffold: plugin entry, settings, types, bundling, manifest
- Phase 2 base calendar view: yearly grid, month rows, sticky headers, day offsets
- Phase 3 event creation: click popup, date range, color picker, markdown storage
- Event editing and deletion from calendar
- Multi-day event rendering with cross-month continuity
- Event metadata schema foundations
- UI polish: event bars, year dropdown, color contrast, wheel capture, scroll behavior
