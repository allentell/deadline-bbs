# Tech Steering — DeadLine BBS

## Stack
- Plain HTML5, CSS3, vanilla JavaScript (ES2020). **No frameworks, no dependencies, no build step.**
- Persistence: `localStorage` only, namespaced keys prefixed `dlbbs-`.
- Hosting: any static host (GitHub Pages, Netlify, Vercel static, S3) or plain `file://`.

## Rules for anyone (human or agent) editing this repo
- **No network calls.** Do not add CDNs, webfonts, analytics, or remote images. Offline operation is a core requirement.
- **No real data.** Seed content stays fictional. Never wire the SysOp chat or any form to an external service.
- **Keyboard parity.** Any new menu/section must be reachable via arrow keys + Enter and via number shortcut if it joins the main menu.
- **State changes go through `store`.** Use the `store.get/set` wrapper in `js/app.js`; never call `localStorage` directly elsewhere.
- **Keep files separable.** Structure in `index.html`, presentation in `css/style.css`, behaviour in `js/app.js`. Inline scripts/styles are not allowed.
- **Escape user text.** User-supplied message/chat content is rendered with `textContent`, never `innerHTML`.
- **Test before done:** `node --check js/app.js`, serve with `python3 -m http.server`, and smoke-test boot → each section → one game guess.

## Performance budget
Total page weight < 100 KB uncompressed. If a feature needs more, it doesn't ship.
