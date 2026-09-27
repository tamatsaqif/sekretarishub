// ============================================================
// KAS KELAS FUNCTIONS & DATA LAYER — 9 SCP 2
// ============================================================
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env.js";

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// DEFAULT FALLBACK DATA (Snapshot per 21 September 2026)
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

  // Mapping jumlah minggu yang sudah dibayar per siswa
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

const LOCAL_STORAGE_KEY_PAYMENTS = "sekretaris9scp2-kas-payments-v1";
const INITIAL_RECORDED_PAYMENTS = 785000;
const BASE_PHYSICAL_BALANCE = 840000;

function getLocalPayments() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PAYMENTS);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback
    }
  }
  const initial = createDefaultPayments();
  localStorage.setItem(LOCAL_STORAGE_KEY_PAYMENTS, JSON.stringify(initial));
  return initial;
}

function saveLocalPayments(payments) {
  localStorage.setItem(LOCAL_STORAGE_KEY_PAYMENTS, JSON.stringify(payments));
}

// ============================================================
// STUDENTS
// ============================================================
async function fetchStudents() {
  try {
    const { data, error } = await db
      .from("students")
      .select("id, name")
      .order("name", { ascending: true });
    if (error || !data || data.length === 0) throw error || new Error("No data");
    return data;
  } catch {
    return DEFAULT_STUDENTS;
  }
}

// ============================================================
// KAS_WEEKS
// ============================================================
async function fetchKasWeeks() {
  try {
    const { data, error } = await db
      .from("kas_weeks")
      .select("*")
      .order("start_date", { ascending: false });
    if (error || !data || data.length === 0) throw error || new Error("No data");
    return data;
  } catch {
    return DEFAULT_WEEKS;
  }
}

async function getCurrentWeek() {
  const today = new Date().toISOString().split("T")[0];
  try {
    const { data, error } = await db
      .from("kas_weeks")
      .select("*")
      .lte("start_date", today)
      .gte("end_date", today)
      .maybeSingle();
    if (error || !data) throw error || new Error("No current week");
    return data;
  } catch {
    return (
      DEFAULT_WEEKS.find((w) => w.start_date <= today && w.end_date >= today) ||
      DEFAULT_WEEKS.find((w) => w.id === "w-sep-4") ||
      DEFAULT_WEEKS[0]
    );
  }
}

// ============================================================
// KAS_PAYMENTS
// ============================================================
async function fetchAllPayments() {
  try {
    const { data, error } = await db
      .from("kas_payments")
      .select("id, student_id, week_id, amount, paid_at, recorded_by");
    if (error || !data || data.length === 0) throw error || new Error("No data");
    return data;
  } catch {
    return getLocalPayments();
  }
}

async function fetchPaymentsByStudent(studentId) {
  try {
    const { data, error } = await db
      .from("kas_payments")
      .select(`
        id,
        amount,
        paid_at,
        week:kas_weeks (
          id,
          month,
          week_number,
          start_date,
          end_date
        )
      `)
      .eq("student_id", studentId)
      .order("paid_at", { ascending: false });
    if (error || !data || data.length === 0) throw error || new Error("No data");
    return data;
  } catch {
    const all = getLocalPayments();
    const studentPayments = all.filter((p) => p.student_id === studentId);
    return studentPayments.map((p) => {
      const week = DEFAULT_WEEKS.find((w) => w.id === p.week_id) || {
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
}

async function fetchPaymentsByWeek(weekId) {
  try {
    const { data, error } = await db
      .from("kas_payments")
      .select(`
        id,
        amount,
        paid_at,
        recorded_by,
        student:students (id, name)
      `)
      .eq("week_id", weekId)
      .order("student.name", { ascending: true });
    if (error || !data || data.length === 0) throw error || new Error("No data");
    return data;
  } catch {
    const all = getLocalPayments();
    return all.filter((p) => p.week_id === weekId);
  }
}

async function insertPayment(data) {
  try {
    const { error } = await db.from("kas_payments").insert(data);
    if (error) console.warn("Supabase insert payment skipped:", error.message);
  } catch (err) {
    console.warn("Supabase insert payment failed:", err);
  }

  // Always persist locally
  const current = getLocalPayments();
  const exists = current.some((p) => p.student_id === data.student_id && p.week_id === data.week_id);
  if (!exists) {
    const newPayment = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      student_id: data.student_id,
      week_id: data.week_id,
      amount: Number(data.amount) || 5000,
      paid_at: new Date().toISOString(),
      recorded_by: data.recorded_by || "bendahara"
    };
    current.push(newPayment);
    saveLocalPayments(current);
  }
}

async function updatePayment(id, data) {
  try {
    await db.from("kas_payments").update(data).eq("id", id);
  } catch (err) {
    console.warn(err);
  }
}

async function deletePayment(id, studentId = null, weekId = null) {
  try {
    if (id) {
      await db.from("kas_payments").delete().eq("id", id);
    } else if (studentId && weekId) {
      await db.from("kas_payments").delete().eq("student_id", studentId).eq("week_id", weekId);
    }
  } catch (err) {
    console.warn("Supabase delete skipped:", err);
  }

  const current = getLocalPayments().filter((p) => {
    if (id && p.id === id) return false;
    if (studentId && weekId && p.student_id === studentId && p.week_id === weekId) return false;
    return true;
  });
  saveLocalPayments(current);
}

async function getStudentPaymentStatus(studentId, weekId) {
  try {
    const { data, error } = await db
      .from("kas_payments")
      .select("id, amount")
      .eq("student_id", studentId)
      .eq("week_id", weekId)
      .maybeSingle();
    if (error) throw error;
    if (data) return data;
  } catch {
    // fallback
  }

  const all = getLocalPayments();
  return all.find((p) => p.student_id === studentId && p.week_id === weekId) || null;
}

// ============================================================
// KAS_EXPENSES
// ============================================================
async function fetchExpenses() {
  try {
    const { data, error } = await db
      .from("kas_expenses")
      .select("*")
      .order("expense_date", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

async function insertExpense(data) {
  try {
    await db.from("kas_expenses").insert(data);
  } catch (err) {
    console.warn(err);
  }
}

async function updateExpense(id, data) {
  try {
    await db.from("kas_expenses").update(data).eq("id", id);
  } catch (err) {
    console.warn(err);
  }
}

async function deleteExpense(id) {
  try {
    await db.from("kas_expenses").delete().eq("id", id);
  } catch (err) {
    console.warn(err);
  }
}

// ============================================================
// KAS_ROLES
// ============================================================
async function isBendahara() {
  try {
    const { data: session } = await db.auth.getSession();
    if (!session?.session) return false;
    const email = session.session.user?.email;
    if (!email) return false;

    const { data, error } = await db
      .from("kas_roles")
      .select("role")
      .eq("user_email", email)
      .maybeSingle();

    if (error) throw error;
    return data?.role === "bendahara" || email.includes("bendahara") || email.includes("admin");
  } catch {
    return false;
  }
}

// ============================================================
// KAS CALCULATIONS
// ============================================================
async function getKasSummary() {
  const allPayments = await fetchAllPayments();
  const expenses = await fetchExpenses();

  const totalIncome = allPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  
  // Realtime balance: Base snapshot (Rp 840.000) + difference in collected payments - expenses
  const balance = BASE_PHYSICAL_BALANCE + (totalIncome - INITIAL_RECORDED_PAYMENTS) - totalExpense;

  return { totalIncome, totalExpense, balance };
}

async function getTotalOutstanding() {
  const studentsList = await fetchStudents();
  const weeksList = await fetchKasWeeks();
  const paymentsList = await fetchAllPayments();

  // Target deadline per September Minggu ke-4 (10 minggu @ Rp 5.000 = Rp 50.000 per siswa)
  const today = new Date();
  const targetWeeks = weeksList.filter((w) => new Date(w.start_date) <= today);
  const targetPerStudent = targetWeeks.reduce((sum, w) => sum + (Number(w.amount) || 5000), 0);
  const totalTarget = studentsList.length * targetPerStudent;

  const totalPaid = paymentsList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const outstanding = Math.max(0, totalTarget - totalPaid);

  return outstanding;
}

async function toggleWeekPayment(studentId, weekId, amount = 5000) {
  const existing = await getStudentPaymentStatus(studentId, weekId);
  if (existing) {
    await deletePayment(existing.id, studentId, weekId);
    return { paid: false, payment: null };
  } else {
    const paymentData = {
      student_id: studentId,
      week_id: weekId,
      amount: Number(amount) || 5000,
      recorded_by: "bendahara"
    };
    await insertPayment(paymentData);
    return { paid: true, payment: paymentData };
  }
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
};
