# DeadLine BBS — Design

## Architecture
Single-page static app, three files, no build step, no dependencies:

```
index.html      — boot screen + terminal shell (menu + 5 section panels)
css/style.css   — ANSI/terminal theme (CSS variables, faint CRT scanline overlay)
js/app.js       — all behaviour, organised in commented modules
```

## Modules (js/app.js)
| Module | Responsibility |
|---|---|
| `store` | Safe `localStorage` JSON get/set wrapper (try/catch, fallbacks) |
| Boot | Timed line-by-line handshake (`BOOT_LINES`), skippable via key/button; timers cleared on skip |
| Menu | Single `menuIndex` state; arrow/Enter/number keys + click/hover; `openSection()` toggles panels |
| Messages | Seed-on-first-run, list (newest first), view, compose, reseed. Key: `dlbbs-messages-v1` |
| Files | Static fictional catalogue, area filter chips, simulated transfer log + generated Blob `.txt` download |
| SysOp | Ordered regex rule table (`SYSOP_RULES`) + rotating fallbacks; 350 ms reply delay for "typing" feel; all on-device |
| Door game | FNV-1a hash of `deadline-<YYYY-MM-DD>` → deterministic 4-digit daily code; exact/close scoring that handles repeated digits by removing matched digits from the pool; keys `dlbbs-codebreaker-day-v1`, `dlbbs-codebreaker-score-v1` |

## Design decisions
- **Terminal aesthetic is the product.** Dark green/amber ANSI palette, monospace everywhere, block-character banner. A faint scanline overlay serves the fiction; contrast stays readable.
- **Keyboard-first, mouse-complete.** Every menu action is reachable by keyboard (the BBS way) and by pointer (the 2026 way). Typing in a form disables global shortcuts so input is never hijacked.
- **No network, ever.** Fonts, art and data are local/system. This makes "works offline" a property of the architecture, not a service worker promise.
- **Fiction is labelled.** Seed posts, files and the About panel state plainly that all content is fictional — period flavour without misinformation.
- **Persistence is local and resettable.** Messages and game state live only in the caller's browser; reseed/clear paths are built in.

## Correctness notes
- CODEBREAKER scoring: exact matches are removed first, then close matches consume digits from the remaining pool, so repeated-digit codes/guesses score correctly.
- Daily determinism: same date → same code on any machine (hash is pure, no RNG, no timezone-dependent seed beyond the ISO date string).
- Boot skip is idempotent (`bootDone` guard + timer cleanup) so mashing Enter can't double-initialise.
