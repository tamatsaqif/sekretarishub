// ============================================================
// SUPABASE CONFIG
// Key dibaca dari env.js yang di-generate saat build Vercel.
// Set env vars di: Vercel Dashboard → Project → Settings → Environment Variables
//   SUPABASE_URL       = https://xxxxxx.supabase.co
//   SUPABASE_ANON_KEY  = eyJ...  (anon/public key, bukan service_role!)
// ============================================================
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env.js";

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// AUTH HELPERS
// ============================================================

async function signIn(email, password) {
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOut() {
  const { error } = await db.auth.signOut();
  if (error) throw error;
}

async function getSession() {
  const { data } = await db.auth.getSession();
  return data.session;
}

function onAuthChange(callback) {
  db.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

// ============================================================
// ATTENDANCE
// ============================================================

async function fetchAttendance(date) {
  // date: "YYYY-MM-DD"
  const { data, error } = await db
    .from("attendance")
    .select("student_name, status")
    .eq("date", date);
  if (error) throw error;
  return Object.fromEntries(data.map((r) => [r.student_name, r.status]));
}

async function upsertAttendance(date, studentName, status) {
  const { error } = await db.from("attendance").upsert(
    { date, student_name: studentName, status, updated_at: new Date().toISOString() },
    { onConflict: "date,student_name" }
  );
  if (error) throw error;
}

async function upsertAllAttendance(date, attendanceMap) {
  const rows = Object.entries(attendanceMap).map(([student_name, status]) => ({
    date,
    student_name,
    status,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await db
    .from("attendance")
    .upsert(rows, { onConflict: "date,student_name" });
  if (error) throw error;
}

// ============================================================
// TASKS
// ============================================================

async function fetchTasks() {
  const { data, error } = await db
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

async function insertTask(task) {
  const { data, error } = await db
    .from("tasks")
    .insert({ subject: task.subject, description: task.description, deadline: task.deadline })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function updateTask(id, task) {
  const { error } = await db
    .from("tasks")
    .update({ subject: task.subject, description: task.description, deadline: task.deadline })
    .eq("id", id);
  if (error) throw error;
}

async function deleteTask(id) {
  const { error } = await db.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================
// NOTES
// ============================================================

async function fetchNotes() {
  const { data, error } = await db
    .from("notes")
    .select("id, content")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function saveNotes(content, existingId = null) {
  if (existingId) {
    const { error } = await db
      .from("notes")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", existingId);
    if (error) throw error;
  } else {
    const { error } = await db
      .from("notes")
      .insert({ content, updated_at: new Date().toISOString() });
    if (error) throw error;
  }
}

// ============================================================
// SCHEDULE
// ============================================================

async function fetchSchedule() {
  const { data, error } = await db.from("schedule").select("day, subjects");
  if (error) throw error;
  return Object.fromEntries(data.map((r) => [r.day, r.subjects]));
}

async function saveSchedule(day, subjects) {
  const { error } = await db
    .from("schedule")
    .upsert({ day, subjects }, { onConflict: "day" });
  if (error) throw error;
}

// ============================================================
// PIKET
// ============================================================

async function fetchPiket() {
  const { data, error } = await db.from("piket").select("day, students");
  if (error) throw error;
  return Object.fromEntries(data.map((r) => [r.day, r.students]));
}

async function savePiket(day, students) {
  const { error } = await db
    .from("piket")
    .upsert({ day, students }, { onConflict: "day" });
  if (error) throw error;
}

export {
  db,
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
};
