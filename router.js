// ============================================================
// CLIENT-SIDE ROUTER FOR SCIENCE2HUB
// ============================================================

const routes = {
  "/": "/home.html",
  "/home": "/home.html",
  "/info": "/index.html",
  "/kas-kelas": "/kas-kelas.html",
};

function loadPage(path) {
  const targetPath = routes[path] || routes["/"];
  
  fetch(targetPath)
    .then((response) => {
      if (!response.ok) throw new Error("Page not found");
      return response.text();
    })
    .then((html) => {
      // Parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      
      // Replace body content
      document.body.innerHTML = doc.body.innerHTML;
      
      // Update title
      document.title = doc.title;
      
      // Re-execute scripts
      const scripts = doc.querySelectorAll("script");
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = oldScript.textContent;
        document.body.appendChild(newScript);
      });
    })
    .catch((err) => {
      console.error("Failed to load page:", err);
      document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; text-align: center;">
          <div>
            <h1 style="font-size: 3rem; margin: 0;">404</h1>
            <p style="margin: 10px 0;">Halaman tidak ditemukan</p>
            <a href="/" style="color: var(--accent);">← Kembali ke Dashboard</a>
          </div>
        </div>
      `;
    });
}

// Handle navigation
window.addEventListener("popstate", () => {
  loadPage(window.location.pathname);
});

// Intercept link clicks
document.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  
  const href = link.getAttribute("href");
  if (!href || href.startsWith("http") || href.startsWith("#")) return;
  
  event.preventDefault();
  window.history.pushState({}, "", href);
  loadPage(href);
});

// Initial load
if (window.location.pathname !== "/") {
  loadPage(window.location.pathname);
}
