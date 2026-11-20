// Publication-style SVG figures for the Build page (no titles, no top/right spines, UA colors).
import { seqColor, inkFor } from "./lib.js";

const FONT = "DM Sans, Arial, Helvetica, sans-serif";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const f2 = (x) => x.toFixed(2).replace("-", "−");
const txt = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${o.size ?? 11}" fill="${o.fill ?? "#1e293b"}"${o.anchor ? ` text-anchor="${o.anchor}"` : ""}${o.weight ? ` font-weight="${o.weight}"` : ""}${o.italic ? ' font-style="italic"' : ""}>${esc(s)}</text>`;

function ticks(lo, hi) {
  const span = hi - lo, step = [0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 25, 50, 100].find((x) => span / x <= 10) ?? 100;
  const out = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(3));
  return out;
}
const tk = (t) => (Math.abs(t) < 1e-9 ? "0" : Math.abs(t) >= 2 ? String(Math.round(t)).replace("-", "−") : (Math.round(t * 100) % 10 ? t.toFixed(2) : t.toFixed(1)).replace("-", "−"));

// rows: [{task:label, items:[{name, est, lo, hi, color, comparator, hollow, note}]}]
export function forestSVG(blocks, { width = 760, axisLabel = "AUC (95% CI)", range = null, ref = 0.5, digits = 2 } = {}) {
  const rowH = 17, headH = 22, labelW = 230, valW = 128, padT = 8, padB = 46;
  const all = blocks.flatMap((b) => b.items.filter((i) => i.est != null));
  let lo = Math.min(0.5, ...all.map((i) => i.lo)), hi = Math.max(...all.map((i) => i.hi), 0.6);
  lo = Math.floor(lo * 10) / 10; hi = Math.min(1, Math.ceil(hi * 10) / 10);
  if (range) [lo, hi] = range;
  const fd = (x) => (Math.abs(x) < 0.5 * 10 ** -digits ? 0 : x).toFixed(digits).replace("-", "−");
  const plotW = width - labelW - valW - 16;
  const X = (v) => labelW + ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * plotW;
  let y = padT, body = "";
  for (const b of blocks) {
    y += headH;
    body += txt(4, y - 6, b.task, { weight: 700, size: 11.5, fill: "#0f172a" });
    for (const it of b.items) {
      y += rowH;
      const cy = y - rowH / 2 + 1;
      body += txt(16, cy + 4, it.name, { italic: it.comparator, fill: it.comparator ? "#475569" : "#1e293b" });
      if (it.est == null) { body += txt(X(lo) + 4, cy + 4, it.note || "excluded: pretraining overlap", { size: 10, fill: "#64748b", italic: true }); continue; }
      const c = it.color || "#0c234b";
      body += `<line x1="${X(Math.max(lo, it.lo ?? it.est))}" x2="${X(Math.min(hi, it.hi ?? it.est))}" y1="${cy}" y2="${cy}" stroke="${c}" stroke-width="1.6"/>`;
      body += it.comparator
        ? `<path d="M${X(it.est)},${cy - 5}l5,5l-5,5l-5,-5z" fill="${it.hollow ? "#fff" : c}" stroke="${c}" stroke-width="1.4"/>`
        : `<circle cx="${X(it.est)}" cy="${cy}" r="4.2" fill="${it.hollow ? "#fff" : c}" stroke="${c}" stroke-width="1.4"/>`;
      body += txt(width - 4, cy + 4, it.constant ? `${fd(it.est)}, constant scores` : it.lo == null ? fd(it.est) : `${fd(it.est)} (${fd(it.lo)}, ${fd(it.hi)})`, { anchor: "end", size: 10.5, italic: it.constant });
    }
    y += 4;
  }
  const H = y + padB;
  let axis = `<line x1="${X(lo)}" x2="${X(hi)}" y1="${y + 4}" y2="${y + 4}" stroke="#334155"/>`;
  for (const t of ticks(lo, hi)) axis += `<line x1="${X(t)}" x2="${X(t)}" y1="${y + 4}" y2="${y + 8}" stroke="#334155"/>` + txt(X(t), y + 20, tk(t), { anchor: "middle", size: 10.5 });
  axis += txt((X(lo) + X(hi)) / 2, y + 38, axisLabel, { anchor: "middle", size: 11 });
  const refl = ref != null && lo <= ref && ref <= hi ? `<line x1="${X(ref)}" x2="${X(ref)}" y1="${padT + 6}" y2="${y + 4}" stroke="#94a3b8" stroke-dasharray="4 3"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${H}" viewBox="0 0 ${width} ${H}"><rect width="100%" height="100%" fill="#fff"/>${refl}${body}${axis}</svg>`;
}

// rows: names; cols: [{label, sub}]; val(r, c) -> {v, excluded}
export function heatSVG(rows, cols, val, { sepAfter = null, comparatorRows = new Set(), color = (v) => seqColor(v), fmt = (v) => f2(v).replace(/^0/, ""), key = null } = {}) {
  const cw = 46, ch = 24, labelW = 190, headH = 120, pad = 10;
  const W = labelW + cols.length * cw + pad * 2, H = headH + rows.length * ch + pad * 2 + 40;
  let s = `<defs><pattern id="hx" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fff"/><line x1="0" y1="0" x2="0" y2="6" stroke="#cbd5e1" stroke-width="2"/></pattern></defs>`;
  cols.forEach((c, j) => {
    const x = labelW + pad + j * cw + cw / 2;
    s += `<text transform="translate(${x + 4},${headH - 4}) rotate(-60)" font-family="${FONT}" font-size="10.5" fill="#1e293b">${esc(c.label)}</text>`;
  });
  rows.forEach((r, i) => {
    const y = headH + pad + i * ch + (sepAfter != null && i > sepAfter ? 6 : 0);
    s += txt(labelW + pad - 6, y + ch / 2 + 4, r, { anchor: "end", italic: comparatorRows.has(r), fill: comparatorRows.has(r) ? "#475569" : "#1e293b" });
    cols.forEach((c, j) => {
      const x = labelW + pad + j * cw, v = val(r, c);
      if (!v) { s += `<rect x="${x + 1}" y="${y + 1}" width="${cw - 2}" height="${ch - 2}" rx="3" fill="#f1f5f9"/>`; return; }
      if (v.excluded) { s += `<rect x="${x + 1}" y="${y + 1}" width="${cw - 2}" height="${ch - 2}" rx="3" fill="url(#hx)"/>`; return; }
      const bg = color(v.v);
      s += `<rect x="${x + 1}" y="${y + 1}" width="${cw - 2}" height="${ch - 2}" rx="3" fill="${bg}"/>` + txt(x + cw / 2, y + ch / 2 + 4, fmt(v.v), { anchor: "middle", size: 10.5, fill: inkFor(bg), weight: 600 });
    });
  });
  // color key
  const ky = headH + pad + rows.length * ch + 20, kx = labelW + pad;
  const K = key ?? { values: [0.5, 0.6, 0.7, 0.8, 0.9], label: "AUC · hatched = excluded for pretraining overlap" };
  K.values.forEach((v, k) => { s += `<rect x="${kx + k * 34}" y="${ky}" width="34" height="10" fill="${color(v)}"/>` + txt(kx + k * 34, ky + 24, fmt(v), { size: 10 }); });
  s += txt(kx + K.values.length * 34 + 10, ky + 9, K.label, { size: 10, fill: "#475569" });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + 10}" viewBox="0 0 ${W} ${H + 10}"><rect width="100%" height="100%" fill="#fff"/>${s}</svg>`;
}

// items: [{name, mean, min, max, color, comparator, k, n}]
export function rankSVG(items, { width = 720, axisLabel = "Mean AUC over the selected tasks", range = null, digits = 2 } = {}) {
  const rowH = 20, labelW = 220, valW = 70, padT = 10, padB = 46;
  let lo = Math.floor(Math.min(0.5, ...items.map((i) => i.min)) * 10) / 10, hi = Math.min(1, Math.ceil(Math.max(...items.map((i) => i.max)) * 10) / 10);
  if (range) [lo, hi] = range;
  const plotW = width - labelW - valW - 10, X = (v) => labelW + ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * plotW;
  let s = "", y = padT;
  items.forEach((it) => {
    y += rowH; const cy = y - rowH / 2;
    s += txt(labelW - 8, cy + 4, it.name + (it.k < it.n ? ` (${it.k} of ${it.n})` : ""), { anchor: "end", italic: it.comparator, fill: it.comparator ? "#475569" : "#1e293b" });
    s += `<line x1="${X(it.min)}" x2="${X(it.max)}" y1="${cy}" y2="${cy}" stroke="${it.color}" stroke-opacity=".45" stroke-width="5" stroke-linecap="round"/>`;
    s += it.comparator ? `<path d="M${X(it.mean)},${cy - 5.5}l5.5,5.5l-5.5,5.5l-5.5,-5.5z" fill="${it.color}"/>` : `<circle cx="${X(it.mean)}" cy="${cy}" r="5" fill="${it.color}"/>`;
    s += txt(width - 4, cy + 4, it.mean.toFixed(digits).replace("-", "−"), { anchor: "end", size: 10.5, weight: 600 });
  });
  let axis = `<line x1="${X(lo)}" x2="${X(hi)}" y1="${y + 6}" y2="${y + 6}" stroke="#334155"/>`;
  for (const t of ticks(lo, hi)) axis += `<line x1="${X(t)}" x2="${X(t)}" y1="${y + 6}" y2="${y + 10}" stroke="#334155"/>` + txt(X(t), y + 22, tk(t), { anchor: "middle", size: 10.5 });
  axis += txt((X(lo) + X(hi)) / 2, y + 40, axisLabel, { anchor: "middle", size: 11 });
  const ref = lo <= 0.5 ? `<line x1="${X(0.5)}" x2="${X(0.5)}" y1="${padT}" y2="${y + 6}" stroke="#94a3b8" stroke-dasharray="4 3"/>` : "";
  const H = y + padB;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${H}" viewBox="0 0 ${width} ${H}"><rect width="100%" height="100%" fill="#fff"/>${ref}${s}${axis}</svg>`;
}

export function download(name, data, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data], { type }));
  a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
export function downloadPNG(name, svg, scale = 3) {
  const m = svg.match(/width="(\d+(?:\.\d+)?)" height="(\d+(?:\.\d+)?)"/);
  const w = +m[1], h = +m[2];
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas"); c.width = w * scale; c.height = h * scale;
    const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.scale(scale, scale); g.drawImage(img, 0, 0);
    c.toBlob((b) => { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name; a.click(); }, "image/png");
  };
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
