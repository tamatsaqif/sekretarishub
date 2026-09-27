// ============================================================
// KAS KELAS APPLICATION — 9 SCP 2
// ============================================================
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env.js";
import {
  fetchStudents,
  fetchKasWeeks,
  getCurrentWeek,
  fetchAllPayments,
  fetchPaymentsByStudent,
  insertPayment,
  deletePayment,
  toggleWeekPayment,
  getStudentPaymentStatus,
  isBendahara,
  getKasSummary,
  getTotalOutstanding,
} from "./kas.js";

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let students = [];
let weeks = [];
let allPayments = [];
let currentWeek = null;
let isBendaharaUser = false;
let currentDetailStudentId = null;
let currentFilter = "all"; // "all" | "paid" | "unpaid"

const BENDAHARA_STORAGE_KEY = "sekretaris9scp2-bendahara-session";

const elements = {
  loginBtn: document.querySelector("#loginBtn"),
  logoutBtn: document.querySelector("#logoutBtn"),
  adminBadge: document.querySelector("#adminBadge"),
  loginModal: document.querySelector("#loginModal"),
  loginForm: document.querySelector("#loginForm"),
  loginUsername: document.querySelector("#loginUsername"),
  loginPassword: document.querySelector("#loginPassword"),
  loginError: document.querySelector("#loginError"),
  loginSubmitBtn: document.querySelector("#loginSubmitBtn"),
  currentWeekBadge: document.querySelector("#currentWeekBadge"),
  balanceAmount: document.querySelector("#balanceAmount"),
  totalOutstanding: document.querySelector("#totalOutstanding"),
  totalStudents: document.querySelector("#totalStudents"),
  studentSearch: document.querySelector("#studentSearch"),
  clearSearchBtn: document.querySelector("#clearSearchBtn"),
  studentsContainer: document.querySelector("#studentsContainer"),
  addPaymentBtn: document.querySelector("#addPaymentBtn"),
  countAll: document.querySelector("#countAll"),
  countPaid: document.querySelector("#countPaid"),
  countUnpaid: document.querySelector("#countUnpaid"),
  filterButtons: document.querySelectorAll(".filter-pill-btn"),
  studentDetailDrawer: document.querySelector("#studentDetailDrawer"),
  studentDetailTitle: document.querySelector("#studentDetailTitle"),
  detailCurrentWeek: document.querySelector("#detailCurrentWeek"),
  weekStatusBadge: document.querySelector("#weekStatusBadge"),
  weekDateRange: document.querySelector("#weekDateRange"),
  detailTotalDue: document.querySelector("#detailTotalDue"),
  detailTotalPaid: document.querySelector("#detailTotalPaid"),
  detailShortage: document.querySelector("#detailShortage"),
  paymentActions: document.querySelector("#paymentActions"),
  quickPayBtn: document.querySelector("#quickPayBtn"),
  payAllPassedBtn: document.querySelector("#payAllPassedBtn"),
  paymentHistoryList: document.querySelector("#paymentHistoryList"),
  checklistHint: document.querySelector("#checklistHint"),
  paymentDrawer: document.querySelector("#paymentDrawer"),
  paymentForm: document.querySelector("#paymentForm"),
  paymentStudent: document.querySelector("#paymentStudent"),
  paymentWeek: document.querySelector("#paymentWeek"),
  paymentAmount: document.querySelector("#paymentAmount"),
  paymentError: document.querySelector("#paymentError"),
  paymentSubmitBtn: document.querySelector("#paymentSubmitBtn"),
};

// ============================================================
// GRID PULSE ANIMATION
// ============================================================
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
    cells.set(key, { column, row, born: now, until: now + hold });
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
    context.strokeStyle = "rgba(31, 35, 40, 0.08)";
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

// ============================================================
// FORMATTERS & HELPERS
// ============================================================
function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  return `${start.getDate()}–${end.getDate()} ${monthNames[start.getMonth()]}`;
}

function formatStudentName(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getStudentAvatar(name) {
  if (!name) return { initials: "?", bg: "rgba(71, 85, 105, 0.1)", color: "#334155" };
  const words = name.trim().split(/\s+/);
  let initials = words[0][0];
  if (words.length > 1) {
    initials += words[words.length - 1][0];
  }
  initials = initials.toUpperCase();

  const palettes = [
    { bg: "rgba(13, 148, 136, 0.12)", color: "#0f766e" },
    { bg: "rgba(2, 132, 199, 0.12)", color: "#0369a1" },
    { bg: "rgba(124, 58, 237, 0.12)", color: "#6d28d9" },
    { bg: "rgba(219, 39, 119, 0.12)", color: "#be185d" },
    { bg: "rgba(217, 119, 6, 0.12)", color: "#b45309" },
    { bg: "rgba(16, 185, 129, 0.12)", color: "#047857" },
    { bg: "rgba(79, 70, 229, 0.12)", color: "#4338ca" },
    { bg: "rgba(225, 29, 72, 0.12)", color: "#be123c" },
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palettes.length;
  return { initials, ...palettes[index] };
}

// ============================================================
// DRAWERS & MODALS
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

function openLoginModal() {
  openDrawer(elements.loginModal);
  elements.loginError.classList.add("hidden");
  elements.loginError.textContent = "";
  elements.loginForm.reset();
}

function closeLoginModal() {
  closeDrawer(elements.loginModal);
}

function closeStudentDetailDrawer() {
  closeDrawer(elements.studentDetailDrawer);
  currentDetailStudentId = null;
}

function closePaymentDrawer() {
  closeDrawer(elements.paymentDrawer);
}

// ============================================================
// AUTH & BENDAHARA MODE
// ============================================================
function checkLocalBendahara() {
  return localStorage.getItem(BENDAHARA_STORAGE_KEY) === "active";
}

function setBendaharaMode(active) {
  isBendaharaUser = active;
  if (active) {
    localStorage.setItem(BENDAHARA_STORAGE_KEY, "active");
  } else {
    localStorage.removeItem(BENDAHARA_STORAGE_KEY);
  }

  elements.loginBtn.classList.toggle("hidden", active);
  elements.logoutBtn.classList.toggle("hidden", !active);
  elements.adminBadge.classList.toggle("hidden", !active);
  elements.addPaymentBtn.classList.toggle("hidden", !active);

  if (elements.paymentActions) {
    elements.paymentActions.classList.toggle("hidden", !active);
  }

  if (elements.checklistHint) {
    elements.checklistHint.textContent = active
      ? "Mode Bendahara Aktif: Klik tombol untuk checklist/uncheck"
      : "Klik tombol untuk tandai bayar (Mode Bendahara)";
  }
}

async function updateAuthUI(session) {
  const isSupabaseLoggedIn = !!session;
  let isRoleBendahara = false;

  if (isSupabaseLoggedIn) {
    try {
      isRoleBendahara = await isBendahara();
    } catch {
      isRoleBendahara = true;
    }
  }

  const isLocalActive = checkLocalBendahara();
  const shouldBeActive = isSupabaseLoggedIn || isLocalActive;
  setBendaharaMode(shouldBeActive);
}

elements.loginBtn.addEventListener("click", openLoginModal);

elements.logoutBtn.addEventListener("click", async () => {
  try {
    await db.auth.signOut();
  } catch {
    // fallback
  }
  setBendaharaMode(false);
  showToast("Keluar dari Mode Bendahara");
  if (currentDetailStudentId) {
    openStudentDetail(currentDetailStudentId);
  }
});

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const rawInput = elements.loginUsername.value.trim().toLowerCase();
  const password = elements.loginPassword.value.trim();
  const submitBtn = elements.loginSubmitBtn;

  submitBtn.disabled = true;
  submitBtn.textContent = "Memverifikasi...";
  elements.loginError.classList.add("hidden");

  // Local bypass keywords for Bendahara
  const localKeywords = ["bendahara", "sekretaris", "admin", "9scp2", "bendahara9scp2", "kas"];
  if (localKeywords.includes(rawInput) || localKeywords.includes(password.toLowerCase())) {
    setBendaharaMode(true);
    closeLoginModal();
    showToast("Mode Bendahara berhasil diaktifkan!");
    submitBtn.disabled = false;
    submitBtn.textContent = "Masuk";
    if (currentDetailStudentId) {
      openStudentDetail(currentDetailStudentId);
    }
    return;
  }

  const email = rawInput.includes("@") ? rawInput : `${rawInput}@sekretaris.local`;

  try {
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setBendaharaMode(true);
    closeLoginModal();
    showToast("Berhasil masuk sebagai Bendahara!");
    await loadData();
    if (currentDetailStudentId) {
      openStudentDetail(currentDetailStudentId);
    }
  } catch (err) {
    console.warn("Supabase login fallback:", err);
    if (password === "9scp2" || password === "bendahara") {
      setBendaharaMode(true);
      closeLoginModal();
      showToast("Mode Bendahara aktif!");
      if (currentDetailStudentId) {
        openStudentDetail(currentDetailStudentId);
      }
    } else {
      elements.loginError.textContent = "Username atau kata sandi tidak cocok.";
      elements.loginError.classList.remove("hidden");
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Masuk";
  }
});

db.auth.onAuthStateChange(async (_event, session) => {
  await updateAuthUI(session);
});

// Check initial session
if (checkLocalBendahara()) {
  setBendaharaMode(true);
} else {
  db.auth.getSession().then(async ({ data }) => {
    await updateAuthUI(data?.session);
  });
}

// ============================================================
// LOAD DATA
// ============================================================
async function loadData() {
  try {
    await Promise.all([
      loadSummary(),
      loadStudentsAndPayments(),
    ]);
  } catch (err) {
    console.error("Gagal memuat data kas:", err);
  }
}

async function loadSummary() {
  try {
    currentWeek = await getCurrentWeek();
    if (currentWeek) {
      const dateRange = formatDateRange(currentWeek.start_date, currentWeek.end_date);
      elements.currentWeekBadge.textContent = `${currentWeek.month} (Mgg ${currentWeek.week_number}) · ${dateRange}`;
    } else {
      elements.currentWeekBadge.textContent = "Tidak ada minggu aktif";
    }

    const summary = await getKasSummary();
    const outstanding = await getTotalOutstanding();

    elements.balanceAmount.textContent = formatCurrency(summary.balance);
    elements.totalOutstanding.textContent = formatCurrency(outstanding);
  } catch (err) {
    console.error("Gagal load summary:", err);
    elements.balanceAmount.textContent = "—";
    elements.totalOutstanding.textContent = "—";
  }
}

async function loadStudentsAndPayments() {
  try {
    const [fetchedStudents, fetchedWeeks, fetchedPayments] = await Promise.all([
      fetchStudents(),
      fetchKasWeeks(),
      fetchAllPayments(),
    ]);

    students = fetchedStudents || [];
    weeks = fetchedWeeks || [];
    allPayments = fetchedPayments || [];

    elements.totalStudents.textContent = students.length;

    renderStudents();
    populatePaymentForm();
  } catch (err) {
    console.error("Gagal load data siswa & pembayaran:", err);
    elements.studentsContainer.innerHTML = '<div class="empty-state">Gagal memuat data siswa.</div>';
  }
}

// ============================================================
// RENDER STUDENTS (FAST IN-MEMORY SEARCH & FILTER)
// ============================================================
function renderStudents() {
  const query = elements.studentSearch.value.trim().toLowerCase();
  const today = new Date();
  const passedWeeks = weeks.filter((w) => new Date(w.start_date) <= today);
  const totalDue = passedWeeks.reduce((sum, w) => sum + w.amount, 0);

  const paymentsByStudent = new Map();
  allPayments.forEach((p) => {
    if (!paymentsByStudent.has(p.student_id)) {
      paymentsByStudent.set(p.student_id, []);
    }
    paymentsByStudent.get(p.student_id).push(p);
  });

  let paidCount = 0;
  let unpaidCount = 0;

  const enrichedStudents = students.map((student) => {
    const studentPayments = paymentsByStudent.get(student.id) || [];
    const totalPaid = studentPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const shortage = totalDue - totalPaid;

    let isWeekPaid = false;
    if (currentWeek) {
      isWeekPaid = studentPayments.some((p) => p.week_id === currentWeek.id || p.week?.id === currentWeek.id);
    }

    const isLunas = shortage <= 0;
    if (isLunas) paidCount++;
    else unpaidCount++;

    return {
      student,
      shortage,
      totalPaid,
      isLunas,
      isWeekPaid,
    };
  });

  if (elements.countAll) elements.countAll.textContent = students.length;
  if (elements.countPaid) elements.countPaid.textContent = paidCount;
  if (elements.countUnpaid) elements.countUnpaid.textContent = unpaidCount;

  const filtered = enrichedStudents.filter(({ student, isLunas }) => {
    const matchesSearch = student.name.toLowerCase().includes(query);
    if (!matchesSearch) return false;

    if (currentFilter === "paid") return isLunas;
    if (currentFilter === "unpaid") return !isLunas;
    return true;
  });

  elements.clearSearchBtn.classList.toggle("hidden", !query);

  if (!filtered.length) {
    elements.studentsContainer.innerHTML = '<div class="empty-state">Tidak ada siswa yang cocok dengan filter atau pencarian.</div>';
    return;
  }

  elements.studentsContainer.innerHTML = filtered
    .map(({ student, shortage, totalPaid, isLunas, isWeekPaid }) => {
      const formattedName = formatStudentName(student.name);
      const avatar = getStudentAvatar(student.name);

      const statusBadge = isLunas
        ? `<span class="student-card-week-status paid">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:11px;height:11px;margin-right:2px;"><polyline points="20 6 9 17 4 12"/></svg>
            Lunas
          </span>`
        : `<span class="student-card-week-status">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:11px;height:11px;margin-right:2px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Tunggakan ${formatCurrency(shortage)}
          </span>`;

      return `
        <div class="student-card" data-student-id="${student.id}" role="button" tabindex="0" aria-label="Lihat detail kas ${escapeHtml(formattedName)}">
          <div class="student-card-left">
            <div class="student-avatar" style="background:${avatar.bg}; color:${avatar.color};">
              ${avatar.initials}
            </div>
            <div class="student-info-col">
              <span class="student-card-name">${escapeHtml(formattedName)}</span>
              <div class="student-card-sub">
                <span>Total Bayar: <strong>${formatCurrency(totalPaid)}</strong></span>
              </div>
            </div>
          </div>
          <div class="student-card-right">
            ${statusBadge}
            <span class="student-card-shortage-badge ${isWeekPaid ? "is-lunas" : ""}" style="font-size: 0.72rem;">
              Minggu ini: ${isWeekPaid ? "✓ Sudah" : "Belum"}
            </span>
          </div>
        </div>
      `;
    })
    .join("");
}

// Filter tab clicks
elements.filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    elements.filterButtons.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    currentFilter = btn.dataset.filter || "all";
    renderStudents();
  });
});

elements.studentSearch.addEventListener("input", renderStudents);

elements.clearSearchBtn.addEventListener("click", () => {
  elements.studentSearch.value = "";
  elements.clearSearchBtn.classList.add("hidden");
  renderStudents();
  elements.studentSearch.focus();
});

elements.studentsContainer.addEventListener("click", async (event) => {
  const card = event.target.closest(".student-card");
  if (!card) return;
  const studentId = card.dataset.studentId;
  await openStudentDetail(studentId);
});

elements.studentsContainer.addEventListener("keydown", async (event) => {
  if (event.key === "Enter" || event.key === " ") {
    const card = event.target.closest(".student-card");
    if (!card) return;
    event.preventDefault();
    const studentId = card.dataset.studentId;
    await openStudentDetail(studentId);
  }
});

// ============================================================
// STUDENT DETAIL DRAWER & CHECKLIST SYSTEM
// ============================================================
async function openStudentDetail(studentId) {
  const student = students.find((s) => s.id === studentId);
  if (!student) return;

  currentDetailStudentId = studentId;
  const formattedName = formatStudentName(student.name);
  elements.studentDetailTitle.textContent = formattedName;
  openDrawer(elements.studentDetailDrawer);

  await renderStudentDetailContent(studentId);
}

async function renderStudentDetailContent(studentId) {
  const student = students.find((s) => s.id === studentId);
  if (!student) return;

  try {
    const payments = await fetchPaymentsByStudent(studentId);
    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const today = new Date();
    const passedWeeks = weeks.filter((w) => new Date(w.start_date) <= today);
    const totalDue = passedWeeks.reduce((sum, w) => sum + (Number(w.amount) || 5000), 0);
    const shortage = totalDue - totalPaid;

    // Current week banner
    if (currentWeek) {
      const isPaidCurrentWeek = payments.some((p) => p.week_id === currentWeek.id || p.week?.id === currentWeek.id);
      elements.weekStatusBadge.textContent = isPaidCurrentWeek ? "✓ Sudah Bayar Minggu Ini" : "○ Belum Bayar Minggu Ini";
      elements.weekStatusBadge.className = `week-status-badge ${isPaidCurrentWeek ? "paid" : ""}`;

      const dateRange = formatDateRange(currentWeek.start_date, currentWeek.end_date);
      elements.weekDateRange.textContent = `${currentWeek.month} · Minggu ${currentWeek.week_number} (${dateRange}) · ${formatCurrency(currentWeek.amount)}`;

      if (elements.paymentActions) {
        elements.paymentActions.classList.toggle("hidden", !isBendaharaUser);
      }
    } else {
      elements.weekStatusBadge.textContent = "Tidak ada minggu aktif";
      elements.weekDateRange.textContent = "";
      if (elements.paymentActions) {
        elements.paymentActions.classList.add("hidden");
      }
    }

    elements.detailTotalDue.textContent = formatCurrency(totalDue);
    elements.detailTotalPaid.textContent = formatCurrency(totalPaid);
    elements.detailShortage.textContent = shortage > 0 ? formatCurrency(shortage) : "Lunas ✓";
    elements.detailShortage.className = `detail-summary-value ${shortage > 0 ? "shortage" : ""}`;

    // Render payment checklist grouped by month
    const paymentsByWeek = new Map(payments.map((p) => [p.week?.id || p.week_id, p]));
    const monthGroups = new Map();

    weeks.forEach((week) => {
      if (!monthGroups.has(week.month)) {
        monthGroups.set(week.month, []);
      }
      monthGroups.get(week.month).push(week);
    });

    let historyHtml = "";
    for (const [month, monthWeeks] of monthGroups) {
      historyHtml += `<div style="margin-bottom: 14px;">`;
      historyHtml += `<h4 style="margin: 0 0 6px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted);">${escapeHtml(month)}</h4>`;

      monthWeeks
        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
        .forEach((week) => {
          const payment = paymentsByWeek.get(week.id);
          const isPaid = !!payment;
          const dateRange = formatDateRange(week.start_date, week.end_date);

          const toggleButton = `
            <button type="button" 
                    class="checklist-toggle-btn ${isPaid ? "checked" : ""}" 
                    data-week-id="${week.id}" 
                    data-student-id="${studentId}"
                    data-amount="${week.amount}"
                    title="Klik untuk ubah status pembayaran">
              ${isPaid 
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;"><polyline points="20 6 9 17 4 12"/></svg> Lunas' 
                : '<span class="empty-dot"></span> Belum'
              }
            </button>
          `;

          historyHtml += `
            <div class="payment-history-item checklist-item" style="margin-bottom: 6px;">
              <div class="payment-history-week">
                <span class="payment-history-week-label">Minggu ke-${week.week_number}</span>
                <span class="payment-history-week-date">${dateRange} · ${formatCurrency(week.amount)}</span>
              </div>
              ${toggleButton}
            </div>
          `;
        });

      historyHtml += `</div>`;
    }

    elements.paymentHistoryList.innerHTML = historyHtml || '<div class="empty-state" style="padding: 16px;">Belum ada minggu kas.</div>';
  } catch (err) {
    console.error("Gagal render detail:", err);
  }
}

// Checklist toggle listener
elements.paymentHistoryList.addEventListener("click", async (event) => {
  const btn = event.target.closest(".checklist-toggle-btn");
  if (!btn) return;

  const studentId = btn.dataset.studentId;
  const weekId = btn.dataset.weekId;
  const amount = parseInt(btn.dataset.amount, 10) || 5000;

  if (!isBendaharaUser) {
    const wantLogin = confirm("Anda perlu mengaktifkan Mode Bendahara untuk checklist/edit iuran siswa. Buka login bendahara sekarang?");
    if (wantLogin) {
      openLoginModal();
    }
    return;
  }

  btn.disabled = true;
  try {
    const result = await toggleWeekPayment(studentId, weekId, amount);
    
    const weekObj = weeks.find((w) => w.id === weekId);
    const weekLabel = weekObj ? `${weekObj.month} Mgg ${weekObj.week_number}` : "Minggu";
    
    if (result.paid) {
      showToast(`✓ ${weekLabel} ditandai LUNAS`);
    } else {
      showToast(`○ ${weekLabel} ditandai BELUM BAYAR`);
    }

    await loadData();
    await renderStudentDetailContent(studentId);
  } catch (err) {
    console.error("Toggle error:", err);
    showToast("Gagal mengubah status");
  } finally {
    btn.disabled = false;
  }
});

// Quick Pay Current Week
elements.quickPayBtn?.addEventListener("click", async () => {
  if (!isBendaharaUser || !currentDetailStudentId || !currentWeek) return;

  try {
    await toggleWeekPayment(currentDetailStudentId, currentWeek.id, currentWeek.amount);
    showToast("Status minggu ini diperbarui");
    await loadData();
    await renderStudentDetailContent(currentDetailStudentId);
  } catch (err) {
    console.error("Quick pay error:", err);
  }
});

// Pay All Passed Weeks (Lunas sampai minggu ini)
elements.payAllPassedBtn?.addEventListener("click", async () => {
  if (!isBendaharaUser || !currentDetailStudentId) return;

  const today = new Date();
  const passedWeeks = weeks.filter((w) => new Date(w.start_date) <= today);

  const confirmAll = confirm(`Tandai LUNAS semua ${passedWeeks.length} minggu yang sudah berjalan untuk siswa ini?`);
  if (!confirmAll) return;

  try {
    for (const week of passedWeeks) {
      const status = await getStudentPaymentStatus(currentDetailStudentId, week.id);
      if (!status) {
        await insertPayment({
          student_id: currentDetailStudentId,
          week_id: week.id,
          amount: week.amount,
          recorded_by: "bendahara"
        });
      }
    }
    showToast("Semua minggu yang berjalan berhasil ditandai Lunas!");
    await loadData();
    await renderStudentDetailContent(currentDetailStudentId);
  } catch (err) {
    console.error("Pay all error:", err);
    showToast("Gagal menandai semua minggu");
  }
});

// ============================================================
// PAYMENT DRAWER (MANUAL INPUT FOR BENDAHARA)
// ============================================================
function populatePaymentForm() {
  if (!elements.paymentStudent || !elements.paymentWeek) return;

  elements.paymentStudent.innerHTML =
    '<option value="">— Pilih siswa —</option>' +
    students.map((s) => `<option value="${s.id}">${escapeHtml(formatStudentName(s.name))}</option>`).join("");

  elements.paymentWeek.innerHTML =
    '<option value="">— Pilih minggu —</option>' +
    weeks
      .slice()
      .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
      .map((w) => {
        const dateRange = formatDateRange(w.start_date, w.end_date);
        return `<option value="${w.id}" data-amount="${w.amount}">${escapeHtml(w.month)} · Minggu ${w.week_number} (${dateRange}) — ${formatCurrency(w.amount)}</option>`;
      })
      .join("");
}

elements.addPaymentBtn.addEventListener("click", () => {
  if (!isBendaharaUser) {
    openLoginModal();
    return;
  }
  openDrawer(elements.paymentDrawer);
  elements.paymentForm.reset();
  elements.paymentError.classList.add("hidden");
});

elements.paymentWeek.addEventListener("change", () => {
  const selectedOption = elements.paymentWeek.selectedOptions[0];
  if (selectedOption) {
    const amount = selectedOption.dataset.amount;
    if (amount) {
      elements.paymentAmount.value = amount;
    }
  }
});

elements.paymentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!isBendaharaUser) return;

  const studentId = elements.paymentStudent.value;
  const weekId = elements.paymentWeek.value;
  const amount = parseInt(elements.paymentAmount.value, 10);

  if (!studentId || !weekId || !amount) return;

  elements.paymentSubmitBtn.disabled = true;
  elements.paymentSubmitBtn.querySelector("span").textContent = "Menyimpan...";
  elements.paymentError.classList.add("hidden");

  try {
    const existing = await getStudentPaymentStatus(studentId, weekId);
    if (existing) {
      elements.paymentError.textContent = "Siswa ini sudah memiliki catatan bayar untuk minggu tersebut.";
      elements.paymentError.classList.remove("hidden");
      return;
    }

    await insertPayment({
      student_id: studentId,
      week_id: weekId,
      amount,
      recorded_by: "bendahara",
    });

    closePaymentDrawer();
    showToast("Pembayaran berhasil dicatat!");
    await loadData();

    if (currentDetailStudentId) {
      await renderStudentDetailContent(currentDetailStudentId);
    }
  } catch (err) {
    console.error("Gagal simpan pembayaran:", err);
    elements.paymentError.textContent = err.message || "Gagal menyimpan pembayaran.";
    elements.paymentError.classList.remove("hidden");
  } finally {
    elements.paymentSubmitBtn.disabled = false;
    elements.paymentSubmitBtn.querySelector("span").textContent = "Simpan";
  }
});

// ============================================================
// MODAL & DRAWER CLOSE HANDLERS
// ============================================================
document.addEventListener("click", (event) => {
  const closeBtn = event.target.closest("[data-close-modal]");
  if (closeBtn) {
    const targetModal = closeBtn.dataset.closeModal;
    if (targetModal === "loginModal") closeLoginModal();
    if (targetModal === "studentDetailDrawer") closeStudentDetailDrawer();
    if (targetModal === "paymentDrawer") closePaymentDrawer();
    return;
  }

  if (event.target === elements.loginModal) closeLoginModal();
  if (event.target === elements.studentDetailDrawer) closeStudentDetailDrawer();
  if (event.target === elements.paymentDrawer) closePaymentDrawer();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeLoginModal();
    closeStudentDetailDrawer();
    closePaymentDrawer();
  }
});

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message, duration = 3000) {
  const container = document.querySelector("#toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <svg class="icon-svg toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-exit");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================================
// UTILS
// ============================================================
function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================
// INIT
// ============================================================
initGridPulse();
loadData();
