/* ============================================================
   HomeFlow — Demo UI (frontend only, no backend)
   ============================================================ */

(() => {
  "use strict";

  /* ---------- State ---------- */

  let MEMBERS = [
    { id: "me",  name: "Mẹ",  role: "Lan", color: "#B99AE0", dark: "#6B4A9E", soft: "#EDE4F7", emoji: "👩" },
    { id: "bo",  name: "Bố",  role: "Minh", color: "#93B58C", dark: "#52744B", soft: "#E3ECDF", emoji: "👨" },
    { id: "bin", name: "Bạn lớn", role: "Bin", color: "#E9A8BC", dark: "#A8506B", soft: "#F9E3E9", emoji: "🧑" },
    { id: "su",  name: "Bạn nhỏ", role: "Su", color: "#E8C37E", dark: "#8A6A2F", soft: "#F7EBD5", emoji: "👶" },
  ];

  const KID_PALETTE = [
    { color: "#8FC1D9", dark: "#3F7A96", soft: "#E4F1F8", emoji: "🧒" },
    { color: "#C79AD9", dark: "#7A4E94", soft: "#F1E6F7", emoji: "👦" },
    { color: "#B4C98F", dark: "#5F7A45", soft: "#EDF2E2", emoji: "👧" },
    { color: "#E0A8A0", dark: "#9C5C54", soft: "#F9E9E6", emoji: "👼" },
  ];
  let kidPaletteIdx = 0;

  function addKid(name, birthday) {
    const pal = KID_PALETTE[kidPaletteIdx % KID_PALETTE.length];
    kidPaletteIdx++;
    const id = "k" + (MEMBERS.length + 1);
    MEMBERS.push({ id, name, role: name, color: pal.color, soft: pal.soft, emoji: pal.emoji });
    state.kids[id] = { birthday, blood: "—", health: [], illnesses: [], grades: [] };
    return id;
  }

  function kids() {
    return MEMBERS.filter((m) => m.id !== "me" && m.id !== "bo");
  }

  function ageFromBirthday(bd) {
    const [d, m, y] = String(bd).split("/").map(Number);
    if (!d || !m || !y) return "";
    let age = TODAY_YEAR - y;
    if (TODAY_MONTH < m || (TODAY_MONTH === m && TODAY_DATE < d)) age--;
    return age;
  }

  const CATS = {
    home:   { label: "Việc nhà",   emoji: "🏠", bg: "#E3ECDF" },
    school: { label: "Học tập",    emoji: "📚", bg: "#E7DBF5" },
    bill:   { label: "Chi tiêu",   emoji: "💳", bg: "#F9E3E9" },
    event:  { label: "Sự kiện",    emoji: "🎉", bg: "#F7ECD4" },
  };

  const DAYS = ["thứ 2", "thứ 3", "thứ 4", "thứ 5", "thứ 6", "thứ 7", "chủ nhật"];
const DAY_SHORT = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  /* ---------- Real clock in Asia/Ho_Chi_Minh ---------- */

  const _hcm = (() => {
    const parts = new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      weekday: "long", day: "numeric", month: "numeric", year: "numeric", hour: "numeric",
    }).formatToParts(new Date());
    const p = {};
    parts.forEach((x) => { p[x.type] = x.value; });
    return p;
  })();
  const WEEKDAY_IDX = { "thứ hai": 0, "thứ ba": 1, "thứ tư": 2, "thứ năm": 3, "thứ sáu": 4, "thứ bảy": 5, "chủ nhật": 6 };
  const TODAY_IDX = WEEKDAY_IDX[_hcm.weekday.toLowerCase()] ?? 4;
  const TODAY_DATE = +_hcm.day;
  const TODAY_MONTH = +_hcm.month;
  const TODAY_YEAR = +_hcm.year;
  const TODAY_HOUR = +_hcm.hour;

  function greetText() {
    if (TODAY_HOUR >= 5 && TODAY_HOUR < 11) return "Chào buổi sáng, cả nhà 🌤️";
    if (TODAY_HOUR >= 11 && TODAY_HOUR < 14) return "Chào buổi trưa, cả nhà ☀️";
    if (TODAY_HOUR >= 14 && TODAY_HOUR < 18) return "Chào buổi chiều, cả nhà 🌇";
    if (TODAY_HOUR >= 18 && TODAY_HOUR < 22) return "Chào buổi tối, cả nhà 🌆";
    return "Chào buổi khuya, cả nhà 🌙";
  }

  function dateLineText(count) {
    const day = DAYS[TODAY_IDX];
    return `${day[0].toUpperCase()}${day.slice(1)}, ${TODAY_DATE} tháng ${TODAY_MONTH} · ${count} việc hôm nay`;
  }

  const state = {
    view: "home",
    items: [],
    missions: [],
    brief: {},
    rebalanced: false,
    parseResult: null,
    lastDump: "",
    aiSummary: "",
    plannerDay: TODAY_IDX,
    plannerMode: "day",
    monthOffset: 0,
    weekOffset: 0,
    taskFilter: "all",
    profileKid: null,
    detailItem: null,
    prevView: "home",
  };

  /* ---------- Seed data ---------- */

  function seed() {
    state.items = [
      { id: "i2", kind: "task", title: "Đóng tiền điện", day: 4, cat: "bill", emoji: "💡", planning: "me", doers: ["me"], done: false },
      { id: "i3", kind: "task", title: "Mua quà sinh nhật bà", day: 4, cat: "event", emoji: "🎁", planning: "me", doers: ["me"], done: false },
      { id: "i10", kind: "task", title: "Mua thuốc cho bà", day: 4, cat: "bill", emoji: "💊", planning: "me", doers: ["bo"], done: false },
      { id: "i9", kind: "task", title: "Kiểm tra bài vở", day: 4, cat: "school", emoji: "📖", planning: "me", doers: ["bin"], done: false },
      { id: "i8", kind: "task", title: "Mua sách vở", day: 4, cat: "school", emoji: "🎒", planning: "me", doers: ["su"], done: false },
      { id: "i2b", kind: "task", title: "Xếp giày lên kệ", day: 4, cat: "home", emoji: "👟", planning: "su", doers: ["su"], done: false },
      { id: "i6", kind: "event", title: "Đón Bin chiều nay", day: 4, time: "17:00", cat: "home", emoji: "🚙", planning: "bo", doers: ["bo"], done: false },
      { id: "i1", kind: "event", title: "Sinh nhật bà", day: 6, time: "11:00", cat: "event", emoji: "🎂", planning: "me", doers: ["all"], done: false },
      { id: "i3b", kind: "task", title: "Ôn bài tiếng Anh", day: 5, cat: "school", emoji: "📚", planning: "bin", doers: ["bin"], done: false },
      { id: "i4", kind: "task", title: "Dọn phòng", day: 5, cat: "home", emoji: "🧸", planning: "bin", doers: ["bin"], done: false },
      { id: "i13", kind: "task", title: "Thanh toán học phí", day: 5, cat: "bill", emoji: "💳", planning: "me", doers: ["me"], done: false },
      { id: "i7", kind: "task", title: "Sửa vòi nước", day: 5, cat: "home", emoji: "🔧", planning: "bo", doers: ["bo"], done: false },
      { id: "i7b", kind: "task", title: "Đổ đầy xăng", day: 5, cat: "bill", emoji: "⛽", planning: "bo", doers: ["bo"], done: false },
      { id: "i15", kind: "task", title: "Chuẩn bị đồ đi chơi cuối tuần", day: 5, cat: "event", emoji: "🧺", planning: "me", doers: ["bo", "bin", "su"], done: false },
      { id: "i5", kind: "task", title: "Nấu bữa tối chủ nhật", day: 6, cat: "home", emoji: "🍲", planning: "bo", doers: ["bo"], done: false },
    ];

    state.missions = [
      { id: "m1", title: "Tự chuẩn bị cặp", for: "bin", stars: 2, got: 1, emoji: "🎒", bg: "#E7DBF5", done: false, step: 1, steps: ["Con biết ngày mai cần gì.", "Con tự chuẩn bị sách vở cần thiết.", "Cặp đã sẵn sàng!"] },
      { id: "m2", title: "Tưới cây", for: "su", stars: 1, got: 1, emoji: "🪴", bg: "#E3ECDF", done: false, step: 1, steps: ["Con nhớ cây cần nước.", "Con lấy bình tưới nước.", "Cây đã được tưới xanh!"] },
      { id: "m3", title: "Thu dọn đồ chơi", for: "su", stars: 2, got: 1, emoji: "🧸", bg: "#F9E3E9", done: false, step: 1, steps: ["Con nhớ chỗ để đồ chơi.", "Con gom đồ chơi về đúng chỗ.", "Phòng gọn gàng rồi!"] },
      { id: "m4", title: "Giúp chuẩn bị bàn ăn", for: "bin", stars: 2, got: 1, emoji: "🍽️", bg: "#F7ECD4", done: false, step: 1, steps: ["Con nhớ bữa tối của cả nhà.", "Con xếp bát đũa cho mọi người.", "Bàn ăn đã sẵn sàng!"] },
      { id: "m5", title: "Sắp xếp sách", for: "bin", stars: 3, got: 1, emoji: "📚", bg: "#E3ECDF", done: false, step: 1, steps: ["Con nhớ sách của mình ở đâu.", "Con xếp sách gọn gàng.", "Giá sách ngăn nắp!"] },
    ];

    state.brief = { done: [], pending: [], next: [] };

    state.kids = {
      bin: {
        birthday: "12/03/2018", blood: "A+",
        health: [
          { date: "10/2026", weight: 28.5, height: 136 },
          { date: "04/2026", weight: 27.2, height: 133 },
          { date: "10/2025", weight: 25.8, height: 129 },
          { date: "04/2025", weight: 24.1, height: 125 },
        ],
        illnesses: [
          { date: "03/2026", text: "Cảm cúm — khỏi sau 3 ngày" },
          { date: "08/2025", text: "Viêm họng nhẹ, uống kháng sinh 5 ngày" },
          { date: "01/2025", text: "Sốt virus, nghỉ học 2 ngày" },
        ],
        grades: [
          { year: "2025–2026", k1: 8.5, k2: 8.9 },
          { year: "2024–2025", k1: 8.2, k2: 8.7 },
        ],
      },
      su: {
        birthday: "25/09/2021", blood: "O+",
        health: [
          { date: "10/2026", weight: 18.2, height: 113 },
          { date: "04/2026", weight: 17.4, height: 110 },
          { date: "10/2025", weight: 16.5, height: 107 },
        ],
        illnesses: [
          { date: "05/2026", text: "Viêm tai giữa nhẹ" },
        ],
        grades: [],
      },
    };
  }

  /* ---------- Load math (planning nặng gấp đôi làm) ---------- */

  function loadPoints(memberId) {
    let pts = 0;
    state.items.forEach((it) => {
      if (it.done) return;
      if (it.planning === memberId) pts += 2;
      if (it.doers.includes("all")) pts += 1;
      else if (it.doers.includes(memberId)) pts += 1;
    });
    return pts;
  }

  function loadTotals() {
    const totals = {};
    let sum = 0;
    MEMBERS.forEach((m) => {
      totals[m.id] = loadPoints(m.id);
      sum += totals[m.id];
    });
    const pcts = {};
    MEMBERS.forEach((m) => {
      pcts[m.id] = sum ? Math.round((totals[m.id] / sum) * 100) : 0;
    });
    return { totals, pcts, sum };
  }

  function avgPct(pcts) {
    return Math.round(MEMBERS.reduce((a, m) => a + pcts[m.id], 0) / MEMBERS.length);
  }

  function member(id) {
    return MEMBERS.find((m) => m.id === id);
  }

  function doersLabel(doers) {
    if (doers.includes("all")) return { label: "Cả nhà", cls: "all", emoji: "❤️" };
    return { label: doers.map((d) => member(d).name).join(", "), cls: "task", emoji: "✅" };
  }

  /* ---------- Helpers ---------- */

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  let toastTimer = null;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  /* ---------- User Guide (5 bước: TALK → UNDERSTAND → PLAN → SHARE → BALANCE) ---------- */

  const GUIDE_STEPS = [
    { icon: "✨", title: "Nói với HomeFlow", text: "Cứ nói những gì bạn đang phải nhớ. HomeFlow sẽ hiểu và sắp xếp giúp cả nhà.", cta: "Thử nói với HomeFlow", target: "dump" },
    { icon: "🧠", title: "Planning Owner ≠ Task Owner", text: "Planning Owner = người nhớ, chuẩn bị, lên kế hoạch và điều phối. Task Owner = người trực tiếp thực hiện.", cta: null },
    { icon: "🗓", title: "Family Planner", text: "Một lịch chung của cả nhà — ai nghĩ, ai làm, ai nhắc đều thấy rõ.", cta: "Xem lịch gia đình", target: "planner" },
    { icon: "⚖️", title: "Family Balance", text: "Gánh nặng được nhìn thấy, để ai cũng có thể san sẻ.", cta: "Xem Family Balance", target: "balance" },
    { icon: "✨", title: "Smart Rebalance", text: "Cùng chia sẻ một vài việc để tuần tới nhẹ nhàng hơn.", cta: "Thử Smart Rebalance", target: "rebalance" },
  ];

  function guideSeen() {
    try { return localStorage.getItem("hf_guide_seen") === "1"; } catch (e) { return false; }
  }
  function markGuideSeen() {
    try { localStorage.setItem("hf_guide_seen", "1"); } catch (e) {}
  }

  function showGuide(step) {
    const g = GUIDE_STEPS[step];
    const ov = document.createElement("div");
    ov.className = "guide-overlay";
    ov.id = "guide-overlay";
    ov.innerHTML = `
      <div class="guide-card">
        <button class="guide-close" id="guide-close" aria-label="Đóng hướng dẫn">✕</button>
        <div class="guide-progress"><i style="width:${((step + 1) / GUIDE_STEPS.length) * 100}%"></i></div>
        <div class="guide-icon">${g.icon}</div>
        <div class="guide-eyebrow">Bước ${step + 1} / ${GUIDE_STEPS.length}</div>
        <div class="guide-title">${g.title}</div>
        <div class="guide-text">${g.text}</div>
        <div class="guide-dots">${GUIDE_STEPS.map((_, i) => `<span class="gd ${i === step ? "on" : ""}"></span>`).join("")}</div>
        <div class="guide-actions">
          ${step > 0 ? `<button class="gb-back" id="guide-back">← Quay lại</button>` : ""}
          ${g.cta
            ? `<button class="btn-primary gb-cta" id="guide-cta">${g.cta}</button>`
            : `<button class="btn-primary gb-cta" id="guide-next">Tiếp theo →</button>`}
        </div>
        ${g.cta && step < GUIDE_STEPS.length - 1 ? `<button class="guide-next-link" id="guide-next-link">Tiếp theo →</button>` : ""}
        <button class="guide-skip" id="guide-skip">Bỏ qua hướng dẫn</button>
      </div>`;
    document.body.appendChild(ov);
    const close = () => { ov.remove(); markGuideSeen(); };
    $("#guide-close").addEventListener("click", close);
    $("#guide-skip").addEventListener("click", close);
    const cta = $("#guide-cta");
    if (cta) {
      cta.addEventListener("click", () => {
        const t = g.target;
        close();
        if (t) showView(t);
      });
    }
    const next = $("#guide-next");
    if (next) next.addEventListener("click", () => { ov.remove(); showGuide(step + 1); });
    const nextLink = $("#guide-next-link");
    if (nextLink) nextLink.addEventListener("click", () => { ov.remove(); showGuide(step + 1); });
    const back = $("#guide-back");
    if (back) back.addEventListener("click", () => { ov.remove(); showGuide(step - 1); });
  }

  function openVideo() {
    let ov = $("#video-overlay");
    if (!ov) {
      ov = document.createElement("div");
      ov.className = "video-overlay";
      ov.id = "video-overlay";
      ov.innerHTML = `
        <div class="video-stage">
          <button class="video-close" id="video-close" aria-label="Đóng video">✕</button>
          <video id="demo-video" controls playsinline preload="metadata">
            <source src="videos/demo.mp4?v=3" type='video/mp4; codecs="avc1.42E01E,mp4a.40.2"'>
            <source src="videos/demo-vp9.mp4?v=3" type='video/mp4; codecs="vp09.00.10.08"'>
          </video>
          <div class="video-endpanel" id="video-endpanel" hidden>
            <div class="vp-title">Bạn muốn thử ngay?</div>
            <button class="btn-primary vp-try" id="vp-try">✨ Nói với HomeFlow</button>
            <button class="vp-replay" id="vp-replay">↻ Xem lại video</button>
          </div>
        </div>`;
      document.body.appendChild(ov);
      const vid = $("#demo-video");
      const ep = $("#video-endpanel");
      const close = () => { vid.pause(); ov.classList.remove("open"); };
      $("#video-close").addEventListener("click", close);
      vid.addEventListener("ended", () => { ep.hidden = false; });
      $("#vp-try").addEventListener("click", () => { close(); showView("dump"); });
      $("#vp-replay").addEventListener("click", () => { ep.hidden = true; vid.currentTime = 0; vid.play().catch(() => {}); });
    }
    ov.classList.add("open");
    const vid = $("#demo-video");
    $("#video-endpanel").hidden = true;
    vid.currentTime = 0;
    vid.play().catch(() => {});
  }

  /* ---------- Router ---------- */

  const VIEWS = {};

  function showView(name) {
    state.view = name;
    $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === name));
    const fab = $("#fab");
    fab.style.display = ["dump", "ai", "confirm"].includes(name) ? "none" : "";
    const app = $("#app");
    app.scrollTop = 0;
    app.innerHTML = `<div class="view">${VIEWS[name]()}</div>`;
    bind(name);
  }

  /* ---------- Shared components ---------- */

  function avatarHtml(m, cls = "") {
    return `<span class="avatar ${cls}" style="background:${m.soft};border:2px solid ${m.color}" title="${esc(m.name)}">${m.emoji}</span>`;
  }

  function ownersHtml(it, editable = false) {
    const pl = member(it.planning);
    const dl = doersLabel(it.doers);
    return `
      <div class="owners">
        <span class="owner planning" title="Planning Owner — người nhớ, lên kế hoạch, chuẩn bị, nhắc">
          <span class="o-ava" style="background:${pl.soft}">${pl.emoji}</span> ${esc(pl.name)}
          <em>Nghĩ và lo</em>
        </span>
        <span class="owner-link">↔</span>
        <span class="owner ${dl.cls}" title="Task Owner — người thực hiện">
          <span class="o-ava" style="background:${dl.cls === "all" ? "#F9E3E9" : "#E3ECDF"}">${dl.emoji}</span> ${esc(dl.label)}
          <em>Làm</em>
        </span>
      </div>`;
  }

  function detailFor(it) {
    const t = it.title.toLowerCase();
    if (t.includes("khám")) {
      return {
        planning: ["nhớ lịch khám", "tìm nơi khám", "đặt lịch", "chuẩn bị giấy tờ"],
        execution: ["đưa con đi khám"],
      };
    }
    const PLAN = {
      school: ["nhớ lịch học", "chuẩn bị sách vở", "liên hệ thầy cô"],
      bill: ["nhớ hạn thanh toán", "chuẩn bị tiền", "theo dõi hóa đơn"],
      event: ["nhớ dịp quan trọng", "chuẩn bị quà", "liên hệ khách mời"],
      home: ["nhớ việc cần làm", "chuẩn bị đồ dùng", "nhắc cả nhà"],
    };
    const EXEC = {
      school: ["đưa/đón con", "theo dõi bài vở"],
      bill: ["thực hiện thanh toán"],
      event: ["chuẩn bị & thực hiện"],
      home: ["thực hiện việc"],
    };
    return { planning: PLAN[it.cat] || PLAN.home, execution: EXEC[it.cat] || EXEC.home };
  }

  function taskCard(it, opts = {}) {
    const cat = CATS[it.cat] || CATS.home;
    const tagTime = it.time ? `<span class="tag time">🕘 ${it.time}</span>` : "";
    const tagDay = `<span class="tag day">${DAYS[it.day]}</span>`;
    return `
      <article class="task-card ${it.done ? "done" : ""} ${it.justAdded ? "just-added" : ""}" data-id="${it.id}" data-act="detail" tabindex="0" role="button" aria-label="Xem chi tiết: ${esc(it.title)}">
        <div class="task-emoji" style="background:${cat.bg}">${it.emoji}</div>
        <div class="task-body">
          <div class="task-title">${esc(it.title)}</div>
          <div class="task-meta">
            ${tagTime}<span class="tag cat">${cat.emoji} ${cat.label}</span>${tagDay}
          </div>
          ${ownersHtml(it)}
        </div>
        <div class="tc-right">
          ${opts.check !== false ? `<button class="check ${it.done ? "on" : ""}" data-act="toggle" aria-label="Đánh dấu xong">✓</button>` : ""}
          <span class="chev">›</span>
        </div>
      </article>`;
  }

  function eventRow(it) {
    const cat = CATS[it.cat] || CATS.home;
    return `
      <article class="event-row ${it.justAdded ? "just-added" : ""}" data-id="${it.id}" data-act="detail" tabindex="0" role="button" aria-label="Xem chi tiết: ${esc(it.title)}">
        <span class="event-time">${it.time || "cả ngày"}</span>
        <span class="event-emoji" style="background:${cat.bg};border-radius:14px;padding:6px">${it.emoji}</span>
        <div class="event-body">
          <div class="event-title">${esc(it.title)}</div>
          ${ownersHtml(it)}
        </div>
        <span class="chev">›</span>
      </article>`;
  }

  function sectionHead(title, linkText, linkView) {
    return `
      <div class="section-head">
        <h3>${title}</h3>
        ${linkText ? `<a href="#" data-nav="${linkView}">${linkText} →</a>` : ""}
      </div>`;
  }

  /* ---------- 1. Home Dashboard ---------- */

  VIEWS.home = () => {
    const { pcts } = loadTotals();
    const today = state.items.filter((it) => it.day === TODAY_IDX && !it.done);
    const soon = state.items.filter((it) => it.day > TODAY_IDX && !it.done);
    const doneToday = state.items.filter((it) => it.day === TODAY_IDX && it.done).length;
    const kidIds = kids().map((k) => k.id);
    const isKidTask = (it) => it.doers.some((d) => kidIds.includes(d));
    const todayAdult = today.filter((it) => !isKidTask(it));
    const todayKids = today.filter(isKidTask);

    return `
      <header class="app-header">
        <div class="header-row">
          <div>
            <div class="greet">${greetText()}</div>
            <div class="date-line" id="date-line">${dateLineText(today.length + doneToday)}</div>
          </div>
          <div class="family-avatars">
            ${MEMBERS.map((m) => avatarHtml(m)).join("")}
          </div>
        </div>
      </header>

      <section class="hero">
        <div class="hero-top">
          <div>
            <div class="hero-title">Cả nhà mình cùng chia sẻ 💜</div>
            <div class="hero-sub">Việc không tên giờ được nhìn thấy, chia sẻ và cùng hoàn thành</div>
          </div>
          <span class="hero-emoji">🏡</span>
        </div>
        <div class="loadbar" id="home-loadbar">
          ${MEMBERS.map((m) => `<div class="seg" data-member="${m.id}" style="width:${pcts[m.id]}%;background:${m.color}"></div>`).join("")}
        </div>
        <div class="legend">
          ${MEMBERS.map((m) => `<span class="legend-item" data-member="${m.id}"><span class="legend-dot" style="background:${m.color}"></span><span class="legend-label">${m.name} ${pcts[m.id]}%</span></span>`).join("")}
        </div>
      </section>

      ${sectionHead(`Hôm nay · ${DAYS[TODAY_IDX]}`, "Xem tất cả", "tasks")}
      ${todayAdult.length ? todayAdult.slice(0, 4).map((it) => taskCard(it)).join("") : ""}
      ${todayKids.length ? `
        <div class="card kids-today">
          <div class="kt-head">
            <span class="kt-title-main">🧒 Việc của các con</span>
            <span class="kt-sub">${todayKids.length} việc · cùng 1 dòng</span>
          </div>
          ${todayKids.map((it) => {
            const doer = member(it.doers.find((d) => kidIds.includes(d)));
            return `
            <div class="kt-item ${it.done ? "done" : ""}" data-id="${it.id}">
              <span class="kt-ava" style="background:${doer.soft}">${doer.emoji}</span>
              <span class="kt-body">
                <span class="kt-title">${it.emoji} ${esc(it.title)}</span>
                <span class="kt-who">${doer.name} làm · ${esc(it.planning === "me" ? "Mẹ nhớ" : member(it.planning).name + " nhớ")}</span>
              </span>
              <button class="check ${it.done ? "on" : ""}" data-act="toggle-kid" aria-label="Đánh dấu xong">✓</button>
            </div>`;
          }).join("")}
        </div>` : ""}
      ${!todayAdult.length && !todayKids.length ? `<div class="empty-note"><span class="en-emoji">🌿</span>Hôm nay nhẹ nhàng, tận hưởng khoảnh khắc!</div>` : ""}

      ${sectionHead("Sắp tới", "Mở kế hoạch", "planner")}
      ${soon.slice(0, 3).map((it) => (it.kind === "event" ? eventRow(it) : taskCard(it, { check: false }))).join("")}

      <div class="quick-grid">
        <button class="quick sage" data-nav="missions">
          <span class="q-emoji">🚀</span>
          <strong>Nhiệm vụ của các con</strong>
          <span class="q-sub">⭐ ${state.missions.reduce((a, m) => a + m.got, 0)} sao trong tuần</span>
        </button>
        <button class="quick lav" data-nav="profiles">
          <span class="q-emoji">📋</span>
          <strong>Hồ sơ con</strong>
          <span class="q-sub">Sinh nhật · sức khỏe · học tập</span>
        </button>
        <button class="quick blush" data-nav="brief">
          <span class="q-emoji">💌</span>
          <strong>Bản tin tuần</strong>
          <span class="q-sub">${state.items.filter((it) => it.done).length} việc đã xong · ${state.items.filter((it) => !it.done).length} việc còn lại</span>
        </button>
      </div>

      ${!guideSeen() ? `
      <div class="onboard-card" id="onboard-card">
        <div class="ob-emoji">💜</div>
        <div class="ob-body">
          <strong>Mới dùng HomeFlow?</strong>
          <span>Khám phá cách cả nhà cùng chia sẻ những việc cần nhớ.</span>
        </div>
        <div class="ob-actions">
          <button class="ob-start" id="ob-start">Bắt đầu</button>
          <button class="ob-later" id="ob-later">Để sau</button>
        </div>
      </div>` : ""}

      <div class="help-area">
        <div class="help-head">❓ Trợ giúp</div>
        <button class="help-item" data-help="guide">🚀 Bắt đầu với HomeFlow</button>
        <button class="help-item" data-help="video">▶ Xem Video Demo</button>
        <button class="help-item" data-help="po">🧠 Planning Owner là gì?</button>
        <button class="help-item" data-help="fb">⚖️ Family Balance hoạt động thế nào?</button>
      </div>
    `;
  };

  /* ---------- 2. Tell HomeFlow ---------- */

  const EXAMPLES = [
    "Thứ 7 Bin học tiếng Anh lúc 9h, bố đưa con đi. Chủ nhật sinh nhật bà nên thứ 6 nhớ mua quà.",
    "Thứ 2 mẹ đưa Bin đi khám răng lúc 14h. Tuần sau nộp học phí.",
    "Cuối tuần cả nhà về quê thăm ông bà, nhớ đổ đầy xăng.",
  ];

  VIEWS.dump = () => `
    <div class="dump-wrap">
      <div class="eyebrow">Tell HomeFlow</div>
      <h2 class="h-title">Hôm nay cả nhà cần gì?</h2>
      <p class="h-sub">Cứ nói tự nhiên như đang nhắn tin cho người thân. HomeFlow sẽ hiểu và sắp xếp giúp cả nhà.</p>

      <div class="dump-note">
        <div class="dump-label">✍️ Nháp nhanh…</div>
        <textarea class="dump-input" id="dump-input" rows="5"
          placeholder="VD: Thứ 7 Bin học tiếng Anh lúc 9h, bố đưa con đi…">${esc(state.lastDump)}</textarea>
      </div>

      <div class="example-chips">
        ${EXAMPLES.map((e, i) => `<button class="chip" data-example="${i}">💬 Ví dụ ${i + 1}</button>`).join("")}
      </div>

      <div class="dump-actions">
        <button class="mic" id="mic-btn" aria-label="Nói cho HomeFlow nghe">
          <span class="mic-ico">🎙️</span>
          <span class="mic-wave"><i></i><i></i><i></i><i></i></span>
        </button>
        <button class="btn-primary" id="dump-submit">✨ HomeFlow hiểu giúp</button>
      </div>

      <div class="note-card" style="margin-top:22px">
        <span class="nc-emoji">🤖</span>
        <span><b>HomeFlow sẽ làm gì tiếp theo?</b><br>
        Hiểu việc cả nhà nói → tách thành việc &amp; sự kiện → đặt deadline → gợi ý <b>ai nghĩ và lo</b> và <b>ai làm</b>. Cả nhà duyệt lại trước khi lưu.</span>
      </div>
      <div class="note-card">
        <span class="nc-emoji">🔒</span>
        <span>Chỉ cả nhà nhìn thấy kế hoạch này. Không ai bị “quên nhắc” nữa.</span>
      </div>
    </div>
  `;

  /* ---------- AI parsing (deterministic demo parser) ---------- */

  function dayIndexOf(text) {
    if (text.includes("chủ nhật")) return 6;
    if (text.includes("cuối tuần")) return 6;
    const map = [
      ["thứ hai", 0], ["thứ 2", 0], ["t2", 0],
      ["thứ ba", 1], ["thứ 3", 1], ["t3", 1],
      ["thứ tư", 2], ["thứ 4", 2], ["t4", 2],
      ["thứ năm", 3], ["thứ 5", 3], ["t5", 3],
      ["thứ sáu", 4], ["thứ 6", 4], ["t6", 4],
      ["thứ bảy", 5], ["thứ 7", 5], ["t7", 5],
    ];
    for (const [k, v] of map) if (text.includes(k)) return v;
    return TODAY_IDX;
  }

  // Day token closest to a keyword — "chủ nhật sinh nhật bà nên thứ 6 nhớ mua quà"
  // → sinh nhật=chủ nhật, mua quà=thứ 6.
  function dayFor(text, keyword) {
    const idx = text.indexOf(keyword);
    const anchor = idx === -1 ? text.length / 2 : idx;
    const tokens = [["thứ 2", 0], ["thứ 3", 1], ["thứ 4", 2], ["thứ 5", 3], ["thứ 6", 4], ["thứ 7", 5], ["chủ nhật", 6]];
    let best = TODAY_IDX, bestDist = Infinity;
    for (const [tok, val] of tokens) {
      let pos = text.indexOf(tok);
      while (pos !== -1) {
        const dist = Math.abs(pos - anchor);
        if (dist < bestDist) { bestDist = dist; best = val; }
        pos = text.indexOf(tok, pos + 1);
      }
    }
    return best;
  }

function timeOf(text) {
  const m = text.match(/(?:lúc\s*)?(\d{1,2})\s*(?:h|giờ)(?:\s*(\d{2}))?/)
    || text.match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  let h = +m[1];
  if (h < 12 && (text.includes("chiều") || text.includes("tối"))) h += 12;
  return `${String(h).padStart(2, "0")}:${m[2] || "00"}`;
}

function timeHint(text) {
  const t = timeOf(text);
  if (t) return t;
  if (text.includes("tối")) return "19:00";
  if (text.includes("chiều")) return "16:00";
  if (text.includes("sáng")) return "08:00";
  return null;
}

  function parseDump(raw) {
    const text = raw.toLowerCase();
    const items = [];
    const clauses = text.split(/[.,;!]/).map((c) => c.trim()).filter(Boolean);

    // Dynamic aliases from MEMBERS — recognises renamed kids ("Bo", "Bạn lớn", …)
    const ALIASES = [];
    MEMBERS.forEach((m) => {
      const words = [m.name.toLowerCase(), m.role.toLowerCase()];
      if (m.id === "bo") words.push("bố", "ba", "cha");
      if (m.id === "me") words.push("mẹ", "má");
      words.forEach((w) => ALIASES.push([w, m.id]));
    });
    const KID_IDS = kids().map((k) => k.id);

    const personNear = (clause, kw, pool) => {
      const idx = clause.indexOf(kw);
      if (idx === -1) return null;
      let best = null, bestDist = Infinity;
      for (const [nm, id] of ALIASES) {
        if (pool && !pool.includes(id)) continue;
        let pos = clause.indexOf(nm);
        while (pos !== -1) {
          const d = Math.abs(pos - idx);
          if (d < bestDist) { bestDist = d; best = id; }
          pos = clause.indexOf(nm, pos + 1);
        }
      }
      return best;
    };
    // Who drives / pays / takes — practically always a parent.
    const parentNear = (clause, kw) => personNear(clause, kw, ["me", "bo"]);

    // Which kid is being talked about, nearest to an anchor verb.
    const kidIn = (clause, anchor) => {
      const idx = clause.indexOf(anchor);
      if (idx === -1) return null;
      let best = null, bestDist = Infinity;
      KID_IDS.forEach((id) => {
        const m = member(id);
        [m.name.toLowerCase(), m.role.toLowerCase()].forEach((a) => {
          let pos = clause.indexOf(a);
          while (pos !== -1) {
            const d = Math.abs(pos - idx);
            if (d < bestDist) { bestDist = d; best = id; }
            pos = clause.indexOf(a, pos + 1);
          }
        });
      });
      return best;
    };
    const kidLabel = (clause) => {
      const anchor = ["đưa", "đón", "chở", "học", "đi"].find((kw) => clause.includes(kw)) || "đi";
      const id = kidIn(clause, anchor);
      if (id) return member(id).role;
      // Unrecognised name — echo it instead of generic "con" ("Bo đi công viên").
      const m = clause.match(/(?:đưa|đón|chở|cho)\s+([a-zà-ỹ]{2,})/);
      if (m && !["bố", "ba", "cha", "mẹ", "má"].includes(m[1])) {
        return m[1][0].toUpperCase() + m[1].slice(1);
      }
      return "con";
    };
    const ownerOf = (clause) => {
      const own = clause.match(/việc của ([a-zà-ỹ]+)/);
      if (own) {
        const hit = ALIASES.find(([a]) => a === own[1]);
        if (hit) return hit[1];
      }
      return null;
    };
    const plannerOf = (clause) => {
      const p = parentNear(clause, "nhớ");
      if (p) return p;
      const o = ownerOf(clause);
      if (o) return o;
      return "me";
    };

    clauses.forEach((clause) => {
      let made = false;
      const push = (it) => { items.push(it); made = true; };

      if (clause.includes("tiếng anh") || clause.includes("lớp") || clause.includes("đi học")) {
        const who = kidLabel(clause);
        const doer = parentNear(clause, "đưa") || parentNear(clause, "đón") || parentNear(clause, "chở") || "bo";
        let title, emoji;
        if (clause.includes("tiếng anh")) {
          title = `Lớp tiếng Anh của ${who}`;
          emoji = "📚";
        } else {
          const hm = clause.match(/đi học (?:(môn )?([a-zà-ỹ]+))/);
          if (hm) {
            title = `${who} đi học ${hm[2]}`;
            emoji = { "đàn": "🎹", "vẽ": "🎨", "bơi": "🏊", "võ": "🥋", "đàn piano": "🎹" }[hm[2]] || "📚";
          } else {
            title = `${who} đi học`;
            emoji = "🏫";
          }
        }
        push({
          kind: "event", title, day: dayFor(clause, "học"), time: timeHint(clause),
          cat: "school", emoji, planning: plannerOf(clause), doers: [doer],
        });
      }

      if (clause.includes("sinh nhật")) {
        const doer = parentNear(clause, "mua") || "all";
        const giftDay = clause.includes("mua quà") ? dayFor(clause, "mua quà") : Math.max(dayFor(clause, "sinh nhật") - 1, 0);
        push({
          kind: "task", title: "Mua quà sinh nhật bà", day: giftDay,
          cat: "event", emoji: "🎁", planning: plannerOf(clause), doers: [doer],
        });
      }

      if (clause.includes("khám")) {
        const doer = parentNear(clause, "đưa") || parentNear(clause, "đón") || parentNear(clause, "khám") || "bo";
        push({
          kind: "event", title: `${kidLabel(clause)} đi khám`, day: dayFor(clause, "khám"), time: timeHint(clause),
          cat: "school", emoji: "🦷", planning: plannerOf(clause), doers: [doer],
        });
      }

      if (clause.includes("học phí") || clause.includes("tiền") || clause.includes("đóng") || clause.includes("nộp")) {
        const doer = parentNear(clause, "đóng") || parentNear(clause, "nộp") || parentNear(clause, "tiền") || "me";
        push({
          kind: "task", title: "Thanh toán hóa đơn", day: dayFor(clause, "thanh toán"),
          cat: "bill", emoji: "💳", planning: plannerOf(clause), doers: [doer],
        });
      }

      if (clause.includes("quê") || clause.includes("thăm")) {
        push({
          kind: "event", title: "Về quê thăm ông bà", day: dayFor(clause, "quê"),
          cat: "event", emoji: "🏡", planning: plannerOf(clause), doers: ["all"],
        });
        if (clause.includes("xăng")) {
          push({
            kind: "task", title: "Đổ đầy xăng", day: dayFor(clause, "xăng"),
            cat: "bill", emoji: "⛽", planning: plannerOf(clause), doers: ["bo"],
          });
        }
      }

      // Pick-up: "X đón Y" (khi chưa có việc khác trong câu)
      if (!made && clause.includes("đón")) {
        const doer = parentNear(clause, "đón") || "me";
        const who = kidLabel(clause);
        push({
          kind: "event", title: `Đón ${who}`, day: dayFor(clause, "đón"), time: timeHint(clause),
          cat: "home", emoji: "🚙", planning: plannerOf(clause), doers: [doer],
        });
      }

      // Generic activity: "X đi <hoạt động>" (đá bóng, bơi, học vẽ, chơi…)
      if (!made) {
        const m = clause.match(/(?:^|\s)đi ([a-zà-ỹ]+(?:\s[a-zà-ỹ]+)*?)(?=\s*(?:lúc|vào|buổi|sáng|chiều|tối|\d)|$)/);
        if (m) {
          const act = m[1].replace(/\s*lúc.*$/i, "").trim();
          if (act) {
            const who = kidLabel(clause);
            const doer = parentNear(clause, "đưa") || parentNear(clause, "đón") || parentNear(clause, "chở") || "bo";
            const ACT_EMOJI = {
              "đá bóng": "⚽", "bơi": "🏊", "học vẽ": "🎨", "đàn": "🎹",
              "chơi": "🎮", "xem phim": "🎬", "dã ngoại": "🏕️", "công viên": "🌳",
              "siêu thị": "🛒", "chùa": "🙏", "câu cá": "🎣",
            };
            const emoji = Object.keys(ACT_EMOJI).find((k) => act.includes(k)) ? ACT_EMOJI[Object.keys(ACT_EMOJI).find((k) => act.includes(k))] : "🎯";
            push({
              kind: "event", title: `${who} đi ${act}`, day: dayFor(clause, "đi"), time: timeHint(clause),
              cat: "event", emoji, planning: plannerOf(clause), doers: [doer],
            });
          }
        }
      }
    });

    if (!items.length) {
      const o = ownerOf(text);
      const doer = o || parentNear(text, "việc") || parentNear(text, "của") || "me";
      const title = o ? `Việc của ${member(o).name}` : "Việc cần làm";
      items.push({
        kind: "task", title, day: TODAY_IDX,
        cat: "home", emoji: "📌", planning: plannerOf(text), doers: [doer],
      });
    }
    return items;
  }

  /* ---------- AI understanding animation ---------- */

  const AI_STEPS = [
    "Hiểu việc cả nhà nói",
    "Sắp xếp việc thành kế hoạch",
    "Biết việc nào cần làm khi nào",
    "Gợi ý ai nghĩ, ai làm",
    "Nhắc cả nhà đúng lúc",
  ];

  VIEWS.ai = () => `
    <div class="ai-stage">
      <div class="ai-heard">💬 “${esc(state.lastDump || "")}”</div>
      <div class="ai-orb">🧠</div>
      <div class="ai-title">HomeFlow đang hiểu…</div>
      <div class="ai-sub">Chỉ vài giây thôi, cả nhà đợi nhé</div>
      <div class="ai-steps">
        ${AI_STEPS.map((s) => `<div class="ai-step"><span class="s-dot">✓</span>${s}</div>`).join("")}
      </div>
    </div>
  `;

  /* ---------- 3. AI Task Confirmation ---------- */

  VIEWS.confirm = () => {
    if (!state.parseResult) return VIEWS.dump();
    const items = state.parseResult;
    return `
      <div class="eyebrow">HomeFlow đã hiểu</div>
      <h2 class="h-title">Xác nhận giúp cả nhà nhé 🙌</h2>
      <p class="h-sub">Mỗi việc có <b>người nghĩ và lo</b> (lên kế hoạch, chuẩn bị, nhắc) và <b>người làm</b>. Có thể chỉnh sửa ngay tại đây.</p>
      ${state.aiSummary ? `<p class="ai-summary">💬 ${esc(state.aiSummary)}</p>` : ""}

      <div class="confirm-hero">
        <div class="ch-visual">
          <span class="ch-pill plan">🧠 Nghĩ và lo</span>
          <span class="ch-neq">≠</span>
          <span class="ch-pill task">✅ Làm</span>
        </div>
        <div class="ch-text">
          <strong>Một việc, hai người chủ</strong>
          <span>Người nghĩ và lo — người làm. Việc không tên giờ có chủ.</span>
        </div>
      </div>

      <div class="section-head"><h3>HomeFlow đã tạo ${items.length} việc</h3></div>
      ${items.map((it, idx) => parseItemHtml(it, idx)).join("")}

      <div style="height:14px"></div>
      <button class="btn-primary" id="confirm-save" style="width:100%">✓ Thêm vào HomeFlow</button>
      <div style="height:10px"></div>
      <button class="btn-ghost" id="confirm-back" style="width:100%">← Sửa lại câu nói</button>
    `;
  };

  function parseItemHtml(it, idx) {
    const cat = CATS[it.cat] || CATS.home;
    const timeTag = it.time ? `<span class="tag time">🕘 ${it.time}</span>` : "";
    return `
      <article class="parse-item" style="animation-delay:${idx * 90}ms">
        <div class="pi-top">
          <div class="task-meta">
            <span class="tag day">${DAYS[it.day]}</span>${timeTag}<span class="tag cat">${cat.emoji} ${cat.label}</span>
          </div>
          <button class="pi-edit" data-act="edit-item" data-idx="${idx}" aria-expanded="false">✏️ Chỉnh sửa</button>
        </div>
        <div class="task-title" style="margin-top:8px;font-size:15px">${it.emoji} ${esc(it.title)}</div>
        ${ownersHtml(it)}
        <div class="pi-editor" data-idx="${idx}" hidden>
          <div class="owner-edit">
            <span class="oe-label">📝 Tiêu đề:</span>
            <input class="mini-text" type="text" data-role="title" data-idx="${idx}" value="${esc(it.title)}" maxlength="60">
          </div>
          <div class="owner-edit">
            <span class="oe-label">🧠 Nghĩ và lo:</span>
            <select class="mini-select planning" data-role="planning" data-idx="${idx}">
              ${MEMBERS.map((m) => `<option value="${m.id}" ${m.id === it.planning ? "selected" : ""}>${m.name}</option>`).join("")}
            </select>
            <span class="oe-label">· ✅ Làm:</span>
            <select class="mini-select task" data-role="task" data-idx="${idx}">
              ${MEMBERS.map((m) => `<option value="${m.id}" ${it.doers.includes(m.id) ? "selected" : ""}>${m.name}</option>`).join("")}
              <option value="all" ${it.doers.includes("all") ? "selected" : ""}>Cả nhà</option>
            </select>
          </div>
          <div class="owner-edit">
            <span class="oe-label">📅 Ngày:</span>
            <select class="mini-select day" data-role="day" data-idx="${idx}">
              ${DAYS.map((d, i) => `<option value="${i}" ${i === it.day ? "selected" : ""}>${d}</option>`).join("")}
            </select>
            <span class="oe-label">· 🕘 Giờ:</span><input class="mini-time" type="time" data-role="time" data-idx="${idx}" value="${it.time || "09:00"}">
          </div>
        </div>
      </article>`;
  }

  /* ---------- 4. Family Planner ---------- */

  VIEWS.planner = () => {
    const dots = DAYS.map((_, d) => state.items.filter((it) => it.day === d && !it.done).length);
    const mode = state.plannerMode;

    return `
      <div class="eyebrow">Family Planner</div>
      <h2 class="h-title">Kế hoạch của cả nhà</h2>
      <p class="h-sub">Một lịch chung — ai nghĩ, ai làm, ai nhắc đều thấy rõ.</p>

      <div class="mode-toggle" role="tablist" aria-label="Chế độ xem lịch">
        ${[["day", "Ngày"], ["week", "Tuần"], ["month", "Tháng"]].map(([k, lab]) =>
          `<button class="mt-btn ${mode === k ? "on" : ""}" data-mode="${k}" role="tab" aria-selected="${mode === k}">${lab}</button>`).join("")}
      </div>

      ${mode === "day" ? dayPlanner(dots) : mode === "week" ? weekPlanner(dots) : monthPlanner(dots)}
    `;
  };

  function dayPlanner(dots) {
    const dayItems = state.items.filter((it) => it.day === state.plannerDay);
    const events = dayItems.filter((it) => it.kind === "event").sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
    const tasks = dayItems.filter((it) => it.kind === "task");
    return `
      <div class="week-strip">
        ${DAYS.map((d, i) => `
          <button class="wday ${i === TODAY_IDX ? "today" : ""} ${i === state.plannerDay ? "selected" : ""}" data-day="${i}">
            <div class="wd-name">${DAY_SHORT[i]}</div>
            <div class="wd-num">${i === TODAY_IDX ? "Hôm nay" : (TODAY_DATE + i - TODAY_IDX)}</div>
            <div class="wd-dots">${dots[i] ? `<i></i>${dots[i] > 1 ? "<i></i>" : ""}${dots[i] > 3 ? "<i></i>" : ""}` : ""}</div>
          </button>`).join("")}
      </div>

      <div class="date-nav">
        <button class="dn-btn" data-day="prev" aria-label="Ngày trước">←</button>
        <button class="dn-today" data-day="today">Hôm nay</button>
        <button class="dn-btn" data-day="next" aria-label="Ngày tiếp theo">→</button>
      </div>

      <div class="day-group">
        <div class="dg-head">📅 ${DAYS[state.plannerDay]} <span class="dg-count">${dayItems.length} việc</span></div>
        ${events.map(eventRow).join("")}
        ${tasks.map((it) => taskCard(it, { check: false })).join("")}
        ${!dayItems.length ? `<div class="empty-note"><span class="en-emoji">🌸</span>Ngày này còn trống, thật thoải mái!</div>` : ""}
      </div>
    `;
  }

  function ownersMini(it) {
    const pl = member(it.planning).name;
    const dl = doersLabel(it.doers).label;
    return `${pl} nghĩ · ${dl} làm`;
  }

  function weekPlanner() {
    const itemsOf = (d) => state.items.filter((it) => it.day === d);
    const total = state.items.filter((it) => !it.done).length;
    const isCurrent = state.weekOffset === 0;
    const wkLabel = state.weekOffset === 0 ? "Tuần này" : state.weekOffset < 0 ? "Tuần trước" : "Tuần sau";
    const fmt = (dt) => `${dt.getUTCDate()}/${dt.getUTCMonth() + 1}`;
    const start = new Date(Date.UTC(TODAY_YEAR, TODAY_MONTH - 1, TODAY_DATE - TODAY_IDX + state.weekOffset * 7));
    const end = new Date(Date.UTC(TODAY_YEAR, TODAY_MONTH - 1, TODAY_DATE - TODAY_IDX + state.weekOffset * 7 + 6));
    return `
      <div class="week-summary">
        <span class="ws-label">${wkLabel}</span>
        <span class="ws-range">${fmt(start)} – ${fmt(end)}</span>
        ${isCurrent ? `<span class="ws-count">${total} việc</span>` : `<span class="ws-count ghost">Chưa có kế hoạch</span>`}
      </div>

      <div class="week-nav">
        <button class="wn-btn" data-wk="prev" aria-label="Tuần trước">← Tuần trước</button>
        <button class="wn-today" data-wk="today">Tuần này</button>
        <button class="wn-btn" data-wk="next" aria-label="Tuần sau">Tuần sau →</button>
      </div>

      <div class="week-agenda">
        ${DAYS.map((d, i) => {
          const items = isCurrent ? itemsOf(i) : [];
          const dt = new Date(Date.UTC(TODAY_YEAR, TODAY_MONTH - 1, TODAY_DATE + i - TODAY_IDX + state.weekOffset * 7));
          const dateNum = dt.getUTCDate();
          const monthNum = dt.getUTCMonth() + 1;
          const isToday = isCurrent && i === TODAY_IDX;
          return `
          <section class="wa-day ${isToday ? "today" : ""} ${i === state.plannerDay ? "selected" : ""}">
            <button class="wa-head" data-day="${i}" aria-label="Xem chi tiết ngày ${DAYS[i]}">
              <span class="wa-name">${DAY_SHORT[i]}</span>
              <span class="wa-date">${dateNum}/${monthNum}</span>
              ${isToday ? `<span class="wa-today">Hôm nay</span>` : ""}
              <span class="wa-count">${items.length} việc</span>
              <span class="wa-chev">›</span>
            </button>
            <div class="wa-body">
              ${items.length ? items.map((it) => `
                <div class="wa-item">
                  <span class="wa-time">${it.time || "cả ngày"}</span>
                  <span class="wa-emoji">${it.emoji}</span>
                  <span class="wa-title">${esc(it.title)}</span>
                  <span class="wa-owners">${ownersMini(it)}</span>
                </div>`).join("") : `
                <div class="wa-empty">🌿 Ngày nhẹ nhàng</div>`}
            </div>
          </section>`;
        }).join("")}
      </div>
      <p class="mg-hint">Bấm vào một ngày để xem chi tiết</p>
    `;
  }

  function monthPlanner() {
    const base = new Date(Date.UTC(TODAY_YEAR, TODAY_MONTH - 1 + state.monthOffset, 1));
    const year = base.getUTCFullYear();
    const month = base.getUTCMonth();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const lead = (base.getUTCDay() + 6) % 7;
    const cells = [];
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const appDay = (new Date(Date.UTC(year, month, d)).getUTCDay() + 6) % 7;
      cells.push({ date: d, appDay });
    }
    const isCurrentMonth = state.monthOffset === 0;
    const dots = DAYS.map((_, dd) => state.items.filter((it) => it.day === dd && !it.done).length);
    return `
      <div class="month-head">
        <button class="mn-btn" data-mnav="prev" aria-label="Tháng trước">←</button>
        <span class="mn-label">Tháng ${month + 1}/${year}</span>
        <button class="mn-btn" data-mnav="next" aria-label="Tháng sau">→</button>
        <button class="mn-today" data-mnav="today">Tháng này</button>
      </div>
      <div class="month-grid">
        ${DAY_SHORT.map((d) => `<div class="mg-dow">${d}</div>`).join("")}
        ${cells.map((c) => c ? `
          <button class="mg-cell ${c.date === TODAY_DATE && isCurrentMonth ? "today" : ""}" data-mday="${c.appDay}">
            <span class="mg-date">${c.date}</span>
            ${isCurrentMonth && dots[c.appDay] ? `<span class="mg-dots">${"●".repeat(Math.min(dots[c.appDay], 3))}</span>` : ""}
          </button>` : `<div class="mg-cell blank"></div>`).join("")}
      </div>
      <p class="mg-hint">Bấm vào một ngày để xem chi tiết</p>
    `;
  }

  /* ---------- 5. Shared Tasks ---------- */

  VIEWS.tasks = () => {
    const filters = [
      ["all", "Tất cả"], ["home", "🏠 Việc nhà"], ["school", "📚 Học tập"],
      ["bill", "💳 Chi tiêu"], ["event", "🎉 Sự kiện"], ["done", "✓ Xong"],
    ];
    let list = state.items.slice();
    if (state.taskFilter === "done") list = list.filter((it) => it.done);
    else if (state.taskFilter !== "all") list = list.filter((it) => it.cat === state.taskFilter && !it.done);
    else list = list.filter((it) => !it.done);

    return `
      <div class="eyebrow">Shared Tasks</div>
      <h2 class="h-title">Việc chung của cả nhà</h2>
      <p class="h-sub">Cùng phân công — không ai phải nhớ hết mọi thứ một mình.</p>

      <div class="filter-row">
        ${filters.map(([k, lab]) => `<button class="fchip ${state.taskFilter === k ? "on" : ""}" data-filter="${k}">${lab}</button>`).join("")}
      </div>

      <div class="dt-explainer" style="margin-top:6px">
        <span class="de-emoji">🧠</span>
        <span>Ai <b>nghĩ và lo</b> ≠ ai <b>làm</b> — bấm vào một việc để xem chi tiết.</span>
      </div>

      ${list.length ? list.map((it) => taskCard(it)).join("") :
        `<div class="empty-note"><span class="en-emoji">🎉</span>Không còn việc nào ở đây. Giỏi lắm cả nhà!</div>`}
    `;
  };

  /* ---------- 6. Family Balance ---------- */

  VIEWS.balance = () => {
    const { totals, pcts, sum } = loadTotals();
    const avg = avgPct(pcts);
    const sorted = MEMBERS.slice().sort((a, b) => pcts[b.id] - pcts[a.id]);
    const maxMember = sorted[0];
    const secondMember = sorted[1];
    const imbalanced = pcts[maxMember.id] - pcts[secondMember.id] >= 8;

    return `
      <div class="eyebrow">Family Balance</div>
      <h2 class="h-title">Cân bằng gia đình ⚖️</h2>
      <p class="h-sub">Gánh nặng được nhìn thấy, để ai cũng có thể san sẻ.</p>

      <div class="card balance-hero">
        <div class="balance-bar" id="bal-bar">
          ${MEMBERS.map((m) => `<div class="seg" style="width:${pcts[m.id]}%;background:${m.color}"><span>${pcts[m.id]}%</span></div>`).join("")}
        </div>
        <div class="eq-line"></div>
        <div class="legend">
          ${MEMBERS.map((m) => `<span class="legend-item"><span class="legend-dot" style="background:${m.color}"></span>${m.name} ${pcts[m.id]}%</span>`).join("")}
        </div>
      </div>

      ${imbalanced ? `
        <div class="banner">
          <span class="bn-emoji">😮💨</span>
          <div>
            <strong>${maxMember.name} đang gánh ${pcts[maxMember.id]}% — cao nhất cả nhà</strong>
            <span>Điểm cân bằng là ${avg}% cho mỗi người. HomeFlow có một gợi ý nhỏ.</span>
          </div>
          <button class="btn-primary bn-btn" data-nav="rebalance">Xem gợi ý</button>
        </div>` : `
        <div class="banner" style="background:var(--sage);color:#45673F">
          <span class="bn-emoji">🌿</span>
          <div>
            <strong>Cả nhà đang chia sẻ khá đều!</strong>
            <span>Tiếp tục duy trì nhé.</span>
          </div>
        </div>`}

      <div class="section-head"><h3>Gánh nặng từng người</h3></div>
      ${MEMBERS.filter((m) => m.id === "me" || m.id === "bo").map((m) => {
        const planningCnt = state.items.filter((it) => !it.done && it.planning === m.id).length;
        const doCnt = state.items.filter((it) => !it.done && it.doers.includes(m.id)).length;
        return `
          <div class="member-card">
            ${avatarHtml(m)}
            <div class="mc-info">
              <div class="mc-name">${m.name} <span class="mc-role">(${m.role})</span></div>
              <div class="mc-load">
                <div class="ml-row"><span class="ml-label">🧠 Nghĩ và lo</span><span class="ml-track"><i style="width:${Math.min(100, planningCnt * 12)}%;background:${m.color}"></i></span><span class="ml-val">${planningCnt}</span></div>
                <div class="ml-row"><span class="ml-label">✅ Làm</span><span class="ml-track"><i style="width:${Math.min(100, doCnt * 12)}%;background:${m.dark}"></i></span><span class="ml-val">${doCnt}</span></div>
              </div>
            </div>
            <div class="mc-pct" style="color:${m.dark}">${pcts[m.id]}%</div>
          </div>`;
      }).join("")}

      <div class="kids-row">
        ${kids().map((m) => {
          const planningCnt = state.items.filter((it) => !it.done && it.planning === m.id).length;
          const doCnt = state.items.filter((it) => !it.done && it.doers.includes(m.id)).length;
          return `
            <div class="member-card kid">
              ${avatarHtml(m, "sm")}
              <div class="mc-info">
                <div class="mc-name">${m.name}</div>
                <div class="mc-load sm">
                  <div class="ml-row"><span class="ml-label">🧠</span><span class="ml-track"><i style="width:${Math.min(100, planningCnt * 12)}%;background:${m.color}"></i></span><span class="ml-val">${planningCnt}</span></div>
                  <div class="ml-row"><span class="ml-label">✅</span><span class="ml-track"><i style="width:${Math.min(100, doCnt * 12)}%;background:${m.dark}"></i></span><span class="ml-val">${doCnt}</span></div>
                </div>
              </div>
              <div class="mc-pct" style="color:${m.dark}">${pcts[m.id]}%</div>
            </div>`;
        }).join("")}
      </div>

      <div class="note-card">
        <span class="nc-emoji">🧮</span>
        <span><b>Cách HomeFlow tính:</b> việc <b>nghĩ và lo</b> (nhớ, lên kế hoạch, chuẩn bị, nhắc) nặng gấp đôi việc <b>làm</b>. Vì phần vô hình đó mới là gánh nặng thật sự.</span>
      </div>
    `;
  };

  /* ---------- 7. Smart Rebalance ---------- */

  VIEWS.rebalance = () => {
    const { totals, pcts, sum } = loadTotals();
    const targets = state.items.filter((it) => ["i2", "i3", "i13"].includes(it.id)); // Đóng tiền điện + Mua quà + Học phí
    const from = member("me");
    const to = member("bo");
    const moved = targets.filter((t) => t.doers.includes("me")).length;
    const meAfter = Math.round(((totals.me - moved) / sum) * 100);
    const boAfter = Math.round(((totals.bo + moved) / sum) * 100);

    if (state.rebalanced) {
      const { pcts: np } = loadTotals();
      const beforePct = state.preMePct != null ? state.preMePct : pcts.me;
      const beforeBoPct = state.preBoPct != null ? state.preBoPct : pcts.bo;
      return `
        <div class="rb-success">
          <span class="rs-emoji">🤝</span>
          <strong>Đã chia sẻ việc cho cả nhà!</strong>
          <p>${to.name} nhận <b>${targets.map((t) => `“${t.title}”`).join(" và ")}</b> — ${from.name} vẫn nhớ &amp; lo, nhưng không còn một mình gánh nữa.</p>
          <div class="before-after" style="margin-top:20px">
            <div class="ba-col"><div class="ba-label">Trước</div>
              <div class="ba-name" style="color:${from.color}">${from.name} ${beforePct}%</div>
              <div class="ba-bar"><i style="width:${beforePct * 1.6}%;background:${from.color}"></i></div>
              <div class="ba-name" style="color:${to.color}">${to.name} ${beforeBoPct}%</div>
              <div class="ba-bar"><i style="width:${beforeBoPct * 1.6}%;background:${to.color}"></i></div></div>
            <div class="ba-col"><div class="ba-label">Sau</div>
              <div class="ba-name" style="color:${from.color}">${from.name} ${np.me}%</div>
              <div class="ba-bar"><i style="width:${np.me * 1.6}%;background:${from.color}"></i></div>
              <div class="ba-name" style="color:${to.color}">${to.name} ${np.bo}%</div>
              <div class="ba-bar"><i style="width:${np.bo * 1.6}%;background:${to.color}"></i></div></div>
          </div>
          <button class="btn-primary" data-nav="balance" style="width:100%;margin-top:22px">Xem cân bằng mới ⚖️</button>
        </div>`;
    }

    return `
      <div class="eyebrow">Smart Rebalance</div>
      <h2 class="h-title">Cân bằng lại nhẹ nhàng ⚖️</h2>

      <div class="rb-hero">
        <span class="rb-emoji">😮💨</span>
        <strong>Tuần này, phần lớn việc phải nhớ và lên kế hoạch đang tập trung vào ${from.name} 💭</strong>
        <p>${from.name} đang gánh ${pcts.me}% — không phải vì ai giỏi hơn, mà vì phần <b>nghĩ và lo</b> đang dồn về một người. Cùng chia sẻ một vài việc để tuần tới nhẹ nhàng hơn nhé.</p>
      </div>

      <div class="rb-suggest">
        <div class="eyebrow">💜 HomeFlow gợi ý</div>
        <div class="rb-transfer">
          <div class="rt-person">
            <div class="rt-ava" style="background:${from.soft}">${from.emoji}</div>
            <small>${from.name} · nghĩ và lo</small>
          </div>
          <div class="rt-arrow">➡️</div>
          <div class="rt-person">
            <div class="rt-ava" style="background:${to.soft}">${to.emoji}</div>
            <small>${to.name} · làm</small>
          </div>
        </div>
        <div class="rt-task">
          ${targets.map((t) => `${t.emoji} “${t.title}” — ${to.name} nhận làm, ${from.name} vẫn nhớ &amp; lo`).join("<br>")}
        </div>

        <div class="before-after">
          <div class="ba-col"><div class="ba-label">Trước</div>
            <div class="ba-name" style="color:${from.color}">${from.name} ${pcts.me}%</div>
            <div class="ba-bar"><i style="width:${pcts.me * 1.6}%;background:${from.color}"></i></div></div>
          <div class="ba-col"><div class="ba-label">Sau khi chia sẻ</div>
            <div class="ba-name" style="color:${from.color}">${from.name} ${meAfter}%</div>
            <div class="ba-bar"><i style="width:${meAfter * 1.6}%;background:${from.color}"></i></div>
            <div class="ba-name" style="color:${to.color}">${to.name} ${boAfter}%</div>
            <div class="ba-bar"><i style="width:${boAfter * 1.6}%;background:${to.color}"></i></div></div>
        </div>
      </div>

      <button class="btn-primary" id="rb-accept" style="width:100%;margin-top:16px">🤝 Đồng ý, chia sẻ việc này</button>
      <div style="height:10px"></div>
      <button class="btn-ghost" data-nav="balance" style="width:100%">Để sau</button>
    `;
  };

  /* ---------- 8. Kids' Missions ---------- */

  VIEWS.missions = () => {
    const ks = kids();
    const kidNames = ks.map((k) => k.name).join(" & ");
    const totalStars = state.missions.reduce((a, m) => a + m.stars, 0);
    const gotStars = state.missions.reduce((a, m) => a + m.got, 0);
    const pct = Math.round((gotStars / totalStars) * 100);
    const allDone = state.missions.every((m) => m.done);
    return `
      <div class="eyebrow gold">Kids' Missions</div>
      <h2 class="h-title">Phiêu lưu của ${kidNames} 🚀</h2>
      <p class="h-sub">Trẻ cùng tham gia việc nhà — vừa chơi vừa học cách chia sẻ. Cả nhà cùng gom sao nhé!</p>

      <div class="family-goal">
        <div class="fg-head">
          <span class="fg-title">🌟 Mục tiêu của cả nhà</span>
          <span class="fg-count">${gotStars}/${totalStars} ⭐</span>
        </div>
        <div class="fg-bar"><i style="width:${pct}%"></i></div>
        <div class="fg-text">${allDone
          ? "Tuyệt vời! Cả nhà đã đạt mục tiêu tuần này 🎉"
          : `Cả nhà đã gom được ${gotStars}/${totalStars} ⭐ — còn ${totalStars - gotStars} sao nữa là cả nhà đi công viên cuối tuần!`}</div>
      </div>

      <div class="section-head"><h3>Nhiệm vụ tuần này</h3></div>
      ${state.missions.map((ms) => {
        const kid = member(ms.for);
        const STEP_LABELS = ["Nhớ", "Chuẩn bị", "Hoàn thành"];
        return `
          <article class="mission-card ${ms.done ? "done" : ""}" data-id="${ms.id}">
            <div class="mission-emoji" style="background:${ms.bg}">${ms.emoji}</div>
            <div class="mission-body">
              <div class="mission-title">${esc(ms.title)}</div>
              <div class="mission-for">Cho ${kid.name} ${kid.emoji}</div>
              <div class="mission-steps">
                ${STEP_LABELS.map((lab, i) => `
                  <div class="mstep ${i < ms.step ? "done" : ""} ${i === ms.step ? "active" : ""}">
                    <span class="ms-dot">${i < ms.step ? "✓" : i + 1}</span>
                    <span class="ms-name">${lab}</span>
                  </div>`).join("")}
              </div>
              <div class="mission-step-desc">${ms.done ? "Tuyệt vời! 🎉" : ms.steps[ms.step]}</div>
              <div class="stars">
                ${Array.from({ length: ms.stars }, (_, i) => `<span class="st ${i < ms.got ? "" : "off"}">⭐</span>`).join("")}
              </div>
            </div>
            <button class="mission-btn" data-act="mission">${ms.done ? "✓ Xong" : ms.step >= 2 ? "Hoàn thành" : "Tiếp theo"}</button>
          </article>`;
      }).join("")}
    `;
  };

  /* ---------- 9b. Kids' Profiles (Hồ sơ con) ---------- */

  function healthRows(health) {
    return health.map((h, i) => {
      const prev = health[i + 1];
      let dw = "", dh = "";
      if (prev) {
        const dW = +(h.weight - prev.weight).toFixed(1);
        const dH = h.height - prev.height;
        dw = dW > 0 ? `↑${dW}` : dW < 0 ? `↓${Math.abs(dW)}` : "=";
        dh = dH > 0 ? `↑${dH}` : dH < 0 ? `↓${Math.abs(dH)}` : "=";
      }
      return { h, dw, dh };
    });
  }

  VIEWS.profiles = () => {
    const ks = kids();
    const selId = ks.some((k) => k.id === state.profileKid) ? state.profileKid : ks[0].id;
    const m = member(selId);
    const prof = state.kids[selId] || { birthday: "", blood: "—", health: [], illnesses: [], grades: [] };
    const age = ageFromBirthday(prof.birthday);
    const health = healthRows(prof.health);

    return `
      <div class="eyebrow sage">Hồ sơ con</div>
      <h2 class="h-title">Sức khỏe &amp; học tập của các con</h2>
      <p class="h-sub">Một nơi lưu mọi cột mốc của con — sinh nhật, cân nặng, chiều cao, bệnh và kết quả học tập.</p>

      <div class="kid-tabs">
        ${ks.map((k) => `
          <button class="kid-tab ${k.id === selId ? "on" : ""}" data-kid="${k.id}">
            <span class="kt-ava" style="background:${k.soft}">${k.emoji}</span> ${esc(k.name)}
          </button>`).join("")}
        <button class="kid-tab add" id="add-kid-tab">＋ Thêm con</button>
      </div>

      <div class="add-kid-form" id="add-kid-form" hidden>
        <div class="eyebrow">Thêm con mới</div>
        <div class="ak-row">
          <input class="ak-input" id="ak-name" placeholder="Tên con (vd: Bi)" maxlength="12">
          <input class="ak-input" id="ak-birthday" placeholder="Ngày sinh DD/MM/YYYY">
        </div>
        <button class="btn-primary" id="ak-save" style="width:100%;margin-top:10px">💜 Thêm con vào gia đình</button>
      </div>

      <div class="card profile-card">
        <div class="pf-head">
          ${avatarHtml(m)}
          <div class="pf-info">
            <div class="pf-name">${esc(m.name)} <button class="rename-btn" data-member="${m.id}">✏️</button></div>
            <div class="pf-meta">🎂 ${prof.birthday || "Chưa có"} ${age ? `· ${age} tuổi` : ""} · 🩸 Nhóm máu ${prof.blood}</div>
          </div>
        </div>
      </div>

      <div class="section-head"><h3>📏 Cân nặng &amp; chiều cao</h3></div>
      <div class="card pf-section">
        ${prof.health.length ? health.map(({ h, dw, dh }) => `
          <div class="health-entry">
            <span class="he-date">${h.date}</span>
            <span class="he-val">${h.weight} kg <em class="hd ${dw.includes("↓") ? "down" : "up"}">${dw}</em></span>
            <span class="he-val">${h.height} cm <em class="hd ${dh.includes("↓") ? "down" : "up"}">${dh}</em></span>
          </div>`).join("") : `<div class="empty-note"><span class="en-emoji">🌱</span>Chưa có số liệu. Thêm lần đo đầu tiên nhé!</div>`}
      </div>

      <div class="section-head"><h3>🩺 Lịch sử bệnh</h3></div>
      <div class="card pf-section">
        ${prof.illnesses.length ? prof.illnesses.map((il) => `
          <div class="illness-entry">
            <span class="il-date">${il.date}</span>
            <span class="il-text">${esc(il.text)}</span>
          </div>`).join("") : `<div class="empty-note"><span class="en-emoji">💚</span>Không có bệnh nào được ghi nhận. Bé khỏe mạnh!</div>`}
      </div>

      <div class="section-head"><h3>📚 Kết quả học tập <span class="dg-count">2 kỳ / năm</span></h3></div>
      <div class="card pf-section">
        ${prof.grades.length ? `
          <div class="grades-head">
            <span>Năm học</span><span>Kỳ 1</span><span>Kỳ 2</span><span>TB năm</span>
          </div>
          ${prof.grades.map((g) => {
            const tb = ((g.k1 + g.k2) / 2).toFixed(1);
            return `
            <div class="grades-row">
              <span class="gr-year">${g.year}</span>
              <span>${g.k1}</span><span>${g.k2}</span>
              <span class="gr-tb">${tb}</span>
            </div>`;
          }).join("")}
        ` : `<div class="empty-note"><span class="en-emoji">🎨</span>Bé còn nhỏ — kết quả học tập sẽ xuất hiện khi con vào lớp 1.</div>`}
      </div>
    `;
  };

  /* ---------- 8b. Task Detail (Planning Owner ≠ Task Owner) ---------- */

  VIEWS.detail = () => {
    const it = state.items.find((x) => x.id === state.detailItem);
    if (!it) return VIEWS.home();
    const cat = CATS[it.cat] || CATS.home;
    const pl = member(it.planning);
    const isAll = it.doers.includes("all");
    const tk = isAll ? { name: "Cả nhà", soft: "#F9E3E9", emoji: "❤️", color: "#E9A8BC" } : member(it.doers[0]);
    const det = detailFor(it);

    return `
      <div class="detail-head">
        <button class="back-btn" data-nav="back" aria-label="Quay lại">←</button>
        <span class="tag day">${DAYS[it.day]}</span>
        ${it.time ? `<span class="tag time">🕘 ${it.time}</span>` : ""}
        <span class="tag cat">${cat.emoji} ${cat.label}</span>
      </div>
      <h2 class="h-title">${it.emoji} ${esc(it.title)}</h2>

      <div class="dt-explainer">
        <span class="de-emoji">💡</span>
        <span>Một việc có <b>hai người chủ</b>: người <b>nghĩ và lo</b> và người <b>làm</b>. Việc không tên giờ được nhìn thấy.</span>
      </div>

      <div class="dt-owner planning">
        <div class="do-head">
          ${avatarHtml(pl, "sm")}
          <div>
            <div class="do-name">${esc(pl.name)} <em>Nghĩ và lo</em></div>
            <div class="do-role">Planning Owner — nhớ · lên kế hoạch · chuẩn bị · nhắc</div>
          </div>
        </div>
        <ul class="do-list">
          ${det.planning.map((p) => `<li>${esc(p)}</li>`).join("")}
        </ul>
      </div>

      <div class="dt-divider"><span>≠</span></div>

      <div class="dt-owner task">
        <div class="do-head">
          <span class="avatar sm" style="background:${tk.soft};border:2px solid ${tk.color}">${tk.emoji}</span>
          <div>
            <div class="do-name">${esc(tk.name)} <em>Làm</em></div>
            <div class="do-role">Task Owner — thực hiện việc</div>
          </div>
        </div>
        <ul class="do-list">
          ${det.execution.map((p) => `<li>${esc(p)}</li>`).join("")}
        </ul>
      </div>

      <button class="btn-primary" data-nav="back" style="width:100%;margin-top:18px">💜 Đã rõ</button>
    `;
  };

  /* ---------- 9. Weekly Family Brief ---------- */

  VIEWS.brief = () => {
    const yesterdayIdx = (TODAY_IDX + 6) % 7;
    const tomorrowIdx = (TODAY_IDX + 1) % 7;
    const byDay = (d) => state.items.filter((it) => it.day === d);
    const doneYesterday = byDay(yesterdayIdx).filter((it) => it.done);
    const today = byDay(TODAY_IDX).filter((it) => !it.done);
    const tomorrow = byDay(tomorrowIdx).filter((it) => !it.done);
    const restOfWeek = state.items.filter((it) => it.day > tomorrowIdx && !it.done);
    const doneCount = state.items.filter((it) => it.done).length;
    const aheadCount = today.length + tomorrow.length + restOfWeek.length;

    const itemRow = (it, checked = false) => `
      <div class="brief-item ${checked ? "checked" : ""}">
        <span class="bi-emoji">${it.emoji}</span>
        <span class="bi-text">${esc(it.title)}${it.time ? ` <span class="bi-time">· ${it.time}</span>` : ""}</span>
        <span class="bi-who">${ownersMini(it)}</span>
      </div>`;

    return `
      <div class="eyebrow blush">Weekly Family Brief</div>
      <h2 class="h-title">Bản tin tuần của cả nhà 💌</h2>
      <p class="h-sub">Một lá thư nhỏ — việc đã xong, việc hôm nay và những điều sắp tới.</p>

      <div class="brief-letter">
        <div class="brief-greet">Gửi cả nhà yêu thương 💜</div>
        <div class="brief-summary">
          Tuần này cả nhà đã cùng nhau hoàn thành <b>${doneCount} việc</b>, còn <b>${aheadCount} việc</b> phía trước — cùng nhau san sẻ nhé.
        </div>

        <div class="brief-section">
          <div class="bs-label done">HÔM QUA · đã hoàn thành</div>
          ${doneYesterday.length ? doneYesterday.map((it) => itemRow(it, true)).join("") : `<div class="brief-empty">🌿 Hôm qua nhẹ nhàng</div>`}
        </div>

        <div class="brief-section">
          <div class="bs-label today">HÔM NAY · cần chú ý</div>
          ${today.length ? today.map((it) => itemRow(it)).join("") : `<div class="brief-empty">🌿 Hôm nay thật thoải mái</div>`}
        </div>

        <div class="brief-section">
          <div class="bs-label pending">NGÀY MAI · chuẩn bị</div>
          ${tomorrow.length ? tomorrow.map((it) => itemRow(it)).join("") : `<div class="brief-empty">🌿 Ngày mai chưa có gì</div>`}
        </div>

        <div class="brief-section">
          <div class="bs-label next">TUẦN TỚI · đừng quên</div>
          ${restOfWeek.length ? restOfWeek.map((it) => itemRow(it)).join("") : `<div class="brief-empty">🌿 Cuối tuần thảnh thơi</div>`}
        </div>
      </div>

      <div class="brief-tagline">
        <div class="bt-line">Ít việc phải nhớ hơn.</div>
        <div class="bt-line2">Nhiều thời gian bên nhau hơn.</div>
        <div class="bt-heart">💜</div>
      </div>

      <div class="share-row">
        <button class="btn-ghost" id="brief-share">📤 Chia sẻ</button>
        <button class="btn-primary" data-nav="home">Về trang chủ</button>
      </div>
    `;
  };

  /* ---------- Bindings ---------- */

  function bind(view) {
    $$("[data-nav]", $("#app")).forEach((el) =>
      el.addEventListener("click", (e) => {
        e.preventDefault();
        if (el.dataset.nav === "back") { showView(state.prevView || "home"); return; }
        showView(el.dataset.nav);
      })
    );

    const obStart = $("#ob-start");
    if (obStart) obStart.addEventListener("click", () => showGuide(0));
    const obLater = $("#ob-later");
    if (obLater) obLater.addEventListener("click", () => { markGuideSeen(); showView("home"); });
    $$("#app [data-help]").forEach((el) =>
      el.addEventListener("click", () => {
        const h = el.dataset.help;
        if (h === "video") openVideo();
        else if (h === "po") showGuide(1);
        else if (h === "fb") showGuide(3);
        else showGuide(0);
      })
    );

    $$("#app [data-act=detail]").forEach((el) => {
      const open = () => {
        state.detailItem = el.dataset.id;
        state.prevView = state.view;
        showView("detail");
      };
      el.addEventListener("click", (e) => {
        if (e.target.closest(".check")) return;
        open();
      });
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
    });

    $$("#app [data-nav=back]").forEach((el) =>
      el.addEventListener("click", () => showView(state.prevView || "home"))
    );

    $$("#app .check[data-act=toggle]").forEach((el) => {
      el.addEventListener("click", () => {
        const card = el.closest(".task-card");
        const it = state.items.find((x) => x.id === card.dataset.id);
        it.done = !it.done;
        el.classList.toggle("on", it.done);
        card.classList.toggle("done", it.done);
        toast(it.done ? `Đã xong: ${it.title} 🎉` : "Đã bỏ đánh dấu — việc vẫn còn đó 💜");
        refreshLoadBars();
      });
    });

    $$("#app .check[data-act=toggle-kid]").forEach((el) => {
      el.addEventListener("click", () => {
        const item = el.closest(".kt-item");
        const it = state.items.find((x) => x.id === item.dataset.id);
        it.done = !it.done;
        el.classList.toggle("on", it.done);
        item.classList.toggle("done", it.done);
        toast(it.done ? `Đã xong: ${it.title} 🎉` : "Đã bỏ đánh dấu — việc vẫn còn đó 💜");
        refreshLoadBars();
      });
    });

    $$(".wday[data-day]").forEach((el) =>
      el.addEventListener("click", () => {
        state.plannerDay = +el.dataset.day;
        showView("planner");
      })
    );

    $$(".dn-btn[data-day], .dn-today[data-day]").forEach((el) =>
      el.addEventListener("click", () => {
        const d = el.dataset.day;
        if (d === "prev") state.plannerDay = (state.plannerDay + 6) % 7;
        else if (d === "next") state.plannerDay = (state.plannerDay + 1) % 7;
        else state.plannerDay = TODAY_IDX;
        showView("planner");
      })
    );

    $$(".mt-btn[data-mode]").forEach((el) =>
      el.addEventListener("click", () => {
        state.plannerMode = el.dataset.mode;
        showView("planner");
      })
    );

    $$(".wa-head[data-day]").forEach((el) =>
      el.addEventListener("click", () => {
        state.plannerDay = +el.dataset.day;
        state.plannerMode = "day";
        showView("planner");
      })
    );

    $$(".mg-cell[data-mday]").forEach((el) =>
      el.addEventListener("click", () => {
        state.plannerDay = +el.dataset.mday;
        state.plannerMode = "day";
        showView("planner");
      })
    );

    $$(".mn-btn[data-mnav], .mn-today[data-mnav]").forEach((el) =>
      el.addEventListener("click", () => {
        const mv = el.dataset.mnav;
        if (mv === "prev") state.monthOffset -= 1;
        else if (mv === "next") state.monthOffset += 1;
        else { state.monthOffset = 0; state.plannerDay = TODAY_IDX; }
        showView("planner");
      })
    );

    $$(".wn-btn[data-wk], .wn-today[data-wk]").forEach((el) =>
      el.addEventListener("click", () => {
        const w = el.dataset.wk;
        if (w === "prev") state.weekOffset -= 1;
        else if (w === "next") state.weekOffset += 1;
        else { state.weekOffset = 0; state.plannerDay = TODAY_IDX; }
        showView("planner");
      })
    );

    $$(".fchip[data-filter]").forEach((el) =>
      el.addEventListener("click", () => {
        state.taskFilter = el.dataset.filter;
        showView("tasks");
      })
    );

    $$(".mission-btn[data-act=mission]").forEach((el) => {
      el.addEventListener("click", () => {
        const card = el.closest(".mission-card");
        const ms = state.missions.find((x) => x.id === card.dataset.id);
        if (ms.done) return;
        ms.step += 1;
        if (ms.step >= 3) {
          ms.done = true;
          ms.got = ms.stars;
          toast(`Chúc mừng ${member(ms.for).name}! +${ms.stars} ⭐`);
        } else {
          ms.got = Math.min(ms.got + 1, ms.stars);
          toast(`${ms.steps[ms.step - 1]} 💜`);
        }
        setTimeout(() => showView("missions"), 600);
      });
    });

    $$(".rename-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const m = member(btn.dataset.member);
        const input = document.createElement("input");
        input.className = "rename-input";
        input.value = m.name;
        input.maxLength = 12;
        input.setAttribute("aria-label", "Tên mới");
        btn.replaceWith(input);
        input.focus();
        input.select();
        let done = false;
        const commit = () => {
          if (done) return;
          done = true;
          const v = input.value.trim();
          if (v && v !== m.name) {
            m.name = v;
            m.role = v;
            toast(`Đã đổi tên thành ${v} 💜`);
          }
          showView(state.view);
        };
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { done = true; showView(state.view); }
        });
        input.addEventListener("blur", commit);
      });
    });

    if (view === "profiles") {
      $$(".kid-tab[data-kid]").forEach((el) =>
        el.addEventListener("click", () => {
          state.profileKid = el.dataset.kid;
          showView("profiles");
        })
      );
      const addForm = $("#add-kid-form");
      $("#add-kid-tab").addEventListener("click", () => {
        addForm.hidden = !addForm.hidden;
      });
      $("#ak-save").addEventListener("click", () => {
        const name = $("#ak-name").value.trim();
        const bd = $("#ak-birthday").value.trim();
        if (!name) { toast("Hãy nhập tên con nhé 💬"); return; }
        const id = addKid(name, bd || "");
        state.profileKid = id;
        toast(`Đã thêm ${name} vào gia đình 💜`);
        showView("profiles");
      });
    }

    if (view === "dump") {
      const ta = $("#dump-input");
      const micBtn = $(".mic");
      const submitDump = (raw) => {
        state.lastDump = raw;
        showView("ai");
        const steps = $$(".ai-step");
        steps.forEach((el, i) => {
          setTimeout(() => {
            el.classList.add("active");
            setTimeout(() => el.classList.replace("active", "done"), 240);
          }, 305 * i);
        });
        const animDone = new Promise((res) => setTimeout(res, 312 * AI_STEPS.length + 370));
        const llm = fetch("/api/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: raw,
            members: MEMBERS.map((m) => ({ id: m.id, name: m.name, role: m.role })),
          }),
          signal: AbortSignal.timeout(15000),
        })
          .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
          .then((data) => {
            if (!data || !Array.isArray(data.items) || !data.items.length) throw new Error("empty");
            state.parseResult = data.items;
            state.aiSummary = data.summary || "";
          })
          .catch(() => {
            state.parseResult = parseDump(raw);
            state.aiSummary = "";
            toast("HomeFlow tự hiểu giúp cả nhà 💜");
          });
        Promise.all([animDone, llm]).then(() => {
          if (state.view === "ai") showView("confirm");
        });
      };

      $$(".chip[data-example]").forEach((el) =>
        el.addEventListener("click", () => {
          ta.value = EXAMPLES[+el.dataset.example];
          ta.focus();
        })
      );
      $("#dump-submit").addEventListener("click", () => {
        const raw = ta.value.trim();
        if (!raw) { toast("Có gì đang ở trong đầu bạn? Cứ nói ra nhé 💬"); return; }
        submitDump(raw);
      });

      // Voice input — "Nói với HomeFlow" 🎙️
      const note = $(".dump-note");
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const recog = new SR();
        recog.lang = "vi-VN";
        recog.interimResults = true;
        recog.maxAlternatives = 1;
        let finalText = "";
        let autoSubmit = false;
        recog.onresult = (e) => {
          let interim = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
            else interim += e.results[i][0].transcript;
          }
          ta.value = (finalText + " " + interim).trim();
        };
        recog.onend = () => {
          micBtn.classList.remove("listening");
          note.classList.remove("listening");
          ta.value = finalText.trim();
          const v = ta.value;
          if (v && autoSubmit) {
            autoSubmit = false;
            setTimeout(() => submitDump(v), 700);
          }
        };
        recog.onerror = (e) => {
          micBtn.classList.remove("listening");
          note.classList.remove("listening");
          if (e.error === "not-allowed" || e.error === "service-not-allowed") {
            toast("Micro bị chặn — bật quyền micro hoặc gõ tay nhé 🎙️");
          } else if (e.error === "no-speech") {
            toast("Chưa nghe thấy gì — thử lại nhé 🎙️");
          } else {
            toast("Không nhận được giọng nói — hãy gõ tay nhé 💬");
          }
        };
        micBtn.addEventListener("click", () => {
          if (micBtn.classList.contains("listening")) { recog.stop(); return; }
          finalText = "";
          autoSubmit = true;
          try {
            recog.start();
            micBtn.classList.add("listening");
            note.classList.add("listening");
            toast("Đang nghe… nói đi cả nhà 🎙️");
          } catch (err) {
            toast("Micro không khả dụng — hãy gõ tay nhé 💬");
          }
        });
      } else {
        micBtn.addEventListener("click", () => toast("Trình duyệt chưa hỗ trợ giọng nói — hãy gõ tay nhé 💬"));
      }
    }

    if (view === "confirm") {
      $$(".pi-edit[data-act=edit-item]").forEach((btn) =>
        btn.addEventListener("click", () => {
          const editor = $(`.pi-editor[data-idx="${btn.dataset.idx}"]`);
          const open = editor.hidden;
          editor.hidden = !open;
          btn.setAttribute("aria-expanded", String(open));
          btn.textContent = open ? "✕ Đóng" : "✏️ Chỉnh sửa";
        })
      );
      $$(".mini-select").forEach((sel) =>
        sel.addEventListener("change", () => {
          const it = state.parseResult[+sel.dataset.idx];
          const role = sel.dataset.role;
          if (role === "planning") it.planning = sel.value;
          else if (role === "task") it.doers = [sel.value];
          else if (role === "day") it.day = +sel.value;
        })
      );
      $$(".mini-time").forEach((inp) =>
        inp.addEventListener("change", () => {
          const it = state.parseResult[+inp.dataset.idx];
          it.time = inp.value || null;
        })
      );
      $$(".mini-text").forEach((inp) =>
        inp.addEventListener("change", () => {
          const it = state.parseResult[+inp.dataset.idx];
          const v = inp.value.trim();
          if (v && v !== it.title) {
            it.title = v;
            const card = inp.closest(".parse-item");
            const tt = card && card.querySelector(".task-title");
            if (tt) tt.textContent = `${it.emoji} ${it.title}`;
          }
        })
      );
      $("#confirm-save").addEventListener("click", () => {
        const items = state.parseResult;
        items.forEach((it, i) => {
          const dup = state.items.find((x) => x.title === it.title && x.day === it.day && !x.done);
          if (dup) {
            dup.planning = it.planning;
            dup.doers = it.doers;
            dup.justAdded = true;
            return;
          }
          it.id = "p" + Date.now() + i;
          it.done = false;
          it.justAdded = true;
          state.items.unshift(it);
        });
        const n = items.length;
        const firstDay = items[0].day;
        const reminders = items.map((it) => {
          const who = it.planning === "me" ? "Mẹ" : member(it.planning).name;
          return `${who} nhớ “${it.title}” trước ${DAYS[it.day]}`;
        }).join(" · ");
        state.parseResult = null;
        const ov = document.createElement("div");
        ov.className = "success-overlay";
        ov.innerHTML = `
          <div class="so-circle">✓</div>
          <div class="so-title">Đã thêm ${n} việc vào HomeFlow!</div>
          <div class="so-sub">🔔 HomeFlow sẽ nhắc: ${esc(reminders)}</div>`;
        document.body.appendChild(ov);
        setTimeout(() => {
          ov.remove();
          state.plannerDay = firstDay;
          showView("planner");
          toast("Đã thêm vào kế hoạch 💜");
          setTimeout(() => {
            $$(".just-added").forEach((el) => el.classList.remove("just-added"));
            state.items.forEach((it) => { it.justAdded = false; });
          }, 4200);
        }, 1750);
      });
      $("#confirm-back").addEventListener("click", () => showView("dump"));
    }

    if (view === "rebalance") {
      const btn = $("#rb-accept");
      if (btn) {
        btn.addEventListener("click", () => {
          state.preMePct = loadTotals().pcts.me;
          state.preBoPct = loadTotals().pcts.bo;
          state.items.filter((it) => ["i2", "i3", "i13"].includes(it.id)).forEach((it) => { it.doers = ["bo"]; });
          state.rebalanced = true;
          showView("rebalance");
          setTimeout(() => {
            toast("Bố đã nhận “Đóng tiền điện”, “Mua quà” và “Thanh toán học phí” 🤝");
          }, 350);
        });
      }
    }

    if (view === "brief") {
      const sh = $("#brief-share");
      if (sh) {
        sh.addEventListener("click", () => toast("Đã gửi bản tin tuần cho cả nhà 💌"));
      }
    }
  }

  function refreshLoadBars() {
    const { pcts } = loadTotals();
    $$("#home-loadbar .seg").forEach((seg) => {
      seg.style.width = pcts[seg.dataset.member] + "%";
    });
    $$("#app .hero .legend-item").forEach((li) => {
      const lab = li.querySelector(".legend-label");
      if (lab) lab.textContent = `${member(li.dataset.member).name} ${pcts[li.dataset.member]}%`;
    });
    const dl = $("#date-line");
    if (dl) {
      const today = state.items.filter((it) => it.day === TODAY_IDX);
      dl.textContent = dateLineText(today.length);
    }
  }

  /* ---------- Boot ---------- */

  function boot() {
    seed();
    $("#fab").addEventListener("click", () => showView("dump"));
    $$(".tab").forEach((t) => t.addEventListener("click", () => showView(t.dataset.view)));
    showView("home");
  }

  document.addEventListener("DOMContentLoaded", boot);
})();