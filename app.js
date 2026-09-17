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

function initGridPulse() {
  const canvas = document.querySelector("#gridPulseCanvas");
  const context = canvas?.getContext("2d");
  if (!canvas || !context || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const cellSize = 26;
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
    context.strokeStyle = "rgba(31, 35, 40, 0.1)";
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
      const alpha = Math.min(0.58, Math.min(1, elapsed / 180) * Math.min(1, remaining / 700) * 0.58);
      context.fillStyle = `rgba(55, 60, 64, ${alpha})`;
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
    Monday: ["B.ING", "PJOK", "IPA", "B.ING", "IPA", "B.ING", "B.ARAB", "B.INDO"],
    Tuesday: ["PJOK", "AL ISLAM", "IPS", "MATEMATIKA", "B.INDO", "KMD", "PEND. PANCASILA"],
    Wednesday: ["PEND. PANCASILA", "INFORMATIKA", "B.INDO", "IPA", "PEND. PANCASILA", "B.INDO", "SENI RUPA"],
    Thursday: ["AL ISLAM", "IPS", "MATEMATIKA", "KMD", "B.INDO", "PEND. PANCASILA"],
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

const elements = {
  todayDate: document.querySelector("#todayDate"),
  todaySubjectsQuick: document.querySelector("#todaySubjectsQuick"),
  todayPiketQuick: document.querySelector("#todayPiketQuick"),
  subjectsList: document.querySelector("#subjectsList"),
  tasksList: document.querySelector("#tasksList"),
  piketList: document.querySelector("#piketList"),
  attendanceList: document.querySelector("#attendanceList"),
  attendanceSearch: document.querySelector("#attendanceSearch"),
  notesInput: document.querySelector("#notesInput"),
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
  piketModal: document.querySelector("#piketModal"),
  piketModalBody: document.querySelector("#piketModalBody"),
  resetAttendanceBtn: document.querySelector("#resetAttendanceBtn"),
  openScheduleModalBtn: document.querySelector("#openScheduleModalBtn"),
  openPiketModalBtn: document.querySelector("#openPiketModalBtn"),
  // Auth elements
  loginBtn: document.querySelector("#loginBtn"),
  logoutBtn: document.querySelector("#logoutBtn"),
  adminBadge: document.querySelector("#adminBadge"),
  loginModal: document.querySelector("#loginModal"),
  loginForm: document.querySelector("#loginForm"),
  loginEmail: document.querySelector("#loginEmail"),
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
    "Adinda Putri",
    "Alif Rahman",
    "Anisa Sari",
    "Ardiansyah",
    "Alya Nabila",
    "Bima Pratama",
    "Citra Dewi",
    "Daffa Rizki",
    "Della Amanda",
    "Dimas Akbar",
    "Eka Putra",
    "Fajar Ramadhan",
    "Farah Aulia",
    "Gilang Permana",
    "Hanif Maulana",
    "Hana Safitri",
    "Ilham Kurniawan",
    "Inaya Zahra",
    "Jihan Azzahra",
    "Khalid Hidayat",
    "Lina Maharani",
    "M. Ridho",
    "Maya Salsabila",
    "Nadia Lestari",
    "Naufal Arif",
    "Omar Fadli",
    "Pandu Wibowo",
    "Qori Azzahra",
    "Raka Pratama",
    "Rizky Ananda",
    "Salsa Fitri",
    "Tegar Putra",
    "Zahra Kamilah"
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

function getTodayKey(date = new Date()) {
  const weekday = date.getDay();
  const map = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const key = map[weekday];
  return ["Saturday", "Sunday"].includes(key) ? "Friday" : key;
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
        Belum ada tugas hari ini.<br />
        <button class="inline-btn" type="button" data-action="new-task">+ Tambah tugas</button>
      </div>
    `;
    return;
  }

  elements.tasksList.innerHTML = state.tasks
    .map(
      (task) => `
        <article class="task-item">
          <div class="task-main"><strong>${escapeHtml(task.subject)}</strong> — ${escapeHtml(task.description)}</div>
          <div class="task-meta">Deadline: ${escapeHtml(formatDeadline(task.deadline))}</div>
          <div class="task-actions">
            <button class="inline-btn" type="button" data-action="edit-task" data-id="${task.id}">Edit</button>
            <button class="inline-btn" type="button" data-action="delete-task" data-id="${task.id}">Hapus</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderAttendance() {
  const query = elements.attendanceSearch.value.trim().toLowerCase();
  const filtered = STUDENTS.filter((student) => student.toLowerCase().includes(query));

  if (!filtered.length) {
    elements.attendanceList.innerHTML = '<div class="empty-state">Tidak ada siswa yang cocok.</div>';
    return;
  }

  elements.attendanceList.innerHTML = filtered
    .map(
      (student) => `
        <label class="student-row">
          <span class="student-name">${student}</span>
          <select data-student="${student}" aria-label="Status ${student}">
            ${STATUS_OPTIONS.map(
              (status) =>
                `<option value="${status}" ${state.attendance[student] === status ? "selected" : ""}>${status}</option>`
            ).join("")}
          </select>
        </label>
      `
    )
    .join("");
}

function renderNotes() {
  elements.notesInput.value = state.notes;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateDailyInfo() {
  const todayKey = getTodayKey();
  const todayDate = formatDate();
  const subjects = state.schedule[todayKey] || [];
  const piket = state.piket[todayKey] || [];
  const tasks = state.tasks;
  const absent = STUDENTS.filter((student) => state.attendance[student] !== "Masuk");
  const note = state.notes.trim() || "Tidak ada catatan hari ini.";

  const formatSection = (label, lines) => {
    const linesText = lines.map((line) => `│ • ${line}`).join("\n");
    return `╭─ ${label}\n${linesText}\n╰──────────────`;
  };

  let message = `୨୧ ──── 𝐃𝐀𝐈𝐋𝐘 𝐂𝐋𝐀𝐒𝐒 𝐈𝐍𝐅𝐎 ──── ୨୧\n\n🗓️ ${todayDate}\n\n`;

  message += `${formatSection("📚 MAPEL HARI INI", subjects || ["Belum ada jadwal hari ini."])}\n\n`;

  if (tasks.length) {
    const taskLines = tasks.flatMap((task) => [
      `• ${task.subject} — ${task.description}`,
      `  ↳ Deadline: ${formatDeadline(task.deadline)}`,
      ""
    ]);
    taskLines.pop();
    message += `╭─ 📝 TUGAS\n${taskLines.map((line) => `${line.startsWith("  ↳") ? "│" : "│ "}${line}`).join("\n")}\n╰──────────────\n\n`;
  } else {
    message += `╭─ 📝 TUGAS\n│ • Tidak ada tugas hari ini.\n╰──────────────\n\n`;
  }

  message += `${formatSection("🧹 PIKET HARI INI", piket.length ? piket : ["Belum ada piket hari ini."])}\n\n`;

  if (absent.length) {
    const absentText = absent.map((student) => `• ${student} (${state.attendance[student]})`);
    message += `╭─ 📋 ABSENSI\n│ Tidak masuk:\n${absentText.map((line) => `│ ${line}`).join("\n")}\n╰──────────────\n\n`;
  } else {
    message += `╭─ 📋 ABSENSI\n│ Tidak masuk:\n│ • Nihil\n╰──────────────\n\n`;
  }

  message += `🗒️ CATATAN\n╰┈➤ ${note}\n\n૮ ˶ᵔ ᵕ ᵔ˶ ა\nSemangat guys! 😸\n\n୨୧ ───────────────── ୨୧`;

  return message;
}

function renderPreview() {
  const text = generateDailyInfo();
  elements.dailyInfoPreview.innerHTML = `<pre>${escapeHtml(text)}</pre>`;

  const whatsappText = encodeURIComponent(text);
  elements.whatsappBtn.href = `https://wa.me/?text=${whatsappText}`;
}

function openTaskModal(task = null) {
  editingTaskId = task ? task.id : null;
  elements.taskModalTitle.textContent = task ? "Edit tugas" : "Tambah tugas";
  elements.taskSubject.value = task ? task.subject : "";
  elements.taskDescription.value = task ? task.description : "";
  elements.taskDeadline.value = task ? deadlineToInput(task.deadline) : "";
  elements.taskModal.classList.remove("hidden");
  elements.taskModal.setAttribute("aria-hidden", "false");
}

function closeTaskModal() {
  editingTaskId = null;
  elements.taskForm.reset();
  elements.taskModal.classList.add("hidden");
  elements.taskModal.setAttribute("aria-hidden", "true");
}

function openScheduleModal() {
  const entries = WEEKDAYS.map(
    (day) => `
      <label class="setting-row">
        <span>${capitalizeFirst(day)}</span>
          <textarea data-day="${day}" rows="4">${escapeHtml((state.schedule[day] || []).join("\n"))}</textarea>
      </label>
    `
  ).join("");

  elements.scheduleModalBody.innerHTML = entries;
  elements.scheduleModal.classList.remove("hidden");
  elements.scheduleModal.setAttribute("aria-hidden", "false");
}

function closeScheduleModal() {
  elements.scheduleModal.classList.add("hidden");
  elements.scheduleModal.setAttribute("aria-hidden", "true");
}

function openPiketModal() {
  const entries = WEEKDAYS.map(
    (day) => `
      <label class="setting-row">
        <span>${capitalizeFirst(day)}</span>
          <textarea data-day="${day}" rows="4">${escapeHtml((state.piket[day] || []).join("\n"))}</textarea>
      </label>
    `
  ).join("");

  elements.piketModalBody.innerHTML = entries;
  elements.piketModal.classList.remove("hidden");
  elements.piketModal.setAttribute("aria-hidden", "false");
}

function closePiketModal() {
  elements.piketModal.classList.add("hidden");
  elements.piketModal.setAttribute("aria-hidden", "true");
}

async function handleTaskSubmit(event) {
  event.preventDefault();
  const subject = elements.taskSubject.value.trim();
  const description = elements.taskDescription.value.trim();
  const deadline = elements.taskDeadline.value;

  if (!subject || !description || !deadline) return;

  try {
    if (editingTaskId) {
      // Update di Supabase
      await updateTask(editingTaskId, { subject, description, deadline });
      state.tasks = state.tasks.map((task) =>
        task.id === editingTaskId ? { ...task, subject, description, deadline } : task
      );
    } else {
      // Insert ke Supabase
      const newTask = await insertTask({ subject, description, deadline });
      state.tasks.push(newTask);
    }
  } catch (err) {
    console.error("Gagal simpan tugas ke Supabase:", err);
    // Fallback: simpan lokal saja
    if (editingTaskId) {
      state.tasks = state.tasks.map((task) =>
        task.id === editingTaskId ? { ...task, subject, description, deadline } : task
      );
    } else {
      state.tasks.push({ id: crypto.randomUUID(), subject, description, deadline });
    }
  }

  saveState();
  renderAll();
  closeTaskModal();
}

async function saveScheduleSettings() {
  const textareas = elements.scheduleModalBody.querySelectorAll("textarea");
  const nextSchedule = {};

  textareas.forEach((textarea) => {
    const day = textarea.dataset.day;
    if (!WEEKDAYS.includes(day)) return;
    const value = textarea.value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
    nextSchedule[day] = value.length ? value : ["Belum ada jadwal"];
  });

  state.schedule = normalizeWeekdays(nextSchedule);

  // Simpan ke Supabase
  try {
    await Promise.all(
      WEEKDAYS.map((day) => saveSchedule(day, state.schedule[day]))
    );
  } catch (err) {
    console.error("Gagal simpan jadwal ke Supabase:", err);
  }

  saveState();
  renderAll();
  closeScheduleModal();
}

async function savePiketSettings() {
  const textareas = elements.piketModalBody.querySelectorAll("textarea");
  const nextPiket = {};

  textareas.forEach((textarea) => {
    const day = textarea.dataset.day;
    if (!WEEKDAYS.includes(day)) return;
    const value = textarea.value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
    nextPiket[day] = value.length ? value : ["Belum ada piket"];
  });

  state.piket = normalizeWeekdays(nextPiket);

  // Simpan ke Supabase
  try {
    await Promise.all(
      WEEKDAYS.map((day) => savePiket(day, state.piket[day]))
    );
  } catch (err) {
    console.error("Gagal simpan piket ke Supabase:", err);
  }

  saveState();
  renderAll();
  closePiketModal();
}

async function resetAttendance() {
  state.attendance = Object.fromEntries(STUDENTS.map((student) => [student, "Masuk"]));

  // Sync ke Supabase
  try {
    await upsertAllAttendance(todayDateStr, state.attendance);
  } catch (err) {
    console.error("Gagal reset absensi ke Supabase:", err);
  }

  saveState();
  renderAll();
}

function copyDailyInfo() {
  const text = generateDailyInfo();
  navigator.clipboard.writeText(text).then(() => {
    elements.copyBtn.textContent = "Tersalin";
    setTimeout(() => {
      elements.copyBtn.textContent = "Salin";
    }, 1400);
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
  elements.shareBtn.textContent = "Tersalin";
  setTimeout(() => {
    elements.shareBtn.textContent = "Bagikan";
  }, 1400);
}

function renderAll() {
  renderDateInfo();
  renderTasks();
  renderAttendance();
  renderNotes();
  renderPreview();
}

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
    try {
      await deleteTask(id);
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

document.addEventListener("change", async (event) => {
  const student = event.target.dataset.student;
  if (!student) return;

  const newStatus = event.target.value;
  state.attendance[student] = newStatus;

  // Sync ke Supabase
  try {
    await upsertAttendance(todayDateStr, student, newStatus);
  } catch (err) {
    console.error("Gagal simpan absensi ke Supabase:", err);
  }

  saveState();
  renderPreview();
});

let notesDebounceTimer = null;
document.addEventListener("input", (event) => {
  if (event.target === elements.notesInput) {
    state.notes = elements.notesInput.value;
    saveState();
    renderPreview();

    // Debounce simpan ke Supabase (tiap 1.5 detik setelah berhenti ngetik)
    clearTimeout(notesDebounceTimer);
    notesDebounceTimer = setTimeout(async () => {
      try {
        await saveNotes(state.notes, notesId);
        if (!notesId) {
          // Ambil id yang baru dibuat
          const row = await fetchNotes();
          if (row) notesId = row.id;
        }
      } catch (err) {
        console.error("Gagal simpan catatan ke Supabase:", err);
      }
    }, 1500);
  }

  if (event.target === elements.attendanceSearch) {
    renderAttendance();
  }
});

elements.generateBtn.addEventListener("click", () => {
  renderPreview();
  elements.dailyInfoPreview.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

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

// ============================================================
// AUTH UI
// ============================================================

function openLoginModal() {
  elements.loginModal.classList.remove("hidden");
  elements.loginModal.setAttribute("aria-hidden", "false");
  elements.loginError.classList.add("hidden");
  elements.loginError.textContent = "";
  elements.loginForm.reset();
}

function closeLoginModal() {
  elements.loginModal.classList.add("hidden");
  elements.loginModal.setAttribute("aria-hidden", "true");
}

function updateAuthUI(session) {
  currentSession = session;
  const loggedIn = !!session;

  elements.loginBtn.classList.toggle("hidden", loggedIn);
  elements.logoutBtn.classList.toggle("hidden", !loggedIn);
  elements.authStatus.textContent = loggedIn
    ? `✅ ${session.user.email}`
    : "";

  // Sembunyikan tombol edit jika belum login
  const editBtns = document.querySelectorAll(
    "#openScheduleModalBtn, #openPiketModalBtn, #addTaskBtn, #resetAttendanceBtn"
  );
  editBtns.forEach((btn) => btn.classList.toggle("hidden", !loggedIn));
}

elements.loginBtn.addEventListener("click", openLoginModal);

elements.logoutBtn.addEventListener("click", async () => {
  try {
    await signOut();
  } catch (err) {
    console.error("Gagal logout:", err);
  }
});

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = elements.loginEmail.value.trim();
  const password = elements.loginPassword.value;
  const submitBtn = elements.loginSubmitBtn;

  submitBtn.disabled = true;
  submitBtn.textContent = "Masuk...";
  elements.loginError.classList.add("hidden");

  try {
    await signIn(email, password);
    closeLoginModal();
  } catch (err) {
    elements.loginError.textContent = "Email atau password salah. Coba lagi.";
    elements.loginError.classList.remove("hidden");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Masuk";
  }
});

// Listen perubahan auth state dari Supabase
onAuthChange((session) => {
  updateAuthUI(session);
});

// ============================================================
// LOAD DATA DARI SUPABASE SAAT INIT
// ============================================================

async function loadFromSupabase() {
  try {
    // Load schedule
    const schedule = await fetchSchedule();
    if (Object.keys(schedule).length) {
      state.schedule = normalizeWeekdays({ ...state.schedule, ...schedule });
    }
  } catch (err) {
    console.warn("Gagal load jadwal dari Supabase:", err);
  }

  try {
    // Load piket
    const piket = await fetchPiket();
    if (Object.keys(piket).length) {
      state.piket = normalizeWeekdays({ ...state.piket, ...piket });
    }
  } catch (err) {
    console.warn("Gagal load piket dari Supabase:", err);
  }

  try {
    // Load tasks
    const tasks = await fetchTasks();
    if (tasks.length) state.tasks = tasks;
  } catch (err) {
    console.warn("Gagal load tugas dari Supabase:", err);
  }

  try {
    // Load notes
    const notesRow = await fetchNotes();
    if (notesRow) {
      notesId = notesRow.id;
      state.notes = notesRow.content;
    }
  } catch (err) {
    console.warn("Gagal load catatan dari Supabase:", err);
  }

  try {
    // Load attendance hari ini
    const attendance = await fetchAttendance(todayDateStr);
    if (Object.keys(attendance).length) {
      state.attendance = { ...state.attendance, ...attendance };
    }
  } catch (err) {
    console.warn("Gagal load absensi dari Supabase:", err);
  }

  renderAll();
}

// ============================================================
// INIT
// ============================================================

// Cek session awal
getSession().then((session) => {
  updateAuthUI(session);
});

initGridPulse();
renderAll(); // Render dulu dari localStorage
loadFromSupabase(); // Lalu load dari Supabase (akan re-render)
