# Zine Viewer

A playful, papercraft-inspired interactive magazine viewer. Upload a PDF and flip through it like a handmade paper magazine — with realistic page-turning physics, tactile paper textures, and a whimsical Flash-era aesthetic.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Upload a PDF or click "try the demo" to see placeholder pages.

## Architecture

```
src/
├── App.tsx                    # Root: manages upload → loading → viewer flow
├── hooks/
│   └── usePdfLoader.ts        # PDF file → rendered pages pipeline
├── utils/
│   ├── pdf.ts                 # pdf.js rendering (pages → data URL images)
│   └── placeholders.ts        # Generates colorful demo zine pages
└── components/
    ├── DecorativeScene.tsx     # Background desk/stage with floating scraps
    ├── UploadPanel.tsx         # Drag-and-drop PDF upload landing screen
    ├── LoadingState.tsx        # Progress animation while rendering pages
    ├── ErrorState.tsx          # Friendly error display
    └── FlipbookViewer.tsx      # The hero: page-flip magazine with controls
```

## Customization

### Background / Visual Theme
Edit `DecorativeScene.tsx` — change the `SCRAPS`, `TAPES`, and `SHAPES` arrays for different floating decorations. The desk gradient is in the `desk` style object.

### Page Styling
In `FlipbookViewer.tsx`, the `pageStyles` object controls:
- `page.backgroundColor` — inner page color (default: off-white `#f9f5ec`)
- `cover.backgroundColor` — cover card stock color (default: `#e8e0cc`)
- `paperTexture` — the subtle grain overlay
- `gutterShadow` — the spine shadow between pages
- `cornerFold` — the hover corner-peel hint

### PDF Rendering Scale
In `usePdfLoader.ts`, the `scale` option (default `1.5`) controls render resolution. Higher = sharper pages but more memory. Range: `1.0` (fast/fuzzy) to `3.0` (crisp/heavy).

### Page Flip Physics
In the `<HTMLFlipBook>` props in `FlipbookViewer.tsx`:
- `flippingTime` — animation duration in ms (default: `800`)
- `maxShadowOpacity` — shadow darkness during flip (default: `0.4`)
- `swipeDistance` — minimum swipe px to trigger flip (default: `30`)

### Color Palette
CSS custom properties in `src/index.css`:
- `--kraft`, `--cream`, `--paper-white` — paper tones
- `--red-tape`, `--blue-sticker`, `--green-tab`, `--yellow-note` — accent colors
- `--desk-bg`, `--desk-surface` — background

## Tech Stack

- **React + Vite + TypeScript**
- **pdfjs-dist** v4 — PDF parsing and page rendering
- **react-pageflip** (StPageFlip) — realistic page-turn physics
- No backend required — everything runs in the browser

## Controls

- **Click/drag** pages to flip
- **Arrow keys** ← → to navigate
- **Space** to go forward
- **Home** to return to cover
- **F** for fullscreen
