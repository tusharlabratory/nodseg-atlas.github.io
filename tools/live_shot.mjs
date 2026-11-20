import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto("https://tusharlabratory.github.io/nodseg-atlas.github.io/explorer/", { waitUntil: "networkidle" });
await p.waitForTimeout(800); await p.screenshot({ path: ".shots/live_explorer.png" });
console.log(errs.length ? errs.join("\n") : "live: no page errors"); await b.close();
