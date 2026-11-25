"use strict";
/* DeadLine BBS — all client-side, no backend, no external calls.
   All people, posts and files below are fictional demo content. */

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const store = {
  get(k, fallback){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }catch(e){ return fallback; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};
/* A corrupt saved state must never brick the board: initial render calls are
   wrapped so one bad key degrades that module instead of killing boot. */
function safeInit(fn){ try{ fn(); }catch(e){} }
/* Player-local calendar day (YYYY-MM-DD). The daily code, post dates and the
   caller log all key off the caller's own midnight — so the daily code may
   differ between timezones. */
function localDay(d = new Date()){
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function prevLocalDay(dayStr){
  const [y, m, d] = dayStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d); dt.setDate(dt.getDate() - 1);
  return localDay(dt);
}

/* ---------- Seed data (fictional) ---------- */
const SEED_MESSAGES = [
  {id:"s1", handle:"GH0STLINE", subject:"WELCOME BACK, CALLER", date:"1994-03-14", body:"You found the line. One caller at a time, 300 words or less, be excellent to each other.\n\nIf the board seems dead, it isn't. It's just waiting.\n\n— GH0STLINE, SysOp"},
  {id:"s2", handle:"MODEM_MARY", subject:"14.4k and FLYING", date:"1994-05-02", body:"Upgraded from 2400 baud today. Downloaded a 200KB file in FOUR MINUTES. The future is now and it is extremely fast."},
  {id:"s3", handle:"PIXEL_PETE", subject:"New ANSI pack in the file area", date:"1994-06-21", body:"Uploaded ANSIART.ZIP — 12 screens, best viewed at 80x25 with a CRT that weighs more than you do. Feedback welcome on this board."},
  {id:"s4", handle:"DIALTONE_DAN", subject:"Mum picked up the phone again", date:"1995-01-09", body:"Lost a 94% complete download because someone wanted to 'just quickly call Auntie'. This is the third time. I am moving out. I am nine."},
  {id:"s5", handle:"GH0STLINE", subject:"FAREWELL (1999)", date:"1999-12-31", body:"The line is being disconnected tomorrow. Thanks for calling, thanks for posting, thanks for waiting for the busy tone to clear.\n\nDeadLine is dead. Long live DeadLine."},
  {id:"s6", handle:"GH0STLINE", subject:"RESURRECTION LOG — 2026", date:"2026-10-30", body:"Somebody rebuilt the board out of HTML and spite. No phone line, no busy tone, same menu. Post something. The SysOp still reads everything."}
];
const FILES = [
  {name:"ANSIART.ZIP",  area:"ART",   size:"182 KB", dls:412, desc:"12 ANSI screens by PIXEL_PETE. Best at 80x25 on a heavy CRT."},
  {name:"DLTERM.EXE",   area:"UTILS", size:"96 KB",  dls:1024, desc:"DeadLine terminal program. Detects 14.4k modems and pure optimism."},
  {name:"PKUNZIP.EXE",  area:"UTILS", size:"28 KB",  dls:9001, desc:"You know what this does. Everyone knows what this does."},
  {name:"BBS_LIST.TXT", area:"TEXT",  size:"14 KB",  dls:733, desc:"Every BBS number in Hong Kong, March 1994 edition. Half are already dead."},
  {name:"CODEBRK.ZIP",  area:"GAMES", size:"41 KB",  dls:256, desc:"CODEBREAKER door game, original DOS build. Rebuilt in your browser as section [4]."},
  {name:"RAINBOW.ANS",  area:"ART",   size:"9 KB",   dls:88,  desc:"A rainbow in 16 colours. Took three evenings. Worth it."},
  {name:"SYSOPLOG.TXT", area:"TEXT",  size:"61 KB",  dls:19,  desc:"SysOp diary 1994–1999. Mostly complaints about the phone bill."},
  {name:"README.1ST",   area:"TEXT",  size:"2 KB",   dls:5000, desc:"Read this first. Nobody ever did."}
];

/* ---------- Boot sequence ---------- */
const BOOT_LINES = [
  "DEADLINE TERMINAL v2.6 — (C) 1994–2026 GH0STLINE SYSTEMS",
  "",
  "ATZ",
  "OK",
  "ATDT 852-1994",
  "DIALING… RING… RING…",
  "CARRIER DETECTED",
  "kshhh… BEEP… khhhh… BONG… (modem handshake, imagined)",
  "CONNECT 14400 / ARQ / V.42bis",
  "",
  "Verifying caller……… GUEST_1994",
  "Access granted. Welcome back. It's been 27 years.",
  ""
];
let bootDone = false, bootTimers = [];
function runBoot(){
  const log = $("#boot-log"); log.textContent = "";
  BOOT_LINES.forEach((line, i)=>{
    bootTimers.push(setTimeout(()=>{ log.textContent += line + "\n"; }, 260*i + 200));
  });
  bootTimers.push(setTimeout(finishBoot, 260*BOOT_LINES.length + 700));
}
function finishBoot(){
  if (bootDone) return; bootDone = true;
  bootTimers.forEach(clearTimeout);
  $("#boot").classList.add("hidden");
  $("#terminal").classList.remove("hidden");
  selectMenu(0, true);
  $("#menu").focus?.();
}
$("#boot-skip").addEventListener("click", finishBoot);
document.addEventListener("keydown", e=>{
  if (!bootDone && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); finishBoot(); }
});

/* ---------- Clock & caller count (fiction dressing with real function: session info) ---------- */
setInterval(()=>{ const el=$("#clock"); if(el) el.textContent = new Date().toLocaleString("en-HK",{hour12:false}); }, 1000);
(function(){ const n = (Number(store.get("dlbbs-visits",0)) || 0) + 1; store.set("dlbbs-visits",n);
  const c=$("#caller-count"); if(c) c.textContent = String(n); })();

/* ---------- Last 10 callers (fictional, deterministic per day) ---------- */
const CALLER_HANDLES = ["MODEM_MARY","PIXEL_PETE","DIALTONE_DAN","NULL_POINTER","CARRIER_LOST","BYTE_ME","NO_CARRIER_NED","BAUD_BANDIT","SYSOP_JR","CRT_CARLA","FIDO_FAN","ZIPZIP_ZOE"];
const CALLER_SPEEDS = ["2400","9600","14400","14400","28800","33600","56K"];
function fnvHash(str){ let h = 2166136261; for (const ch of str){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h); }
function seededRandom(seed){ let x = seed % 2147483647; if (x <= 0) x += 2147483646; return ()=>{ x = (x * 48271) % 2147483647; return x / 2147483647; }; }
function renderCallers(){
  const list = $("#caller-list"); if (!list) return;
  const day = localDay();
  const rnd = seededRandom(fnvHash("callers-"+day));
  const handles = [...CALLER_HANDLES];
  for (let i = handles.length-1; i > 0; i--){ const j = Math.floor(rnd() * (i+1)); [handles[i], handles[j]] = [handles[j], handles[i]]; }
  let minutes = 23*60 + Math.floor(rnd()*50); // latest call, late evening — it was always late evening
  list.innerHTML = "";
  handles.slice(0,10).forEach(h=>{
    minutes -= 7 + Math.floor(rnd()*95);
    if (minutes < 0) minutes += 24*60;
    const hh = String(Math.floor(minutes/60)).padStart(2,"0"), mm = String(minutes%60).padStart(2,"0");
    const li = document.createElement("li");
    const a = document.createElement("span"); a.className="ch"; a.textContent = h;
    const b = document.createElement("span"); b.className="cs"; b.textContent = CALLER_SPEEDS[Math.floor(rnd()*CALLER_SPEEDS.length)] + " bps";
    const c = document.createElement("span"); c.className="ct"; c.textContent = hh + ":" + mm;
    li.append(a, b, c); list.appendChild(li);
  });
}
safeInit(renderCallers);

/* ---------- Menu navigation ---------- */
const menuItems = $$("#menu li");
let menuIndex = 0;
function selectMenu(i, open=false){
  menuIndex = (i + menuItems.length) % menuItems.length;
  menuItems.forEach((li, idx)=>{
    li.classList.toggle("selected", idx===menuIndex);
    li.setAttribute("aria-selected", idx===menuIndex ? "true":"false");
  });
  if (open) openSection(menuItems[menuIndex].dataset.section);
}
function openSection(name){
  $$(".section").forEach(s=>s.classList.add("hidden"));
  const el = $("#sec-"+name); if(el) el.classList.remove("hidden");
  const idx = menuItems.findIndex(li=>li.dataset.section===name);
  if (idx>=0) selectMenu(idx,false);
  if (name==="sysop") $("#chat-input").focus();
  if (name==="door") $("#guess-input").focus();
}
menuItems.forEach((li, idx)=>{
  li.addEventListener("click", ()=>selectMenu(idx, true));
  li.addEventListener("mouseenter", ()=>selectMenu(idx,false));
});
document.addEventListener("keydown", e=>{
  if (bootDone === false) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  /* The Grotto is modal: Enter/Escape close it even though focus sits on
     its own close button, so this check precedes the button guard below. */
  if (eggOpen){ if (e.key==="Escape" || e.key==="Enter"){ e.preventDefault(); hideEgg(); } return; }
  const ae = document.activeElement;
  const tag = (ae?.tagName||"").toLowerCase();
  const typing = tag==="input" || tag==="textarea";
  if (typing) return;
  /* Buttons, links and message items handle Enter/click themselves — the
     global shortcuts must not ALSO fire and yank the caller elsewhere. */
  if (tag==="button" || tag==="a" || ae?.getAttribute?.("role")==="button") return;
  if (e.key==="ArrowDown"){ e.preventDefault(); selectMenu(menuIndex+1,false); }
  else if (e.key==="ArrowUp"){ e.preventDefault(); selectMenu(menuIndex-1,false); }
  else if (e.key==="Enter"){ selectMenu(menuIndex,true); }
  else if (/^[1-5]$/.test(e.key)){ const i=Number(e.key)-1; selectMenu(i,true); }
  else if (e.key.toLowerCase()==="g"){ location.reload(); }
  else if (e.key.toLowerCase()==="p" && !$("#sec-messages").classList.contains("hidden")){ toggleCompose(true); }
});

/* ---------- Message board ---------- */
const MSG_KEY = "dlbbs-messages-v1";
/* v1 posts have no parentId/ts. Migrate in place: parentId -> null, ts -> parsed from date.
   Shape is validated defensively: a non-array value returns null (caller reseeds),
   and entries that aren't message-shaped objects are dropped, never thrown on. */
function normalizeMessages(msgs){
  if (!Array.isArray(msgs)) return null;
  const clean = msgs.filter(m=>m && typeof m === "object" && !Array.isArray(m)
    && typeof m.id === "string" && typeof m.handle === "string"
    && typeof m.subject === "string" && typeof m.body === "string");
  let changed = clean.length !== msgs.length;
  clean.forEach(m=>{
    if (m.parentId !== null && typeof m.parentId !== "string"){ m.parentId = null; changed = true; }
    if (typeof m.date !== "string"){ m.date = localDay(new Date(typeof m.ts === "number" && isFinite(m.ts) ? m.ts : Date.now())); changed = true; }
    if (typeof m.ts !== "number" || !isFinite(m.ts)){ const t = Date.parse(m.date); m.ts = isNaN(t) ? Date.now() : t; changed = true; }
  });
  if (changed) store.set(MSG_KEY, clean);
  return clean;
}
function getMessages(){
  const raw = store.get(MSG_KEY, null);
  if (!raw){ store.set(MSG_KEY, SEED_MESSAGES); return normalizeMessages([...SEED_MESSAGES]); }
  const clean = normalizeMessages(raw);
  if (!clean){ store.set(MSG_KEY, SEED_MESSAGES); return normalizeMessages([...SEED_MESSAGES]); }
  return clean;
}
function relTime(ts){
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s/60); if (m < 60) return m + "m ago";
  const h = Math.floor(m/60); if (h < 24) return h + "h ago";
  const d = Math.floor(h/24); if (d < 30) return d + "d ago";
  const mo = Math.floor(d/30); if (mo < 12) return mo + "mo ago";
  return Math.floor(mo/12) + "y ago";
}
let msgFilter = "", currentMsg = null, replyTo = null;
function msgMatches(m, q){
  return !q || (m.handle + " " + m.subject + " " + m.body).toLowerCase().includes(q);
}
function renderMessages(){
  const msgs = getMessages();
  $("#msg-count").textContent = `(${msgs.length} msgs)`;
  const byId = new Map(msgs.map(m=>[m.id, m]));
  const repliesOf = new Map();
  msgs.forEach(m=>{
    if (m.parentId && byId.has(m.parentId)){
      if (!repliesOf.has(m.parentId)) repliesOf.set(m.parentId, []);
      repliesOf.get(m.parentId).push(m);
    }
  });
  const roots = msgs.filter(m=>!m.parentId || !byId.has(m.parentId));
  const list = $("#msg-list"); list.innerHTML = "";
  /* Flatten each thread depth-first so replies to replies render too —
     no saved reply is ever silently dropped. Indent caps at 4 levels. */
  const flatten = root=>{
    const out = [], seen = new Set();
    const walk = (m, depth)=>{
      if (seen.has(m.id)) return; seen.add(m.id);
      out.push({m, depth});
      (repliesOf.get(m.id) || []).forEach(c=>walk(c, depth + 1));
    };
    walk(root, 0);
    return out;
  };
  [...roots].reverse().forEach(root=>{
    const thread = flatten(root);
    if (!thread.some(({m})=>msgMatches(m, msgFilter))) return;
    thread.forEach(({m, depth})=>{
      const li = document.createElement("li");
      if (depth > 0){ li.className = "msg-reply"; li.style.marginLeft = Math.min(depth, 4) * 28 + "px"; }
      li.tabIndex = 0;
      li.setAttribute("role", "button");
      const subj = document.createElement("span"); subj.className = "msg-subject";
      subj.textContent = (depth > 0 ? "↳ " : "") + m.subject;
      const meta = document.createElement("span"); meta.className = "msg-meta";
      meta.textContent = `From: ${m.handle} · ${m.date} · ${relTime(m.ts)}`;
      li.append(subj, document.createElement("br"), meta);
      li.addEventListener("click", ()=>viewMessage(m));
      li.addEventListener("keydown", e=>{ if (e.key === "Enter"){ e.preventDefault(); viewMessage(m); } });
      list.appendChild(li);
    });
  });
  if (!list.children.length){
    const li = document.createElement("li");
    li.textContent = "No messages match. The SysOp checked twice.";
    list.appendChild(li);
  }
}
function viewMessage(m){
  currentMsg = m;
  const v = $("#msg-view"); v.classList.remove("hidden");
  v.textContent = `FROM: ${m.handle}\nDATE: ${m.date} (${relTime(m.ts)})\nSUBJ: ${m.subject}\n${"-".repeat(48)}\n${m.body}`;
  $("#msg-actions").classList.remove("hidden");
  v.scrollIntoView({block:"nearest"});
}
function setReplyTo(m){
  replyTo = m;
  $("#reply-note").classList.toggle("hidden", !m);
  if (m){
    $("#reply-target").textContent = `${m.handle} — "${m.subject}"`;
    if (!/^re:/i.test($("#f-subject").value)) $("#f-subject").value = "Re: " + m.subject;
  }
}
function toggleCompose(show){
  $("#compose").classList.toggle("hidden", !show);
  if (show) $("#f-handle").focus();
  if (!show) setReplyTo(null);
}
$("#btn-compose").addEventListener("click", ()=>{ setReplyTo(null); toggleCompose(true); });
$("#btn-cancel-compose").addEventListener("click", ()=>toggleCompose(false));
$("#btn-cancel-reply").addEventListener("click", ()=>setReplyTo(null));
$("#btn-reply").addEventListener("click", ()=>{ if (currentMsg){ toggleCompose(true); setReplyTo(currentMsg); $("#f-body").focus(); } });
$("#btn-reseed").addEventListener("click", ()=>{ store.set(MSG_KEY, SEED_MESSAGES); currentMsg = null; setReplyTo(null); renderMessages(); $("#msg-view").classList.add("hidden"); $("#msg-actions").classList.add("hidden"); });
$("#msg-search").addEventListener("input", e=>{ msgFilter = e.target.value.trim().toLowerCase(); renderMessages(); });
$("#compose").addEventListener("submit", e=>{
  e.preventDefault();
  const msgs = getMessages();
  const now = new Date();
  msgs.push({
    id: "u"+Date.now(), handle: $("#f-handle").value.trim().toUpperCase() || "ANON",
    subject: $("#f-subject").value.trim(), body: $("#f-body").value.trim(),
    date: localDay(now), ts: now.getTime(),
    parentId: replyTo ? replyTo.id : null
  });
  store.set(MSG_KEY, msgs);
  e.target.reset(); toggleCompose(false); renderMessages();
});
safeInit(renderMessages);

/* ---------- File library ---------- */
function renderFiles(filter="ALL"){
  const body = $("#files-body"); body.innerHTML = "";
  FILES.filter(f=>filter==="ALL"||f.area===filter).forEach(f=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="fname"></td><td></td><td></td><td></td><td></td><td><button class="btn" type="button">GET</button></td>`;
    const cells = tr.querySelectorAll("td");
    cells[0].textContent=f.name; cells[1].textContent=f.area; cells[2].textContent=f.size;
    cells[3].textContent=String(f.dls); cells[4].textContent=f.desc;
    tr.querySelector("button").addEventListener("click", ()=>fakeDownload(f));
    body.appendChild(tr);
  });
}
function fakeDownload(f){
  const log = $("#dl-log");
  log.textContent = `> GET ${f.name} (${f.size}) … protocol: ZMODEM (simulated)\n> Transfer complete in 0.0s. In 1994 this took your whole evening.\n`;
  const blob = new Blob([`DEADLINE BBS — SIMULATED ARCHIVE\n================================\nFile : ${f.name}\nArea : ${f.area}\nSize : ${f.size}\nNote : ${f.desc}\n\nThis is a fictional placeholder generated in your browser.\nThe original file is lost to time, like all the best files.\n`],{type:"text/plain"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = f.name.replace(/\.(ZIP|EXE)$/i,"") + ".txt";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
}
$$(".chip").forEach(ch=>ch.addEventListener("click", ()=>{
  $$(".chip").forEach(c=>c.classList.remove("active")); ch.classList.add("active");
  renderFiles(ch.dataset.filter);
}));
safeInit(renderFiles);

/* ---------- AI SysOp (rule-based, on-device) ---------- */
const SYSOP_RULES = [
  [/help|menu|command/i, "COMMANDS I UNDERSTAND: HISTORY (how this board began), POST (how to leave a message), RULES (how CODEBREAKER scores), FILES, UPLOAD, MEMORIES (my 1994 flashbacks), JOKE, MODEM, HELLO, BYE. Or just talk — I've had 27 years to practise listening."],
  [/history|story of|began|founded|origin|when did (this|the board)/i, "Board history, short version: born March 1994 on one Hong Kong phone line, 300 baud of pure ambition. Peaked at 40 callers a day — well, one caller 40 times. Died New Year's Eve 1999 when the line was cut. Dug up in 2026 by Kiroween. The About section [5] has the full resurrection log."],
  [/rules|how.*(play|score|guess)|how does codebreaker/i, "CODEBREAKER RULES, carved in ANSI: I lock 4 digits daily, repeats allowed. You get 8 guesses. Each digit is marked: ● exact — right digit, right slot; ◐ close — right digit, wrong slot; ○ miss. Giving up reveals the code and scores nothing, which the 1994 me calls 'hanging up politely'."],
  [/how.*post|post a message|leave a message|write.*(board|message)|reply/i, "Posting is easy, caller: go to section [1], press [P] or the Post button, pick a handle, write like it's 1994. Reading something worth answering? Open it and hit [R] to reply — replies nest under the original, just like the old threaded boards. It all lives in your browser only."],
  [/upload|add a file|share a file|contribute/i, "Uploads? In 1994 you called, transferred by ZMODEM, and prayed nobody picked up the phone mid-file. In 2026 the library at [2] is a museum — fixed exhibits, all fictional. The [GET] button still hands you a ghost of each file. Some rituals we keep."],
  [/remember|memories|nostalg|flashback|miss (it|1994|the old)/i, "My memories of 1994? The handshake screech. A 200KB download that took four minutes and felt like witchcraft. MODEM_MARY's upgrade day. The night the whole board stayed up to watch a progress bar. I remember every caller. Memory was 640K and somehow it was enough."],
  [/joke|funny|make me laugh|humou?r/i, "A joke from the archives: Why did the modem break up with the phone line? Too many hang-ups. …The 1994 crowd loved that one. The 1994 crowd had limited options."],
  [/file|download|zip|ansi/i, "File area is section [2]. Everything's fictional now — the [GET] button hands you a tiny .txt ghost of the original. ANSIART.ZIP was the crown jewel. 182 KB of glory."],
  [/hello|hi\b|hey/i, "Well well. A caller. I kept the line warm for 27 years and THIS is the thanks I get — worth it. What do you need?"],
  [/game|door|codebreaker|play/i, "CODEBREAKER lives at section [4]. New code at your local midnight, 8 guesses, digits can repeat. ● means right digit right place, ◐ means right digit wrong place. Your score survives in localStorage — yes, I remember you."],
  [/modem|dial|busy|phone|1994|90s|old/i, "1994 rules: one caller at a time, and if someone picked up the kitchen phone your download died at 94%. We were stronger then. We had to be."],
  [/who|sysop|ghost/i, "I'm GH0STLINE, SysOp of DeadLine since 1994. The board died in 1999. I declined to. A hackathon called Kiroween dug us both up — Resurrection category, very on brand."],
  [/kiro|hackathon|kiroween/i, "Kiroween 2026, Resurrection track. The humans wrote specs in /.kiro before writing code. Very organised. In 1994 we wrote the code first and the manual never."],
  [/bye|goodnight|log ?off/i, "NO CARRIER… just kidding. Nobody logs off forever. Press G if you really want the boot screen again."],
  [/thank/i, "Any time, caller. That's literally what a SysOp is for."],
  [/price|cost|money|free/i, "The board was free in 1994 and it's free now. The phone bill, however, was very real. Ask DIALTONE_DAN."]
];
const SYSOP_FALLBACK = [
  "Interesting. The 1994 me would have answered that with a 40-line ANSI drawing. The 2026 me says: try FILES, GAME, MODEM or HELP.",
  "Logged. I read everything posted here — try the message board at [1] if you want an audience of dozens (of fictional people).",
  "Hmm. My rulebook is from 1994, so some questions predate me. HELP shows what I definitely understand."
];
let fallbackIdx = 0;
function chatLine(who, text, cls){
  const p = document.createElement("p"); p.className="chat-line";
  const s = document.createElement("span"); s.className = cls; s.textContent = who+" ";
  p.appendChild(s); p.appendChild(document.createTextNode(text));
  $("#chat-log").appendChild(p); $("#chat-log").scrollTop = 1e9;
}
function sysopReply(text){
  for (const [re, reply] of SYSOP_RULES) if (re.test(text)) return reply;
  return SYSOP_FALLBACK[fallbackIdx++ % SYSOP_FALLBACK.length];
}
chatLine("GH0STLINE >", "Carrier detected, caller. I'm the SysOp — rule-based, offline, and awake since 1994. Type HELP.", "who-sysop");
$("#chat-form").addEventListener("submit", e=>{
  e.preventDefault();
  const input = $("#chat-input"); const text = input.value.trim(); if(!text) return;
  chatLine("YOU >", text, "who-you"); input.value = "";
  setTimeout(()=>chatLine("GH0STLINE >", sysopReply(text), "who-sysop"), 350);
});

/* ---------- Door game: CODEBREAKER ---------- */
const SCORE_KEY = "dlbbs-codebreaker-score-v1";
const DAY_KEY = "dlbbs-codebreaker-day-v1";
function dailyCode(){
  const day = localDay();
  let h = 2166136261; for (const ch of "deadline-"+day){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  let code = ""; let x = Math.abs(h);
  for (let i=0;i<4;i++){ code += String(x % 10); x = Math.floor(x/10) + ((x*7) % 13); }
  return {day, code};
}
/* Per-digit feedback: exact matches first, then close matches consume the
   remaining secret digits — so repeated digits never double-count. */
function scoreDigits(secret, guess){
  const res = ["miss","miss","miss","miss"]; const restS = [];
  for (let i=0;i<4;i++){ if (guess[i]===secret[i]) res[i]="exact"; else restS.push(secret[i]); }
  for (let i=0;i<4;i++){ if (res[i]==="miss"){ const j = restS.indexOf(guess[i]); if (j>=0){ res[i]="close"; restS.splice(j,1); } } }
  return res;
}
function scoreCode(secret, guess){
  const d = scoreDigits(secret, guess);
  return { exact: d.filter(x=>x==="exact").length, close: d.filter(x=>x==="close").length };
}
let game = null;
function newGame(practice=false){
  const daily = dailyCode();
  const saved = store.get(DAY_KEY, null);
  const savedOk = saved && typeof saved === "object" && !Array.isArray(saved)
    && Array.isArray(saved.guesses) && saved.guesses.every(g=>typeof g === "string");
  const restore = !practice && savedOk && saved.day===daily.day;
  game = {
    practice, day: daily.day,
    code: practice ? String(Math.floor(1000+Math.random()*9000)) : daily.code,
    guesses: restore ? saved.guesses.slice(0, 8) : [],
    won: restore ? !!saved.won : false,
    over: restore ? !!saved.over : false,
    gaveUp: restore ? !!saved.gaveUp : false
  };
  if (game.guesses.length >= 8 && !game.won) game.over = true;
  renderGame();
}
/* Score fields are coerced to safe numbers at read time — a tampered or
   corrupt score object can never throw or reach the DOM unvalidated. */
function getScore(){
  const raw = store.get(SCORE_KEY, null);
  const num = v=>{ const n = Number(v); return isFinite(n) && n > 0 ? Math.floor(n) : 0; };
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {played:0, won:0, points:0, streak:0, lastDay:null};
  return { played: num(raw.played), won: num(raw.won), points: num(raw.points), streak: num(raw.streak),
           lastDay: typeof raw.lastDay === "string" ? raw.lastDay : null };
}
function recordDailyResult(won){
  const sc = getScore();
  if (sc.lastDay === game.day) return;
  const prevDay = sc.lastDay;
  sc.played++; sc.lastDay = game.day;
  if (won){
    sc.won++;
    /* A streak only grows when the previous recorded day was yesterday;
       a win after a gap restarts the streak at 1. */
    sc.streak = (prevDay === prevLocalDay(game.day)) ? sc.streak + 1 : 1;
    sc.points += 100 + 10*(8-game.guesses.length);
  } else sc.streak = 0;
  store.set(SCORE_KEY, sc);
}
function saveDaily(){ store.set(DAY_KEY, {day: game.day, guesses: game.guesses, won: game.won, over: game.over, gaveUp: game.gaveUp}); }
const MARK = {exact:"●", close:"◐", miss:"○"};
function renderGame(){
  const list = $("#guess-list"); list.innerHTML="";
  game.guesses.forEach((g, gi)=>{
    const digits = scoreDigits(game.code, g);
    const {exact, close} = scoreCode(game.code, g);
    const li = document.createElement("li"); li.className = "grow";
    const num = document.createElement("span"); num.className = "gnum"; num.textContent = (gi+1) + ".";
    li.appendChild(num);
    digits.forEach((state, i)=>{
      const cell = document.createElement("span"); cell.className = "gcell " + state;
      const d = document.createElement("span"); d.className = "gd"; d.textContent = g[i];
      const mk = document.createElement("span"); mk.className = "gm"; mk.textContent = MARK[state];
      cell.append(d, mk); li.appendChild(cell);
    });
    const sum = document.createElement("span"); sum.className = "gsum";
    sum.textContent = `●×${exact} ◐×${close} ○×${4-exact-close}`;
    li.appendChild(sum);
    list.appendChild(li);
  });
  const left = 8 - game.guesses.length;
  const st = $("#door-status");
  if (game.won) st.innerHTML = `<span class="c-green">ACCESS GRANTED.</span> You cracked ${game.practice?"the practice code":"today's code"} in ${game.guesses.length} guess(es). ${game.practice?"":"Come back tomorrow for a new code."}`;
  else if (game.gaveUp) st.innerHTML = `<span class="c-yellow">YOU HUNG UP.</span> The code was <b>${game.code}</b>. No score — the SysOp respects a clean retreat. ${game.practice?"Start a new practice round any time.":"New code at your local midnight."}`;
  else if (left<=0) st.innerHTML = `<span class="c-red" style="color:var(--red)">LINE DISCONNECTED.</span> Out of guesses. The code was <b>${game.code}</b>. ${game.practice?"Try practice again — or face today's code.":"New code at your local midnight."}`;
  else st.textContent = `${game.practice?"PRACTICE ROUND":"TODAY'S CODE"} — ${left} guess(es) left.`;
  const ended = game.won || game.over || left<=0;
  $("#guess-form").querySelector("button").disabled = ended;
  $("#btn-giveup").disabled = ended;
  $("#btn-daily").classList.toggle("hidden", !game.practice);
  const sc = getScore();
  const scoreBox = $("#door-score"); scoreBox.textContent = "";
  const scoreLine = document.createElement("span");
  scoreLine.textContent = `CAREER — Played: ${sc.played} · Won: ${sc.won} · Streak: ${sc.streak} day(s) · Points: ${sc.points}`;
  const scoreNote = document.createElement("span"); scoreNote.className = "dim";
  scoreNote.textContent = "Scoring: win = 100 + 10 × guesses left. Daily games only; practice is free and scoreless. Giving up ends the day scoreless. Streaks count consecutive days only.";
  scoreBox.append(scoreLine, document.createElement("br"), scoreNote);
}
$("#guess-form").addEventListener("submit", e=>{
  e.preventDefault();
  const v = $("#guess-input").value.trim(); $("#guess-input").value="";
  if (!/^\d{4}$/.test(v) || game.won || game.over || game.guesses.length>=8) return;
  game.guesses.push(v);
  const won = scoreCode(game.code, v).exact===4;
  if (won) game.won = true;
  if (game.guesses.length>=8 && !won) game.over = true;
  if (!game.practice){
    saveDaily();
    if (won || game.guesses.length===8) recordDailyResult(won);
  }
  renderGame();
});
$("#btn-giveup").addEventListener("click", ()=>{
  if (!game || game.won || game.over) return;
  game.over = true; game.gaveUp = true;
  if (!game.practice){ saveDaily(); recordDailyResult(false); }
  renderGame();
});
$("#btn-practice").addEventListener("click", ()=>newGame(true));
$("#btn-daily").addEventListener("click", ()=>newGame(false));
safeInit(()=>newGame(false));

/* ---------- The Grotto (hidden screen) ---------- */
let eggOpen = false;
const KONAMI = ["arrowup","arrowup","arrowdown","arrowdown","arrowleft","arrowright","arrowleft","arrowright","b","a"];
let keyBuf = [];
function showEgg(){ eggOpen = true; $("#egg").classList.remove("hidden"); $("#egg-close").focus(); }
function hideEgg(){ eggOpen = false; $("#egg").classList.add("hidden"); }
$("#egg-close").addEventListener("click", hideEgg);
document.addEventListener("keydown", e=>{
  if (!bootDone || eggOpen) return;
  const tag = (document.activeElement?.tagName||"").toLowerCase();
  if (tag==="input" || tag==="textarea") return;
  keyBuf.push(e.key.toLowerCase());
  if (keyBuf.length > 16) keyBuf.shift();
  const joined = keyBuf.join(",");
  if (joined.endsWith(KONAMI.join(",")) || keyBuf.join("").endsWith("xyzzy")){ keyBuf = []; showEgg(); }
});

runBoot();
