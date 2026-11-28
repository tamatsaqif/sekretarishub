// make-bundle.cjs — jalankan: node make-bundle.cjs
// Menggabungkan env.js + supabase.js + shared.js jadi bundle.js tanpa import/export

const fs = require("fs");
const path = require("path");

const DIR = __dirname;

function read(file) {
  return fs.readFileSync(path.join(DIR, file), "utf8");
}

// ── env.js ──────────────────────────────────────────────────
let envSrc = read("env.js");
// Hapus export keyword
envSrc = envSrc.replace(/^export const /gm, "const ");

// ── supabase.js ──────────────────────────────────────────────
let supSrc = read("supabase.js");
// Hapus import env
supSrc = supSrc.replace(/^import\s+\{[^}]+\}\s+from\s+["']\.\/env\.js["'];?\s*\n?/m, "");
// Hapus export block di akhir
supSrc = supSrc.replace(/\nexport\s*\{[^}]*\};?\s*$/, "");

// ── shared.js ──────────────────────────────────────────────
let sharedSrc = read("shared.js");
// Hapus import supabase
sharedSrc = sharedSrc.replace(/^import\s+\{[^}]+\}\s+from\s+["']\.\/supabase\.js["'];?\s*\n?/m, "");
// Hapus export block di akhir
sharedSrc = sharedSrc.replace(/\nexport\s*\{[^}]*\};?\s*$/, "");

// ── Gabungkan semua jadi IIFE + window exports ──────────────
const bundle = `// bundle.js — AUTO-GENERATED, jangan edit manual
// Generated: ${new Date().toISOString()}
(function (window) {
  "use strict";

  // ── ENV ─────────────────────────────────────────────────
${indent(envSrc, 2)}

  // ── SUPABASE ─────────────────────────────────────────────
${indent(supSrc, 2)}

  // ── SHARED ───────────────────────────────────────────────
${indent(sharedSrc, 2)}

  // ── EXPORT KE WINDOW ────────────────────────────────────
  window.WK = {
    // env
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    // supabase
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
    // shared
    initTheme,
    toggleTheme,
    STUDENTS,
    WEEKDAYS,
    DAY_LABELS_ID,
    MONTH_NAMES,
    COMPLETED_TASKS_KEY,
    TASKS_STORAGE_KEY,
    getCompletedTaskIds,
    saveCompletedTaskId,
    escapeHtml,
    formatStudentName,
    getInitials,
    getDateKey,
    formatDate,
    formatCurrency,
    deadlineToInput,
    formatDeadline,
    getDeadlineUrgency,
    showToast,
    initGridPulse,
    setupNavigation,
  };

})(window);
`;

function indent(src, spaces) {
  const pad = " ".repeat(spaces);
  return src.split("\n").map(line => line ? pad + line : "").join("\n");
}

fs.writeFileSync(path.join(DIR, "bundle.js"), bundle, "utf8");
console.log("✅ bundle.js berhasil dibuat (" + bundle.length + " chars)");
