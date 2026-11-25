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
- THE SYSTEM SHALL derive one deterministic 4-digit code per calendar day, allow 8 guesses, and report exact/close feedback per guess.
- THE SYSTEM SHALL persist the day's progress and a career score (played / won / streak / points) in `localStorage`.
- THE SYSTEM SHALL offer a scoreless practice round with a random code.

### 7. Platform constraints
- THE SYSTEM SHALL be a static site (HTML/CSS/JS, zero dependencies) that runs from `file://` or any static host and works offline after first load.
- THE SYSTEM SHALL contain only fictional content and SHALL make no network requests.
- THE SYSTEM SHOULD remain usable on a desktop demo viewport and degrade gracefully on narrow screens.
