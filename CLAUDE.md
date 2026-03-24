# Kids Games — Claude Code Guide

## What This Is

A collection of 7 mini-games for ages 3–5, organized as a hub-and-spoke app. Central hub handles navigation and sticker rewards; each game is a self-contained folder. Vanilla HTML/CSS/JS, no build step, hosted on GitHub Pages.

---

## Tech Stack

- Vanilla HTML5/CSS3/JavaScript — no frameworks, no build step
- Web Speech API for text-to-speech prompts
- HTML5 `<audio>` elements for sound effects
- CSS custom properties for shared design system
- localStorage for sticker collection and preferences
- GitHub Pages hosting

---

## File Structure

```
kids-games/
  index.html              — hub page (game selection, sticker display)
  hub.js                  — hub navigation, sticker system, session tracking
  hub-styles.css          — hub-specific styling
  shared-styles.css       — design system: colors, animations, button styles, layout helpers
  docs/
    kids-games-dev-phase-plan.md — development plan and technical specs
  color-pop/              — color matching bubble game
    index.html
    color-pop.js
    images/ audio/
  animal-peekaboo/        — hidden animal discovery
    index.html
    animal-peekaboo.js
    images/ audio/
  bird-match/             — silhouette drag-and-drop matching
    index.html
    bird-match.js
    images/
  bug-count/              — counting and number recognition
    index.html
    bug-count.js
    images/
  feelings-faces/         — emotion recognition
    index.html
    feelings-faces.js
  sound-spelling/         — phonics and letter recognition
    index.html
    sound-spelling.js
    audio/
  hide-and-seek/          — find hidden animals in a scene
    index.html
    hide-and-seek.js
    images/ audio/
```

Each game is fully self-contained — its own `index.html`, `game-name.js`, and assets. No shared JS between games.

---

## Architecture

### Hub System (hub.js)
- **Sticker registry**: `STICKER_REGISTRY` maps game keys to sticker metadata
- **Session tracking**: games played today, last play date, daily reset
- **Sticker award flow**: game completes → sets localStorage → navigates back to hub → hub detects new sticker on `window.focus`
- **Sound preference**: `kidsGames_soundEnabled` read by all games at startup

### localStorage Keys
| Key | Purpose |
|-----|---------|
| `kidsGames_earnedStickers` | Comma-separated game keys |
| `kidsGames_stickerCount` | Count (backward compat) |
| `kidsGames_soundEnabled` | Sound on/off preference |
| `kidsGames_lastPlayDate` | Daily reset trigger |
| `kidsGames_gamesPlayedToday` | Session counter |
| `kidsGames_lastNavigation` | Timestamp for detecting returns |

### Per-Game Architecture
Every game follows the same pattern:
1. `DOMContentLoaded` → get DOM elements → load settings → setup listeners → initialize
2. 5 rounds: display instruction → generate items → wait for input → validate → feedback → next round
3. Celebration overlay on completion → `awardSticker('game-key')` → back to hub

### Data Flow
```
Hub → click game card → navigate to game/index.html
Game → 5 rounds → awardSticker() → localStorage updated → navigate back
Hub → window.focus → detect new sticker → update display
```

---

## Design System (shared-styles.css)

### Colors (CSS custom properties)
- Primary: `--primary-blue`, `--primary-green`, `--primary-purple`, `--primary-orange`, `--primary-pink`, `--primary-red`
- States: `--success-green`, `--warning-orange`, `--error-red`
- Neutral: `--neutral-light`, `--neutral-medium`, `--neutral-dark`

### Shared Animation Classes
- `.pop-animation` — scale 0→1.2→1 (0.3s)
- `.bounce` — vertical bounce (0.6s)
- `.sparkle` — spin + scale (1s)
- `.celebration` — spin + scale combo (1.2s)
- `.float` — vertical float (3s infinite)
- `.shake` — horizontal wiggle (0.5s)
- `.pulse` — opacity + scale (1s infinite)

### Layout & Accessibility
- `.game-button` — 80-100px minimum touch targets
- `.big-touch-target` — 100px+ for young children
- `.center-stage` — flex centered, 60vh min
- `.game-container` — max-width 800px centered
- Responsive at 768px breakpoint
- High-contrast mode and reduced-motion support

---

## Coding Conventions

- Game folders: lowercase with hyphens (`color-pop`, `bird-match`)
- JS files match folder name (`color-pop.js`, `bird-match.js`)
- Global variables for game state (no closures or modules)
- Direct `addEventListener` on elements (no event delegation)
- CSS: game-specific styles inline in HTML `<style>` + link to `../shared-styles.css`
- State classes: `.active`, `.locked`, `.unlocked`, `.found`, `.hidden`
- Speech synthesis includes iOS initialization workaround

---

## Key Constraints

- No shared JavaScript between games — each game is fully independent
- Games communicate with hub only through localStorage and browser navigation
- All games use exactly 5 rounds — this is a consistent UX expectation
- Sound preference must be checked at game start from `kidsGames_soundEnabled`
- Touch targets must be large (80-100px minimum) for the age group
- Asset budget: <5MB per game, <2s load time target
- Voice prompts depend on Web Speech API availability — always check before using
- Adding a new game: copy an existing folder, modify the JS, add entry to hub's sticker registry
