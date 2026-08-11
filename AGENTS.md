# AGENTS.md

## Project

Obsidian community plugin **Photo Album** (`id: photo-album`). Renders `photoalbum` fenced code blocks as an image grid, with WebP thumbnail caching under the plugin directory.

Stack: TypeScript, Obsidian API (`obsidian` package), esbuild → single `main.js` (CJS). No test suite. `isDesktopOnly: false` — keep mobile compatibility.

Human docs: `README.md`. Official plugin API/guidelines: https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines

## Layout

```
src/
  main.ts            # PhotoAlbumPlugin — commands, settings tab, markdown postprocessor
  Album.ts           # parse meta, list images, render grid, open photo
  AlbumInsert.ts     # insert ```photoalbum``` block (plain or callout)
  AlbumListModal.ts  # SuggestModal to pick an album folder
  ThumbnailCache.ts  # generate/read WebP thumbs via canvas
  Settings.ts        # settings interface + PluginSettingTab
  Constants.ts       # IMAGE_EXTENSIONS, WEBP_QUALITY, CACHE_DIR_NAME
styles.css           # plugin styles (shipped with release)
manifest.json        # plugin manifest (keep in sync with package.json version)
esbuild.config.mjs   # bundler
version-bump.mjs     # used by `npm version`
```

Release artifacts: `main.js`, `manifest.json`, `styles.css`. `main.js` is gitignored; CI builds it on tag push (`.github/workflows/release.yml`).

## Commands

```bash
npm install
npm run dev      # esbuild watch
npm run build    # tsc -noEmit + production bundle
npm version patch|minor|major   # bumps package + manifest via version-bump.mjs
```

After code changes, run `npm run build` and fix type errors before finishing.

## Architecture

1. **Code block language:** `photoalbum`. Processor looks for `code.language-photoalbum` inside a `pre` via `registerMarkdownPostProcessor` (not `registerMarkdownCodeBlockProcessor`).
2. **Block syntax:**
   ```
   ```photoalbum
   title: "Trip"
   folder: "trip-to-bali"
   ```
   ```
   `folder` is required; relative to settings `albumFolderPath` (default `Albums`).
3. **Flow:** parse meta → list images in album subfolder → `ThumbnailCache.getOrGenerateThumbnails` → render CSS grid → click opens file in a new leaf.
4. **Cache path:** `{plugin.manifest.dir}/thumbnails/{albumFolder}/{basename}.webp`. Changing thumbnail size calls `ThumbnailCache.invalidateAllCache`.
5. **Settings:** `albumFolderPath`, `columns` (1–12), `thumbnailSize` (100–800). Persist with `loadData` / `saveData`.

## Conventions

- **Imports:** `tsconfig` `baseUrl` is `src`, so use bare imports: `import { Album } from 'Album'`.
- **Indent:** tabs, width 4 (see `.editorconfig`).
- **UI text:** Sentence case (Obsidian style). No default hotkeys for commands.
- **DOM:** use `createEl` / `createDiv` / `createSpan`; never `innerHTML` with user data.
- **Styles:** prefer classes + Obsidian CSS variables (`var(--text-muted)`, etc.) over hardcoded colors. Grid columns use `--album-columns`.
- **Images:** extensions live only in `Constants.IMAGE_EXTENSIONS`. Thumbnails are square canvas WebP at `WEBP_QUALITY`.
- **Async:** prefer `async`/`await`. Prefer `const`/`let` over `var`.
- **Cleanup:** register resources via Plugin helpers (`addCommand`, `registerMarkdownPostProcessor`, etc.) so unload cleans them up.
- Do not edit generated `main.js` by hand; change `src/` and rebuild.
- Keep `manifest.json` `version` aligned with `package.json` when releasing.

## Boundaries

- Do not add Node/Electron-only APIs that break mobile unless the feature is clearly desktop-gated.
- Do not commit secrets, vault `data.json`, or local thumbnail caches.
- Prefer small, focused changes that match existing class/static-method style in `src/`.
