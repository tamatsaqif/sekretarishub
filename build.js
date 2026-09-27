// build.js — dijalankan Vercel saat deploy
// Baca env vars dan generate env.js untuk dipakai browser
import { writeFileSync, existsSync } from "fs";

const rawUrl = process.env.SUPABASE_URL || "";
const rawKey = process.env.SUPABASE_ANON_KEY || "";

const url = rawUrl.trim();
const key = rawKey.trim();

if (!url || !key) {
  if (existsSync("env.js")) {
    console.log("ℹ️ SUPABASE_URL / SUPABASE_ANON_KEY tidak ditemukan di env, menggunakan env.js yang sudah ada.");
  } else {
    console.warn("⚠️ SUPABASE_URL atau SUPABASE_ANON_KEY belum diset. Menulis placeholder env.js untuk mode lokal/offline.");
    const content = `// File ini di-generate otomatis saat build. Jangan edit manual.
export const SUPABASE_URL = "https://xxxxxx.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";
`;
    writeFileSync("env.js", content);
  }
} else {
  const content = `// File ini di-generate otomatis saat build. Jangan edit manual.
export const SUPABASE_URL = ${JSON.stringify(url)};
export const SUPABASE_ANON_KEY = ${JSON.stringify(key)};
`;
  writeFileSync("env.js", content);
  console.log("✅ env.js berhasil di-generate dari environment variables.");
}
