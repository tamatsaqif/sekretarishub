// build.js — dijalankan Vercel saat deploy
// Baca env vars dan generate env.js untuk dipakai browser
import { writeFileSync } from "fs";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("❌ SUPABASE_URL atau SUPABASE_ANON_KEY belum diset di Vercel Environment Variables!");
  process.exit(1);
}

const content = `// File ini di-generate otomatis saat build. Jangan edit manual.
export const SUPABASE_URL = ${JSON.stringify(url)};
export const SUPABASE_ANON_KEY = ${JSON.stringify(key)};
`;

writeFileSync("env.js", content);
console.log("✅ env.js berhasil di-generate.");
