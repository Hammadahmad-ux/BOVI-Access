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
| Service 05 — Mastic & Sealant | `07-General-Rope-Access/IMG_9969.jpg` | `services/mastic-sealant.jpg` | 376KB |
| Service 06 — Pressure Washing / DOFF | `07-General-Rope-Access/IMG_9398.jpg` | `services/pressure-washing-doff-cleaning.jpg` | 227KB |
| ~~Featured project~~ | ~~`06-Window-Cleaning-Liverpool/IMG_4077.jpg`~~ | **Retired.** The homepage Featured Project block now leads with the External Pipe Repair job, which is the project flagged `featured` on /portfolio, so the derivative it used to show is unreferenced and no longer generated. | |
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

### Phase 3 additions

| Slot | Source file | Output |
| --- | --- | --- |
| Service 07 — Roof & Roofline Repairs | `07-General-Rope-Access/IMG_9419.jpg` | `services/roof-roofline-repairs.jpg` |
| Service 08 — Lightning Protection | `04-Lightning-Protection/cf652e84-…jpg` | `services/lightning-protection.jpg` |
| About — hero | `02-Window-Cleaning/1886bb55-…jpg` | `about/hero.jpg` |
| About — full-bleed elevation | `02-Window-Cleaning/5df96089-…jpg` | `about/elevation.jpg` |
| About — safety | `07-General-Rope-Access/IMG_2983.jpg` | `about/safety.jpg` |
| Portfolio — hero | `02-Window-Cleaning/IMG_3384.jpg` | `portfolio/hero.jpg` |
| Project 04 | `06-Window-Cleaning-Liverpool/IMG_4063.jpg` | `home/project-04.jpg` |
| Project 05 | `05-Drainage-Pipes/IMG_5865.jpg` (trimmed) | `home/project-05.jpg` |
| Project 06 | `04-Lightning-Protection/4c19f2c3-…jpg` | `home/project-06.jpg` |

The six primary service images were regenerated at **1400px** (was 1000px)
because they now serve the service-page hero as well as the Homepage stage.

`IMG_6361` was rejected for the roof slot: it is a phone screenshot whose
letterbox bars are not pure black, so `trimBars` left it at a 0.45 aspect.
`IMG_9419` is a genuine photograph and was used instead. **Check the aspect
ratio (0.75 = photo, ~0.46 = screenshot) before adopting any new source.**

### Hero background video

**Replaced with the client's own BOVI footage.** The temporary clip whose
provenance was never confirmed is gone, and so is that launch blocker.

| Item | Value |
| --- | --- |
| Source | `client-assets/hero-new-background.mov` (git-ignored, never modified) |
| Generated by | `npm run assets:video` |
| Duration | 36.03s |
| Source format | 1080×1920 **portrait**, HEVC Main 10, **Dolby Vision profile 8.4 / HLG BT.2020**, 60fps, 12970 kb/s, **with AAC audio**, 55.7MB |
| Desktop derivative | `public/media/bovi-hero-desktop.mp4` — 1920×1080, H.264 High, CRF 29, 30fps, silent, faststart, **7.42MB** |
| Mobile derivative | `public/media/bovi-hero-mobile.mp4` — 810×1440, H.264 High, CRF 33, 30fps, silent, faststart, **5.26MB** |

**Provenance.** The montage carries a **BOVI ACCESS watermark** burned
into the lower-left of most clips, and the content is consistent with the
verified photography in this library — rope-access technicians working
glazing, descending elevations, rigging at roof level, handling lifting
chains. This is BOVI's own material. For completeness: the container also
carries `te_is_reencode: 1` and a `DreaminaMetaInfo` tag, i.e. it was
exported through an editing app in the CapCut/Dreamina family. That is
what assembling a montage looks like and is not itself a concern; it is
recorded here so nobody has to re-derive it later.

#### Why two derivatives rather than one

The source is portrait and the desktop hero is wide. Cropping 9:16 to
16:9 discards three quarters of the picture and stretching it is not an
option, so the desktop file is a **composition built from the same
footage**: a copy scaled to fill 1920×1080, blurred (`gblur sigma=42`)
and darkened, with the untouched portrait frame laid over it at its own
aspect ratio toward the right, its vertical edges feathered so there is
no pillarbox seam, and a left-weighted gradient baked in because the hero
typography lives on the left.

The panel is **inset** from the right edge (x=1056 of 1920), not flush
with it. The hero renders with `object-fit: cover`, so 1024px viewports
lose roughly 230px from each side; flush right would lose a third of the
panel, inset loses about 6%.

Below 1024px the phone simply gets the portrait frame, which fits a
portrait viewport almost exactly — at 390×800 barely 30px is lost from
each side.

#### Three things that had to be handled

1. **HDR.** BT.2020 with an HLG transfer. Encoding it to H.264 with only
   `-pix_fmt yuv420p` produces the washed-out grey result you get when
   wide-gamut values are reinterpreted as BT.709. The script tone maps
   properly (linearise → Hable → BT.709).
2. **A runaway filter graph.** The two mask PNGs are `-loop 1` inputs and
   never end, so without `shortest=1` on every framesync filter the
   encode keeps producing frames after the video runs out. The first
   attempt reached 40MB and was still going.
3. **The audio track**, removed — a muted background video has no use for
   it.

#### File weight

The montage is 36s where the old clip was 17.5s, so at equivalent quality
it costs roughly twice the bytes: **7.42MB desktop, 5.26MB mobile**,
against 3.60MB before. Homepage transfer measured 8.74MB desktop and
6.26MB mobile, with LCP 608ms / 448ms and CLS 0 — the poster still
carries LCP, and the video only begins downloading after hydration.

CRF and resolution are the only real levers here: dropping to 24fps saves
nothing, because CRF targets quality per frame and fewer frames simply
cost more each. Mobile is 810px rather than 1080 and CRF 33 rather than
31 because it is 100% sharp handheld footage where the desktop file is
mostly cheap blur; at a real 390px phone width CRF 31 and 33 are
indistinguishable, and 33 saves 1.4MB on the connection least able to
afford it.

**If the pages need to be lighter, the honest lever is a shorter edit** —
which is the client's call, not ours.

#### Contrast

The new footage is brighter than both the old clip and the still, so the
scrim was re-tuned and re-measured against live video frames rather than
assumed. Desktop passes with the flat scrim reduced to 40% (the encode
carries its own baked gradient, and stacking a second full-strength scrim
would have left the client's footage looking switched off).

On mobile the raw footage is full-bleed and two elements failed AA: the
supporting paragraph in `mist` at 3.2:1 and the eyebrow in `green-bright`
at 3.4:1. Rescuing those by darkening alone would have needed roughly
**85% black over the whole frame** — the one thing this revision must not
do. Both are set to `bone` below `lg` instead, which clears AA at 6.5:1
and 8.9:1 with the footage still visible. Green and mist return at `lg`,
where they measure 6.7:1 and 5.8:1.

Measured worst-case, glyph rect by glyph rect, across six video frames at
1440 / 1024 / 390 / 375: **zero failures**.

Reduced-motion users get the still photograph and **no video is
requested at all**.

### Letterbox trimming

`IMG_6272` and `IMG_5861` are iPhone **screenshots** (1170×2532) with black
bars baked in above and below the photograph. The generator trims them
(`trimBars: true`) before resizing, so the published crop is the photo, not the
screenshot. Several other client files share this shape — check the aspect
ratio (0.46 rather than 0.75) before using one.

### Service imagery honesty

**Corrected in the client revision pass.** Renan reviewed the live
preview and reported that the Mastic & Sealant page showed a window
cleaning photograph. He was right, and more specifically right than the
note that used to sit here: `IMG_4093` shows a technician on rope at a
glazed elevation **carrying a window cleaner's bucket with a squeegee in
it**. Calling it "generic" was too generous — it depicts a different
service.

It was worse than a bad crop, because the earlier audit had recorded
"no genuine Mastic & Sealant photography exists". That was wrong. A
complete joint-sealing job sits in `07-General-Rope-Access`, which is
the unsorted folder, so it was never read as service imagery:

| File | What is actually visible |
| --- | --- |
| `IMG_9969` | Technician applying sealant from a **cordless applicator gun** into a vertical joint; fresh bead visible along the joint |
| `IMG_9892` | Technician feeding **backer rod** into a joint, pointing tool in hand, sealant gun on the ledge below |
| `IMG_9966` | Second technician on the same elevation, backer strips on the harness |
| `IMG_9896` | Two technicians working panel joints on a rendered elevation |

`IMG_9969` is now the hero and the other three are the gallery. Mastic &
Sealant is no longer flagged generic in `src/lib/content/services.ts`,
because it no longer is.

**The lesson for future audits:** `07-General-Rope-Access` is a mixed
folder, not a folder of unusable images. Read it per-file before
concluding a service has no coverage.

One service still has none:

| Service | Image used | Why it is acceptable |
| --- | --- | --- |
| Pressure Washing / DOFF | `IMG_9398` — technician descending weathered masonry | A real BOVI photograph, and masonry is the actual DOFF context. Alt text describes the elevation, not the process. |

It stays flagged `mediaIsGeneric: true` in `src/lib/content/services.ts`
and carries **one** extra image rather than a pair — see §7.

### Service galleries

Added in the client revision pass, after Renan asked for more pictures on
the internal pages. These feed the `gallery` field that already existed
on the Sanity `service` document, so he can replace any of them in Studio
without a code change.

Slot `-01` is the large mid-page image; `-02` and `-03` are the
asymmetric pair beneath the overview. **The pair renders only when both
exist**, so a service with thin coverage is simply shorter.

| Service | `-01` | `-02` | `-03` |
| --- | --- | --- | --- |
| Commercial Window Cleaning | `02/810C5448-….jpg` | `02/IMG_9304.jpg` | `02/bd7eada4-….jpg` |
| Brickwork & Repointing | `03/IMG_1718.jpg` | `03/IMG_1745.jpg` | `03/IMG_1698.jpg` |
| Gutter Cleaning | `03/IMG_0710.jpg` | `05/IMG_6274.jpg` | `03/IMG_0707.jpg` |
| Drainage & External Pipe Repairs | `05/PHOTO-2024-12-27-10-54-10.jpg` | `05/IMG_5859.jpg` | `05/IMG_5863.jpg` |
| Mastic & Sealant | `07/IMG_9892.jpg` | `07/IMG_9966.jpg` | `07/IMG_9896.jpg` |
| Pressure Washing / DOFF | `07/IMG_9664.jpg` | — | — |
| Roof & Roofline Repairs | `07/IMG_9420.jpg` | `07/IMG_6403.jpg` | `03/IMG_0706.jpg` |
| Lightning Protection | `04/dc4aec95-….jpg` | `04/7c7e3f8d-….jpg` | `04/fe14fd76-….jpg` |

Notes:

- **The gutter frames come from "Repoint"** — `IMG_0707`, `IMG_0710` and
  `IMG_0711` were always mis-filed (§2). They are the library's only real
  gutter imagery and are now used as such.
- `07/IMG_6403` is one of the few frames where the **BOVI Access hoodie
  is legible**. It is used on Roof & Roofline Repairs.
- Before this pass the service template re-used `heroMedia` for the
  "Access and delivery" figure, so **every service page showed the same
  photograph twice**. `gallery[0]` replaces it.
- Several sources are 1170×2532 full-screen phone frames (aspect 0.462).
  These are photographs, **not** letterboxed screenshots — top and bottom
  bands were sampled and no bar was found — so `trimBars` correctly leaves
  most of them alone.
- **Boxes stay portrait at every width.** A landscape mobile crop was
  tried on the pair and cut the heads off technicians; the library is
  almost entirely 3:4 phone photography (§4).

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

### Project groupings

Added when the Projects page was rebuilt as a completed-work gallery. The
client asked for photographs of real jobs with a short description each,
rather than category tiles linking to service pages — and pointed out the
symptom, two Lightning Protection entries on one page.

**Every group below was verified by eye as a contact sheet**, not taken on
trust from the folder name. One job = one project = one page.

| Project | Source set | Frames | What confirms it is one job |
| --- | --- | --- | --- |
| External Pipe Repair | `05/PHOTO-2024-12-27` + `IMG_5859/5860/5861` | 4 | Same cream glazed-brick lightwell, same black cast iron stacks, in every frame |
| Gutter & Downpipe Clearance | `03/IMG_0706/0707/0710/0711` | 4 | Consecutive camera numbering; the same buff-and-red brick block and estate context |
| Brickwork Repointing | `03/IMG_1722/1718/1745/1698` | 4 | Same weathered stock brick, same orange rope and rigging, same roof |
| Lightning Protection Works | `04/7c7e3f8d` + `4c19f2c3/cf652e84/dc4aec95` | 4 | All eleven frames in the folder are the same red brick block |
| Mastic & Sealant Renewal | `07/IMG_9969/9966` | 2 | See the warning below |
| Commercial Glazing Clean | `06/IMG_4045/4063/4037/4097` | 4 | Whole folder is one apartment block, same cladding and balconies |

> **The sealant project was nearly wrong.** `07/IMG_9892` and `IMG_9896`
> were originally grouped with `9966/9969` as one job. They are not: 9892
> and 9896 are a rendered elevation beside a railway line, 9966 and 9969
> are a brick-and-panel block. Two buildings, two jobs. Presenting them as
> one would have been exactly the fabrication CONTENT-RULES.md §2 forbids,
> so the project is the brick-and-panel site only — the one where the
> sealant gun and the bead in the joint are both visible. That leaves it
> with two photographs instead of four, which is the honest number.

**Only ONE distinct external-pipework job exists in the library.** The
client has said his first two jobs were drainage and pipe repairs; the
`05-Drainage-Pipes` folder holds that one pipework job plus a separate
gutter-clearance job on a different building (`IMG_6272-6275`, orange
brick, used as service imagery). If the second of those two jobs is one of
the gutter sets, Renan can say so and the label changes — but nothing here
guesses at it.

**No project carries a client, address, location, date or value**, because
none has been verified. Titles say what the work was.

---

## 7. Gaps — client action needed

1. **No Pressure Washing / DOFF imagery.** This is one of the two services
   with a confirmed legacy Wix URL, so it matters for SEO continuity.
   It is now the ONLY service still in this position.
2. ~~No Mastic & Sealant imagery.~~ **Resolved** — see § Service imagery
   honesty. Four genuine joint-sealing frames were found in the unsorted
   general folder.
3. ~~Hero video replacement pending.~~ **Resolved** — the client supplied
   `hero-new-background.mov`, his own watermarked BOVI montage, and it is
   live. Swapping it again remains a one-value change
   (`DEFAULT_HERO_VIDEO` / `DEFAULT_HERO_VIDEO_NARROW` in
   `src/lib/config/hero-media.ts`, or the Sanity Homepage field — which
   now actually reaches the page, see below).
4. ~~The homepage CMS fields are not wired up.~~ **Resolved.**
   `getHomepage()` was written in Phase 4 and called from nowhere, so
   every homepage field Renan could edit in Studio changed nothing on the
   page. All of them now reach it: hero supporting copy, introduction
   copy and image, service-area copy, closing CTA copy, featured project
   and selected projects — read by `Hero`, `Introduction`, `Coverage`,
   `FinalCta`, `FeaturedProject` and `ProjectGrid` respectively. Each
   falls back to the verified local content when blank, which is why the
   empty Homepage document the project ships with renders unchanged.
5. **No verified project metadata.** Six projects are now published as a
   completed-work gallery using service-led titles that are true of the
   photographs. What is still missing is anything that would let a project
   name a **client, address, location, date or scope** — supply any of
   those and the page shows them; leave them and it shows nothing rather
   than a guess.
6. **Coverage vs Liverpool.** A meaningful part of the library is from
   Liverpool, while approved coverage is "London & the South East". Worth
   clarifying with Renan before these images anchor a project page.

Until 1 is resolved, that service page uses a genuine broader BOVI image
and carries fewer photographs than the rest — **never** substitute
imagery from another service.

---

## 8. Regenerating

```bash
npm run assets:brand    # logos + favicons from raw/Logo
npm run assets:images   # web derivatives from jpg/
```

Both read from `client-assets/` and write to `public/` or `src/app/`.
**Neither ever writes back to `client-assets/`.** Originals are immutable.
