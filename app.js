// ============================================================
// SUPABASE INTEGRATION
// ============================================================
import {
  signIn,
  signOut,
  getSession,
  onAuthChange,
  fetchAttendance,
  upsertAttendance,
  upsertAllAttendance,
  fetchTasks,
  insertTask,
  updateTask,
  deleteTask,
  fetchNotes,
  saveNotes,
  fetchSchedule,
  saveSchedule,
  fetchPiket,
  savePiket,
} from "./supabase.js";

// ============================================================
// STATE & CONSTANTS
// ============================================================
let notesId = null;
let todayDateStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

const STORAGE_KEY = "sekretaris9scp2-state-v1";
const STUDENTS = [
  "ADZKIYA SAFWA ANAKA",
  "ALIYAH NUR LATHIFAH",
  "ALTHAF ZISAN AYDIN R",
  "ANDI NAUFAL N",
  "ASHFA HADZIQ H",
  "ASYIFA NAISILA JELITA",
  "BETHARI JANITRA IW",
  "BILLIE RAIHAN SAPUTRA",
  "DAFFA RIDHO ALGHANI",
  "DELISA ASZAHRA P",
  "DHAFIN DZIMAR",
  "DIMAS NARENDRA W",
  "DIRA SHASMIRA RIANTI",
  "EDDLYN ARSY ZUHAIR",
  "FADIPTA JAVAS A",
  "KEI EZHAR ABHIMATA",
  "KENZO JABBAR LEBCCA",
  "MALVINO APRILIO PI",
  "MARITZA ADILIA S",
  "MOCH DAFFA RAFANDRA",
  "MOCH NABIL DAVIAN N",
  "MUH GHAISAN WIMIANO",
  "MUH RAFA RABBANI H",
  "MUH RAFI SYAHPUTRA A",
  "NAURA KARENZA A Z",
  "NAYOTTAMA AR",
  "SABRINA VIDI ARETHA",
  "VELIKA JASMIN CK",
  "VINNO IBRAHIM A",
  "WIDYATAMAKA ZAYYAN",
  "YUDHISTIRA PERWIRA W",
  "ZAHRA LAILIA R",
  "ZUHAL ABDILLAH AFKAR"
];

const STATUS_OPTIONS = ["Masuk", "Sakit", "Izin", "Alpha"];
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAY_LABELS_ID = {
  Monday: "Senin",
  Tuesday: "Selasa",
  Wednesday: "Rabu",
  Thursday: "Kamis",
  Friday: "Jumat"
};

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function deadlineToInput(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/,\s*(\d{1,2})\s+([A-Za-z]+)/);
  if (!match) return "";
  const month = MONTH_NAMES.findIndex((name) => name.toLowerCase() === match[2].toLowerCase());
  if (month < 0) return "";
  return `${new Date().getFullYear()}-${String(month + 1).padStart(2, "0")}-${String(match[1]).padStart(2, "0")}`;
}

function formatDeadline(value) {
  const input = deadlineToInput(value);
  if (!input) return value;
  const date = new Date(`${input}T00:00:00`);
  return `${new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(date)}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
}

function getDeadlineUrgency(value) {
  const input = deadlineToInput(value);
  if (!input) return { label: value, urgentClass: "" };
  const target = new Date(`${input}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `Lewat (${formatDeadline(value)})`, urgentClass: "urgent" };
  } else if (diffDays === 0) {
    return { label: `Hari Ini (${formatDeadline(value)})`, urgentClass: "urgent" };
  } else if (diffDays === 1) {
    return { label: `Besok (${formatDeadline(value)})`, urgentClass: "soon" };
  } else {
    return { label: formatDeadline(value), urgentClass: "" };
  }
}

function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = "success") {
  const container = document.querySelector("#toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");

  const iconSvg =
    type === "error"
      ? `<svg class="icon-svg toast-icon" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
      : `<svg class="icon-svg toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  toast.innerHTML = `${iconSvg} <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-exit");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2600);
}

// ============================================================
// CANVAS GRID PULSE ANIMATION
// ============================================================
function initGridPulse() {
  const canvas = document.querySelector("#gridPulseCanvas");
  const context = canvas?.getContext("2d");
  if (!canvas || !context || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const cellSize = 28;
  const cells = new Map();
  let width = 0;
  let height = 0;
  let columns = 0;
  let rows = 0;
  let frame = 0;
  let pointer = null;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    columns = Math.ceil(width / cellSize);
    rows = Math.ceil(height / cellSize);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    wake();
  };

  const wake = () => {
    if (!frame) frame = requestAnimationFrame(draw);
  };

  const light = (column, row, hold = 900) => {
    if (column < 0 || row < 0 || column >= columns || row >= rows) return;
    const key = `${column},${row}`;
    const existing = cells.get(key);
    const now = performance.now();
    if (existing && existing.until > now) {
      existing.until = Math.max(existing.until, now + hold * 0.35);
      return;
    }
    cells.set(key, {
      column,
      row,
      born: now,
      until: now + hold,
    });
    wake();
  };

  const paint = () => {
    if (!pointer) return;
    const column = Math.floor(pointer.x / cellSize);
    const row = Math.floor(pointer.y / cellSize);
    for (let y = -2; y <= 2; y += 1) {
      for (let x = -2; x <= 2; x += 1) {
        if (Math.hypot(x, y) <= 2.6 && Math.random() > 0.25) light(column + x, row + y, 700 + Math.random() * 900);
      }
    }
  };

  const draw = (now) => {
    frame = 0;
    context.clearRect(0, 0, width, height);
    context.strokeStyle = "rgba(0, 0, 0, 0.05)";
    context.lineWidth = 1;
    context.beginPath();
    for (let x = 0; x <= columns; x += 1) {
      context.moveTo(x * cellSize + 0.5, 0);
      context.lineTo(x * cellSize + 0.5, height);
    }
    for (let y = 0; y <= rows; y += 1) {
      context.moveTo(0, y * cellSize + 0.5);
      context.lineTo(width, y * cellSize + 0.5);
    }
    context.stroke();

    for (const [key, cell] of cells) {
      const elapsed = now - cell.born;
      const remaining = cell.until - now;
      if (remaining <= 0) {
        cells.delete(key);
        continue;
      }
      const alpha = Math.min(0.45, Math.min(1, elapsed / 180) * Math.min(1, remaining / 700) * 0.45);
      context.fillStyle = `rgba(13, 148, 136, ${alpha})`;
      context.fillRect(cell.column * cellSize + 2, cell.row * cellSize + 2, cellSize - 3, cellSize - 3);
    }

    if (cells.size) frame = requestAnimationFrame(draw);
  };

  let ambient = window.setInterval(() => {
    light(Math.floor(Math.random() * columns), Math.floor(Math.random() * rows), 2200 + Math.random() * 1200);
  }, 3600);

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    pointer = { x: event.clientX, y: event.clientY };
    paint();
  }, { passive: true });
  resize();

  window.addEventListener("beforeunload", () => {
    clearInterval(ambient);
    cancelAnimationFrame(frame);
  }, { once: true });
}

function normalizeWeekdays(dayMap) {
  return Object.fromEntries(
    WEEKDAYS.map((day) => [day, Array.isArray(dayMap?.[day]) ? dayMap[day] : []])
  );
}

const defaultState = {
  schedule: {
    Monday: ["B.ING", "IPA", "BTQ Kelas 9", "B.ARAB", "Program Peminatan"],
    Tuesday: ["PJOK", "AL ISLAM", "BTQ Kelas 9", "PEND. PANCASILA", "B.INDO"],
    Wednesday: ["BK", "IPS", "BTQ Kelas 9", "INFORMATIKA", "IPA"],
    Thursday: ["MATH", "KMD", "BTQ Kelas 9", "B.INDO", "SENI RUPA"],
    Friday: ["B.ING", "PJOK", "IPA", "B.INDO", "SENI RUPA", "PEND. PANCASILA"]
  },
  piket: {
    Monday: [
      "ADZKIYA SAFWA ANAKA",
      "ALIYAH NUR LATHIFAH",
      "ALTHAF ZISAN AYDIN R",
      "ANDI NAUFAL N",
      "ASHFA HADZIQ H",
      "ASYIFA NAISILA JELITA",
      "BETHARI JANITRA IW"
    ],
    Tuesday: [
      "BILLIE RAIHAN SAPUTRA",
      "DAFFA RIDHO ALGHANI",
      "DELISA ASZAHRA P",
      "DHAFIN DZIMAR",
      "DIMAS NARENDRA W",
      "DIRA SHASMIRA RIANTI",
      "EDDLYN ARSY ZUHAIR"
    ],
    Wednesday: [
      "FADIPTA JAVAS A",
      "KEI EZHAR ABHIMATA",
      "KENZO JABBAR LEBCCA",
      "MALVINO APRILIO PI",
      "MARITZA ADILIA S",
      "MOCH DAFFA RAFANDRA",
      "MOCH NABIL DAVIAN N"
    ],
    Thursday: [
      "MUH GHAISAN WIMIANO",
      "MUH RAFA RABBANI H",
      "MUH RAFI SYAHPUTRA A",
      "NAURA KARENZA A Z",
      "NAYOTTAMA AR",
      "SABRINA VIDI ARETHA"
    ],
    Friday: [
      "VELIKA JASMIN CK",
      "VINNO IBRAHIM A",
      "WIDYATAMAKA ZAYYAN",
      "YUDHISTIRA PERWIRA W",
      "ZAHRA LAILIA R",
      "ZUHAL ABDILLAH AFKAR"
    ]
  },
  tasks: [],
  notes: "Kalau ada yang kurang atau salah bisa dikoreksi dan ditambahin yaa!",
  attendance: Object.fromEntries(
    STUDENTS.map((student) => [student, "Masuk"])
  ),
};

const state = loadState();
state.schedule = normalizeWeekdays(state.schedule);
state.piket = normalizeWeekdays(state.piket);

const ATTENDANCE_DEFAULT_MIGRATION = "sekretaris9scp2-attendance-default-v2";
if (!localStorage.getItem(ATTENDANCE_DEFAULT_MIGRATION)) {
  state.attendance = Object.fromEntries(STUDENTS.map((student) => [student, "Masuk"]));
  localStorage.setItem(ATTENDANCE_DEFAULT_MIGRATION, "done");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
let editingTaskId = null;
let isSekretarisLoggedIn = false;

// Drawer active filter states
let currentScheduleTab = "all";
let currentPiketTab = "all";

const elements = {
  todayDate: document.querySelector("#todayDate"),
  todaySubjectsQuick: document.querySelector("#todaySubjectsQuick"),
  todayPiketQuick: document.querySelector("#todayPiketQuick"),
  subjectsList: document.querySelector("#subjectsList"),
  tasksList: document.querySelector("#tasksList"),
  piketList: document.querySelector("#piketList"),
  attendanceList: document.querySelector("#attendanceList"),
  attendanceSearch: document.querySelector("#attendanceSearch"),
  clearSearchBtn: document.querySelector("#clearSearchBtn"),
  attendanceSummaryText: document.querySelector("#attendanceSummaryText"),
  statTotalCount: document.querySelector("#statTotalCount"),
  statMasukCount: document.querySelector("#statMasukCount"),
  statSakitCount: document.querySelector("#statSakitCount"),
  statIzinCount: document.querySelector("#statIzinCount"),
  statAlphaCount: document.querySelector("#statAlphaCount"),
  statSakitPill: document.querySelector("#statSakitPill"),
  statIzinPill: document.querySelector("#statIzinPill"),
  statAlphaPill: document.querySelector("#statAlphaPill"),
  notesInput: document.querySelector("#notesInput"),
  notesStatusIndicator: document.querySelector("#notesStatusIndicator"),
  dailyInfoPreview: document.querySelector("#dailyInfoPreview"),
  copyBtn: document.querySelector("#copyBtn"),
  shareBtn: document.querySelector("#shareBtn"),
  whatsappBtn: document.querySelector("#whatsappBtn"),
  generateBtn: document.querySelector("#generateBtn"),
  addTaskBtn: document.querySelector("#addTaskBtn"),
  taskModal: document.querySelector("#taskModal"),
  taskForm: document.querySelector("#taskForm"),
  taskModalTitle: document.querySelector("#taskModalTitle"),
  taskSubject: document.querySelector("#taskSubject"),
  taskDescription: document.querySelector("#taskDescription"),
  taskDeadline: document.querySelector("#taskDeadline"),
  scheduleModal: document.querySelector("#scheduleModal"),
  scheduleModalBody: document.querySelector("#scheduleModalBody"),
  scheduleDayTabs: document.querySelector("#scheduleDayTabs"),
  piketModal: document.querySelector("#piketModal"),
  piketModalBody: document.querySelector("#piketModalBody"),
  piketDayTabs: document.querySelector("#piketDayTabs"),
  resetAttendanceBtn: document.querySelector("#resetAttendanceBtn"),
  openScheduleModalBtn: document.querySelector("#openScheduleModalBtn"),
  openPiketModalBtn: document.querySelector("#openPiketModalBtn"),
  copyAttendanceOnlyBtn: document.querySelector("#copyAttendanceOnlyBtn"),
  previewTabs: document.querySelector("#previewTabs"),
  // Auth elements
  loginBtn: document.querySelector("#loginBtn"),
  logoutBtn: document.querySelector("#logoutBtn"),
  adminBadge: document.querySelector("#adminBadge"),
  adminBadgeText: document.querySelector("#adminBadgeText"),
  loginModal: document.querySelector("#loginModal"),
  loginForm: document.querySelector("#loginForm"),
  loginUsername: document.querySelector("#loginUsername"),
  loginPassword: document.querySelector("#loginPassword"),
  loginError: document.querySelector("#loginError"),
  loginSubmitBtn: document.querySelector("#loginSubmitBtn"),
};

function loadState() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  const legacyStudentNames = [
    "Adinda Putri", "Alif Rahman", "Anisa Sari", "Ardiansyah", "Alya Nabila",
    "Bima Pratama", "Citra Dewi", "Daffa Rizki", "Della Amanda", "Dimas Akbar",
    "Eka Putra", "Fajar Ramadhan", "Farah Aulia", "Gilang Permana", "Hanif Maulana",
    "Hana Safitri", "Ilham Kurniawan", "Inaya Zahra", "Jihan Azzahra", "Khalid Hidayat",
    "Lina Maharani", "M. Ridho", "Maya Salsabila", "Nadia Lestari", "Naufal Arif",
    "Omar Fadli", "Pandu Wibowo", "Qori Azzahra", "Raka Pratama", "Rizky Ananda",
    "Salsa Fitri", "Tegar Putra", "Zahra Kamilah"
  ];

  if (saved && saved.attendance) {
    const hasLegacyNames = Object.keys(saved.attendance).some((name) => legacyStudentNames.includes(name));
    if (hasLegacyNames) {
      localStorage.removeItem(STORAGE_KEY);
      return structuredClone(defaultState);
    }
  }

  if (!saved) {
    return structuredClone(defaultState);
  }

  const filteredSchedule = Object.fromEntries(
    Object.entries(saved.schedule || {}).filter(([day]) => WEEKDAYS.includes(day))
  );
  const filteredPiket = Object.fromEntries(
    Object.entries(saved.piket || {}).filter(([day]) => WEEKDAYS.includes(day))
  );

  const merged = structuredClone(defaultState);
  merged.schedule = normalizeWeekdays({ ...merged.schedule, ...filteredSchedule });
  merged.piket = normalizeWeekdays({ ...merged.piket, ...filteredPiket });
  merged.tasks = Array.isArray(saved.tasks) ? saved.tasks : merged.tasks;
  const builtInTasks = new Set([
    "B. Indo|Membuat teks pidato",
    "PPKN|Mengerjakan halaman 42–45",
    "PJOK|Membawa perlengkapan olahraga"
  ]);
  if (merged.tasks.length && merged.tasks.every((task) => builtInTasks.has(`${task.subject}|${task.description}`))) {
    merged.tasks = [];
  }
  merged.notes = typeof saved.notes === "string" ? saved.notes : merged.notes;
  merged.attendance = { ...merged.attendance, ...(saved.attendance || {}) };
  return merged;
}

function saveState() {
  state.schedule = normalizeWeekdays(state.schedule);
  state.piket = normalizeWeekdays(state.piket);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getDateKey(date = new Date()) {
  const weekday = date.getDay();
  const map = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const key = map[weekday];
  return ["Saturday", "Sunday"].includes(key) ? "Monday" : key;
}

function getTodayKey(date = new Date()) {
  return getDateKey(date);
}

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  if (d.getDay() === 6) {
    d.setDate(d.getDate() + 2);
  } else if (d.getDay() === 0) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function capitalizeFirst(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Mode preview: 'tomorrow' | 'today' | 'attendance'
let currentPreviewMode = new Date().getHours() >= 15 ? "tomorrow" : "today";

function renderDateInfo() {
  const todayKey = getTodayKey();
  elements.todayDate.textContent = formatDate();

  const subjects = state.schedule[todayKey] || [];
  const piket = state.piket[todayKey] || [];

  elements.todaySubjectsQuick.innerHTML = subjects.length
    ? subjects.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : `<li>Belum ada jadwal hari ini.</li>`;

  elements.todayPiketQuick.innerHTML = piket.length
    ? piket.slice(0, 5).map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : `<li>Belum ada piket hari ini.</li>`;

  elements.subjectsList.innerHTML = subjects.length
    ? subjects.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : `<li>Belum ada jadwal hari ini.</li>`;

  elements.piketList.innerHTML = piket.length
    ? piket.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : `<li>Belum ada piket hari ini.</li>`;
}

function renderTasks() {
  if (!state.tasks.length) {
    elements.tasksList.innerHTML = `
      <div class="empty-state">
        <p>Belum ada tugas atau PR aktif.</p>
        <button class="inline-btn admin-only ${isSekretarisLoggedIn ? '' : 'hidden'}" type="button" data-action="new-task">+ Tambah Tugas</button>
      </div>
    `;
    return;
  }

  elements.tasksList.innerHTML = state.tasks
    .map((task) => {
      const urgency = getDeadlineUrgency(task.deadline);
      return `
        <article class="task-item">
          <div class="task-main">
            <strong>${escapeHtml(task.subject)}</strong> — ${escapeHtml(task.description)}
          </div>
          <div class="task-meta-row">
            <span class="deadline-badge ${urgency.urgentClass}">
              <svg class="icon-svg mini" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              ${escapeHtml(urgency.label)}
            </span>
            <div class="task-actions admin-only ${isSekretarisLoggedIn ? '' : 'hidden'}">
              <button class="inline-btn" type="button" data-action="edit-task" data-id="${task.id}" title="Edit tugas">Edit</button>
              <button class="inline-btn" type="button" data-action="delete-task" data-id="${task.id}" title="Hapus tugas">Hapus</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAttendance() {
  const query = elements.attendanceSearch.value.trim().toLowerCase();
  elements.clearSearchBtn.classList.toggle("hidden", query.length === 0);

  const filtered = STUDENTS.filter((student) => student.toLowerCase().includes(query));

  // Count attendance stats
  const total = STUDENTS.length;
  let masuk = 0;
  let sakit = 0;
  let izin = 0;
  let alpha = 0;

  STUDENTS.forEach((student) => {
    const status = state.attendance[student] || "Masuk";
    if (status === "Masuk") masuk++;
    else if (status === "Sakit") sakit++;
    else if (status === "Izin") izin++;
    else if (status === "Alpha") alpha++;
  });

  elements.statTotalCount.textContent = total;
  elements.statMasukCount.textContent = masuk;
  elements.statSakitCount.textContent = sakit;
  elements.statIzinCount.textContent = izin;
  elements.statAlphaCount.textContent = alpha;

  elements.statSakitPill.style.display = sakit > 0 ? "inline-flex" : "none";
  elements.statIzinPill.style.display = izin > 0 ? "inline-flex" : "none";
  elements.statAlphaPill.style.display = alpha > 0 ? "inline-flex" : "none";

  const notPresentCount = sakit + izin + alpha;
  elements.attendanceSummaryText.textContent =
    notPresentCount === 0
      ? `Semua Hadir (${total} Siswa)`
      : `${masuk} Hadir, ${notPresentCount} Tidak Hadir`;

  if (!filtered.length) {
    elements.attendanceList.innerHTML = '<div class="empty-state">Tidak ada nama siswa yang cocok.</div>';
    return;
  }

  elements.attendanceList.innerHTML = filtered
    .map((student) => {
      const status = state.attendance[student] || "Masuk";
      const initials = getInitials(student);
      return `
        <label class="student-row">
          <div class="student-avatar-name">
            <span class="student-avatar" aria-hidden="true">${initials}</span>
            <span class="student-name">${escapeHtml(student)}</span>
          </div>
          <div class="status-select-wrap">
            <select data-student="${student}" data-status="${status}" aria-label="Status kehadiran ${student}">
              ${STATUS_OPTIONS.map(
                (opt) => `<option value="${opt}" ${status === opt ? "selected" : ""}>${opt}</option>`
              ).join("")}
            </select>
          </div>
        </label>
      `;
    })
    .join("");
}

function renderNotes() {
  elements.notesInput.value = state.notes;
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatSection(label, lines) {
  const linesText = lines.map((line) => `│ • ${line}`).join("\n");
  return `╭─ ${label}\n${linesText}\n╰──────────────`;
}

function generateAttendanceReportText() {
  const todayDate = formatDate();
  const total = STUDENTS.length;
  const masuk = STUDENTS.filter((s) => (state.attendance[s] || "Masuk") === "Masuk");
  const sakit = STUDENTS.filter((s) => state.attendance[s] === "Sakit");
  const izin = STUDENTS.filter((s) => state.attendance[s] === "Izin");
  const alpha = STUDENTS.filter((s) => state.attendance[s] === "Alpha");
  const notPresent = STUDENTS.filter((s) => (state.attendance[s] || "Masuk") !== "Masuk");

  let text = `୨୧ ─── 𝐋𝐀𝐏𝐎𝐑𝐀𝐍 𝐀𝐁𝐒𝐄𝐍𝐒𝐈 ─── ୨୧\n\n`;
  text += `🗓️ ${todayDate}\n`;
  text += `🏫 Kelas: 9 SCP 2\n\n`;
  text += `📊 REKAP KEHADIRAN:\n`;
  text += `• Total Siswa : ${total}\n`;
  text += `• Masuk        : ${masuk.length}\n`;
  text += `• Sakit        : ${sakit.length}\n`;
  text += `• Izin         : ${izin.length}\n`;
  text += `• Alpha        : ${alpha.length}\n\n`;

  if (notPresent.length) {
    text += `📝 KETERANGAN TIDAK MASUK:\n`;
    notPresent.forEach((student, index) => {
      text += `${index + 1}. ${student} (${state.attendance[student]})\n`;
    });
  } else {
    text += `📝 KETERANGAN TIDAK MASUK:\n• Nihil (Semua hadir ✨)\n`;
  }

  text += `\n୨୧ ───────────────── ୨୧`;
  return text;
}

function generateDailyInfo(mode = currentPreviewMode) {
  if (mode === "attendance") {
    return generateAttendanceReportText();
  }

  const isTomorrow = mode === "tomorrow";
  const targetDate = isTomorrow ? getTomorrowDate() : new Date();
  const targetKey = getDateKey(targetDate);
  const targetDateStr = formatDate(targetDate);

  const subjects = state.schedule[targetKey] || [];
  const piket = state.piket[targetKey] || [];
  const tasks = state.tasks;
  const note = state.notes.trim() || "Kalau ada yang kurang atau salah bisa dikoreksi dan ditambahin yaa!";

  let message = `୨୧ ──── 𝐃𝐀𝐈𝐋𝐘 𝐂𝐋𝐀𝐒𝐒 𝐈𝐍𝐅𝐎 ──── ୨୧\n\n🗓️ ${targetDateStr}\n\n`;

  const mapelTitle = isTomorrow ? "📚 MAPEL BESOK" : "📚 MAPEL HARI INI";
  message += `${formatSection(mapelTitle, subjects.length ? subjects : ["Belum ada jadwal."])}\n\n`;

  if (tasks.length) {
    const taskLines = tasks.flatMap((task) => [
      `• ${task.subject} — ${task.description}`,
      `  ↳ Deadline: ${formatDeadline(task.deadline)}`,
      ""
    ]);
    taskLines.pop();
    message += `╭─ 📝 TUGAS\n${taskLines.map((line) => `${line.startsWith("  ↳") ? "│" : "│ "}${line}`).join("\n")}\n╰──────────────\n\n`;
  } else {
    message += `╭─ 📝 TUGAS\n│ • Tidak ada tugas.\n╰──────────────\n\n`;
  }

  const piketTitle = isTomorrow ? "🧹 PIKET BESOK" : "🧹 PIKET HARI INI";
  message += `${formatSection(piketTitle, piket.length ? piket : ["Belum ada piket."])}\n\n`;

  if (!isTomorrow) {
    const absent = STUDENTS.filter((student) => (state.attendance[student] || "Masuk") !== "Masuk");
    if (absent.length) {
      const absentText = absent.map((student) => `• ${student} (${state.attendance[student]})`);
      message += `╭─ 📋 ABSENSI\n│ Tidak masuk:\n${absentText.map((line) => `│ ${line}`).join("\n")}\n╰──────────────\n\n`;
    } else {
      message += `╭─ 📋 ABSENSI\n│ Tidak masuk:\n│ • Nihil\n╰──────────────\n\n`;
    }
  }

  const closing = isTomorrow ? "Semangat buat besok guys! 😸" : "Semangat guys! 😸";
  message += `🗒️ CATATAN\n╰┈➤ ${note}\n\n૮ ˶ᵔ ᵕ ᵔ˶ ა\n${closing}\nhttps://science2hub.vercel.app\n\n୨୧ ───────────────── ୨୧`;

  return message;
}

function renderPreview() {
  if (elements.previewTabs) {
    elements.previewTabs.querySelectorAll(".tab-btn").forEach((btn) => {
      const isActive = btn.dataset.mode === currentPreviewMode;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  const text = generateDailyInfo(currentPreviewMode);
  elements.dailyInfoPreview.innerHTML = `<pre>${escapeHtml(text)}</pre>`;

  const whatsappText = encodeURIComponent(text);
  elements.whatsappBtn.href = `https://wa.me/?text=${whatsappText}`;
}

// ============================================================
// DRAWERS (SLIDING PANELS)
// ============================================================
function openDrawer(drawerElement) {
  if (!drawerElement) return;
  drawerElement.classList.add("is-open");
  drawerElement.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeDrawer(drawerElement) {
  if (!drawerElement) return;
  drawerElement.classList.remove("is-open");
  drawerElement.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function openTaskModal(task = null) {
  editingTaskId = task ? task.id : null;
  elements.taskModalTitle.textContent = task ? "Edit Tugas" : "Tambah Tugas";
  elements.taskSubject.value = task ? task.subject : "";
  elements.taskDescription.value = task ? task.description : "";
  elements.taskDeadline.value = task ? deadlineToInput(task.deadline) : "";
  openDrawer(elements.taskModal);
}

function closeTaskModal() {
  editingTaskId = null;
  elements.taskForm.reset();
  closeDrawer(elements.taskModal);
}

function renderScheduleDrawerBody() {
  const daysToShow = currentScheduleTab === "all" ? WEEKDAYS : [currentScheduleTab];
  elements.scheduleModalBody.innerHTML = daysToShow
    .map(
      (day) => `
        <div class="setting-row" data-day-section="${day}">
          <div class="setting-row-header">
            <span class="setting-day-title">Jadwal ${DAY_LABELS_ID[day] || day}</span>
          </div>
          <textarea data-day="${day}" rows="4" placeholder="Contoh:\nB.ING\nIPA\nBTQ Kelas 9">${escapeHtml(
            (state.schedule[day] || []).join("\n")
          )}</textarea>
        </div>
      `
    )
    .join("");
}

function openScheduleModal() {
  currentScheduleTab = "all";
  if (elements.scheduleDayTabs) {
    elements.scheduleDayTabs.querySelectorAll(".drawer-day-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.day === "all");
    });
  }
  renderScheduleDrawerBody();
  openDrawer(elements.scheduleModal);
}

function closeScheduleModal() {
  closeDrawer(elements.scheduleModal);
}

function renderPiketDrawerBody() {
  const daysToShow = currentPiketTab === "all" ? WEEKDAYS : [currentPiketTab];
  elements.piketModalBody.innerHTML = daysToShow
    .map(
      (day) => `
        <div class="setting-row" data-day-section="${day}">
          <div class="setting-row-header">
            <span class="setting-day-title">Piket ${DAY_LABELS_ID[day] || day}</span>
          </div>
          <textarea data-day="${day}" rows="4" placeholder="Contoh:\nNAMA SISWA 1\nNAMA SISWA 2">${escapeHtml(
            (state.piket[day] || []).join("\n")
          )}</textarea>
        </div>
      `
    )
    .join("");
}

function openPiketModal() {
  currentPiketTab = "all";
  if (elements.piketDayTabs) {
    elements.piketDayTabs.querySelectorAll(".drawer-day-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.day === "all");
    });
  }
  renderPiketDrawerBody();
  openDrawer(elements.piketModal);
}

function closePiketModal() {
  closeDrawer(elements.piketModal);
}

// ============================================================
// FORM ACTIONS & SAVING
// ============================================================
async function handleTaskSubmit(event) {
  event.preventDefault();
  const subject = elements.taskSubject.value.trim();
  const description = elements.taskDescription.value.trim();
  const deadline = elements.taskDeadline.value;

  if (!subject || !description || !deadline) return;

  try {
    if (editingTaskId) {
      await updateTask(editingTaskId, { subject, description, deadline });
      state.tasks = state.tasks.map((task) =>
        task.id === editingTaskId ? { ...task, subject, description, deadline } : task
      );
      showToast("Tugas berhasil diperbarui!");
    } else {
      const newTask = await insertTask({ subject, description, deadline });
      state.tasks.push(newTask);
      showToast("Tugas baru berhasil ditambahkan!");
    }
  } catch (err) {
    console.error("Gagal simpan tugas ke Supabase:", err);
    if (editingTaskId) {
      state.tasks = state.tasks.map((task) =>
        task.id === editingTaskId ? { ...task, subject, description, deadline } : task
      );
    } else {
      state.tasks.push({ id: crypto.randomUUID(), subject, description, deadline });
    }
    showToast("Tugas disimpan di perangkat lokal.");
  }

  saveState();
  renderAll();
  closeTaskModal();
}

async function saveScheduleSettings() {
  const textareas = elements.scheduleModalBody.querySelectorAll("textarea");
  textareas.forEach((textarea) => {
    const day = textarea.dataset.day;
    if (!WEEKDAYS.includes(day)) return;
    const value = textarea.value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
    state.schedule[day] = value.length ? value : ["Belum ada jadwal"];
  });

  state.schedule = normalizeWeekdays(state.schedule);

  try {
    await Promise.all(WEEKDAYS.map((day) => saveSchedule(day, state.schedule[day])));
    showToast("Jadwal pelajaran berhasil disimpan!");
  } catch (err) {
    console.error("Gagal simpan jadwal ke Supabase:", err);
    showToast("Jadwal tersimpan di penyimpanan lokal.");
  }

  saveState();
  renderAll();
  closeScheduleModal();
}

async function savePiketSettings() {
  const textareas = elements.piketModalBody.querySelectorAll("textarea");
  textareas.forEach((textarea) => {
    const day = textarea.dataset.day;
    if (!WEEKDAYS.includes(day)) return;
    const value = textarea.value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
    state.piket[day] = value.length ? value : ["Belum ada piket"];
  });

  state.piket = normalizeWeekdays(state.piket);

  try {
    await Promise.all(WEEKDAYS.map((day) => savePiket(day, state.piket[day])));
    showToast("Jadwal piket berhasil disimpan!");
  } catch (err) {
    console.error("Gagal simpan piket ke Supabase:", err);
    showToast("Piket tersimpan di penyimpanan lokal.");
  }

  saveState();
  renderAll();
  closePiketModal();
}

async function resetAttendance() {
  const confirmReset = confirm("Apakah Anda yakin ingin mereset seluruh status absensi menjadi 'Masuk'?");
  if (!confirmReset) return;

  state.attendance = Object.fromEntries(STUDENTS.map((student) => [student, "Masuk"]));

  try {
    await upsertAllAttendance(todayDateStr, state.attendance);
    showToast("Absensi berhasil direset ke 'Masuk'!");
  } catch (err) {
    console.error("Gagal reset absensi ke Supabase:", err);
    showToast("Absensi direset secara lokal.");
  }

  saveState();
  renderAll();
}

function copyDailyInfo() {
  const text = generateDailyInfo();
  navigator.clipboard.writeText(text).then(() => {
    showToast("Daily Class Info berhasil disalin ke clipboard!");
  });
}

async function shareDailyInfo() {
  const text = generateDailyInfo();
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Daily Class Info 9 SCP 2",
        text
      });
      return;
    } catch (error) {
      console.warn("Share cancelled by user.", error);
    }
  }

  await navigator.clipboard.writeText(text);
  showToast("Teks berhasil disalin untuk dibagikan!");
}

function renderAll() {
  renderDateInfo();
  renderTasks();
  renderAttendance();
  renderNotes();
  renderPreview();
}

// ============================================================
// EVENT LISTENERS
// ============================================================
document.addEventListener("click", async (event) => {
  const target = event.target.closest("button, a");
  if (!target) return;

  const action = target.dataset.action;

  if (action === "new-task") {
    openTaskModal();
    return;
  }

  if (action === "edit-task") {
    const task = state.tasks.find((item) => item.id === target.dataset.id);
    if (task) openTaskModal(task);
    return;
  }

  if (action === "delete-task") {
    const id = target.dataset.id;
    const confirmDelete = confirm("Hapus tugas ini?");
    if (!confirmDelete) return;

    try {
      await deleteTask(id);
      showToast("Tugas berhasil dihapus.");
    } catch (err) {
      console.error("Gagal hapus tugas dari Supabase:", err);
    }
    state.tasks = state.tasks.filter((task) => task.id !== id);
    saveState();
    renderAll();
    return;
  }

  if (target.dataset.closeModal) {
    const modalId = target.dataset.closeModal;
    if (modalId === "taskModal") closeTaskModal();
    if (modalId === "scheduleModal") closeScheduleModal();
    if (modalId === "piketModal") closePiketModal();
    if (modalId === "loginModal") closeLoginModal();
  }
});

// Sliding day switcher in Schedule Drawer
if (elements.scheduleDayTabs) {
  elements.scheduleDayTabs.addEventListener("click", (event) => {
    const btn = event.target.closest(".drawer-day-tab");
    if (!btn || !btn.dataset.day) return;
    currentScheduleTab = btn.dataset.day;
    elements.scheduleDayTabs.querySelectorAll(".drawer-day-tab").forEach((b) => {
      b.classList.toggle("active", b === btn);
    });
    renderScheduleDrawerBody();
  });
}

// Sliding day switcher in Piket Drawer
if (elements.piketDayTabs) {
  elements.piketDayTabs.addEventListener("click", (event) => {
    const btn = event.target.closest(".drawer-day-tab");
    if (!btn || !btn.dataset.day) return;
    currentPiketTab = btn.dataset.day;
    elements.piketDayTabs.querySelectorAll(".drawer-day-tab").forEach((b) => {
      b.classList.toggle("active", b === btn);
    });
    renderPiketDrawerBody();
  });
}

document.addEventListener("change", async (event) => {
  const student = event.target.dataset.student;
  if (!student) return;

  const newStatus = event.target.value;
  state.attendance[student] = newStatus;
  event.target.dataset.status = newStatus;

  try {
    await upsertAttendance(todayDateStr, student, newStatus);
  } catch (err) {
    console.error("Gagal simpan absensi ke Supabase:", err);
  }

  saveState();
  renderAttendance();
  renderPreview();
});

let notesDebounceTimer = null;
document.addEventListener("input", (event) => {
  if (event.target === elements.notesInput) {
    state.notes = elements.notesInput.value;
    saveState();
    renderPreview();

    elements.notesStatusIndicator.textContent = "Menyimpan...";
    clearTimeout(notesDebounceTimer);
    notesDebounceTimer = setTimeout(async () => {
      try {
        await saveNotes(state.notes, notesId);
        if (!notesId) {
          const row = await fetchNotes();
          if (row) notesId = row.id;
        }
        elements.notesStatusIndicator.textContent = "Tersimpan";
      } catch (err) {
        console.error("Gagal simpan catatan ke Supabase:", err);
        elements.notesStatusIndicator.textContent = "Lokal";
      }
    }, 1200);
  }

  if (event.target === elements.attendanceSearch) {
    renderAttendance();
  }
});

if (elements.clearSearchBtn) {
  elements.clearSearchBtn.addEventListener("click", () => {
    elements.attendanceSearch.value = "";
    renderAttendance();
    elements.attendanceSearch.focus();
  });
}

elements.generateBtn.addEventListener("click", () => {
  renderPreview();
  elements.dailyInfoPreview.scrollIntoView({ behavior: "smooth", block: "nearest" });
  showToast("Pratinjau Daily Info berhasil diperbarui!");
});

if (elements.previewTabs) {
  elements.previewTabs.addEventListener("click", (event) => {
    const btn = event.target.closest(".tab-btn");
    if (!btn || !btn.dataset.mode) return;
    currentPreviewMode = btn.dataset.mode;
    renderPreview();
  });
}

if (elements.copyAttendanceOnlyBtn) {
  elements.copyAttendanceOnlyBtn.addEventListener("click", async () => {
    const text = generateAttendanceReportText();
    await navigator.clipboard.writeText(text);
    showToast("Rekap absensi berhasil disalin ke clipboard!");
  });
}

elements.addTaskBtn.addEventListener("click", () => openTaskModal());
elements.copyBtn.addEventListener("click", copyDailyInfo);
elements.shareBtn.addEventListener("click", shareDailyInfo);
elements.taskForm.addEventListener("submit", handleTaskSubmit);
elements.openScheduleModalBtn.addEventListener("click", openScheduleModal);
elements.openPiketModalBtn.addEventListener("click", openPiketModal);
document.querySelector("#saveScheduleBtn").addEventListener("click", saveScheduleSettings);
document.querySelector("#savePiketBtn").addEventListener("click", savePiketSettings);
elements.resetAttendanceBtn.addEventListener("click", resetAttendance);

window.addEventListener("click", (event) => {
  if (event.target === elements.taskModal) closeTaskModal();
  if (event.target === elements.scheduleModal) closeScheduleModal();
  if (event.target === elements.piketModal) closePiketModal();
  if (event.target === elements.loginModal) closeLoginModal();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeTaskModal();
    closeScheduleModal();
    closePiketModal();
    closeLoginModal();
  }
});

// ============================================================
// AUTH UI
// ============================================================
function openLoginModal() {
  openDrawer(elements.loginModal);
  elements.loginError.classList.add("hidden");
  elements.loginError.textContent = "";
  elements.loginForm.reset();
}

function closeLoginModal() {
  closeDrawer(elements.loginModal);
}

function updateAuthUI(session) {
  isSekretarisLoggedIn = !!session;

  elements.loginBtn.classList.toggle("hidden", isSekretarisLoggedIn);
  elements.logoutBtn.classList.toggle("hidden", !isSekretarisLoggedIn);
  elements.adminBadge.classList.toggle("hidden", !isSekretarisLoggedIn);

  if (isSekretarisLoggedIn) {
    const displayName = session.user.email ? session.user.email.split("@")[0] : "Sekretaris";
    elements.adminBadgeText.textContent = displayName;
  }

  // Tampilkan tombol jika login sebagai sekretaris, sembunyikan jika bukan
  const editBtns = document.querySelectorAll(
    "#openScheduleModalBtn, #openPiketModalBtn, #addTaskBtn, #resetAttendanceBtn, .admin-only"
  );
  editBtns.forEach((btn) => {
    btn.classList.toggle("hidden", !isSekretarisLoggedIn);
  });

  renderTasks();
}

elements.loginBtn.addEventListener("click", openLoginModal);

elements.logoutBtn.addEventListener("click", async () => {
  try {
    await signOut();
    showToast("Anda telah keluar dari Mode Sekretaris.");
  } catch (err) {
    console.error("Gagal logout:", err);
  }
});

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const rawInput = elements.loginUsername.value.trim().toLowerCase();
  const password = elements.loginPassword.value;
  const submitBtn = elements.loginSubmitBtn;

  const email = rawInput.includes("@") ? rawInput : `${rawInput}@sekretaris.local`;

  submitBtn.disabled = true;
  submitBtn.textContent = "Memverifikasi...";
  elements.loginError.classList.add("hidden");

  try {
    await signIn(email, password);
    closeLoginModal();
    showToast("Berhasil masuk sebagai Sekretaris!");
  } catch (err) {
    console.error("Login gagal:", err);
    let msg = "Username atau password salah.";
    if (err && err.message) {
      if (err.message.includes("Invalid login credentials")) {
        msg = `Password salah atau akun "${rawInput}" (${email}) belum dibuat di Supabase.`;
      } else if (err.message.includes("Email not confirmed")) {
        msg = "Email belum dikonfirmasi di Supabase (centang Auto Confirm).";
      } else {
        msg = err.message;
      }
    }
    elements.loginError.textContent = msg;
    elements.loginError.classList.remove("hidden");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Masuk";
  }
});

onAuthChange((session) => {
  updateAuthUI(session);
});

// ============================================================
// LOAD DATA DARI SUPABASE
// ============================================================
async function loadFromSupabase() {
  try {
    const schedule = await fetchSchedule();
    if (Object.keys(schedule).length) {
      state.schedule = normalizeWeekdays({ ...state.schedule, ...schedule });
    }
  } catch (err) {
    console.warn("Gagal load jadwal dari Supabase:", err);
  }

  try {
    const piket = await fetchPiket();
    if (Object.keys(piket).length) {
      state.piket = normalizeWeekdays({ ...state.piket, ...piket });
    }
  } catch (err) {
    console.warn("Gagal load piket dari Supabase:", err);
  }

  try {
    const tasks = await fetchTasks();
    if (Array.isArray(tasks)) {
      state.tasks = tasks;
    }
  } catch (err) {
    console.warn("Gagal load tugas dari Supabase:", err);
  }

  try {
    const notesRow = await fetchNotes();
    if (notesRow) {
      notesId = notesRow.id;
      state.notes = notesRow.content;
    }
  } catch (err) {
    console.warn("Gagal load catatan dari Supabase:", err);
  }

  try {
    const attendance = await fetchAttendance(todayDateStr);
    if (Object.keys(attendance).length) {
      state.attendance = { ...state.attendance, ...attendance };
    }
  } catch (err) {
    console.warn("Gagal load absensi dari Supabase:", err);
  }

  saveState();
  renderAll();
}

// ============================================================
// INIT
// ============================================================
getSession().then((session) => {
  updateAuthUI(session);
});

initGridPulse();
renderAll();
loadFromSupabase();
