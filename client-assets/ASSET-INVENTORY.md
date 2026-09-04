# BOVI ACCESS — Client Asset Inventory

Provenance record for every production image, and a working map of the
client's photographic library.

Source media is **git-ignored** (~470MB). This document is tracked, so the
mapping survives even though the files do not.

---

## 1. Where things are

```
client-assets/
  raw/       136 files — the client's original package (untracked)
  jpg/       136 files — JPG conversions, organised by service (untracked)
  selected/  curated shortlist (tracked)
```

**Backup:** the organised JPG library also exists outside the repo at
`~/Desktop/BOVI-Images-JPG`. The repo copy is a copy, not the only copy.

**Original Drive source:** the client's Google Drive folder
(`1t7kE74odw9cD9A_tWdSlXsSsph4M6PNC`). The local files are now the working
source of truth.

### Format breakdown of `raw/`

| Format | Count |
| --- | --- |
| HEIC | 82 |
| PNG | 35 |
| JPG | 19 |
| **Total** | **136** |

### HEIC — resolved, not a blocker

82 of the originals are HEIC, which browsers do not reliably display.
**A complete, correctly organised JPG conversion of the whole library
already existed** on the machine and has been brought into the repo as
`client-assets/jpg/`. No conversion work was required and **no original was
modified**.

Production derivatives are generated from the JPG library by
`npm run assets:images` using `sharp`.

---

## 2. Folder mapping

`raw/` uses the client's own folder names; `jpg/` is reorganised by service.

| `raw/` | `jpg/` | Files | Service mapping |
| --- | --- | --- | --- |
| `Logo` | `01-Logo` | 16 | Brand |
| `Window cleaning` | `02-Window-Cleaning` | 25 | Commercial Window Cleaning |
| `Repoint` | `03-Brickwork-Repointing` | 14 | Brickwork & Repointing |
| `Spda` | `04-Lightning-Protection` | 11 | Lightning Protection |
| `Waste pipe` | `05-Drainage-Pipes` | 12 | Drainage & External Pipe Repairs |
| `Window cleaning - liverpol` | `06-Window-Cleaning-Liverpool` | 10 | Commercial Window Cleaning |
| *(loose root files)* | `07-General-Rope-Access` | 48 | General / mixed |

Notes:

- **"Spda"** is Portuguese (*Sistema de Proteção contra Descargas
  Atmosféricas*) — lightning protection. The mapping is correct.
- **"Repoint" is partly mis-filed.** `IMG_0707`, `IMG_0710` and `IMG_0711`
  are gutter and downpipe shots (a blocked gutter, a downpipe with a plant
  growing out of it), not brickwork. They are the best available **Gutter
  Cleaning** imagery.
- `07-General-Rope-Access` duplicates a few Liverpool files (`IMG_4037`,
  `IMG_4045`, `IMG_4056`). Treat the Liverpool folder as canonical.

---

## 3. Logo variants — verified by inspection

All 16 logo files are 2000×2000 PNG. Alpha channel was checked per file;
**the JPG conversions destroyed transparency, so production logos are
generated from the raw PNGs.**

| File | Alpha | Content | Use |
| --- | --- | --- | --- |
| `Access - 1.PNG` | No | Green BOVI + white ACCESS on **baked black** | Reference only |
| **`Access - 1(1).PNG`** | **Yes** | Green BOVI + **white** ACCESS + white abseiler | **Full lockup — dark grounds** |
| `Access - 1(2)`, `1(3)` | Yes | Variants of the above | Spares |
| `Access - 2.PNG` | No | Green ring + white figure on **baked black** | **Favicon / app icon** |
| **`Access - 2(1).PNG`** | **Yes** | Green ring + white figure | **Icon — dark grounds** |
| `Access - 2(2)`, `2(3)` | Yes | Variants | Spares |
| **`Access - 3.PNG`** | **Yes** | Green BOVI + **dark grey** ACCESS | **Full lockup — light grounds** |
| `Access - 3(1)` | No | Opaque variant | Reference only |
| `Access - 3(2)`, `3(3)` | Yes | Variants | Spares |
| `Access - 4.PNG` | No | White abseiler on **baked grey** | Avoid — grey box |
| `Access - 4(1).PNG` | Yes | White abseiler, transparent | Mark — dark grounds |
| `Access - 5.PNG` | Yes | **Black** abseiler, transparent | Mark — light grounds |
| `Access - 5(1).PNG` | No | Opaque variant | Reference only |

The mark is a **rope-access abseiler descending inside the "O" of BOVI**.

### Generated production files

`npm run assets:brand` → from `client-assets/raw/Logo/`:

| Output | Source | Size |
| --- | --- | --- |
| `public/brand/bovi-access-lockup-on-dark.png` | `Access - 1(1).PNG` | 720×356 |
| `public/brand/bovi-access-lockup-on-light.png` | `Access - 3.PNG` | 720×357 |
| `public/brand/bovi-mark-on-dark.png` | `Access - 2(1).PNG` | 256×244 |
| `src/app/icon.png` | `Access - 2.PNG` | 512×512 |
| `src/app/apple-icon.png` | `Access - 2.PNG` | 180×180 |

The favicon uses the **opaque** dark-ground mark deliberately: it reads
correctly against any browser tab colour, light or dark.

**The logo was not redrawn or reinterpreted.**

---

## 4. Critical constraint — the library is portrait

Almost every client photograph is **3024×4032 portrait** (phone
photography). A handful are 1200×1600 or 1536×2048; `IMG_7448` is one of
the very few landscape frames.

**This shapes the design.** Compositions must be built for portrait
sources: full-bleed `object-fit: cover` with tuned `object-position`,
portrait-friendly editorial grids, offset crops. Do not design layouts that
assume wide landscape imagery — see `DESIGN.md` §6.

---

## 5. In production now

Generated by `npm run assets:images`. Every slot below is a genuine BOVI
photograph; alt text describes what is actually visible and never asserts a
client, project or place.

| Slot | Source file | Output | Size |
| --- | --- | --- | --- |
| Hero still / poster / fallback / default OG | `06-Window-Cleaning-Liverpool/IMG_4045.jpg` | `hero/hero-still.jpg` 1800×2400 | 722KB |
| Introduction | `07-General-Rope-Access/IMG_4184.jpg` | `home/introduction.jpg` 1200×1600 | 154KB |
| Service 01 — Commercial Window Cleaning | `02-Window-Cleaning/ca095fda-…jpg` | `services/commercial-window-cleaning.jpg` | 193KB |
| Service 02 — Brickwork & Repointing | `03-Brickwork-Repointing/IMG_1722.jpg` | `services/brickwork-repointing.jpg` | 129KB |
| Service 03 — Gutter Cleaning | `05-Drainage-Pipes/IMG_6272.jpg` | `services/gutter-cleaning.jpg` | 203KB |
| Service 04 — Drainage & External Pipe Repairs | `05-Drainage-Pipes/IMG_5861.jpg` | `services/drainage-external-pipe-repairs.jpg` | 171KB |
| Service 05 — Mastic & Sealant | `07-General-Rope-Access/IMG_4093.jpg` | `services/mastic-sealant.jpg` | 74KB |
| Service 06 — Pressure Washing / DOFF | `07-General-Rope-Access/IMG_9398.jpg` | `services/pressure-washing-doff-cleaning.jpg` | 227KB |
| Featured project | `06-Window-Cleaning-Liverpool/IMG_4077.jpg` | `home/featured-project.jpg` 1500×2000 | 330KB |
| Project 01 (landscape) | `02-Window-Cleaning/IMG_7448.jpg` | `home/project-01.jpg` 1600×1200 | 247KB |
| Project 02 (portrait) | `03-Brickwork-Repointing/IMG_1693.jpg` | `home/project-02.jpg` 1000×1333 | 234KB |
| Project 03 (portrait) | `04-Lightning-Protection/69a393a4-…jpg` | `home/project-03.jpg` 1200×1600 | 172KB |

**Why the hero frame.** Dramatic upward perspective; a technician mid-work on
a modern brick-and-copper-clad building; strong vertical lines; genuine
commercial context; sky at the top giving clean contrast for the H1. It holds
up cropped both to a wide desktop band and a tall mobile frame.

**Project cards deliberately show three different disciplines** — window
cleaning, brickwork, lightning protection — so the section reads as breadth of
capability rather than one repeated job.

### Letterbox trimming

`IMG_6272` and `IMG_5861` are iPhone **screenshots** (1170×2532) with black
bars baked in above and below the photograph. The generator trims them
(`trimBars: true`) before resizing, so the published crop is the photo, not the
screenshot. Several other client files share this shape — check the aspect
ratio (0.46 rather than 0.75) before using one.

### Service imagery honesty

Two services have **no genuine service-specific photography**:

| Service | Image used | Why it is acceptable |
| --- | --- | --- |
| Mastic & Sealant | `IMG_4093` — technician on rope at a glazed elevation | A real BOVI rope-access photograph. Alt text describes the technician and the elevation; it does **not** claim to show mastic work. |
| Pressure Washing / DOFF | `IMG_9398` — technician descending weathered masonry | A real BOVI photograph, and masonry is the actual DOFF context. Alt text describes the elevation, not the process. |

Both are flagged `imageIsGeneric: true` in `src/lib/content/home.ts` so the gap
stays visible in code rather than being quietly forgotten. Replace them as soon
as genuine imagery is supplied — see §7.

## 6. Shortlist for Phase 2 / 3

Candidates only — not yet cut into derivatives.

| Slot | Candidates |
| --- | --- |
| Introduction | `02-Window-Cleaning/1886bb55-…jpg` (team on a curved glass tower), `07/IMG_4184.jpg` |
| Commercial Window Cleaning | `02/ca095fda-…jpg`, `02/d184c48c-…jpg`, `02/IMG_9304.jpg`, `02/IMG_9308.jpg` |
| Brickwork & Repointing | `03/IMG_1722.jpg` (chimney stack against sky), `03/IMG_1698.jpg`, `03/IMG_1745.jpg` |
| Gutter Cleaning | `03/IMG_0710.jpg`, `03/IMG_0711.jpg`, `07/IMG_9342.jpg`, `07/IMG_9376.jpg` *(mis-filed in "Repoint")* |
| Drainage & External Pipe Repairs | `05/IMG_5859–5865.jpg`, `05/IMG_6272–6275.jpg`, `03/IMG_0707.jpg` |
| Lightning Protection | `04/1fcabe8b-…jpg`, `04/4c19f2c3-…jpg`, `04/dc4aec95-…jpg` (tape/conductor close-up) |
| Pressure Washing / DOFF | **None identified** — see §7 |
| Mastic & Sealant | **None identified** — see §7 |
| Roof & Roofline Repairs | `07/IMG_6361.jpg`, `07/IMG_6362.jpg` (slate roof, rope protection) |
| About / Safety | `07/IMG_2983.jpg`, `07/IMG_2986.jpg` (technicians in PPE and respirators) |
| Featured Project | `06-Window-Cleaning-Liverpool` set — the most coherent single job in the library |
| Project cards | Liverpool set · `02` glass-tower set · `03` chimney set |

---

## 7. Gaps — client action needed

1. **No Pressure Washing / DOFF imagery.** This is one of the two services
   with a confirmed legacy Wix URL, so it matters for SEO continuity.
2. **No Mastic & Sealant imagery.**
3. **No hero video.** Architecture is ready and waiting for a URL.
4. **No verified project metadata.** Photographs exist; titles, clients,
   locations, dates and scopes do not. Until they are supplied, no project
   can be published (`CONTENT-RULES.md` §1).
5. **Coverage vs Liverpool.** A meaningful part of the library is from
   Liverpool, while approved coverage is "London & the South East". Worth
   clarifying with Renan before these images anchor a project page.

Until 1 and 2 are resolved, those service pages use a tasteful neutral
layout or a genuine broader BOVI image — **never** substitute imagery.

---

## 8. Regenerating

```bash
npm run assets:brand    # logos + favicons from raw/Logo
npm run assets:images   # web derivatives from jpg/
```

Both read from `client-assets/` and write to `public/` or `src/app/`.
**Neither ever writes back to `client-assets/`.** Originals are immutable.
