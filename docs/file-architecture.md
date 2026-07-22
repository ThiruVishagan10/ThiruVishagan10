
# PROJECT SELENE — Architecture

> A GitHub Profile that feels like booting the control panel of an AI-powered
> Software Engineer. Original visual language: **VisionOS glass + Windows
> Terminal + Raycast**. Not Iron Man. Not cyberpunk.

---

## 1. Design Constraints (the reality of GitHub READMEs)

GitHub sanitizes README HTML aggressively. This dictates the whole architecture:

| Want | Allowed on a profile README? | Our strategy |
|------|------------------------------|--------------|
| `<style>` / CSS classes | ❌ stripped | Push all styling **inside SVG files** |
| `<script>` | ❌ stripped | No JS; animation via SMIL/CSS-in-SVG |
| Inline `style=""` | ⚠️ mostly stripped | Avoid; rely on SVG + tables |
| Animated SVG as `<img>` | ✅ renders (SMIL + `<style>` inside the SVG) | **Core technique** |
| `<picture>` theme switch | ✅ works | Light/dark asset swapping |
| `<details>`/`<summary>` | ✅ works | Easter eggs, collapsibles |
| `<a title="">` hover text | ✅ works | Hover tooltips |
| Alignment via `<div align>` / tables | ✅ works | Layout skeleton |

**Consequence:** every "animated / glowing / typing" effect lives in a
**self-contained `.svg` file** referenced as an image. The `README.md` is a thin
composition layer that arranges these SVG modules. This is what makes it feel
premium instead of a badge-spam wall.

---

## 2. Visual System (design tokens)

```
Background      #0D1117   base surface
Surface glass   #161B22 @ 60% + 1px #FFFFFF14 border   (glass panels)
Primary accent  #00E5FF   cyan   — headings, active glow, scan lines
Secondary       #8B5CF6   violet — gradients, secondary highlights
Text            #F8FAFC
Muted           #94A3B8
Success         #34D399   (roadmap ✓, status "shipped")
Warning         #FBBF24   (status "in progress")

Font stack (SVG): "SF Mono", "JetBrains Mono", ui-monospace  (terminal feel)
Display        : system-ui / Inter fallback for headings
Radius         : 16px panels, 10px chips
Glow recipe    : feGaussianBlur stdDeviation 2–4 + additive cyan/violet
Grid           : 32px cells, #FFFFFF08 lines, slow parallax drift
```

Every SVG imports these same tokens so all 8 modules read as one OS.

---

## 3. Module Map (top → bottom of the profile)

```
┌─ 01 HERO BANNER ─────────── assets/banner.svg          (animated)
│    grid + particles + gradient light + typing headline
├─ 02 BOOT TERMINAL ───────── assets/terminal.svg        (animated)
│    > boot / whoami / role / stack / mission  (typed sequentially)
├─ 03 ABOUT ───────────────── README.md (prose + glass rule)
├─ 04 TECH STACK ──────────── assets/stack/*.svg         (6 grouped panels)
│    Backend · Frontend · Cloud · Databases · AI · Tools
├─ 05 FEATURED PROJECTS ───── assets/projects/*.svg      (4 cards)
│    IdeaPulse · Go URL Shortener · Task Manager · PathBridge
├─ 06 GITHUB ANALYTICS ────── external services, themed  (stats/streak/langs/activity/trophy)
├─ 07 ROADMAP 2026 ────────── assets/roadmap.svg         (animated checklist)
├─ 08 CONTACT ─────────────── assets/contact chips + links
└─ ·· SNAKE + EASTER EGGS ─── .github/workflows/snake.yml + <details>
```

---

## 4. Folder Structure

```
github-profile/                 (repo root = your GitHub username repo)
├── README.md                   ← composition layer
├── assets/
│   ├── banner.svg              ← 01 hero (animated)
│   ├── terminal.svg            ← 02 boot terminal (animated)
│   ├── roadmap.svg             ← 07 roadmap (animated)
│   ├── divider.svg             ← reusable glass section rule
│   ├── stack/
│   │   ├── backend.svg   frontend.svg  cloud.svg
│   │   └── databases.svg ai.svg        tools.svg
│   ├── projects/
│   │   ├── ideapulse.svg     url-shortener.svg
│   │   └── task-manager.svg  pathbridge.svg
│   └── icons/                 ← shared symbol defs (go, react, aws, …)
├── .github/
│   └── workflows/
│       └── snake.yml          ← generates snake contribution animation
└── docs/
    └── file-architecture.md   ← this file (design source of truth)
```

`README-assets/` from the sketch is folded into `assets/` to keep one asset root.

---

## 5. Build Order (each = one approval gate)

| # | Component | Deliverable | Depends on |
|---|-----------|-------------|-----------|
| 0 | Scaffold + tokens | folders, `divider.svg`, token block | — |
| 1 | **Hero banner** | `assets/banner.svg` | tokens |
| 2 | **Boot terminal** | `assets/terminal.svg` | tokens |
| 3 | About + README skeleton | `README.md` sections 01–03 wired | 1,2 |
| 4 | Tech stack panels | `assets/stack/*.svg` | tokens |
| 5 | Project cards | `assets/projects/*.svg` | tokens |
| 6 | GitHub analytics | themed external embeds | username |
| 7 | Roadmap | `assets/roadmap.svg` | tokens |
| 8 | Contact + Snake + Easter eggs | chips, `snake.yml`, `<details>` | username |
| 9 | Final assembly + QA | complete `README.md` | all |

We build **one row at a time** and you approve before the next.

---

## ★ FINAL STATE (as shipped) — config-driven

The profile evolved into a **generated project**. One config is the source of
truth; a build script + GitHub Action regenerate everything.

```
selene.config.json          ← EDIT THIS (identity, about, terminal, projects, roadmap, contact)
scripts/build.mjs           ← generator (pure Node, no deps)
.github/workflows/
  ├── build-profile.yml     ← on push → rebuild README + data SVGs → auto-commit
  └── snake.yml             ← every 12h → contribution snake → `output` branch
package.json                ← `npm run build`
docs/SETUP.md               ← operator manual (deploy, enable Actions, edit)

GENERATED (never hand-edit):  README.md · assets/terminal.svg ·
                              assets/projects/*.svg · assets/roadmap.svg ·
                              assets/contact/*.svg
STATIC (hand-authored):       assets/banner.svg · assets/divider.svg ·
                              assets/stack.svg · assets/*-cyan.svg (alt theme)
```

**Theme:** Black & Gold (`#0A0A0B` / `#E8C25A`). Tokens live in the `T` block of
`build.mjs`; Cyan & Violet ships as an alternate (`*-cyan.svg`).

**Chosen theme, decorative signature:** SELENE = moon → the hero's glowing
orbital AI core (rings + satellites), reading as a golden moon in this palette.

All 9 components complete. Deploy via `docs/SETUP.md`.

---

## 6. Inputs I need before wiring links (Component 6+)

- GitHub ThiruVishagan10 (for repo links, stats, snake, trophy)
- LinkedIn URL
- Portfolio URL
- Resume link (PDF/Drive)
- Any repo names that differ from the display names above

Hero/terminal/stack/projects (Components 1–5) don't need these — we can start now.
```
