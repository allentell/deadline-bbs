# Kiroween 2026 — Submission Checklist (Allen's steps)

Project: **DeadLine BBS** · Category: **Resurrection**
⏰ **Submission deadline: Dec 4, 2026, 14:00 Pacific = Dec 5, 2026, 06:00 Hong Kong time.** Do not cut this close — aim to submit by Dec 4 evening HKT.
🔗 **Live app: https://allentell.github.io/deadline-bbs/** · **Repo: https://github.com/allentell/deadline-bbs**

## Already done (in this folder)
- [x] Working app: `index.html` + `css/style.css` + `js/app.js` (boot sequence, menu, message board, file library, AI SysOp, daily door game)
- [x] `/.kiro` at repo root: specs (`requirements.md`, `design.md`, `tasks.md`, `spec.md`), steering (`product.md`, `tech.md`), hook (`hooks/on-save-verify.kiro.hook`)
- [x] `README.md` (what it is, Resurrection category, how to run, how Kiro was used, tech stack)
- [x] MIT `LICENSE`

## Allen — accounts & credits (do first)
- [x] Register / sign in on **Devpost** and register for the Kiroween 2026 hackathon — done 2026-11-25 (account: allentell)
- [x] Create a **Kiro account** — done 2026-11-25
- [ ] Actually open/use Kiro on this project — the `/.kiro` folder should reflect real usage (a real Kiro session + commit; rules allow disqualification for insufficient Kiro use)
- [x] **Request the 4,000 Kiro credits** — submitted 2026-11-25, ahead of the Dec 1, 2026, 12:00 pm Pacific deadline (= Dec 2, 2026, 04:00 Hong Kong time); awaiting the approval email (credits must be redeemed by Dec 4, 2026 and expire Dec 31, 2026)

## Allen — publish
- [x] Create a **public GitHub repository** and push this whole folder, confirming `/.kiro` is at the repo root and the MIT LICENSE is included — https://github.com/allentell/deadline-bbs
- [x] Deploy to static hosting (GitHub Pages: deploy from `main`, root) and confirm the **functional app URL** loads, boots, and the door game plays — https://allentell.github.io/deadline-bbs/
- [x] Test the live URL with a clean profile (localStorage starts clean — seed posts and the daily code appear) — verified on the live URL 2026-11-25

## Allen — demo video (< 3 minutes)
Suggested script (~2:30):
1. (0:00) Boot sequence — let the handshake play, say what a BBS was in one sentence
2. (0:30) Main menu with keyboard only — "↑↓, Enter, number keys, like 1994"
3. (0:50) Message board — open the 1999 farewell post, post a new message, refresh to show it persisted
4. (1:20) File library — filter to ANSI ART, GET a file, show the simulated ZMODEM log
5. (1:40) AI SysOp — type `HELP`, then ask about the modem; stress: rule-based, offline, no API
6. (2:00) Door game — make 2–3 CODEBREAKER guesses, show ●/◐ feedback and the career score
7. (2:25) Close on the About screen: "Dead tech never dies — Resurrection category, built spec-first with Kiro; the /.kiro folder is in the repo."
- [ ] Upload to **YouTube** — the video must be **publicly visible** (the official Kiroween rules require a public video; unlisted does not qualify) — and copy the link

## Allen — submit on Devpost
- [ ] Project name: DeadLine BBS — Resurrected 1994
- [ ] Category: **Resurrection**
- [ ] Text description: adapt README's intro + features table; state plainly that all content is fictional, it runs offline, and how Kiro specs/steering/hooks were used
- [ ] Paste: public GitHub repo URL, functional app URL, YouTube demo URL
- [ ] Double-check the `/.kiro` directory is visible in the submitted repo
- [ ] Submit — then re-open the submission page to confirm it shows as submitted, **before Dec 5, 2026, 06:00 Hong Kong time**
