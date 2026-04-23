# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

## [Unreleased]

## [0.1.1] - 2026-04-23

### Added
- Event metadata schema fields: `event: true`, optional `type`, optional `participants`.
- Event modal inputs for free-text `type` and line-based `participants`.
- Storage and loading support for `type` and `participants` in frontmatter.
- README updates describing metadata schema and compatibility behavior.

### Changed
- Year view create/edit flow now preserves and persists event metadata.
- Documentation wording, quick-start flow, and contributor notes refined.

### Compatibility
- Older event notes without `event`, `type`, or `participants` remain supported.
- Notes with `event: false` are intentionally skipped.
