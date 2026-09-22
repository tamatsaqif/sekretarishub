// ============================================================
// KAS KELAS APPLICATION
// ============================================================
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env.js";
import {
  fetchStudents,
  fetchKasWeeks,
  fetchPaymentsByStudent,
  insertPayment,
  insertExpense,
  isBendahara,
  getKasSummary,
  getStudentPaymentStatus,
} from "./kas.js";

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let students = [];
let weeks = [];
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
  balanceAmount: document.querySelector("#balanceAmount"),
  totalIncome: document.querySelector("#totalIncome"),
  totalExpense: document.querySelector("#totalExpense"),
  studentSearch: document.querySelector("#studentSearch"),
  studentsContainer: document.querySelector("#studentsContainer"),
  addPaymentBtn: document.querySelector("#addPaymentBtn"),
  addExpenseBtn: document.querySelector("#addExpenseBtn"),
  paymentModal: document.querySelector("#paymentModal"),
  paymentForm: document.querySelector("#paymentForm"),
  paymentStudent: document.querySelector("#paymentStudent"),
  paymentWeek: document.querySelector("#paymentWeek"),
  paymentAmount: document.querySelector("#paymentAmount"),
  paymentError: document.querySelector("#paymentError"),
  paymentSubmitBtn: document.querySelector("#paymentSubmitBtn"),
  expenseModal: document.querySelector("#expenseModal"),
  expenseForm: document.querySelector("#expenseForm"),
  expenseAmount: document.querySelector("#expenseAmount"),
  expenseDescription: document.querySelector("#expenseDescription"),
  expenseDate: document.querySelector("#expenseDate"),
  expenseError: document.querySelector("#expenseError"),
  expenseSubmitBtn: document.querySelector("#expenseSubmitBtn"),
  studentDetailModal: document.querySelector("#studentDetailModal"),
  studentDetailName: document.querySelector("#studentDetailName"),
  detailTotalPaid: document.querySelector("#detailTotalPaid"),
  detailShortage: document.querySelector("#detailShortage"),
  paymentHistory: document.querySelector("#paymentHistory"),
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

async function updateAuthUI(session) {
  const loggedIn = !!session;
  elements.loginBtn.classList.toggle("hidden", loggedIn);
  elements.logoutBtn.classList.toggle("hidden", !loggedIn);
  elements.adminBadge.classList.toggle("hidden", !loggedIn);
  
  if (loggedIn) {
    const displayName = session.user.email ? session.user.email.split("@")[0] : "User";
    elements.adminBadge.textContent = `✏️ ${displayName}`;
    
    // Check role
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
  elements.addExpenseBtn.classList.toggle("hidden", !isBendaharaUser);
}

elements.loginBtn.addEventListener("click", openLoginModal);

elements.logoutBtn.addEventListener("click", async () => {
  try {
    await db.auth.signOut();
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
  submitBtn.textContent = "Masuk...";
  elements.loginError.classList.add("hidden");

  try {
    await db.auth.signInWithPassword({ email, password });
    closeLoginModal();
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
});

db.auth.getSession().then(async ({ data }) => {
  await updateAuthUI(data.session);
});

// ============================================================
// LOAD DATA
// ============================================================
function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

async function loadSummary() {
  try {
    const summary = await getKasSummary();
    elements.balanceAmount.textContent = formatCurrency(summary.balance);
    elements.totalIncome.textContent = formatCurrency(summary.totalIncome);
    elements.totalExpense.textContent = formatCurrency(summary.totalExpense);
  } catch (err) {
    console.error("Gagal load summary:", err);
    elements.balanceAmount.textContent = "—";
    elements.totalIncome.textContent = "—";
    elements.totalExpense.textContent = "—";
  }
}

async function loadStudents() {
  try {
    students = await fetchStudents();
    weeks = await fetchKasWeeks();
    renderStudents();
    populatePaymentForm();
  } catch (err) {
    console.error("Gagal load siswa:", err);
    elements.studentsContainer.innerHTML = '<div class="empty-state">Gagal memuat data siswa.</div>';
  }
}

function renderStudents() {
  const query = elements.studentSearch.value.trim().toLowerCase();
  const filtered = students.filter((s) => s.name.toLowerCase().includes(query));

  if (!filtered.length) {
    elements.studentsContainer.innerHTML = '<div class="empty-state">Tidak ada siswa yang cocok.</div>';
    return;
  }

  elements.studentsContainer.innerHTML = filtered
    .map(
      (student) => `
        <div class="student-row" style="cursor: pointer;" data-student-id="${student.id}">
          <span class="student-name">${escapeHtml(student.name)}</span>
          <span style="font-size: 0.85rem; color: var(--muted);">Lihat detail →</span>
        </div>
      `
    )
    .join("");
}

elements.studentSearch.addEventListener("input", renderStudents);

elements.studentsContainer.addEventListener("click", async (event) => {
  const row = event.target.closest(".student-row");
  if (!row) return;
  const studentId = row.dataset.studentId;
  await openStudentDetail(studentId);
});

// ============================================================
// STUDENT DETAIL MODAL
// ============================================================
async function openStudentDetail(studentId) {
  const student = students.find((s) => s.id === studentId);
  if (!student) return;

  currentDetailStudentId = studentId;
  elements.studentDetailName.textContent = student.name;
  elements.studentDetailModal.classList.remove("hidden");
  elements.studentDetailModal.setAttribute("aria-hidden", "false");
  elements.paymentHistory.innerHTML = '<div class="empty-state">Memuat riwayat...</div>';

  try {
    const payments = await fetchPaymentsByStudent(studentId);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    // Hitung total yang harus dibayar (semua minggu yang sudah lewat)
    const today = new Date();
    const passedWeeks = weeks.filter((w) => new Date(w.start_date) <= today);
    const totalDue = passedWeeks.reduce((sum, w) => sum + w.amount, 0);
    const shortage = totalDue - totalPaid;

    elements.detailTotalPaid.textContent = formatCurrency(totalPaid);
    elements.detailShortage.textContent = shortage > 0 ? formatCurrency(shortage) : "Lunas ✓";

    // Render payment history by month
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
      historyHtml += `<h4 style="margin: 0 0 12px; font-size: 1.05rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">${escapeHtml(month)}</h4>`;
      
      monthWeeks.sort((a, b) => new Date(a.start_date) - new Date(b.start_date)).forEach((week) => {
        const payment = paymentsByWeek.get(week.id);
        const isPaid = !!payment;
        const icon = isPaid ? "✓" : "○";
        const status = isPaid ? "Dibayar" : "Belum bayar";
        const color = isPaid ? "var(--ink)" : "var(--muted)";
        
        const startDate = new Date(week.start_date);
        const endDate = new Date(week.end_date);
        const dateRange = `${startDate.getDate()}–${endDate.getDate()} ${startDate.toLocaleDateString("id-ID", { month: "short" })}`;

        historyHtml += `
          <div style="display: flex; justify-content: space-between; padding: 10px 12px; border: 1px solid var(--line); border-radius: 10px; background: rgba(255, 255, 255, 0.7); margin-bottom: 8px; color: ${color};">
            <div>
              <span style="font-weight: 600;">${icon} Minggu ${week.week_number}</span>
              <span style="color: var(--muted); font-size: 0.85rem; margin-left: 8px;">· ${dateRange}</span>
            </div>
            <span style="font-weight: 600;">${status}</span>
          </div>
        `;
      });

      historyHtml += `</div>`;
    }

    elements.paymentHistory.innerHTML = historyHtml || '<div class="empty-state">Belum ada riwayat pembayaran.</div>';
  } catch (err) {
    console.error("Gagal load detail siswa:", err);
    elements.paymentHistory.innerHTML = '<div class="empty-state">Gagal memuat riwayat.</div>';
  }
}

function closeStudentDetailModal() {
  elements.studentDetailModal.classList.add("hidden");
  elements.studentDetailModal.setAttribute("aria-hidden", "true");
  currentDetailStudentId = null;
}

// ============================================================
// PAYMENT MODAL (BENDAHARA)
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
        const startDate = new Date(w.start_date);
        const endDate = new Date(w.end_date);
        const dateRange = `${startDate.getDate()}–${endDate.getDate()} ${startDate.toLocaleDateString("id-ID", { month: "short" })}`;
        return `<option value="${w.id}" data-amount="${w.amount}">${escapeHtml(w.month)} · Minggu ${w.week_number} (${dateRange}) · ${formatCurrency(w.amount)}</option>`;
      }).join("");
}

elements.addPaymentBtn.addEventListener("click", () => {
  if (!isBendaharaUser) return;
  elements.paymentModal.classList.remove("hidden");
  elements.paymentModal.setAttribute("aria-hidden", "false");
  elements.paymentForm.reset();
  elements.paymentError.classList.add("hidden");
});

function closePaymentModal() {
  elements.paymentModal.classList.add("hidden");
  elements.paymentModal.setAttribute("aria-hidden", "true");
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

elements.paymentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!isBendaharaUser) return;

  const studentId = elements.paymentStudent.value;
  const weekId = elements.paymentWeek.value;
  const amount = parseInt(elements.paymentAmount.value, 10);

  if (!studentId || !weekId || !amount) return;

  elements.paymentSubmitBtn.disabled = true;
  elements.paymentSubmitBtn.textContent = "Menyimpan...";
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

    closePaymentModal();
    await loadSummary();
    
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
    elements.paymentSubmitBtn.textContent = "Tandai Sudah Bayar";
  }
});

// ============================================================
// EXPENSE MODAL (BENDAHARA)
// ============================================================
elements.addExpenseBtn.addEventListener("click", () => {
  if (!isBendaharaUser) return;
  elements.expenseModal.classList.remove("hidden");
  elements.expenseModal.setAttribute("aria-hidden", "false");
  elements.expenseForm.reset();
  elements.expenseDate.valueAsDate = new Date();
  elements.expenseError.classList.add("hidden");
});

function closeExpenseModal() {
  elements.expenseModal.classList.add("hidden");
  elements.expenseModal.setAttribute("aria-hidden", "true");
}

elements.expenseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!isBendaharaUser) return;

  const amount = parseInt(elements.expenseAmount.value, 10);
  const description = elements.expenseDescription.value.trim();
  const expenseDate = elements.expenseDate.value;

  if (!amount || !description || !expenseDate) return;

  elements.expenseSubmitBtn.disabled = true;
  elements.expenseSubmitBtn.textContent = "Menyimpan...";
  elements.expenseError.classList.add("hidden");

  try {
    const { data: session } = await db.auth.getSession();
    const recordedBy = session?.session?.user?.email || "unknown";

    await insertExpense({
      amount,
      description,
      expense_date: expenseDate,
      recorded_by: recordedBy,
    });

    closeExpenseModal();
    await loadSummary();
  } catch (err) {
    console.error("Gagal simpan pengeluaran:", err);
    elements.expenseError.textContent = err.message || "Gagal menyimpan pengeluaran.";
    elements.expenseError.classList.remove("hidden");
  } finally {
    elements.expenseSubmitBtn.disabled = false;
    elements.expenseSubmitBtn.textContent = "Simpan Pengeluaran";
  }
});

// ============================================================
// MODAL CLOSE HANDLERS
// ============================================================
document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.closeModal === "loginModal") closeLoginModal();
  if (target.dataset.closeModal === "studentDetailModal") closeStudentDetailModal();
  if (target.dataset.closeModal === "paymentModal") closePaymentModal();
  if (target.dataset.closeModal === "expenseModal") closeExpenseModal();
});

window.addEventListener("click", (event) => {
  if (event.target === elements.loginModal) closeLoginModal();
  if (event.target === elements.studentDetailModal) closeStudentDetailModal();
  if (event.target === elements.paymentModal) closePaymentModal();
  if (event.target === elements.expenseModal) closeExpenseModal();
});

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
loadSummary();
loadStudents();
