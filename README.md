# gltf-light

Browser-based tool to **preview and optimize `.glb` 3D models** — fully
client-side. Models are never uploaded to a server; all parsing, optimization,
and capture happen in the browser.

The app ships in two versions that live side by side in a single Next.js build:

| Route | Version | Notes |
| --- | --- | --- |
| `/` | **v2** (current) | Preview + non-destructive optimization, JA/EN UI, light/dark theme |
| `/legacy` | legacy (frozen) | The previous version, kept as-is; no new features |

## Features (v2)

**Preview**
- 3D viewer (plain three.js) with orbit controls and reset view
- Animation playback (per-clip toggle, play/pause, scrub)
- Material inspector (textures, roughness/metalness)
- Mesh-structure tree, click-synced with viewer picking
- Capture: export the view as a PNG with adjustable light/shadow and optional
  transparent background

**Optimize** (non-destructive — the original bytes are never mutated)
- Prune unused data + dedup
- Texture downscale — bulk (max resolution) or per-texture, incl. per-texture
  deletion
- Polygon reduction via `meshoptimizer` simplify (off by default)
- Auto Before/After estimate; the 3D view reflects the result
- One-click save of the optimized `.glb` (copyright metadata is preserved)

Upload by clicking the dropzone or dragging a `.glb` onto the viewer area.

## Architecture

- **Next.js App Router** with two route groups: `app/(v2)` (`/`) and
  `app/(legacy)` (`/legacy`). The two are fully decoupled — an ESLint
  `import/no-restricted-paths` rule forbids cross-imports so either can be
  removed independently.
- **3D layer**: plain `three.js` behind thin hooks (`useThreeStage`); no
  react-three-fiber.
- **Optimization**: `@gltf-transform/core` + `functions` run inside a **Web
  Worker** (`app/(v2)/pipeline/`) so the UI thread never blocks. The pipeline is
  non-destructive: the original `ArrayBuffer` is immutable and every run
  produces fresh bytes.
- **State**: Zustand (`modelStore` / `optimizeStore` / `uiStore`). `uiStore`
  (mode / theme / locale) is persisted to `localStorage`. Legacy still uses
  Recoil.
- **Styling**: CSS Modules (SCSS) + CSS custom properties for theme tokens.
- **i18n**: lightweight in-house dictionary (`app/(v2)/i18n/`). Locale is
  auto-detected from the browser on first visit, then persisted; a header switch
  toggles JA/EN. `en.ts` is typed against the `ja.ts` source, so a missing key
  is a compile error.
- **Analytics**: GA4 via `@next/third-parties` (see below). Only anonymous usage
  events are sent — never model bytes, content, or filenames.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (v2). The legacy app is at
[http://localhost:3000/legacy](http://localhost:3000/legacy).

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you need.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 measurement ID. When unset, GA is not loaded and nothing is sent (local/test builds stay silent). Set it in production to enable `page_view` (`/` and `/legacy`) + v2 custom interaction events. |

Custom-event parameters must be registered as custom dimensions/metrics in the
GA4 property to appear in reports.

## Scripts

```bash
npm run dev    # dev server
npm run build  # production build
npm start      # serve the production build
npm run lint   # ESLint (incl. the legacy/v2 decoupling guard)
npm test       # Vitest suite (once)
npm run test:watch
```

## Testing

Tests run on Vitest with Testing Library and jsdom. CI (`.github/workflows/ci.yml`)
runs lint, tests, and build on every pull request.
