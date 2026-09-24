// ============================================================
// KAS KELAS APPLICATION
// ============================================================
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env.js";
import {
  fetchStudents,
  fetchKasWeeks,
  getCurrentWeek,
  fetchPaymentsByStudent,
  insertPayment,
  getStudentPaymentStatus,
  isBendahara,
  getKasSummary,
  getTotalOutstanding,
} from "./kas.js";

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let students = [];
let weeks = [];
let currentWeek = null;
let isBendaharaUser = false;
let currentDetailStudentId = null;

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
  paymentHistoryList: document.querySelector("#paymentHistoryList"),
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

// ============================================================
// AUTH UI
// ============================================================
function openModal(modalElement) {
  modalElement.classList.remove("hidden");
  modalElement.classList.add("is-open");
  modalElement.setAttribute("aria-hidden", "false");
}

function closeModal(modalElement) {
  modalElement.classList.remove("is-open");
  setTimeout(() => {
    modalElement.classList.add("hidden");
    modalElement.setAttribute("aria-hidden", "true");
  }, 300);
}

function openLoginModal() {
  openModal(elements.loginModal);
  elements.loginError.classList.add("hidden");
  elements.loginError.textContent = "";
  elements.loginForm.reset();
}

function closeLoginModal() {
  closeModal(elements.loginModal);
}

async function updateAuthUI(session) {
  const loggedIn = !!session;
  elements.loginBtn.classList.toggle("hidden", loggedIn);
  elements.logoutBtn.classList.toggle("hidden", !loggedIn);
  elements.adminBadge.classList.toggle("hidden", !loggedIn);
  
  if (loggedIn) {
    try {
      isBendaharaUser = await isBendahara();
    } catch (err) {
      console.warn("Gagal cek role:", err);
      isBendaharaUser = false;
    }
  } else {
    isBendaharaUser = false;
  }

  // Show/hide bendahara-only buttons
  elements.addPaymentBtn.classList.toggle("hidden", !isBendaharaUser);
}

elements.loginBtn.addEventListener("click", openLoginModal);

elements.logoutBtn.addEventListener("click", async () => {
  try {
    await db.auth.signOut();
    showToast("Berhasil keluar");
  } catch (err) {
    console.error("Gagal logout:", err);
    showToast("Gagal keluar");
  }
});

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const rawInput = elements.loginUsername.value.trim().toLowerCase();
  const password = elements.loginPassword.value;
  const submitBtn = elements.loginSubmitBtn;

  const email = rawInput.includes("@") ? rawInput : `${rawInput}@sekretaris.local`;

  submitBtn.disabled = true;
  submitBtn.textContent = "Masuk...";
  elements.loginError.classList.add("hidden");

  try {
    await db.auth.signInWithPassword({ email, password });
    closeLoginModal();
    showToast("Berhasil masuk");
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

db.auth.onAuthStateChange(async (_event, session) => {
  await updateAuthUI(session);
  if (session) {
    await loadData();
  }
});

db.auth.getSession().then(async ({ data }) => {
  await updateAuthUI(data.session);
});

// ============================================================
// CURRENCY FORMATTING
// ============================================================
function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  return `${start.getDate()}–${end.getDate()} ${monthNames[start.getMonth()]}`;
}

// ============================================================
// LOAD DATA
// ============================================================
async function loadData() {
  await Promise.all([
    loadSummary(),
    loadStudents(),
  ]);
}

async function loadSummary() {
  try {
    // Load current week
    currentWeek = await getCurrentWeek();
    if (currentWeek) {
      const dateRange = formatDateRange(currentWeek.start_date, currentWeek.end_date);
      elements.currentWeekBadge.textContent = `Minggu ke-${currentWeek.week_number} · ${dateRange}`;
    } else {
      elements.currentWeekBadge.textContent = "Tidak ada minggu aktif";
    }

    // Load summary
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

async function loadStudents() {
  try {
    students = await fetchStudents();
    weeks = await fetchKasWeeks();
    elements.totalStudents.textContent = students.length;
    
    await renderStudents();
    populatePaymentForm();
  } catch (err) {
    console.error("Gagal load siswa:", err);
    elements.studentsContainer.innerHTML = '<div class="empty-state">Gagal memuat data siswa.</div>';
  }
}

async function renderStudents() {
  const query = elements.studentSearch.value.trim().toLowerCase();
  const filtered = students.filter((s) => s.name.toLowerCase().includes(query));

  if (!filtered.length) {
    elements.studentsContainer.innerHTML = '<div class="empty-state">Tidak ada siswa yang cocok.</div>';
    return;
  }

  // Show/hide clear button
  elements.clearSearchBtn.classList.toggle("hidden", !query);

  // Calculate each student's status for current week
  const today = new Date();
  const passedWeeks = weeks.filter((w) => new Date(w.start_date) <= today);

  const studentCards = await Promise.all(
    filtered.map(async (student) => {
      // Get current week payment status
      let weekStatus = "Belum Bayar";
      let weekStatusClass = "";
      if (currentWeek) {
        const payment = await getStudentPaymentStatus(student.id, currentWeek.id);
        if (payment) {
          weekStatus = "Sudah Bayar";
          weekStatusClass = "paid";
        }
      }

      // Calculate outstanding
      const payments = await fetchPaymentsByStudent(student.id);
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const totalDue = passedWeeks.reduce((sum, w) => sum + w.amount, 0);
      const shortage = totalDue - totalPaid;

      return {
        student,
        weekStatus,
        weekStatusClass,
        shortage,
      };
    })
  );

  elements.studentsContainer.innerHTML = studentCards
    .map(
      ({ student, weekStatus, weekStatusClass, shortage }) => `
        <div class="student-card" data-student-id="${student.id}">
          <div class="student-card-header">
            <span class="student-card-name">${escapeHtml(student.name)}</span>
            <span class="student-card-week-status ${weekStatusClass}">${weekStatus}</span>
          </div>
          <div class="student-card-meta">
            <span class="student-card-meta-item">Tunggakan: <strong>${shortage > 0 ? formatCurrency(shortage) : "Lunas"}</strong></span>
          </div>
        </div>
      `
    )
    .join("");
}

elements.studentSearch.addEventListener("input", renderStudents);

elements.clearSearchBtn.addEventListener("click", () => {
  elements.studentSearch.value = "";
  elements.clearSearchBtn.classList.add("hidden");
  renderStudents();
});

elements.studentsContainer.addEventListener("click", async (event) => {
  const card = event.target.closest(".student-card");
  if (!card) return;
  const studentId = card.dataset.studentId;
  await openStudentDetail(studentId);
});

// ============================================================
// STUDENT DETAIL DRAWER
// ============================================================
async function openStudentDetail(studentId) {
  const student = students.find((s) => s.id === studentId);
  if (!student) return;

  currentDetailStudentId = studentId;
  elements.studentDetailTitle.textContent = student.name;
  openModal(elements.studentDetailDrawer);

  // Show loading
  elements.weekStatusBadge.textContent = "Memuat...";
  elements.weekDateRange.textContent = "";
  elements.detailTotalDue.textContent = "—";
  elements.detailTotalPaid.textContent = "—";
  elements.detailShortage.textContent = "—";
  elements.paymentHistoryList.innerHTML = '<div class="empty-state" style="padding: 16px;">Memuat riwayat...</div>';

  try {
    // Current week status
    if (currentWeek) {
      const payment = await getStudentPaymentStatus(studentId, currentWeek.id);
      const isPaid = !!payment;
      
      elements.weekStatusBadge.textContent = isPaid ? "✓ Sudah Bayar Minggu Ini" : "○ Belum Bayar Minggu Ini";
      elements.weekStatusBadge.className = `week-status-badge ${isPaid ? "paid" : ""}`;
      
      const dateRange = formatDateRange(currentWeek.start_date, currentWeek.end_date);
      elements.weekDateRange.textContent = `Minggu ke-${currentWeek.week_number} · ${dateRange} · ${formatCurrency(currentWeek.amount)}`;

      // Show quick pay button if bendahara and not paid
      if (isBendaharaUser && !isPaid) {
        elements.paymentActions.classList.remove("hidden");
        elements.quickPayBtn.onclick = () => quickPay(studentId, currentWeek.id, currentWeek.amount);
      } else {
        elements.paymentActions.classList.add("hidden");
      }
    } else {
      elements.weekStatusBadge.textContent = "Tidak ada minggu aktif";
      elements.weekDateRange.textContent = "";
      elements.paymentActions.classList.add("hidden");
    }

    // Calculate summary
    const payments = await fetchPaymentsByStudent(studentId);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    const today = new Date();
    const passedWeeks = weeks.filter((w) => new Date(w.start_date) <= today);
    const totalDue = passedWeeks.reduce((sum, w) => sum + w.amount, 0);
    const shortage = totalDue - totalPaid;

    elements.detailTotalDue.textContent = formatCurrency(totalDue);
    elements.detailTotalPaid.textContent = formatCurrency(totalPaid);
    elements.detailShortage.textContent = shortage > 0 ? formatCurrency(shortage) : "Lunas ✓";

    // Render payment history
    const paymentsByWeek = new Map(payments.map((p) => [p.week.id, p]));
    const monthGroups = new Map();

    weeks.forEach((week) => {
      if (!monthGroups.has(week.month)) {
        monthGroups.set(week.month, []);
      }
      monthGroups.get(week.month).push(week);
    });

    let historyHtml = "";
    for (const [month, monthWeeks] of monthGroups) {
      historyHtml += `<div style="margin-bottom: 20px;">`;
      historyHtml += `<h4 style="margin: 0 0 12px; font-size: 0.9rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted);">${escapeHtml(month)}</h4>`;
      
      monthWeeks.sort((a, b) => new Date(b.start_date) - new Date(a.start_date)).forEach((week) => {
        const payment = paymentsByWeek.get(week.id);
        const isPaid = !!payment;
        const statusClass = isPaid ? "paid" : "";
        const statusText = isPaid ? "✓ Dibayar" : "○ Belum Bayar";
        
        const dateRange = formatDateRange(week.start_date, week.end_date);

        historyHtml += `
          <div class="payment-history-item">
            <div class="payment-history-week">
              <span class="payment-history-week-label">Minggu ${week.week_number}</span>
              <span class="payment-history-week-date">${dateRange} · ${formatCurrency(week.amount)}</span>
            </div>
            <span class="payment-history-status ${statusClass}">${statusText}</span>
          </div>
        `;
      });

      historyHtml += `</div>`;
    }

    elements.paymentHistoryList.innerHTML = historyHtml || '<div class="empty-state" style="padding: 16px;">Belum ada riwayat pembayaran.</div>';
  } catch (err) {
    console.error("Gagal load detail siswa:", err);
    elements.paymentHistoryList.innerHTML = '<div class="empty-state" style="padding: 16px;">Gagal memuat riwayat.</div>';
  }
}

function closeStudentDetailDrawer() {
  closeModal(elements.studentDetailDrawer);
  currentDetailStudentId = null;
}

// ============================================================
// PAYMENT DRAWER (BENDAHARA)
// ============================================================
function populatePaymentForm() {
  // Populate students dropdown
  elements.paymentStudent.innerHTML = '<option value="">— Pilih siswa —</option>' +
    students.map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join("");

  // Populate weeks dropdown
  elements.paymentWeek.innerHTML = '<option value="">— Pilih minggu —</option>' +
    weeks
      .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
      .map((w) => {
        const dateRange = formatDateRange(w.start_date, w.end_date);
        return `<option value="${w.id}" data-amount="${w.amount}">${escapeHtml(w.month)} · Minggu ${w.week_number} (${dateRange}) · ${formatCurrency(w.amount)}</option>`;
      }).join("");
}

elements.addPaymentBtn.addEventListener("click", () => {
  if (!isBendaharaUser) return;
  openModal(elements.paymentDrawer);
  elements.paymentForm.reset();
  elements.paymentError.classList.add("hidden");
});

function closePaymentDrawer() {
  closeModal(elements.paymentDrawer);
}

elements.paymentWeek.addEventListener("change", () => {
  const selectedOption = elements.paymentWeek.selectedOptions[0];
  if (selectedOption) {
    const amount = selectedOption.dataset.amount;
    if (amount) {
      elements.paymentAmount.value = amount;
    }
  }
});

async function quickPay(studentId, weekId, amount) {
  if (!isBendaharaUser) return;

  const confirmPay = confirm("Catat pembayaran untuk minggu ini?");
  if (!confirmPay) return;

  try {
    const { data: session } = await db.auth.getSession();
    const recordedBy = session?.session?.user?.email || "unknown";

    await insertPayment({
      student_id: studentId,
      week_id: weekId,
      amount,
      recorded_by: recordedBy,
    });

    showToast("Pembayaran berhasil dicatat");
    await loadSummary();
    await renderStudents();
    
    // Refresh student detail
    if (currentDetailStudentId) {
      await openStudentDetail(currentDetailStudentId);
    }
  } catch (err) {
    console.error("Gagal simpan pembayaran:", err);
    showToast("Gagal menyimpan pembayaran");
  }
}

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
    // Check if already paid
    const existing = await getStudentPaymentStatus(studentId, weekId);
    if (existing) {
      elements.paymentError.textContent = "Siswa ini sudah bayar untuk minggu tersebut.";
      elements.paymentError.classList.remove("hidden");
      return;
    }

    const { data: session } = await db.auth.getSession();
    const recordedBy = session?.session?.user?.email || "unknown";

    await insertPayment({
      student_id: studentId,
      week_id: weekId,
      amount,
      recorded_by: recordedBy,
    });

    closePaymentDrawer();
    showToast("Pembayaran berhasil dicatat");
    await loadSummary();
    await renderStudents();
    
    // Refresh student detail if open
    if (currentDetailStudentId) {
      await openStudentDetail(currentDetailStudentId);
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
// MODAL CLOSE HANDLERS
// ============================================================
document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.closeModal === "loginModal") closeLoginModal();
  if (target.dataset.closeModal === "studentDetailDrawer") closeStudentDetailDrawer();
  if (target.dataset.closeModal === "paymentDrawer") closePaymentDrawer();
});

window.addEventListener("click", (event) => {
  if (event.target === elements.loginModal) closeLoginModal();
  if (event.target === elements.studentDetailDrawer) closeStudentDetailDrawer();
  if (event.target === elements.paymentDrawer) closePaymentDrawer();
});

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message, duration = 3000) {
  const container = document.querySelector("#toastContainer");
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
  return text
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
