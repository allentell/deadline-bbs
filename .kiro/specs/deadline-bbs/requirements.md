# DeadLine BBS — Requirements

Spec: `deadline-bbs` · Category: Kiroween 2026 — Resurrection
Authored with Kiro spec-driven development. User stories use EARS-style acceptance criteria.

## Introduction
DeadLine BBS resurrects a 1990s dial-up bulletin board system (dead technology: single-line, modem-only, killed by the web circa 1999) as a dependency-free static web app. It preserves the rituals — dial-up handshake, ANSI banner, numbered menus, message board, file library, SysOp chat, door game — while running offline in a modern browser with no backend and no user data.

## Requirements

### 1. Boot / dial-up sequence
**User story:** As a caller, I want the connection ritual, so that the resurrection feels like dialling in.
- WHEN the app loads, THE SYSTEM SHALL play a timed, text-only modem handshake sequence (AT commands, CONNECT 14400) with no sound.
- WHEN the caller presses Enter, Space, or the skip button, THE SYSTEM SHALL end the sequence immediately and show the main terminal.
- WHEN the sequence finishes naturally, THE SYSTEM SHALL show the main terminal.

### 2. Main menu & keyboard navigation
**User story:** As a caller, I want BBS-authentic navigation, so that it works like the original.
- THE SYSTEM SHALL offer five sections: Message Board, File Library, AI SysOp Chat, Door Game, About.
- WHEN the caller presses ↑/↓, THE SYSTEM SHALL move the menu selection; WHEN they press Enter or a number key 1–5, THE SYSTEM SHALL open that section.
- THE SYSTEM SHALL also support mouse/touch selection. Pressing G SHALL return to the boot screen (log off).

### 3. Message board
**User story:** As a caller, I want to read and post messages, so that the board feels alive between visits.
- THE SYSTEM SHALL seed the board with fictional posts and persist all posts in `localStorage` under `dlbbs-messages-v1`.
- WHEN the caller submits the compose form (handle, subject, body), THE SYSTEM SHALL save and immediately list the new post.
- THE SYSTEM SHALL provide a reset that restores the seed posts. No real personal data SHALL be requested or transmitted.

### 4. File library
**User story:** As a caller, I want the file area ritual, so that browsing/downloading feels period-correct.
- THE SYSTEM SHALL list fictional files with filename, area, size, download count and description, filterable by area (UTILS / ART / TEXT / GAMES).
- WHEN the caller chooses GET, THE SYSTEM SHALL simulate a ZMODEM transfer in the log and download a small generated `.txt` placeholder. No real binaries SHALL be served.

### 5. AI SysOp chat
**User story:** As a caller, I want to talk to the SysOp, so that the board has a personality.
- THE SYSTEM SHALL answer with canned, rule-based, in-character responses entirely on-device. No external API SHALL be called and no chat data SHALL leave the browser.
- THE SYSTEM SHALL recognise at least the intents: help, greeting, files, game, modem/nostalgia, identity, Kiroween, farewell, thanks, cost.

### 6. Door game — CODEBREAKER 3000
**User story:** As a caller, I want a daily door game, so that I have a reason to call back tomorrow.
- THE SYSTEM SHALL derive one deterministic 4-digit code per **player-local** calendar day, allow 8 guesses, and report exact/close feedback per guess.
- THE SYSTEM SHALL persist the day's progress and a career score (played / won / streak / points) in `localStorage`.
- THE SYSTEM SHALL offer a scoreless practice round with a random code.

### 7. Platform constraints
- THE SYSTEM SHALL be a static site (HTML/CSS/JS, zero dependencies) that runs from `file://` or any static host and works offline after first load.
- THE SYSTEM SHALL contain only fictional content and SHALL make no network requests.
- THE SYSTEM SHOULD remain usable on a desktop demo viewport and degrade gracefully on narrow screens.

## Iteration 2 (v1.1–v1.2)

### 8. Message board depth & discovery (v1.1)
**User story:** As a caller, I want real threaded conversations, so that replies feel like the old boards.
- WHEN a caller replies to a message, THE SYSTEM SHALL store the reply against its parent (`parentId`) and render the **full thread tree** — replies to replies SHALL appear, indented by depth (capped), never silently dropped.
- THE SYSTEM SHALL provide text search across handle, subject and body; a thread SHALL remain visible while any of its messages matches.
- THE SYSTEM SHALL show relative timestamps ("2h ago") alongside each post's date.
- WHEN a v1 save (no `parentId`/`ts`) is loaded, THE SYSTEM SHALL migrate it in place.
- THE SYSTEM SHALL validate persisted message data at read time: non-array values fall back to the seed posts, and entries that are not message-shaped objects SHALL be dropped — a corrupt save SHALL NOT prevent the app from booting.

### 9. Caller log & hidden screen (v1.1)
- THE SYSTEM SHALL show a "Last 10 Callers" log on the main menu: fictional handles, connect speeds and times, regenerated deterministically from the player-local day.
- THE SYSTEM SHALL hide one unlisted screen (the Grotto), reachable by the Konami sequence or a magic word; the About section MAY carry only a vague rumour of it.

### 10. SysOp depth (v1.1)
- IN ADDITION TO requirement 5, THE SYSTEM SHALL recognise the intents: board history, game rules, how-to-post, uploads, 1994 memories, and jokes (16 intents total).

### 11. Door game depth & honesty (v1.1–v1.2)
- THE SYSTEM SHALL show per-digit feedback (● exact / ◐ close / ○ miss) for every guess, scored so repeated digits never double-count, plus per-guess counts.
- THE SYSTEM SHALL offer give-up/reveal, ending the round scoreless and persisting that outcome.
- WHILE a practice round is active, THE SYSTEM SHALL offer a one-click return to today's daily game without a reload.
- The daily code SHALL roll over at the **player's local midnight**; all copy SHALL say so and SHALL note the code may differ by timezone. Post dates SHALL use the player-local day.
- A career streak SHALL count consecutive days only: a win increments it only when the previous recorded day was the previous local day, otherwise it restarts at 1; a loss resets it to 0.
- Persisted score data SHALL be validated/coerced to numbers at read time and rendered via `textContent`, never interpolated into `innerHTML`.

### 12. Input & focus integrity (v1.2)
- Global menu shortcuts SHALL NOT fire when the event carries Ctrl/Meta/Alt, nor when focus is on a button, link or message item (those elements handle Enter themselves).
- The main menu listbox SHALL be focusable, and focus SHALL land on it when the boot sequence finishes.
- All text/background colour pairs SHALL meet WCAG AA contrast (≥ 4.5:1), including `--dim` text on the selected menu item.
