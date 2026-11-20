// Screenshot the built site (dist/) at desktop and phone widths. Run in mcr.microsoft.com/playwright.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
const BASE = "/nodseg-atlas.github.io";
const root = path.resolve("dist");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".csv": "text/csv", ".png": "image/png" };
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (!p.startsWith(BASE)) { res.writeHead(404); return res.end(); }
  p = path.join(root, p.slice(BASE.length));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, "index.html");
  if (!fs.existsSync(p)) { res.writeHead(404); return res.end("404"); }
  res.writeHead(200, { "content-type": types[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
}).listen(4321);
const pages = process.argv.slice(2);
const browser = await chromium.launch();
const errors = [];
for (const [w, tag] of [[1280, "desktop"], [390, "phone"]]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => errors.push(`${tag} ${page.url()}: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`${tag} ${page.url()}: ${m.text()}`); });
  for (const p of pages) {
    await page.goto(`http://localhost:4321${BASE}${p}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(+(process.env.WAIT || 400));
    const name = (p.replace(/[/?=]/g, "_") || "_home").replace(/^_+|_+$/g, "") || "home";
    await page.screenshot({ path: `.shots/${tag}_${name}.png`, fullPage: true });
  }
  await page.close();
}
await browser.close();
srv.close();
console.log(errors.length ? errors.join("\n") : "no page errors");
