// Dev server — jalankan dengan: node dev-server.js
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = 3000;

const MIME = {
  html: "text/html; charset=utf-8",
  js: "application/javascript; charset=utf-8",
  css: "text/css; charset=utf-8",
  json: "application/json; charset=utf-8",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  png: "image/png",
  jpg: "image/jpeg",
  woff2: "font/woff2",
  woff: "font/woff",
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  let filePath = path.join(ROOT, urlPath);

  // Directory → index.html
  if (urlPath === "/" || urlPath === "") {
    filePath = path.join(ROOT, "index.html");
  }

  // Extensionless path → try .html
  if (!path.extname(filePath) && !fs.existsSync(filePath)) {
    filePath += ".html";
  }

  try {
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const ct = MIME[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": ct,
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(data);
    console.log(`200 ${req.url}`);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found: " + req.url);
    console.log(`404 ${req.url}`);
  }
}).listen(PORT, () => {
  console.log(`\nDev server running at http://localhost:${PORT}\n`);
});
