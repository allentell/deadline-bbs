# DeadLine BBS — Resurrected 1994

> Dead tech never dies. It just waits for someone to call back.

**Kiroween 2026 · Category: Resurrection** · A 1990s dial-up bulletin board system, rebuilt as a modern web app.

In 1994, DeadLine BBS ran on a single phone line in Hong Kong: one caller at a time, 14,400 bps, and your download died if someone picked up the kitchen phone. The web killed it in 1999. For Kiroween, it's back — same rituals, no modem, no phone bill.

## Try it

**▶ Play it live: https://allentell.github.io/deadline-bbs/**
Source: https://github.com/allentell/deadline-bbs

Or run it locally — no build, no install, no server required:

```bash
# Option A: just open the file
open index.html            # macOS
xdg-open index.html        # Linux

# Option B: serve it (identical result)
python3 -m http.server 8000
# then visit http://localhost:8000
```

Press **Enter** to skip the dial-up sequence, then use **↑ ↓ + Enter**, number keys **1–5**, or your mouse.

## Features

| # | Section | What it does |
|---|---|---|
| 1 | Message Board | Read/post messages with **fully nested threaded replies** (replies to replies render, indented by depth), **text search**, and relative timestamps ("2h ago"); seeded with fictional 1994–2026 posts, persisted in `localStorage` (v1 saves migrate automatically; corrupt saves are validated and repaired, never fatal) |
| 2 | File Library | Fictional file areas (UTILS / ANSI ART / TEXT / GAMES) with filters and a simulated ZMODEM `[GET]` that downloads a tiny generated `.txt` ghost of each file |
| 3 | AI SysOp Chat | Talk to GH0STLINE, the SysOp since 1994 — 16 rule-based intents (board history, game rules, how to post, 1994 memories, jokes…), 100% on-device, no API, nothing leaves your browser |
| 4 | Door Game: CODEBREAKER 3000 | Daily deterministic 4-digit code for **your local day** (new code at your local midnight), 8 guesses, **per-digit ●/◐/○ feedback grid**, a give-up/reveal option, career score + **consecutive-day streak** in `localStorage`, plus a scoreless practice mode with a one-click return to today's code |
| 5 | About | The Resurrection Log: 1994 → 1999 → 2026 |

Plus: modem handshake boot sequence, ANSI-art banner, a **"Last 10 callers"** log on the main menu (fictional, regenerated deterministically each day), full keyboard navigation (G = log off back to boot — an in-page reset, no reload), sound-free, works fully offline, responsive down to phone widths, and it respects `prefers-reduced-motion` (the dial-up sequence is skipped for callers who ask for stillness). Rumour has it something hidden still answers to a magic word…

**All content is fictional** — every caller, post and file was invented for this demo. Nothing is transmitted anywhere; posts and scores live only in your own browser.

## How Kiro was used

This project was built spec-first with **Kiro**, and the evidence ships in the repo:

- **Specs** — `.kiro/specs/deadline-bbs/` : `requirements.md` (EARS-style acceptance criteria), `design.md` (modules, decisions, correctness notes), `tasks.md` (checklist), `spec.md` (index)
- **Steering** — `.kiro/steering/product.md` (fiction-only, zero-friction, tone) and `.kiro/steering/tech.md` (no-network, no-dependency, keyboard-parity and state-handling rules that governed every edit)
- **Hooks** — `.kiro/hooks/on-save-verify.kiro.hook` : an agent hook that, on every save of the app files, re-checks that the JS parses, no network calls sneaked in, seed content stays fictional, and keyboard navigation still reaches every section

The workflow: write the spec → let steering constrain the implementation → build task by task → let the hook guard the invariants. The BBS is the demo; the `/.kiro` folder is the process, preserved.

## Tech stack

- Vanilla HTML5 / CSS3 / JavaScript — **zero dependencies, zero build step, 53 KB total** (all three app files, uncompressed)
- `localStorage` for message and game persistence (namespaced `dlbbs-*` keys)
- Deterministic daily game code via an FNV-1a hash of the date — the same code for every caller in your timezone on the same day; it rolls over at **your local midnight**, so codes may differ between timezones. No server needed
- Runs from `file://` or any static host

## License

MIT — see [LICENSE](LICENSE).

## Submission

Kiroween 2026 (Devpost). Remaining submission steps and deadlines are tracked in [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md).
