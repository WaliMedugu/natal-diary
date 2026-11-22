// Natal Diary prototype. A single-page app with no build step. All data is kept
// on the device (localStorage), so it works offline once loaded.
(function () {
  const KEY = "natal-diary-v1";
  const DAY = 86400000;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  // WHO 2016 eight-contact antenatal model (weeks)
  const CONTACTS = [
    { w: 12, what: "Booking visit: blood tests, HIV/syphilis screening, BP, weight, dating scan" },
    { w: 20, what: "Anomaly scan, BP, urine test, start IPTp malaria prevention" },
    { w: 26, what: "BP, fundal height, blood sugar check, IPTp dose" },
    { w: 30, what: "BP, haemoglobin check, baby's growth" },
    { w: 34, what: "BP, IPTp dose, birth preparedness plan" },
    { w: 36, what: "Baby's position, BP, plan where to deliver" },
    { w: 38, what: "BP, signs of labour, final checks" },
    { w: 40, what: "Due date check, plan if labour hasn't started" },
  ];
  // Nigeria NPHCDA routine immunisation schedule (days after birth)
  const IMMS = [
    { d: 0, what: "BCG, OPV0, Hepatitis B (birth dose)" },
    { d: 42, what: "Pentavalent 1, PCV 1, OPV 1, Rotavirus 1" },
    { d: 70, what: "Pentavalent 2, PCV 2, OPV 2, Rotavirus 2" },
    { d: 98, what: "Pentavalent 3, PCV 3, OPV 3, IPV" },
    { d: 183, what: "Vitamin A (1st dose)" },
    { d: 274, what: "Measles 1, Yellow fever, Meningitis A" },
    { d: 456, what: "Measles 2" },
  ];
  const WEEK_TIPS = {
    12: "Baby is about the size of a lime. Book your first antenatal visit if you haven't.",
    16: "Baby is about the size of an avocado. Keep taking iron and folic acid daily.",
    20: "Halfway! You may start to feel the baby move. Ask about your anomaly scan.",
    24: "Baby is about the size of a corn cob. Sleep under a treated net every night.",
    28: "Third trimester. Start counting kicks: at least 10 in 2 hours. Sleep on your side.",
    32: "Baby is gaining weight fast. Watch for headache, blurred vision and swelling.",
    36: "Pack your hospital bag and confirm transport to your delivery facility.",
    40: "Your due date. Go to your facility when contractions are 5 minutes apart.",
  };

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage blocked: keep in memory */ } }

  function demoState() {
    const now = Date.now();
    const edd = now + (40 - 24) * 7 * DAY - 3 * DAY; // ~24 weeks today
    return {
      name: "Amina", edd, clinic: "Wuse District Hospital, Abuja", lang: "English",
      visitsDone: [12, 20], tdDoses: 1, birth: null,
      logs: [
        { t: now - 14 * DAY, week: 22, systolic: 112, diastolic: 72, weight: 68.2, temperature: 36.7, symptoms: [], level: "green" },
        { t: now - 7 * DAY, week: 23, systolic: 118, diastolic: 76, weight: 68.9, temperature: 36.8, symptoms: ["burning_urine"], level: "amber" },
        { t: now - 1 * DAY, week: 24, systolic: 116, diastolic: 74, weight: 69.3, temperature: 36.6, symptoms: [], level: "green" },
      ],
      notes: [
        { t: now - 28 * DAY, text: "20-week scan normal. One baby, placenta high. Hb 11.2 g/dL." },
        { t: now - 70 * DAY, text: "Booking visit. Blood group O+. HIV, syphilis and hepatitis B negative." },
      ],
      chat: [],
    };
  }

  let state = load() || demoState();
  if (new URLSearchParams(location.search).has("fresh")) { state = demoState(); save(); }

  const gaDays = () => 280 - Math.round((state.edd - Date.now()) / DAY);
  const gaWeek = () => Math.max(0, Math.floor(gaDays() / 7));
  const tipFor = (w) => { const ks = Object.keys(WEEK_TIPS).map(Number).filter((k) => k <= w); return WEEK_TIPS[ks.length ? Math.max(...ks) : 12]; };
  const dateAtWeek = (w) => state.edd - (40 - w) * 7 * DAY;

  // ---------- screens ----------
  function home() {
    const w = gaWeek();
    const pct = Math.min(100, Math.round((gaDays() / 280) * 100));
    const next = CONTACTS.find((c) => !state.visitsDone.includes(c.w) && c.w >= w) || CONTACTS.find((c) => !state.visitsDone.includes(c.w));
    const overdue = CONTACTS.filter((c) => c.w < w && !state.visitsDone.includes(c.w));
    const last = state.logs[state.logs.length - 1];
    return `
      <p class="sub" style="margin:0">Good morning,</p>
      <h2>${esc(state.name)}</h2>
      <div class="ring" style="background:conic-gradient(var(--rose) 0 ${pct}%,var(--blush) ${pct}% 100%)"><div><span><strong>Week ${w}</strong><small>${pct}% complete<br>Due ${new Date(state.edd).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</small></span></div></div>
      ${overdue.length ? `<div class="result amber" style="margin-top:0"><h4>Missed visit</h4><p>Your ${overdue[0].w}-week check hasn't been logged. Call ${esc(state.clinic)} to rebook.</p></div>` : ""}
      ${next ? `<div class="card"><div class="row" style="justify-content:space-between"><b>Next antenatal visit</b><span class="pill due">Week ${next.w}</span></div><p style="margin-top:6px">${fmt(dateAtWeek(next.w))} · ${esc(state.clinic)}</p><p class="sub" style="margin:6px 0 0">${next.what}</p></div>` : ""}
      ${state.tdDoses < 2 ? `<div class="card"><div class="row" style="justify-content:space-between"><b>Tetanus (Td) dose ${state.tdDoses + 1}</b><span class="pill due">Due</span></div><p style="margin-top:6px">Ask for it at your next visit, then tap to log it.</p><button class="ghost" style="margin-top:8px" data-act="td">Log Td dose</button></div>` : ""}
      <div class="card"><b>This week</b><p style="margin-top:6px">${tipFor(w)}</p></div>
      ${last ? `<div class="card log-item"><div><b>Last check-in</b><p>${fmt(last.t)} · BP ${last.systolic}/${last.diastolic} · ${last.weight} kg</p></div><span class="dot ${last.level}"></span></div>` : ""}
      <h3>Daily reminders</h3>
      <div class="card"><p>💊 Iron + folic acid, 8:00 am<br>🛏️ Sleep under a treated net<br>🦶 Count kicks after meals${w >= 28 ? "" : " (from week 28)"}</p></div>`;
  }

  function chip(key, label, red) { return `<span class="chip ${red ? "redk" : ""}" data-sym="${key}">${label}</span>`; }

  function log() {
    const R = NDTriage.RED_SYMPTOMS, A = NDTriage.AMBER_SYMPTOMS;
    return `
      <h2>Daily check-in</h2>
      <p class="sub">Week ${gaWeek()} · takes 30 seconds</p>
      <div class="two"><div><label>BP systolic</label><input id="sys" inputmode="numeric" placeholder="120"></div><div><label>BP diastolic</label><input id="dia" inputmode="numeric" placeholder="80"></div></div>
      <div class="two"><div><label>Weight (kg)</label><input id="wt" inputmode="decimal" placeholder="69.0"></div><div><label>Temperature (°C)</label><input id="temp" inputmode="decimal" placeholder="36.8"></div></div>
      <label>Baby's movements in 2 hours ${gaWeek() < 28 ? "(from week 28)" : ""}</label><input id="kicks" inputmode="numeric" placeholder="e.g. 12">
      <label>How are you feeling? Tap any that apply</label>
      <div class="chips">${Object.entries(A).map(([k, v]) => chip(k, v)).join("")}${Object.entries(R).map(([k, v]) => chip(k, v, true)).join("")}</div>
      <button class="btn" data-act="savelog">Save &amp; check</button>
      <div id="out"></div>`;
  }

  function ask() {
    const sugg = ["How often should my baby move?", "What blood pressure is too high?", "What should I eat?", "Which vaccines does my baby need?", "I lost my pregnancy"];
    const msgs = state.chat.map((m) => m.me ? `<div class="bubble me">${esc(m.text)}</div>`
      : `<div class="bubble bot">${esc(m.text)}${m.src ? `<span class="src">Source: ${esc(m.src)}</span>` : ""}</div>`).join("");
    return `
      <h2>Ask Natal Diary</h2>
      <p class="sub">Answers come only from our verified library, each with its source. This is not a diagnosis.</p>
      <div class="banner">If you have bleeding, fits, a severe headache or your baby stops moving, <b>go to a hospital now</b>.</div>
      ${msgs || `<div class="bubble bot">Hi ${esc(state.name)}! Ask me anything about your pregnancy or your baby.</div>`}
      <div class="suggest">${sugg.map((s) => `<span class="chip" data-q="${esc(s)}">${esc(s)}</span>`).join("")}</div>
      <div class="askbar"><input id="q" placeholder="Type your question…"><button data-act="ask">Ask</button></div>`;
  }

  function record() {
    const w = gaWeek();
    return `
      <h2>My record</h2>
      <p class="sub">Show this to any clinic, or share it as a summary</p>
      <div class="card"><p><b>${esc(state.name)}</b> · Due ${fmt(state.edd)} · Week ${w}<br>Clinic: ${esc(state.clinic)}<br>Td doses: ${state.tdDoses} · Visits done: ${state.visitsDone.length}/8</p></div>
      <h3>Antenatal plan (WHO 8 contacts)</h3>
      <div class="timeline">${CONTACTS.map((c) => {
        const done = state.visitsDone.includes(c.w);
        const status = done ? `<span class="pill done">Done</span>` : c.w < w ? `<span class="pill due">Missed</span>` : `<span class="pill">${fmt(dateAtWeek(c.w))}</span>`;
        return `<div class="card"><span class="w">${c.w}w</span><p style="flex:1">${c.what}</p>${done ? status : `<span data-visit="${c.w}" style="cursor:pointer">${status}</span>`}</div>`;
      }).join("")}</div>
      <h3>Check-ins</h3>
      ${state.logs.slice().reverse().map((l) => `<div class="card log-item"><p>${fmt(l.t)} · wk ${l.week} · BP ${l.systolic || "–"}/${l.diastolic || "–"} · ${l.weight || "–"} kg</p><span class="dot ${l.level}"></span></div>`).join("")}
      <h3>Visit notes</h3>
      ${state.notes.map((n) => `<div class="card"><p><b>${fmt(n.t)}</b><br>${esc(n.text)}</p></div>`).join("")}
      <textarea id="note" rows="2" placeholder="Add a note from your visit…"></textarea>
      <button class="btn" data-act="note">Add note</button>
      <button class="btn" style="background:var(--rose)" data-act="share">Share summary with clinic</button>`;
  }

  function baby() {
    if (!state.birth) {
      return `
        <h2>Baby mode</h2>
        <p class="sub">After delivery, Natal Diary becomes your baby's diary</p>
        <div class="card"><p>We'll remind you about every vaccine in Nigeria's routine immunisation schedule, and about your postnatal checks at 24 hours, day 3, days 7–14 and 6 weeks.</p></div>
        <label>Baby's date of birth</label><input id="dob" type="date">
        <button class="btn" data-act="birth">Start baby mode</button>
        <p class="sub" style="margin-top:12px">Preview with a sample birth date:</p>
        <button class="ghost" data-act="birthdemo">Show example schedule</button>`;
    }
    const b = state.birth;
    return `
      <h2>Baby's diary</h2>
      <p class="sub">Born ${fmt(b)} · ${Math.max(0, Math.floor((Date.now() - b) / DAY / 7))} weeks old</p>
      <h3>Immunisations (NPHCDA schedule)</h3>
      <div class="timeline">${IMMS.map((im) => {
        const due = b + im.d * DAY;
        const st = due < Date.now() - 2 * DAY ? `<span class="pill done">Given</span>` : `<span class="pill due">${fmt(due)}</span>`;
        return `<div class="card"><p style="flex:1"><b>${im.d === 0 ? "At birth" : im.d < 120 ? Math.round(im.d / 7) + " weeks" : Math.round(im.d / 30.4) + " months"}</b><br>${im.what}</p>${st}</div>`;
      }).join("")}</div>
      <h3>Postnatal checks for mum</h3>
      <div class="card"><p>24 hours · Day 3 · Days 7–14 · 6 weeks</p></div>
      <button class="ghost" data-act="unbirth">Back to pregnancy</button>`;
  }

  const SCREENS = { home, log, ask, record, baby };

  function render() {
    const tab = (location.hash.replace("#", "").split("?")[0]) || "home";
    const fn = SCREENS[tab] || home;
    $("#screen").innerHTML = `<span class="offline">● Saved on device</span>` + fn();
    document.querySelectorAll(".tabs a").forEach((a) => a.classList.toggle("active", a.dataset.tab === tab));
    if (tab === "ask") { const s = $("#screen"); s.scrollTop = s.scrollHeight; }
  }

  function answer(q) {
    if (!q.trim()) return;
    state.chat.push({ me: true, text: q });
    // Safety layer: emergency words always get an urgent reply first, whatever retrieval finds.
    if (/bleed|blood(?!\s*pressure)|convuls|\bfits?\b|seizure|not moving|stopped moving|no movement|water(s)? (broke|break)|faint|can'?t breathe/i.test(q)) {
      state.chat.push({ text: "⚠️ This may be a danger sign. Please go to the nearest hospital or call your midwife now. Don't wait for your next appointment.", src: "WHO / FMoH Nigeria danger signs" });
      const ds = NDKB.KB.find((d) => d.id === "danger-signs");
      state.chat.push({ text: ds.a, src: ds.src });
      save(); render(); return;
    }
    const r = NDKB.ask(q);
    if (r.confident) state.chat.push({ text: r.answer.a, src: r.answer.src });
    else state.chat.push({ text: "I'm not sure I have a verified answer for that. Please ask your midwife at your next visit, or call your clinic if you are worried." });
    save(); render();
  }

  function runLog() {
    const syms = [...document.querySelectorAll(".chip.on[data-sym]")].map((c) => c.dataset.sym);
    const entry = { t: Date.now(), week: gaWeek(), systolic: $("#sys").value, diastolic: $("#dia").value, weight: $("#wt").value, temperature: $("#temp").value, kicks2h: $("#kicks").value, symptoms: syms };
    const r = NDTriage.triage(entry);
    entry.level = r.level;
    state.logs.push(entry); save();
    const title = { red: "Go to a hospital now", amber: "Call your clinic today", green: "All looks okay" }[r.level];
    $("#out").innerHTML = `<div class="result ${r.level}"><h4>${title}</h4><p>${r.advice}</p>${r.reasons.length ? `<ul>${r.reasons.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}${r.level === "red" ? `<p style="margin-top:8px"><b>📞 Call your clinic</b> · Share your record on arrival</p>` : ""}</div>`;
    $("#out").scrollIntoView({ block: "end" });
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-sym],[data-q],[data-act],[data-visit]");
    if (!t) return;
    if (t.dataset.sym) t.classList.toggle("on");
    else if (t.dataset.q) answer(t.dataset.q);
    else if (t.dataset.visit) { state.visitsDone.push(Number(t.dataset.visit)); save(); render(); }
    else {
      const a = t.dataset.act;
      if (a === "savelog") runLog();
      if (a === "ask") answer($("#q").value);
      if (a === "td") { state.tdDoses++; save(); render(); }
      if (a === "note") { const v = $("#note").value.trim(); if (v) { state.notes.unshift({ t: Date.now(), text: v }); save(); render(); } }
      if (a === "share") {
        const s = `Natal Diary summary: ${state.name}, due ${fmt(state.edd)} (week ${gaWeek()}). Visits done ${state.visitsDone.length}/8. Td doses ${state.tdDoses}. Last BP ${state.logs.at(-1)?.systolic}/${state.logs.at(-1)?.diastolic}.`;
        if (navigator.share) navigator.share({ title: "Natal Diary", text: s }).catch(() => {}); else alert(s);
      }
      if (a === "birth") { const v = $("#dob").value; if (v) { state.birth = new Date(v).getTime(); save(); render(); } }
      if (a === "birthdemo") { state.birth = Date.now() - 50 * DAY; save(); render(); }
      if (a === "unbirth") { state.birth = null; save(); render(); }
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.id === "q") answer(e.target.value); });
  $("#resetBtn").addEventListener("click", () => { state = demoState(); save(); location.hash = "home"; render(); });
  window.addEventListener("hashchange", render);

  // Scripted demo states (used to record the demo video): ?shot=red etc.
  window.NDDemo = { state: () => state, answer, runLog };
  render();
  const shot = new URLSearchParams(location.search).get("shot");
  if (shot) {
    state = demoState(); save(); render();
    const go = (t) => { history.replaceState(null, "", "#" + t); render(); };
    const fill = (sys, dia, kicks, syms, temp) => {
      go("log");
      $("#sys").value = sys; $("#dia").value = dia; $("#wt").value = "69.6"; $("#temp").value = temp || "36.8"; $("#kicks").value = kicks;
      syms.forEach((s) => document.querySelector(`[data-sym=${s}]`).classList.add("on"));
      runLog(); setTimeout(() => { const sc = $("#screen"); sc.scrollTop = sc.scrollHeight; }, 60);
    };
    if (shot === "log") { go("log"); $("#sys").value = "118"; $("#dia").value = "76"; $("#wt").value = "69.6"; $("#kicks").value = "12"; }
    if (shot === "green") fill("118", "76", "12", []);
    if (shot === "amber") fill("142", "88", "12", []);
    if (shot === "red") fill("148", "96", "8", ["headache", "blurred_vision"]);
    if (shot === "ask") { go("ask"); answer("How often should my baby move?"); answer("I'm seeing blood, should I worry"); }
    if (shot === "ask2") { go("ask"); answer("what food is good for me now that I'm pregnant"); answer("can I drink agbo?"); }
    if (shot === "record") { go("record"); }
    if (shot === "baby") { state.birth = Date.now() - 50 * DAY; save(); go("baby"); }
    if (shot === "missed") { state.edd = Date.now() + (40 - 28) * 7 * DAY; state.visitsDone = [12, 20]; save(); go("home"); }
  }
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
