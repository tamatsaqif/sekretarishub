// ============================================================
// SUPABASE CONFIG & API CLIENT — Web Kelas 9 SCP 2
// ============================================================
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env.js";

const cleanUrl = (SUPABASE_URL || "").trim();
const cleanKey = (SUPABASE_ANON_KEY || "").trim();

const { createClient } = window.supabase || {};
const db = createClient && cleanUrl && cleanKey ? createClient(cleanUrl, cleanKey) : null;

// ============================================================
// AUTH HELPERS
// ============================================================
async function signIn(email, password) {
  if (!db) throw new Error("Supabase client belum terkonfigurasi.");
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOut() {
  if (!db) return;
  const { error } = await db.auth.signOut();
  if (error) throw error;
}

async function getSession() {
  if (!db) return null;
  try {
    const { data } = await db.auth.getSession();
    return data?.session || null;
  } catch {
    return null;
  }
}

function onAuthChange(callback) {
  if (!db) return () => {};
  const { data } = db.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => data?.subscription?.unsubscribe();
}

// ============================================================
// ATTENDANCE
// ============================================================
async function fetchAttendance(date) {
  if (!db) return {};
  const { data, error } = await db
    .from("attendance")
    .select("student_name, status")
    .eq("date", date);
  if (error) throw error;
  return Object.fromEntries((data || []).map((r) => [r.student_name, r.status]));
}

async function upsertAttendance(date, studentName, status) {
  if (!db) return;
  const { error } = await db.from("attendance").upsert(
    { date, student_name: studentName, status, updated_at: new Date().toISOString() },
    { onConflict: "date,student_name" }
  );
  if (error) throw error;
}

async function upsertAllAttendance(date, attendanceMap) {
  if (!db) return;
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
  if (!db) return [];
  const { data, error } = await db
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

async function insertTask(task) {
  if (!db) {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `t-${Date.now()}`,
      subject: task.subject,
      description: task.description,
      deadline: task.deadline,
      created_at: new Date().toISOString()
    };
  }
  const { data, error } = await db
    .from("tasks")
    .insert({ subject: task.subject, description: task.description, deadline: task.deadline })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function updateTask(id, task) {
  if (!db) return;
  const { error } = await db
    .from("tasks")
    .update({ subject: task.subject, description: task.description, deadline: task.deadline })
    .eq("id", id);
  if (error) throw error;
}

async function deleteTask(id) {
  if (!db) return;
  const { error } = await db.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================
// NOTES
// ============================================================
async function fetchNotes() {
  if (!db) return null;
  const { data, error } = await db
    .from("notes")
    .select("id, content")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function saveNotes(content, existingId = null) {
  if (!db) return;
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
  if (!db) return {};
  const { data, error } = await db.from("schedule").select("day, subjects");
  if (error) throw error;
  return Object.fromEntries((data || []).map((r) => [r.day, r.subjects]));
}

async function saveSchedule(day, subjects) {
  if (!db) return;
  const { error } = await db
    .from("schedule")
    .upsert({ day, subjects }, { onConflict: "day" });
  if (error) throw error;
}

// ============================================================
// PIKET
// ============================================================
async function fetchPiket() {
  if (!db) return {};
  const { data, error } = await db.from("piket").select("day, students");
  if (error) throw error;
  return Object.fromEntries((data || []).map((r) => [r.day, r.students]));
}

async function savePiket(day, students) {
  if (!db) return;
  const { error } = await db
    .from("piket")
    .upsert({ day, students }, { onConflict: "day" });
  if (error) throw error;
}

// ============================================================
// ANNOUNCEMENTS
// ============================================================
async function fetchAnnouncements() {
  if (!db) return [];
  try {
    const { data, error } = await db
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

async function insertAnnouncement(announcement) {
  if (!db) {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `a-${Date.now()}`,
      title: announcement.title,
      content: announcement.content,
      tag: announcement.tag || "Info",
      created_at: new Date().toISOString()
    };
  }
  try {
    const { data, error } = await db
      .from("announcements")
      .insert({
        title: announcement.title,
        content: announcement.content,
        tag: announcement.tag || "Info"
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `a-${Date.now()}`,
      title: announcement.title,
      content: announcement.content,
      tag: announcement.tag || "Info",
      created_at: new Date().toISOString()
    };
  }
}

async function deleteAnnouncement(id) {
  if (!db) return;
  try {
    await db.from("announcements").delete().eq("id", id);
  } catch {
    // fallback
  }
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
  fetchAnnouncements,
  insertAnnouncement,
  deleteAnnouncement,
};
