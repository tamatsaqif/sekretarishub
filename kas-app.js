// ============================================================
// KAS KELAS APPLICATION — 9 SCP 2
// ============================================================
import {
  fetchStudents,
  fetchKasWeeks,
  getCurrentWeek,
  fetchAllPayments,
  fetchPaymentsByStudent,
  insertPayment,
  toggleWeekPayment,
  getStudentPaymentStatus,
  getKasSummary,
  getTotalOutstanding,
} from "./kas.js";
import {
  formatCurrency,
  formatStudentName,
  getInitials,
  escapeHtml,
  showToast,
  initGridPulse,
  setupNavigation
} from "./shared.js";

initGridPulse();
setupNavigation("kas-kelas");

let students = [];
let weeks = [];
let allPayments = [];
let currentWeek = null;
let currentDetailStudentId = null;
let currentFilter = "all"; // "all" | "paid" | "unpaid"

const elements = {
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
  kasFilterPills: document.querySelector("#kasFilterPills"),
  studentDetailDrawer: document.querySelector("#studentDetailDrawer"),
  studentDetailTitle: document.querySelector("#studentDetailTitle"),
  weekStatusBadge: document.querySelector("#weekStatusBadge"),
  weekDateRange: document.querySelector("#weekDateRange"),
  detailTotalDue: document.querySelector("#detailTotalDue"),
  detailTotalPaid: document.querySelector("#detailTotalPaid"),
  detailShortage: document.querySelector("#detailShortage"),
  paymentActions: document.querySelector("#paymentActions"),
  quickPayBtn: document.querySelector("#quickPayBtn"),
  payAllPassedBtn: document.querySelector("#payAllPassedBtn"),
  paymentHistoryList: document.querySelector("#paymentHistoryList"),
  closeDetailDrawerBtn: document.querySelector("#closeDetailDrawerBtn"),
  closeDetailDrawerFooterBtn: document.querySelector("#closeDetailDrawerFooterBtn"),
  paymentDrawer: document.querySelector("#paymentDrawer"),
  paymentForm: document.querySelector("#paymentForm"),
  paymentStudent: document.querySelector("#paymentStudent"),
  paymentWeek: document.querySelector("#paymentWeek"),
  paymentAmount: document.querySelector("#paymentAmount"),
  paymentError: document.querySelector("#paymentError"),
  paymentSubmitBtn: document.querySelector("#paymentSubmitBtn"),
  closePaymentDrawerBtn: document.querySelector("#closePaymentDrawerBtn"),
  cancelPaymentDrawerBtn: document.querySelector("#cancelPaymentDrawerBtn"),
};

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
  try {
    await Promise.all([loadSummary(), loadStudentsAndPayments()]);
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

    if (elements.totalStudents) {
      elements.totalStudents.textContent = students.length;
    }

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
  const totalDue = passedWeeks.reduce((sum, w) => sum + (Number(w.amount) || 5000), 0);

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
      const initials = getInitials(student.name);

      const statusBadge = isLunas
        ? `<span class="status-badge-kas paid">✓ Lunas</span>`
        : `<span class="status-badge-kas unpaid">Tunggakan ${formatCurrency(shortage)}</span>`;

      return `
        <div class="student-item interactive" data-student-id="${student.id}" role="button" tabindex="0" style="cursor: pointer;">
          <div class="student-left">
            <div class="student-avatar">${initials}</div>
            <div>
              <span class="student-name">${escapeHtml(formattedName)}</span>
              <div class="student-sub">
                Total Bayar: <strong>${formatCurrency(totalPaid)}</strong> · Minggu ini: ${isWeekPaid ? "✓ Sudah" : "Belum"}
              </div>
            </div>
          </div>
          <div>
            ${statusBadge}
          </div>
        </div>
      `;
    })
    .join("");
}

// Filter tab clicks
elements.kasFilterPills?.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-pill");
  if (!btn) return;
  elements.kasFilterPills.querySelectorAll(".filter-pill").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  currentFilter = btn.dataset.filter || "all";
  renderStudents();
});

elements.studentSearch.addEventListener("input", renderStudents);
elements.clearSearchBtn.addEventListener("click", () => {
  elements.studentSearch.value = "";
  elements.clearSearchBtn.classList.add("hidden");
  renderStudents();
  elements.studentSearch.focus();
});

elements.studentsContainer.addEventListener("click", async (event) => {
  const card = event.target.closest(".student-item");
  if (!card) return;
  const studentId = card.dataset.studentId;
  await openStudentDetail(studentId);
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

  elements.studentDetailDrawer.classList.add("is-open");
  elements.studentDetailDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  await renderStudentDetailContent(studentId);
}

function closeStudentDetail() {
  elements.studentDetailDrawer.classList.remove("is-open");
  elements.studentDetailDrawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  currentDetailStudentId = null;
}

elements.closeDetailDrawerBtn.addEventListener("click", closeStudentDetail);
elements.closeDetailDrawerFooterBtn.addEventListener("click", closeStudentDetail);
elements.studentDetailDrawer.addEventListener("click", (e) => {
  if (e.target === elements.studentDetailDrawer) closeStudentDetail();
});

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
      elements.weekStatusBadge.textContent = isPaidCurrentWeek ? "✓ Sudah Bayar" : "○ Belum Bayar";
      elements.weekStatusBadge.className = `status-badge-kas ${isPaidCurrentWeek ? "paid" : "unpaid"}`;

      const dateRange = formatDateRange(currentWeek.start_date, currentWeek.end_date);
      elements.weekDateRange.textContent = `${currentWeek.month} · Minggu ${currentWeek.week_number} (${dateRange}) · ${formatCurrency(currentWeek.amount)}`;
    } else {
      elements.weekStatusBadge.textContent = "Tidak ada minggu aktif";
      elements.weekDateRange.textContent = "";
    }

    elements.detailTotalDue.textContent = formatCurrency(totalDue);
    elements.detailTotalPaid.textContent = formatCurrency(totalPaid);
    elements.detailShortage.textContent = shortage > 0 ? formatCurrency(shortage) : "Lunas ✓";

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
      historyHtml += `<div style="margin-bottom: 12px;">`;
      historyHtml += `<h4 style="margin: 0 0 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-muted);">${escapeHtml(month)}</h4>`;

      monthWeeks
        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
        .forEach((week) => {
          const payment = paymentsByWeek.get(week.id);
          const isPaid = !!payment;
          const dateRange = formatDateRange(week.start_date, week.end_date);

          historyHtml += `
            <div class="list-item" style="margin-bottom: 4px; padding: 8px 12px;">
              <div>
                <span class="font-bold" style="font-size: 0.8125rem;">Minggu ke-${week.week_number}</span>
                <div class="text-muted" style="font-size: 0.72rem;">${dateRange} · ${formatCurrency(week.amount)}</div>
              </div>
              <button type="button" 
                      class="checklist-toggle-btn ${isPaid ? "checked" : ""}" 
                      data-week-id="${week.id}" 
                      data-student-id="${studentId}"
                      data-amount="${week.amount}"
                      title="Ubah status iuran">
                ${isPaid ? "✓ Lunas" : "Belum"}
              </button>
            </div>
          `;
        });

      historyHtml += `</div>`;
    }

    elements.paymentHistoryList.innerHTML = historyHtml || '<div class="empty-state">Belum ada data minggu kas.</div>';
  } catch (err) {
    console.error("Gagal render detail:", err);
  }
}

// 1-Tap Instant Toggle
elements.paymentHistoryList.addEventListener("click", async (event) => {
  const btn = event.target.closest(".checklist-toggle-btn");
  if (!btn) return;

  const studentId = btn.dataset.studentId;
  const weekId = btn.dataset.weekId;
  const amount = parseInt(btn.dataset.amount, 10) || 5000;

  const isCurrentlyChecked = btn.classList.contains("checked");
  btn.classList.toggle("checked", !isCurrentlyChecked);
  btn.textContent = !isCurrentlyChecked ? "✓ Lunas" : "Belum";

  try {
    const result = await toggleWeekPayment(studentId, weekId, amount);
    const weekObj = weeks.find((w) => w.id === weekId);
    const weekLabel = weekObj ? `${weekObj.month} Mgg ${weekObj.week_number}` : "Minggu";

    showToast(result.paid ? `✓ ${weekLabel} ditandai LUNAS` : `○ ${weekLabel} ditandai BELUM`);
    await loadData();
    await renderStudentDetailContent(studentId);
  } catch (err) {
    console.error("Toggle error:", err);
    btn.classList.toggle("checked", isCurrentlyChecked);
    btn.textContent = isCurrentlyChecked ? "✓ Lunas" : "Belum";
    showToast("Gagal mengubah status iuran");
  }
});

// Quick Pay
elements.quickPayBtn?.addEventListener("click", async () => {
  if (!currentDetailStudentId || !currentWeek) return;
  try {
    const res = await toggleWeekPayment(currentDetailStudentId, currentWeek.id, currentWeek.amount);
    showToast(res.paid ? "Minggu ini ditandai Lunas!" : "Minggu ini ditandai Belum");
    await loadData();
    await renderStudentDetailContent(currentDetailStudentId);
  } catch (err) {
    console.error("Quick pay error:", err);
  }
});

// Pay All Passed Weeks
elements.payAllPassedBtn?.addEventListener("click", async () => {
  if (!currentDetailStudentId) return;
  const today = new Date();
  const passedWeeks = weeks.filter((w) => new Date(w.start_date) <= today);

  try {
    for (const week of passedWeeks) {
      const status = await getStudentPaymentStatus(currentDetailStudentId, week.id);
      if (!status) {
        await insertPayment({
          student_id: currentDetailStudentId,
          week_id: week.id,
          amount: week.amount || 5000,
          recorded_by: "bendahara",
        });
      }
    }
    showToast("Semua minggu yang telah lewat ditandai Lunas!");
    await loadData();
    await renderStudentDetailContent(currentDetailStudentId);
  } catch (err) {
    console.error("Pay all error:", err);
    showToast("Gagal memproses pembayaran");
  }
});

// ============================================================
// PAYMENT DRAWER (MANUAL INPUT)
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

function openPaymentDrawer() {
  elements.paymentDrawer.classList.add("is-open");
  elements.paymentDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  elements.paymentForm.reset();
  elements.paymentError.classList.add("hidden");
}

function closePaymentDrawer() {
  elements.paymentDrawer.classList.remove("is-open");
  elements.paymentDrawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

elements.addPaymentBtn?.addEventListener("click", openPaymentDrawer);
elements.closePaymentDrawerBtn?.addEventListener("click", closePaymentDrawer);
elements.cancelPaymentDrawerBtn?.addEventListener("click", closePaymentDrawer);
elements.paymentDrawer?.addEventListener("click", (e) => {
  if (e.target === elements.paymentDrawer) closePaymentDrawer();
});

elements.paymentWeek?.addEventListener("change", () => {
  const selected = elements.paymentWeek.selectedOptions[0];
  if (selected && selected.dataset.amount) {
    elements.paymentAmount.value = selected.dataset.amount;
  }
});

elements.paymentForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const studentId = elements.paymentStudent.value;
  const weekId = elements.paymentWeek.value;
  const amount = parseInt(elements.paymentAmount.value, 10);

  if (!studentId || !weekId || !amount) return;

  elements.paymentSubmitBtn.disabled = true;
  elements.paymentSubmitBtn.textContent = "Menyimpan...";
  elements.paymentError.classList.add("hidden");

  try {
    const existing = await getStudentPaymentStatus(studentId, weekId);
    if (existing) {
      elements.paymentError.textContent = "Siswa sudah tercatat bayar pada minggu tersebut.";
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
    console.error("Save payment error:", err);
    elements.paymentError.textContent = err?.message || "Gagal mencatat pembayaran.";
    elements.paymentError.classList.remove("hidden");
  } finally {
    elements.paymentSubmitBtn.disabled = false;
    elements.paymentSubmitBtn.textContent = "Simpan";
  }
});

loadData();
