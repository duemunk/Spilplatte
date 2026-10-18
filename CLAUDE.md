# Spilplatte

Web games made by kids, played on an **iPad running iOS 12 Safari**, hosted on GitHub Pages
at https://duemunk.github.io/Spilplatte/. All building happens through Claude Code.

## Hard rules (iOS 12)
- Plain `<script>` files, no build step, no frameworks, no ES modules, no CDN imports.
- JavaScript must be **ES2017**: no `?.`, no `??`, no class fields, no `Array.prototype.flat`,
  no `Object.fromEntries`. Run `npx --yes es-check@7 es2017 sw.js 'shared/**/*.js' 'games/**/*.js'`
  before pushing; CI runs the same check.
- Navigate with `location.href = ...`, never a plain `<a>` click — iOS 12 opens plain links
  from the home-screen web app in Safari. Every page links `manifest.json`.
- Emoji must exist on iOS 12 (Unicode 11 or older). Not available: 🧍 🪙 🩹 🦮 🧇 🧄 🪑 🛕 and
  anything newer. Check the emoji's Unicode version before using it.
- Touch events only (no pointer events). Audio starts after the first tap (engine handles it).

## Performance (original iPad Air, A7, 1 GB RAM)
Every game must run smoothly on the original iPad Air. Games set `window.HI_RES = true` (the
template does) to render at the screen's pixel density, which costs up to 4x the pixels on that
iPad; the engine caches emoji/text as bitmaps. Games must keep drawing cheap:
- Draw with the engine helpers (`emoji`, `text`, `picture`, `box`, `circle`). No `shadowBlur`,
  `filter`, gradients or `globalCompositeOperation` per frame; no per-pixel `getImageData` work.
- Keep on-screen objects modest (aim for under ~150 moving things) and remove anything off-screen.
- No allocations in hot loops where avoidable: reuse objects/arrays instead of creating new ones
  every frame; avoid `filter`/`map` per frame on large arrays.
- Text that changes every frame (timers with decimals) creates a new cached bitmap each time —
  round values (whole seconds, integer points).
- Images: small PNGs (under ~512 px, few hundred KB total per game); scale them down before
  adding. Sounds: short, compressed (`.m4a`/`.mp3`).
- Move things by `speed * dt` so the game behaves the same at lower frame rates.
- Count fills per frame, not just objects: aim for roughly 150 `box`/`circle` calls and only a
  few dozen see-through (`rgba`) ones. Draw tile maps as runs of same-coloured tiles (one
  rectangle per run, computed once), grid lines as full-length lines, and skip anything
  off-screen. Desktop Chrome hides this cost — the A7 GPU does not.

## Fonts
Games use fun fonts. Pick one at the top of `game.js` with `useFont("<name>")`; `text()` then
draws in it. Names: `arcade` (Press Start 2P, pixel — wide, use for short titles/scores only),
`kridt` (Chalkboard SE), `tusch` (Marker Felt), `racer` (Futura Condensed ExtraBold),
`rund` (Arial Rounded), `standard`. Choose one that fits the game's mood. `fontFor(size)`
gives the CSS font string for drawing directly with `ctx`.

## Rotation
The iPad may be held either way, and rotated mid-game. The engine fits the 1024 × 768 world
into the screen in both orientations (smaller with bars in portrait) and re-measures after
every rotation. Games must not read `window.innerWidth`/`innerHeight` or size DOM by hand —
always draw in world units — and must keep working when rotated at any moment.

## Touch targets
Everything a kid taps is at least **60 × 60** (game units are iPad points, the world is
1024 × 768). Prefer bigger. Menus close with a visible 64 × 64 ✖️ and also by tapping outside.

## Showing things to the kids
Never use Safari or any other app — only Claude's in-app browser pane. The kids can't navigate
Claude Code, so open and close it for them:
- Open: `preview_start` with the `url` (e.g. the sounds page or the game).
- Check `tabs_context`; if it says the pane is hidden, tell them in one short Danish sentence to
  tap the globe button, showing the icon: "Tryk på 🌐 globus-knappen øverst til højre."
- Close: `tabs_close` on every tab as soon as that step is done.
Don't ask them to click links in the chat.

## Updates on the iPad
The home-screen app has no reload button. The start page has a big "🔄 Hent nye spil" button,
reloads itself after 5 minutes in the background, and all links/scripts carry `?v=<time>` so
new versions show up. Keep that loader in every game's `index.html` (copy the template).

## Offline
`sw.js` (service worker) makes everything work offline: network first, cached copy when
offline, query strings ignored. It pre-caches each game's `index.html`, `game.js` and icon from
`games.json`. **Any other file a game uses (pictures, sounds) must be listed in that game's
`assets` array in `games.json`**, e.g. `"assets": ["bil.png", "brum.m4a"]`, or it won't work
offline until it has been loaded once online.

## Start over
The engine gives every game a ↺ button (next to 🏠) that asks "Vil du starte forfra?" and then
deletes everything the game stored with `save()` and restarts it. So games must keep all
progress through `save()`/`load()` (never `localStorage` directly) and must not cover the
top-left corner (the two buttons) with things to tap.

## Players and records
A game can set `window.USES_PLAYERS = true;` at the top of `game.js`. The engine then asks
"Hvem spiller?" when the game opens (profiles + Gæst + "Ny spiller"), adds a player button
next to ↺, and the game stores per-player data with `playerSave(key, value)` /
`playerLoad(key, fallback)`; `showRecords(key, unit)` shows everyone's value as a scoreboard,
and `player()` gives `{ id, name, emoji }`. Profiles live only in the iPad's storage and are
shared by all games — kids type their own names there, so names never reach the repo.

## Making a new game
1. Copy `games/template/` to `games/<kebab-name>/`, set the `<title>`.
2. Write the game in `game.js` using the helpers in `shared/engine.js`
   (`clear`, `circle`, `box`, `text`, `emoji`, `picture`, `beep`, `sfx`, `sound`, `random`,
   `distance`, `save`, `load`) and the hooks `setup`, `update(dt)`, `draw`, `onTap`,
   `onDrag`, `onRelease`. The world is always 1024 x 768, landscape.
3. Add an entry to `games.json` (`title`, `folder`, `emoji`, `icon`, `color`) and the author to
   `private/authors.json`, then run `node tools/seal.mjs`.
   Icons are 256×256 PNGs in the game folder; render one with `tools/make-icon.swift`. Always
   save a new or changed icon as `icon.png` — `tools/seal.mjs` renames it to `icon_<hash>.png`
   and updates `games.json`, so the new picture gets a new URL and no cache can show the old one.
   Sound effects for `sfx(name)` are previewed at `shared/lyde.html`.
4. Images and sounds go in the game's own folder.

## Privacy
The repo is public. Kids' names never go into tracked files, commit messages or anything else
that gets pushed. Real author names live only in `private/authors.json` (gitignored, keyed by
game folder); the 6-digit unlock code is in `private/unlock-code.txt`. `node tools/seal.mjs`
encrypts each name into `games.json` (AES-GCM, key from PBKDF2 of the code; salt and a check
value in `shared/seal.json`) — run it before every commit that touches `games.json`. Games
play without the code; the "🔑 Kode" button on the start page only reveals the names. Keep
anything else personal (real places, photos, full names) out of games too.

## Language and audience
- **Any message in Danish is from one of the kids — use the `spil` skill.**
- The kids (around 10 years old) write to Claude **in Danish**. Answer them in Danish, in short,
  friendly, simple sentences a 10-year-old understands — no jargon, no long explanations.
  This overrides any "always answer in English" preference.
- Everything user-facing in the platform and games is Danish and kid-friendly: titles, buttons,
  scores, messages, `games.json` titles.
- Code identifiers and comments stay in English.

## Preview locally
`python3 -m http.server 8000` from the repo root.
