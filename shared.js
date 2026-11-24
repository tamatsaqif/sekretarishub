// ============================================================
// SHARED UTILITIES & UNIFIED NAVIGATION — Web Kelas 9 SCP 2
// ============================================================
import { signIn, signOut, getSession, onAuthChange } from "./supabase.js";

export const STUDENTS = [
  "ADZKIYA SAFWA ANAKA",
  "ALIYAH NUR LATHIFAH",
  "ALTHAF ZISAN AYDIN R",
  "ANDI NAUFAL N",
  "ASHFA HADZIQ H",
  "ASYIFA NAISILA JELITA",
  "BETHARI JANITRA IW",
  "BILLIE RAIHAN SAPUTRA",
  "DAFFA RIDHO ALGHANI",
  "DELISA ASZAHRA P",
  "DHAFIN DZIMAR",
  "DIMAS NARENDRA W",
  "DIRA SHASMIRA RIANTI",
  "EDDLYN ARSY ZUHAIR",
  "FADIPTA JAVAS A",
  "KEI EZHAR ABHIMATA",
  "KENZO JABBAR LEBCCA",
  "MALVINO APRILIO PI",
  "MARITZA ADILIA S",
  "MOCH DAFFA RAFANDRA",
  "MOCH NABIL DAVIAN N",
  "MUH GHAISAN WIMIANO",
  "MUH RAFA RABBANI H",
  "MUH RAFI SYAHPUTRA A",
  "NAURA KARENZA A Z",
  "NAYOTTAMA AR",
  "SABRINA VIDI ARETHA",
  "VELIKA JASMIN CK",
  "VINNO IBRAHIM A",
  "WIDYATAMAKA ZAYYAN",
  "YUDHISTIRA PERWIRA W",
  "ZAHRA LAILIA R",
  "ZUHAL ABDILLAH AFKAR"
];

export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const DAY_LABELS_ID = {
  Monday: "Senin",
  Tuesday: "Selasa",
  Wednesday: "Rabu",
  Thursday: "Kamis",
  Friday: "Jumat"
};

export const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export const COMPLETED_TASKS_KEY = "sekretaris9scp2-completed-tasks";
export const TASKS_STORAGE_KEY = "sekretaris9scp2-tasks-list";

export function getCompletedTaskIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(COMPLETED_TASKS_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export function saveCompletedTaskId(id, isCompleted) {
  const set = getCompletedTaskIds();
  if (isCompleted) {
    set.add(id);
  } else {
    set.delete(id);
  }
  localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify([...set]));
  return set;
}

// ============================================================
// FORMATTERS & HELPERS
// ============================================================
export function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatStudentName(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function getDateKey(date = new Date()) {
  const weekday = date.getDay();
  const map = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const key = map[weekday];
  return ["Saturday", "Sunday"].includes(key) ? "Monday" : key;
}

export function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(amount || 0);
}

export function deadlineToInput(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/,\s*(\d{1,2})\s+([A-Za-z]+)/);
  if (!match) return "";
  const month = MONTH_NAMES.findIndex((name) => name.toLowerCase() === match[2].toLowerCase());
  if (month < 0) return "";
  return `${new Date().getFullYear()}-${String(month + 1).padStart(2, "0")}-${String(match[1]).padStart(2, "0")}`;
}

export function formatDeadline(value) {
  const input = deadlineToInput(value);
  if (!input) return value || "";
  const date = new Date(`${input}T00:00:00`);
  return `${new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(date)}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
}

export function getDeadlineUrgency(value) {
  const input = deadlineToInput(value);
  if (!input) return { label: value || "—", urgentClass: "" };
  const target = new Date(`${input}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `Lewat (${formatDeadline(value)})`, urgentClass: "urgent" };
  } else if (diffDays === 0) {
    return { label: `Hari Ini (${formatDeadline(value)})`, urgentClass: "urgent" };
  } else if (diffDays === 1) {
    return { label: `Besok (${formatDeadline(value)})`, urgentClass: "soon" };
  } else if (diffDays <= 3) {
    return { label: `${diffDays} hari lagi (${formatDeadline(value)})`, urgentClass: "soon" };
  } else {
    return { label: formatDeadline(value), urgentClass: "" };
  }
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================
export function showToast(message, type = "success") {
  let container = document.querySelector("#toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");

  const iconSvg =
    type === "error"
      ? `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
      : `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  toast.innerHTML = `${iconSvg} <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-exit");
    setTimeout(() => toast.remove(), 260);
  }, 2600);
}

// ============================================================
// CANVAS GRID PULSE ANIMATION
// ============================================================
export function initGridPulse() {
  const canvas = document.querySelector("#gridPulseCanvas");
  const context = canvas?.getContext("2d");
  if (!canvas || !context || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const cellSize = 28;
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

  const light = (column, row, hold = 800) => {
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
        if (Math.hypot(x, y) <= 2.4 && Math.random() > 0.3) {
          light(column + x, row + y, 600 + Math.random() * 800);
        }
      }
    }
  };

  const draw = (now) => {
    frame = 0;
    context.clearRect(0, 0, width, height);
    context.strokeStyle = "rgba(0, 0, 0, 0.04)";
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
      const alpha = Math.min(0.35, Math.min(1, elapsed / 180) * Math.min(1, remaining / 600) * 0.35);
      context.fillStyle = `rgba(29, 29, 31, ${alpha})`;
      context.fillRect(cell.column * cellSize + 2, cell.row * cellSize + 2, cellSize - 3, cellSize - 3);
    }

    if (cells.size) frame = requestAnimationFrame(draw);
  };

  const ambient = window.setInterval(() => {
    light(Math.floor(Math.random() * columns), Math.floor(Math.random() * rows), 2000 + Math.random() * 1000);
  }, 4000);

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
// SHARED NAVIGATION & AUTH MODAL
// ============================================================
export function setupNavigation(activePage = "home") {
  const headerContainer = document.querySelector("#siteHeader");
  if (!headerContainer) return;

  const navItems = [
    {
      key: "home", label: "Home", href: "/",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
    },
    {
      key: "daily-info", label: "Daily Info", href: "/daily-info",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`
    },
    {
      key: "tugas", label: "Tugas", href: "/tugas",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`
    },
    {
      key: "piket", label: "Piket", href: "/piket",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`
    },
    {
      key: "anggota", label: "Anggota", href: "/anggota",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
    },
  ];

  // ── Minimal top bar ──
  headerContainer.innerHTML = `
    <div class="topbar-inner">
      <a href="/" class="brand-group" aria-label="Web Kelas 9 SCP 2">
        <span class="brand-badge">9 SCP 2</span>
        <span class="brand-title">Class Space</span>
      </a>
      <div class="topbar-actions">
        <span id="globalAdminBadge" class="admin-badge hidden">
          <span id="globalAdminRoleText">Pengurus</span>
        </span>
        <button id="globalLogoutBtn" class="btn-ghost btn-sm hidden" type="button" aria-label="Keluar">
          <span>Keluar</span>
        </button>
        <button id="globalLoginBtn" class="secret-login-btn" type="button" title="Masuk Mode Pengurus" aria-label="Login pengurus">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="1.5"></circle><circle cx="19" cy="12" r="1.5"></circle><circle cx="5" cy="12" r="1.5"></circle></svg>
        </button>
      </div>
    </div>
  `;

  // ── Bottom dock ──
  let dockWrapper = document.querySelector("#mainDockWrapper");
  if (!dockWrapper) {
    dockWrapper = document.createElement("div");
    dockWrapper.id = "mainDockWrapper";
    dockWrapper.className = "dock-wrapper";
    dockWrapper.innerHTML = `
      <nav class="dock" role="toolbar" aria-label="Navigasi Utama">
        ${navItems.map((item) => `
          <a href="${item.href}"
             class="dock-item${item.key === activePage ? " dock-active" : ""}"
             aria-label="${item.label}"
             aria-current="${item.key === activePage ? "page" : "false"}">
            <span class="dock-label">${item.label}</span>
            <div class="dock-icon-wrap">
              ${item.icon}
            </div>
            <span class="dock-active-dot"></span>
          </a>
        `).join("")}
      </nav>
    `;
    document.body.appendChild(dockWrapper);
  }

  // ── Auth Modal ──
  let authModal = document.querySelector("#authLoginModal");
  if (!authModal) {
    authModal = document.createElement("div");
    authModal.id = "authLoginModal";
    authModal.className = "drawer-backdrop";
    authModal.setAttribute("aria-hidden", "true");
    authModal.innerHTML = `
      <div class="drawer-panel" style="max-width: 420px;" role="dialog" aria-modal="true" aria-labelledby="authDialogTitle">
        <div class="drawer-head">
          <div class="drawer-title-group">
            <span class="drawer-tag">Autentikasi</span>
            <h3 id="authDialogTitle">Mode Pengurus</h3>
          </div>
          <button type="button" class="drawer-close-btn" id="closeAuthModalBtn" aria-label="Tutup form login">×</button>
        </div>
        <form id="globalLoginForm" class="drawer-form">
          <div class="drawer-body">
            <p class="text-secondary" style="font-size: 0.875rem; margin-bottom: 16px;">
              Masuk sebagai Sekretaris atau Bendahara untuk sinkronisasi data kelas.
            </p>
            <div class="field-group">
              <label for="authInputUser">Username / Email</label>
              <input id="authInputUser" type="text" placeholder="Masukkan username" required autocomplete="username" />
            </div>
            <div class="field-group">
              <label for="authInputPass">Kata Sandi</label>
              <input id="authInputPass" type="password" placeholder="••••••••" required autocomplete="current-password" />
            </div>
            <p id="authErrorMsg" class="form-error hidden" role="alert" style="margin-top: 8px;"></p>
          </div>
          <div class="drawer-footer">
            <button type="button" class="btn-secondary" id="cancelAuthModalBtn">Batal</button>
            <button type="submit" class="btn-primary" id="submitAuthBtn">Masuk</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(authModal);
  }

  // ── Event handlers ──
  const openLoginBtn = document.querySelector("#globalLoginBtn");
  const logoutBtn = document.querySelector("#globalLogoutBtn");
  const adminBadge = document.querySelector("#globalAdminBadge");
  const adminRoleText = document.querySelector("#globalAdminRoleText");
  const closeAuthModalBtn = document.querySelector("#closeAuthModalBtn");
  const cancelAuthModalBtn = document.querySelector("#cancelAuthModalBtn");
  const loginForm = document.querySelector("#globalLoginForm");
  const authErrorMsg = document.querySelector("#authErrorMsg");
  const authSubmitBtn = document.querySelector("#submitAuthBtn");

  const openDrawer = (el) => {
    if (!el) return;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = (el) => {
    if (!el) return;
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const openAuth = () => {
    openDrawer(authModal);
    if (authErrorMsg) {
      authErrorMsg.classList.add("hidden");
      authErrorMsg.textContent = "";
    }
    loginForm?.reset();
  };

  const closeAuth = () => closeDrawer(authModal);

  openLoginBtn?.addEventListener("click", openAuth);
  closeAuthModalBtn?.addEventListener("click", closeAuth);
  cancelAuthModalBtn?.addEventListener("click", closeAuth);
  authModal?.addEventListener("click", (e) => {
    if (e.target === authModal) closeAuth();
  });

  logoutBtn?.addEventListener("click", async () => {
    try {
      await signOut();
      showToast("Berhasil keluar.");
      syncAuthState(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  });

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const rawUser = document.querySelector("#authInputUser")?.value.trim().toLowerCase() || "";
    const pass = document.querySelector("#authInputPass")?.value || "";

    const email = rawUser.includes("@") ? rawUser : `${rawUser}@sekretaris.local`;

    if (authSubmitBtn) {
      authSubmitBtn.disabled = true;
      authSubmitBtn.textContent = "Memproses...";
    }
    authErrorMsg?.classList.add("hidden");

    try {
      const session = await signIn(email, pass);
      closeAuth();
      showToast("Berhasil masuk!");
      syncAuthState(session);
      window.dispatchEvent(new CustomEvent("app:auth-changed", { detail: session }));
    } catch (err) {
      console.error("Login failed:", err);
      if (authErrorMsg) {
        authErrorMsg.textContent = err?.message || "Username atau kata sandi tidak sesuai.";
        authErrorMsg.classList.remove("hidden");
      }
    } finally {
      if (authSubmitBtn) {
        authSubmitBtn.disabled = false;
        authSubmitBtn.textContent = "Masuk";
      }
    }
  });

  function syncAuthState(session) {
    const isLoggedIn = !!session;
    openLoginBtn?.classList.toggle("hidden", isLoggedIn);
    logoutBtn?.classList.toggle("hidden", !isLoggedIn);
    adminBadge?.classList.toggle("hidden", !isLoggedIn);

    if (isLoggedIn && adminRoleText) {
      const email = session?.user?.email || "";
      const name = email.split("@")[0] || "Pengurus";
      adminRoleText.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    }

    document.querySelectorAll(".admin-only").forEach((el) => {
      el.classList.toggle("hidden", !isLoggedIn);
    });
  }

  getSession().then((session) => syncAuthState(session));
  onAuthChange((session) => syncAuthState(session));

  // ── Dock magnification (desktop only) ──
  const dockEl = document.querySelector(".dock");
  if (dockEl && !window.matchMedia("(hover: none)").matches) {
    const dockItems = Array.from(dockEl.querySelectorAll(".dock-item"));
    const BASE = 48;
    const MAX = 76;
    const RANGE = 130;

    dockEl.addEventListener("mousemove", (e) => {
      dockItems.forEach((item) => {
        const wrap = item.querySelector(".dock-icon-wrap");
        if (!wrap) return;
        const rect = wrap.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const dist = Math.abs(e.clientX - cx);
        const t = Math.max(0, 1 - dist / RANGE);
        const size = BASE + (MAX - BASE) * t * t * (3 - 2 * t); // smoothstep
        wrap.style.width = size + "px";
        wrap.style.height = size + "px";
        const svg = wrap.querySelector("svg");
        if (svg) {
          const iconSize = Math.round(size * 0.42);
          svg.style.width = iconSize + "px";
          svg.style.height = iconSize + "px";
        }
      });
    });

    dockEl.addEventListener("mouseleave", () => {
      dockItems.forEach((item) => {
        const wrap = item.querySelector(".dock-icon-wrap");
        if (!wrap) return;
        wrap.style.width = "";
        wrap.style.height = "";
        const svg = wrap.querySelector("svg");
        if (svg) {
          svg.style.width = "";
          svg.style.height = "";
        }
      });
    });
  }

  // Universal Link Routing for local development server support
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

    if ((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && !href.endsWith(".html")) {
      event.preventDefault();
      const target = href === "/" || href === "/home" ? "/index.html" : `${href}.html`;
      window.location.href = target;
    }
  });
}
