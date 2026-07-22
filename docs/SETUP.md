# PROJECT SELENE — Setup & Maintenance

> This is the **operator's manual** (for you). The public-facing profile is the
> generated `README.md`. You never edit that by hand — you edit
> [`selene.config.json`](../selene.config.json) and push.

---

## 1. First deploy

The profile only shows up on your GitHub account if it lives in a repo named
**exactly** after your username.

```bash
# 1. Create a PUBLIC repo on GitHub named:  ThiruVishagan10
#    (same as your username — this is the "profile repo")

# 2. From this folder:
git init
git add .
git commit -m "feat: PROJECT SELENE profile"
git branch -M main
git remote add origin https://github.com/ThiruVishagan10/ThiruVishagan10.git
git push -u origin main
```

Open `https://github.com/ThiruVishagan10` — the profile renders.

---

## 2. Turn on the two GitHub Actions

Both live in `.github/workflows/`. After the first push:

1. Go to your repo → **Settings → Actions → General**
2. Under *Workflow permissions*, select **Read and write permissions** → Save.
   (Both actions commit back to the repo, so they need this.)

| Workflow | What it does | Trigger |
|----------|--------------|---------|
| **Build Profile** (`build-profile.yml`) | Regenerates `README.md` + data SVGs from the config | on push to `selene.config.json` / the script, or manual |
| **Snake Animation** (`snake.yml`) | Builds the contribution-snake SVG → `output` branch | every 12h + manual |

Run each once manually to seed them: repo → **Actions** → pick the workflow →
**Run workflow**. The snake image (and streak/stats) fill in within a minute.

> The snake image 404s until `snake.yml` has run at least once — that's expected.

---

## 3. Editing your profile (the whole point)

Edit **`selene.config.json`**, commit, push. The Build Profile action rebuilds
everything and commits the result. Examples:

**Add your LinkedIn / portfolio / résumé** — fill the empty strings:
```jsonc
"contact": {
  "email":    "krithik@metronis.space",
  "linkedin": "https://www.linkedin.com/in/thiru-vishagan/",
  "portfolio":"https://your-site.dev",
  "resume":   "https://.../resume.pdf"
}
```
Empty string = button hidden. Filled = button appears. That's it.

**Add / edit a project** — add an object to `projects`:
```jsonc
{
  "name": "New Thing", "initial": "N", "repo": "new-thing",
  "status": "in-progress",            // shipped | in-progress | planning
  "desc": ["Line one of the pitch.", "Line two (keep it to two lines)."],
  "tech": ["Go", "Redis", "gRPC"]
}
```

**Advance the roadmap** — flip a status:
```jsonc
{ "label": "Docker", "status": "done" }   // planned → learning → done
```
The progress %, the drawn track length, and the pulsing "next" node all
recompute automatically.

**Change the boot terminal lines** — edit the `terminal` array
(`kind`: `value` = gold answer, `text` = plain, `status` = dot).

---

## 4. Working locally (optional)

```bash
npm run build      # regenerate everything without pushing
```
Then eyeball the SVGs in a browser and commit when happy. (No `npm install`
needed — the generator is pure Node, zero dependencies.)

---

## 5. What's generated vs. hand-authored

| Generated (don't edit) | Hand-authored (safe to edit) |
|------------------------|------------------------------|
| `README.md` | `assets/banner.svg` |
| `assets/terminal.svg` | `assets/divider.svg` |
| `assets/projects/*.svg` | `assets/stack.svg` |
| `assets/roadmap.svg` | `assets/*-cyan.svg` (alt theme) |
| `assets/contact/*.svg` | |

## 6. Retheme

Everything gold comes from the `T` token block at the top of
[`scripts/build.mjs`](../scripts/build.mjs). Change those hexes + rebuild to
recolor the whole generated set. A ready-made **Cyan & Violet** hero/divider
already ships as `assets/banner-cyan.svg` / `assets/divider-cyan.svg`.
