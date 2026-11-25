"use strict";
/* DeadLine BBS — all client-side, no backend, no external calls.
   All people, posts and files below are fictional demo content. */

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const store = {
  get(k, fallback){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }catch(e){ return fallback; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};

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
(function(){ const n = store.get("dlbbs-visits",0)+1; store.set("dlbbs-visits",n);
  const c=$("#caller-count"); if(c) c.textContent = String(n); })();

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
  const tag = (document.activeElement?.tagName||"").toLowerCase();
  const typing = tag==="input" || tag==="textarea";
  if (typing) return;
  if (e.key==="ArrowDown"){ e.preventDefault(); selectMenu(menuIndex+1,false); }
  else if (e.key==="ArrowUp"){ e.preventDefault(); selectMenu(menuIndex-1,false); }
  else if (e.key==="Enter"){ selectMenu(menuIndex,true); }
  else if (/^[1-5]$/.test(e.key)){ const i=Number(e.key)-1; selectMenu(i,true); }
  else if (e.key.toLowerCase()==="g"){ location.reload(); }
  else if (e.key.toLowerCase()==="p" && !$("#sec-messages").classList.contains("hidden")){ toggleCompose(true); }
});

/* ---------- Message board ---------- */
const MSG_KEY = "dlbbs-messages-v1";
function getMessages(){ return store.get(MSG_KEY, null) || (store.set(MSG_KEY, SEED_MESSAGES), [...SEED_MESSAGES]); }
function renderMessages(){
  const msgs = getMessages();
  $("#msg-count").textContent = `(${msgs.length} msgs)`;
  const list = $("#msg-list"); list.innerHTML = "";
  [...msgs].reverse().forEach(m=>{
    const li = document.createElement("li");
    li.innerHTML = `<span class="msg-subject"></span><br><span class="msg-meta"></span>`;
    li.querySelector(".msg-subject").textContent = m.subject;
    li.querySelector(".msg-meta").textContent = `From: ${m.handle} · ${m.date}`;
    li.addEventListener("click", ()=>viewMessage(m));
    list.appendChild(li);
  });
}
function viewMessage(m){
  const v = $("#msg-view"); v.classList.remove("hidden");
  v.textContent = `FROM: ${m.handle}\nDATE: ${m.date}\nSUBJ: ${m.subject}\n${"-".repeat(48)}\n${m.body}`;
  v.scrollIntoView({block:"nearest"});
}
function toggleCompose(show){
  $("#compose").classList.toggle("hidden", !show);
  if (show) $("#f-handle").focus();
}
$("#btn-compose").addEventListener("click", ()=>toggleCompose(true));
$("#btn-cancel-compose").addEventListener("click", ()=>toggleCompose(false));
$("#btn-reseed").addEventListener("click", ()=>{ store.set(MSG_KEY, SEED_MESSAGES); renderMessages(); $("#msg-view").classList.add("hidden"); });
$("#compose").addEventListener("submit", e=>{
  e.preventDefault();
  const msgs = getMessages();
  msgs.push({
    id: "u"+Date.now(), handle: $("#f-handle").value.trim().toUpperCase() || "ANON",
    subject: $("#f-subject").value.trim(), body: $("#f-body").value.trim(),
    date: new Date().toISOString().slice(0,10)
  });
  store.set(MSG_KEY, msgs);
  e.target.reset(); toggleCompose(false); renderMessages();
});
renderMessages();

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
renderFiles();

/* ---------- AI SysOp (rule-based, on-device) ---------- */
const SYSOP_RULES = [
  [/help|menu|command/i, "COMMANDS I UNDERSTAND: FILES (what's in the library), GAME (how CODEBREAKER works), MODEM (war stories), HELLO, BYE. Or just talk — I've had 27 years to practise listening."],
  [/hello|hi\b|hey/i, "Well well. A caller. I kept the line warm for 27 years and THIS is the thanks I get — worth it. What do you need?"],
  [/file|download|zip|ansi/i, "File area is section [2]. Everything's fictional now — the [GET] button hands you a tiny .txt ghost of the original. ANSIART.ZIP was the crown jewel. 182 KB of glory."],
  [/game|door|codebreaker|play/i, "CODEBREAKER lives at section [4]. New code every midnight, 8 guesses, digits can repeat. ● means right digit right place, ◐ means right digit wrong place. Your score survives in localStorage — yes, I remember you."],
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
  const day = new Date().toISOString().slice(0,10);
  let h = 2166136261; for (const ch of "deadline-"+day){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  let code = ""; let x = Math.abs(h);
  for (let i=0;i<4;i++){ code += String(x % 10); x = Math.floor(x/10) + ((x*7) % 13); }
  return {day, code};
}
function scoreCode(secret, guess){
  let exact=0; const s=[...secret], g=[...guess]; const restS=[], restG=[];
  s.forEach((d,i)=>{ if(d===g[i]) exact++; else { restS.push(d); restG.push(g[i]); } });
  let close=0; restG.forEach(d=>{ const j=restS.indexOf(d); if(j>=0){ close++; restS.splice(j,1); } });
  return {exact, close};
}
let game = null;
function newGame(practice=false){
  const daily = dailyCode();
  const saved = store.get(DAY_KEY, null);
  game = {
    practice, day: daily.day,
    code: practice ? String(Math.floor(1000+Math.random()*9000)) : daily.code,
    guesses: (!practice && saved && saved.day===daily.day) ? saved.guesses : [],
    won: (!practice && saved && saved.day===daily.day) ? saved.won : false
  };
  renderGame();
}
function getScore(){ return store.get(SCORE_KEY, {played:0, won:0, points:0, streak:0, lastDay:null}); }
function renderGame(){
  const list = $("#guess-list"); list.innerHTML="";
  game.guesses.forEach(g=>{
    const {exact, close} = scoreCode(game.code, g);
    const li = document.createElement("li");
    li.textContent = `${g}   ${"●".repeat(exact)}${"◐".repeat(close)}${"○".repeat(4-exact-close)}`;
    list.appendChild(li);
  });
  const left = 8 - game.guesses.length;
  const st = $("#door-status");
  if (game.won) st.innerHTML = `<span class="c-green">ACCESS GRANTED.</span> You cracked ${game.practice?"the practice code":"today's code"} in ${game.guesses.length} guess(es). ${game.practice?"":"Come back tomorrow for a new code."}`;
  else if (left<=0) st.innerHTML = `<span class="c-red" style="color:var(--red)">LINE DISCONNECTED.</span> Out of guesses. The code was <b>${game.code}</b>. ${game.practice?"Try practice again — or face today's code.":"New code at midnight."}`;
  else st.textContent = `${game.practice?"PRACTICE ROUND":"TODAY'S CODE"} — ${left} guess(es) left.`;
  $("#guess-form").querySelector("button").disabled = game.won || left<=0;
  const sc = getScore();
  $("#door-score").innerHTML = `CAREER — Played: ${sc.played} · Won: ${sc.won} · Streak: ${sc.streak} day(s) · Points: ${sc.points}<br><span class="dim">Scoring: win = 100 + 10 × guesses left. Daily games only; practice is free and scoreless.</span>`;
}
$("#guess-form").addEventListener("submit", e=>{
  e.preventDefault();
  const v = $("#guess-input").value.trim(); $("#guess-input").value="";
  if (!/^\d{4}$/.test(v) || game.won || game.guesses.length>=8) return;
  game.guesses.push(v);
  const won = scoreCode(game.code, v).exact===4;
  if (won) game.won = true;
  if (!game.practice){
    store.set(DAY_KEY, {day: game.day, guesses: game.guesses, won: game.won});
    if (won || game.guesses.length===8){
      const sc = getScore();
      if (sc.lastDay !== game.day){
        sc.played++; sc.lastDay = game.day;
        if (won){ sc.won++; sc.streak++; sc.points += 100 + 10*(8-game.guesses.length); } else sc.streak = 0;
        store.set(SCORE_KEY, sc);
      }
    }
  }
  renderGame();
});
$("#btn-practice").addEventListener("click", ()=>newGame(true));
newGame(false);

runBoot();
