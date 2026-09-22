// ============================================================
// KAS KELAS SUPABASE FUNCTIONS
// ============================================================
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env.js";

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// STUDENTS
// ============================================================

async function fetchStudents() {
  const { data, error } = await db
    .from("students")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}

// ============================================================
// KAS_WEEKS
// ============================================================

async function fetchKasWeeks() {
  const { data, error } = await db
    .from("kas_weeks")
    .select("*")
    .order("start_date", { ascending: false });
  if (error) throw error;
  return data;
}

async function getCurrentWeek() {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await db
    .from("kas_weeks")
    .select("*")
    .lte("start_date", today)
    .gte("end_date", today)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ============================================================
// KAS_PAYMENTS
// ============================================================

async function fetchPaymentsByStudent(studentId) {
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
  if (error) throw error;
  return data;
}

async function fetchPaymentsByWeek(weekId) {
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
  if (error) throw error;
  return data;
}

async function insertPayment(data) {
  const { error } = await db.from("kas_payments").insert(data);
  if (error) throw error;
}

async function updatePayment(id, data) {
  const { error } = await db
    .from("kas_payments")
    .update(data)
    .eq("id", id);
  if (error) throw error;
}

async function deletePayment(id) {
  const { error } = await db
    .from("kas_payments")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

async function getStudentPaymentStatus(studentId, weekId) {
  const { data, error } = await db
    .from("kas_payments")
    .select("id, amount")
    .eq("student_id", studentId)
    .eq("week_id", weekId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ============================================================
// KAS_EXPENSES
// ============================================================

async function fetchExpenses() {
  const { data, error } = await db
    .from("kas_expenses")
    .select("*")
    .order("expense_date", { ascending: false });
  if (error) throw error;
  return data;
}

async function insertExpense(data) {
  const { error } = await db.from("kas_expenses").insert(data);
  if (error) throw error;
}

async function updateExpense(id, data) {
  const { error } = await db
    .from("kas_expenses")
    .update(data)
    .eq("id", id);
  if (error) throw error;
}

async function deleteExpense(id) {
  const { error } = await db
    .from("kas_expenses")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ============================================================
// KAS_ROLES (Role check)
// ============================================================

async function isBendahara() {
  const { data: session } = await db.auth.getSession();
  if (!session) return false;

  const email = session.user?.email;
  if (!email) return false;

  const { data, error } = await db
    .from("kas_roles")
    .select("role")
    .eq("user_email", email)
    .maybeSingle();

  if (error) throw error;
  return data?.role === "bendahara";
}

// ============================================================
// KAS CALCULATIONS
// ============================================================

async function getKasSummary() {
  // Total pemasukan
  const { data: payments, error: paymentsError } = await db
    .from("kas_payments")
    .select("amount");
  if (paymentsError) throw paymentsError;
  const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);

  // Total pengeluaran
  const { data: expenses, error: expensesError } = await db
    .from("kas_expenses")
    .select("amount");
  if (expensesError) throw expensesError;
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Saldo
  const balance = totalIncome - totalExpense;

  return { totalIncome, totalExpense, balance };
}

export {
  db,
  fetchStudents,
  fetchKasWeeks,
  getCurrentWeek,
  fetchPaymentsByStudent,
  fetchPaymentsByWeek,
  insertPayment,
  updatePayment,
  deletePayment,
  getStudentPaymentStatus,
  fetchExpenses,
  insertExpense,
  updateExpense,
  deleteExpense,
  isBendahara,
  getKasSummary,
};
