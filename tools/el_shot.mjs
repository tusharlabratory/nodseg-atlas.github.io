// Screenshot one element of a built page: node el_shot.mjs <path> <css selector> <out.png>
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
const BASE = "/nodseg-atlas.github.io";
const root = path.resolve("dist");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (!p.startsWith(BASE)) { res.writeHead(404); return res.end(); }
  p = path.join(root, p.slice(BASE.length));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, "index.html");
  if (!fs.existsSync(p)) { res.writeHead(404); return res.end("404"); }
  res.writeHead(200, { "content-type": types[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
}).listen(4322);
const [pg, sel, out] = process.argv.slice(2);
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1.5 });
await page.goto(`http://localhost:4322${BASE}${pg}`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.locator(sel).first().screenshot({ path: out });
await b.close(); srv.close();
