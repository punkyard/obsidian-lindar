# Development

## Prerequisites

- `git`
- Node.js (current LTS recommended)
- `npm`
- Obsidian
- a separate Obsidian vault for plugin development

## Local development loop

```bash
npm install      # install deps
npm run dev      # watch + build
npm run build    # production build
eslint ./src/    # lint
```

From the plugin folder:

- run `npm install`
- run `npm run dev`
- let the build watch process regenerate `main.js` on changes
- reload Obsidian after manifest changes
- enable the plugin in **Settings → Community plugins**

## Project structure

```
src/
  main.ts       # lifecycle only (onload, onunload, addCommand)
  settings.ts   # interface + DEFAULT_SETTINGS
  types.ts
  commands/
  ui/
  utils/
```

Keep `main.ts` minimal — delegate all logic to modules.

### Expected project files

- `src/main.ts` — plugin entry point
- `src/settings.ts` — settings model and defaults
- `src/types.ts` — shared calendar and event types
- `manifest.json` — plugin metadata
- `package.json` — scripts and dependencies
- `tsconfig.json` — TypeScript configuration
- `esbuild.config.mjs` — bundling configuration
- `versions.json` — plugin version compatibility map
- `README.md` — user-facing documentation
- `LICENSE` — MIT license text

## Testing

Copy `main.js` + `manifest.json` + `styles.css` to `<Vault>/.obsidian/plugins/<plugin-id>/`, reload Obsidian, enable in **Settings → Community plugins**.

## Development expectations

- test inside a separate development vault, not a primary vault
- prefer modular files over a large `main.ts`
- use Obsidian APIs for settings, commands, views, and cleanup registration
- keep startup work light and defer heavy rendering until needed
- avoid network behavior in v1 unless clearly documented and user-controlled

## Notes for contributors

- Keep `type` free-form (do not enforce a strict enum).
- Treat schema additions as backward-compatible unless explicitly marked breaking.
- Prefer small frontmatter keys and stable semantics across releases.

## Current status

- [x] Yearly horizontal calendar grid with sticky month labels and headers
- [x] Event creation popup and markdown-backed event storage
- [x] Single-day and multi-day event rendering in month rows
- [x] Edit and delete events from the calendar
- [x] Render continuous multi-day event bars below date numbers
- [x] Improve month-list wheel capture, scroll behavior, and responsive lane layout
- [x] Finalize month event lane scrolling in empty tail areas
- [x] Polish event bars: spacing, contrast, and overflow
- [x] Add optional event type and participants metadata to stored event notes
- [ ] Complete release readiness documentation and tests

## Performance backlog (deferred)

High-impact runtime optimizations already in place (event cache, coalesced rendering, stale-render guards).

For larger vaults:

- [ ] Incremental rendering (update only changed month rows instead of rebuilding the full year view)
- [ ] Background/preload event parsing strategy for very large event collections
- [ ] Vault file-change listeners to keep in-memory event cache hot without explicit reloads
