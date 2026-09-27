// ============================================================
// KAS KELAS FUNCTIONS & DATA STORE — 9 SCP 2
// ============================================================
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env.js";

const { createClient } = window.supabase || {};
const db = createClient ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// ============================================================
// DEFAULT SEED DATA (Snapshot per 21 September 2026)
// ============================================================
const DEFAULT_STUDENTS = [
  { id: "s-1", name: "ADZKIYA SAFWA ANAKA" },
  { id: "s-2", name: "ALIYAH NUR LATHIFAH" },
  { id: "s-3", name: "ALTHAF ZISAN AYDIN R" },
  { id: "s-4", name: "ANDI NAUFAL N" },
  { id: "s-5", name: "ASHFA HADZIQ H" },
  { id: "s-6", name: "ASYIFA NAISILA JELITA" },
  { id: "s-7", name: "BETHARI JANITRA IW" },
  { id: "s-8", name: "BILLIE RAIHAN SAPUTRA" },
  { id: "s-9", name: "DAFFA RIDHO ALGHANI" },
  { id: "s-10", name: "DELISA ASZAHRA P" },
  { id: "s-11", name: "DHAFIN DZIMAR" },
  { id: "s-12", name: "DIMAS NARENDRA W" },
  { id: "s-13", name: "DIRA SHASMIRA RIANTI" },
  { id: "s-14", name: "EDDLYN ARSY ZUHAIR" },
  { id: "s-15", name: "FADIPTA JAVAS A" },
  { id: "s-16", name: "KEI EZHAR ABHIMATA" },
  { id: "s-17", name: "KENZO JABBAR LEBCCA" },
  { id: "s-18", name: "MALVINO APRILIO PI" },
  { id: "s-19", name: "MARITZA ADILIA S" },
  { id: "s-20", name: "MOCH DAFFA RAFANDRA" },
  { id: "s-21", name: "MOCH NABIL DAVIAN N" },
  { id: "s-22", name: "MUH GHAISAN WIMIANO" },
  { id: "s-23", name: "MUH RAFA RABBANI H" },
  { id: "s-24", name: "MUH RAFI SYAHPUTRA A" },
  { id: "s-25", name: "NAURA KARENZA A Z" },
  { id: "s-26", name: "NAYOTTAMA AR" },
  { id: "s-27", name: "SABRINA VIDI ARETHA" },
  { id: "s-28", name: "VELIKA JASMIN CK" },
  { id: "s-29", name: "VINNO IBRAHIM A" },
  { id: "s-30", name: "WIDYATAMAKA ZAYYAN" },
  { id: "s-31", name: "YUDHISTIRA PERWIRA W" },
  { id: "s-32", name: "ZAHRA LAILIA R" },
  { id: "s-33", name: "ZUHAL ABDILLAH AFKAR" }
];

const DEFAULT_WEEKS = [
  { id: "w-jul-3", month: "Juli 2026", week_number: 3, start_date: "2026-07-13", end_date: "2026-07-19", amount: 5000 },
  { id: "w-jul-4", month: "Juli 2026", week_number: 4, start_date: "2026-07-20", end_date: "2026-07-26", amount: 5000 },
  { id: "w-ags-1", month: "Agustus 2026", week_number: 1, start_date: "2026-08-03", end_date: "2026-08-09", amount: 5000 },
  { id: "w-ags-2", month: "Agustus 2026", week_number: 2, start_date: "2026-08-10", end_date: "2026-08-16", amount: 5000 },
  { id: "w-ags-3", month: "Agustus 2026", week_number: 3, start_date: "2026-08-17", end_date: "2026-08-23", amount: 5000 },
  { id: "w-ags-4", month: "Agustus 2026", week_number: 4, start_date: "2026-08-24", end_date: "2026-08-30", amount: 5000 },
  { id: "w-sep-1", month: "September 2026", week_number: 1, start_date: "2026-08-31", end_date: "2026-09-06", amount: 5000 },
  { id: "w-sep-2", month: "September 2026", week_number: 2, start_date: "2026-09-07", end_date: "2026-09-13", amount: 5000 },
  { id: "w-sep-3", month: "September 2026", week_number: 3, start_date: "2026-09-14", end_date: "2026-09-20", amount: 5000 },
  { id: "w-sep-4", month: "September 2026", week_number: 4, start_date: "2026-09-21", end_date: "2026-09-27", amount: 5000 },
  { id: "w-okt-1", month: "Oktober 2026", week_number: 1, start_date: "2026-09-28", end_date: "2026-10-04", amount: 5000 },
  { id: "w-okt-2", month: "Oktober 2026", week_number: 2, start_date: "2026-10-05", end_date: "2026-10-11", amount: 5000 },
  { id: "w-okt-3", month: "Oktober 2026", week_number: 3, start_date: "2026-10-12", end_date: "2026-10-18", amount: 5000 },
  { id: "w-okt-4", month: "Oktober 2026", week_number: 4, start_date: "2026-10-19", end_date: "2026-10-25", amount: 5000 }
];

function createDefaultPayments() {
  const weekIds = [
    "w-jul-3", "w-jul-4",
    "w-ags-1", "w-ags-2", "w-ags-3", "w-ags-4",
    "w-sep-1", "w-sep-2", "w-sep-3", "w-sep-4",
    "w-okt-1", "w-okt-2"
  ];

  const studentPaidWeeks = {
    "s-1": 9,   // Adzkiya (tunggakan 5k)
    "s-2": 8,   // Aliya (tunggakan 10k)
    "s-3": 0,   // Althaf (50k)
    "s-4": 0,   // Andi (50k)
    "s-5": 5,   // Ashfa (25k)
    "s-6": 8,   // Asyifa (10k)
    "s-7": 10,  // Bethari (Lunas s/d Sept w4)
    "s-8": 0,   // Billie (50k)
    "s-9": 0,   // Daffa Ridho (50k)
    "s-10": 10, // Delisa (Lunas)
    "s-11": 12, // Dhafin (Lunas s/d Okt w2)
    "s-12": 0,  // Dimas (50k)
    "s-13": 9,  // Dira (5k)
    "s-14": 0,  // Eddlyn (50k)
    "s-15": 9,  // Fadipta (5k)
    "s-16": 0,  // Kei Ezhar (50k)
    "s-17": 8,  // Kenzo (10k)
    "s-18": 8,  // Malvino (10k)
    "s-19": 8,  // Maritza (10k)
    "s-20": 0,  // Daffa R.P (50k)
    "s-21": 5,  // Nabil (25k)
    "s-22": 0,  // Ghaisan (50k)
    "s-23": 0,  // Rafa (50k)
    "s-24": 3,  // Rafi (35k)
    "s-25": 8,  // Naura (10k)
    "s-26": 0,  // Nayottama (50k)
    "s-27": 10, // Sabrina (Lunas)
    "s-28": 7,  // Velika (15k)
    "s-29": 0,  // Vinno (50k)
    "s-30": 9,  // Widyatamaka (5k)
    "s-31": 0,  // Yudhistira (50k)
    "s-32": 11, // Zahra (Lunas s/d Okt w1)
    "s-33": 0   // Zuhal (50k)
  };

  const payments = [];
  let pIdx = 1;
  for (const [studentId, count] of Object.entries(studentPaidWeeks)) {
    for (let i = 0; i < count; i++) {
      const weekId = weekIds[i];
      if (weekId) {
        payments.push({
          id: `p-${pIdx++}`,
          student_id: studentId,
          week_id: weekId,
          amount: 5000,
          paid_at: "2026-09-21T08:00:00Z",
          recorded_by: "initial_snapshot"
        });
      }
    }
  }
  return payments;
}

// ============================================================
// UNIFIED LOCAL STORE (Source of Truth)
// ============================================================
const KAS_STORAGE_KEY = "sekretaris9scp2-kas-unified-store-v2";
const INITIAL_RECORDED_PAYMENTS = 785000;
const BASE_PHYSICAL_BALANCE = 840000;

let kasState = {
  students: DEFAULT_STUDENTS,
  weeks: DEFAULT_WEEKS,
  payments: createDefaultPayments(),
  expenses: [],
  baseBalance: BASE_PHYSICAL_BALANCE,
};

function loadKasState() {
  if (typeof localStorage === "undefined") return kasState;
  const raw = localStorage.getItem(KAS_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.payments)) {
        kasState.students = (parsed.students && parsed.students.length) ? parsed.students : DEFAULT_STUDENTS;
        kasState.weeks = (parsed.weeks && parsed.weeks.length) ? parsed.weeks : DEFAULT_WEEKS;
        kasState.payments = parsed.payments;
        kasState.expenses = parsed.expenses || [];
        kasState.baseBalance = parsed.baseBalance || BASE_PHYSICAL_BALANCE;
        return kasState;
      }
    } catch {
      // fallback
    }
  }

  kasState.students = DEFAULT_STUDENTS;
  kasState.weeks = DEFAULT_WEEKS;
  kasState.payments = createDefaultPayments();
  kasState.expenses = [];
  kasState.baseBalance = BASE_PHYSICAL_BALANCE;
  saveKasState();
  return kasState;
}

function saveKasState() {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KAS_STORAGE_KEY, JSON.stringify(kasState));
}

// Initialize immediately
loadKasState();

// ============================================================
// DATA ACCESSORS (Fast, Local & Realtime)
// ============================================================
async function fetchStudents() {
  loadKasState();
  return kasState.students;
}

async function fetchKasWeeks() {
  loadKasState();
  return kasState.weeks;
}

async function getCurrentWeek() {
  loadKasState();
  const today = new Date().toISOString().split("T")[0];
  return (
    kasState.weeks.find((w) => w.start_date <= today && w.end_date >= today) ||
    kasState.weeks.find((w) => w.id === "w-sep-4") ||
    kasState.weeks[0]
  );
}

async function fetchAllPayments() {
  loadKasState();
  return kasState.payments;
}

async function fetchPaymentsByStudent(studentId) {
  loadKasState();
  const studentPayments = kasState.payments.filter((p) => p.student_id === studentId);
  return studentPayments.map((p) => {
    const week = kasState.weeks.find((w) => w.id === p.week_id) || {
      id: p.week_id,
      month: "September 2026",
      week_number: 4,
      start_date: "2026-09-21",
      end_date: "2026-09-27"
    };
    return {
      id: p.id,
      amount: p.amount,
      paid_at: p.paid_at,
      week_id: p.week_id,
      student_id: p.student_id,
      week
    };
  });
}

async function fetchPaymentsByWeek(weekId) {
  loadKasState();
  return kasState.payments.filter((p) => p.week_id === weekId);
}

async function getStudentPaymentStatus(studentId, weekId) {
  loadKasState();
  return kasState.payments.find((p) => p.student_id === studentId && p.week_id === weekId) || null;
}

async function insertPayment(data) {
  loadKasState();
  const studentId = data.student_id;
  const weekId = data.week_id;
  const amount = Number(data.amount) || 5000;

  const existingIdx = kasState.payments.findIndex((p) => p.student_id === studentId && p.week_id === weekId);
  if (existingIdx >= 0) {
    kasState.payments[existingIdx].amount = amount;
  } else {
    kasState.payments.push({
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      student_id: studentId,
      week_id: weekId,
      amount,
      paid_at: new Date().toISOString(),
      recorded_by: data.recorded_by || "bendahara"
    });
  }
  saveKasState();

  if (db) {
    db.from("kas_payments")
      .insert({
        student_id: studentId,
        week_id: weekId,
        amount,
        recorded_by: data.recorded_by || "bendahara"
      })
      .then(() => {})
      .catch(() => {});
  }
}

async function deletePayment(id, studentId = null, weekId = null) {
  loadKasState();
  kasState.payments = kasState.payments.filter((p) => {
    if (id && p.id === id) return false;
    if (studentId && weekId && p.student_id === studentId && p.week_id === weekId) return false;
    return true;
  });
  saveKasState();

  if (db) {
    if (id) {
      db.from("kas_payments").delete().eq("id", id).then(() => {}).catch(() => {});
    } else if (studentId && weekId) {
      db.from("kas_payments").delete().eq("student_id", studentId).eq("week_id", weekId).then(() => {}).catch(() => {});
    }
  }
}

async function updatePayment(id, data) {
  loadKasState();
  const idx = kasState.payments.findIndex((p) => p.id === id);
  if (idx >= 0) {
    kasState.payments[idx] = { ...kasState.payments[idx], ...data };
    saveKasState();
  }
}

async function toggleWeekPayment(studentId, weekId, amount = 5000) {
  loadKasState();
  const existingIdx = kasState.payments.findIndex((p) => p.student_id === studentId && p.week_id === weekId);

  if (existingIdx >= 0) {
    const deletedId = kasState.payments[existingIdx].id;
    kasState.payments.splice(existingIdx, 1);
    saveKasState();

    if (db && deletedId) {
      db.from("kas_payments").delete().eq("id", deletedId).then(() => {}).catch(() => {});
    }
    return { paid: false, payment: null };
  } else {
    const newPayment = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      student_id: studentId,
      week_id: weekId,
      amount: Number(amount) || 5000,
      paid_at: new Date().toISOString(),
      recorded_by: "bendahara"
    };
    kasState.payments.push(newPayment);
    saveKasState();

    if (db) {
      db.from("kas_payments")
        .insert({
          student_id: studentId,
          week_id: weekId,
          amount: Number(amount) || 5000,
          recorded_by: "bendahara"
        })
        .then(() => {})
        .catch(() => {});
    }
    return { paid: true, payment: newPayment };
  }
}

// ============================================================
// EXPENSES & CALCULATIONS
// ============================================================
async function fetchExpenses() {
  loadKasState();
  return kasState.expenses;
}

async function insertExpense(data) {
  loadKasState();
  kasState.expenses.push({
    id: `e-${Date.now()}`,
    amount: Number(data.amount) || 0,
    description: data.description || "",
    expense_date: data.expense_date || new Date().toISOString().split("T")[0],
    recorded_by: data.recorded_by || "bendahara"
  });
  saveKasState();
}

async function updateExpense(id, data) {
  loadKasState();
  const idx = kasState.expenses.findIndex((e) => e.id === id);
  if (idx >= 0) {
    kasState.expenses[idx] = { ...kasState.expenses[idx], ...data };
    saveKasState();
  }
}

async function deleteExpense(id) {
  loadKasState();
  kasState.expenses = kasState.expenses.filter((e) => e.id !== id);
  saveKasState();
}

async function isBendahara() {
  return true;
}

async function getKasSummary() {
  loadKasState();
  const totalIncome = kasState.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalExpense = kasState.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  
  const balance = kasState.baseBalance + (totalIncome - INITIAL_RECORDED_PAYMENTS) - totalExpense;

  return { totalIncome, totalExpense, balance };
}

async function getTotalOutstanding() {
  loadKasState();
  const today = new Date();
  const targetWeeks = kasState.weeks.filter((w) => new Date(w.start_date) <= today);
  const targetPerStudent = targetWeeks.reduce((sum, w) => sum + (Number(w.amount) || 5000), 0);
  const totalTarget = kasState.students.length * targetPerStudent;

  const totalPaid = kasState.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const outstanding = Math.max(0, totalTarget - totalPaid);

  return outstanding;
}

export {
  db,
  fetchStudents,
  fetchKasWeeks,
  getCurrentWeek,
  fetchPaymentsByStudent,
  fetchAllPayments,
  fetchPaymentsByWeek,
  insertPayment,
  updatePayment,
  deletePayment,
  toggleWeekPayment,
  getStudentPaymentStatus,
  fetchExpenses,
  insertExpense,
  updateExpense,
  deleteExpense,
  isBendahara,
  getKasSummary,
  getTotalOutstanding,
  loadKasState,
  saveKasState
};
