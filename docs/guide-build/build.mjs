// Builds ../ShaheenLMS-Guide.pdf from guide.html.
// 1. inject TOC, figures and page markers  2. render with Chrome
// 3. read marker pages with pdf.js, fill TOC page numbers, render again
// 4. stamp running header and footer with pdf-lib
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const legend = JSON.parse(readFileSync(here('./shots/legend.json'), 'utf8'));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();

let src = readFileSync(here('./guide.html'), 'utf8');
const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
src = src.replace('{{DATE}}', date);

// figures from screenshots + legend.json
src = src.replace(/<figure data-shot="([^"]+)" class="([^"]*)" data-cap="([^"]*)"><\/figure>/g, (_, id, cls, cap) => {
  const l = legend[id];
  if (!l || l.error) throw new Error('missing screenshot ' + id);
  const items = (l.callouts || []).map(c => `<li><span class="n">${c.n}</span><span>${esc(c.label)}</span></li>`).join('');
  return `<figure class="${cls}"><img src="shots/${id}.jpg" alt="${esc(cap)}"><figcaption>${cap}</figcaption>${items ? `<ol class="legend">${items}</ol>` : ''}</figure>`;
});

// headings with data-toc get ids and invisible markers
const toc = [];
src = src.replace(/<(h1|h2|h3)([^>]*?) data-toc="([^"]+)"([^>]*)>([\s\S]*?)<\/\1>/g, (_, tag, a, id, b, inner) => {
  toc.push({ id, tag, text: strip(inner) });
  return `<${tag}${a} id="${id}"${b}><span class="mk">QQ${id.replace(/-/g, '')}QQ</span>${inner}</${tag}>`;
});

function tocHtml(pages = {}) {
  return toc.map(t => {
    const cls = t.tag === 'h1' ? 't-part' : t.tag === 'h2' ? 't-ch' : 't-sub';
    const label = t.tag === 'h1' ? (t.id === 'partA' ? 'Part A · ' : t.id === 'partB' ? 'Part B · ' : 'Appendices · ') + t.text : t.text;
    return `<div class="${cls}"><a href="#${t.id}"><span>${esc(label)}</span><span class="dots"></span><span class="pg">${pages[t.id] ?? '00'}</span></a></div>`;
  }).join('\n');
}

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();

async function render(pages) {
  const html = src.replace('<nav id="toc"><!-- filled by build.mjs --></nav>', `<nav id="toc">${tocHtml(pages)}</nav>`);
  writeFileSync(here('./out.html'), html);
  await page.goto(pathToFileURL(here('./out.html')).href, { waitUntil: 'networkidle' });
  return page.pdf({ format: 'A4', preferCSSPageSize: true, printBackground: true, outline: true, tagged: true });
}

async function markerPages(buf) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), useSystemFonts: true }).promise;
  const found = {};
  for (let i = 1; i <= doc.numPages; i++) {
    const tc = await (await doc.getPage(i)).getTextContent();
    const txt = tc.items.map(it => it.str).join('');
    for (const t of toc) if (found[t.id] == null && txt.includes('QQ' + t.id.replace(/-/g, '') + 'QQ')) found[t.id] = i;
  }
  return { found, n: doc.numPages };
}

let buf = await render();
let { found } = await markerPages(buf);
buf = await render(found);
const second = await markerPages(buf);
const drift = toc.filter(t => second.found[t.id] !== found[t.id]).map(t => t.id);
if (drift.length) { found = second.found; buf = await render(found); }
const missing = toc.filter(t => found[t.id] == null).map(t => t.id);
await browser.close();

// running header (current chapter) and footer
const pdf = await PDFDocument.load(buf);
const font = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
const green = rgb(0x16 / 255, 0x65 / 255, 0x34 / 255);
const grey = rgb(0.38, 0.42, 0.40);
const line = rgb(0.86, 0.9, 0.87);
const chapters = toc.filter(t => t.tag !== 'h3' && found[t.id]).sort((a, b) => found[a.id] - found[b.id]);
const pages = pdf.getPages();
const total = pages.length;
const mm = 72 / 25.4;
pages.forEach((p, i) => {
  const n = i + 1;
  if (n === 1) return; // cover carries its own band: Made by TenH Tech · tenhtech.com
  const { width, height } = p.getSize();
  const cur = [...chapters].reverse().find(c => found[c.id] <= n);
  const part = [...chapters].reverse().find(c => c.tag === 'h1' && found[c.id] <= n);
  const partName = !part ? '' : part.id === 'partA' ? 'Part A' : part.id === 'partB' ? 'Part B' : 'Appendices';
  const head = n === 2 ? 'Contents' : cur ? (cur.tag === 'h1' ? partName : `${partName}  ·  ${cur.text}`) : '';
  // header
  p.drawText('ShaheenLMS Guide', { x: 16 * mm, y: height - 12 * mm, size: 8, font: bold, color: green });
  const hw = font.widthOfTextAtSize(head, 8);
  p.drawText(head, { x: width - 16 * mm - hw, y: height - 12 * mm, size: 8, font, color: grey });
  p.drawLine({ start: { x: 16 * mm, y: height - 14 * mm }, end: { x: width - 16 * mm, y: height - 14 * mm }, thickness: 0.6, color: line });
  // footer
  p.drawLine({ start: { x: 16 * mm, y: 12.5 * mm }, end: { x: width - 16 * mm, y: 12.5 * mm }, thickness: 0.6, color: line });
  p.drawText('Made by', { x: 16 * mm, y: 8 * mm, size: 8, font, color: grey });
  p.drawText('TenH Tech', { x: 16 * mm + font.widthOfTextAtSize('Made by ', 8), y: 8 * mm, size: 8, font: bold, color: green });
  const pg = `Page ${n} of ${total}`;
  p.drawText(pg, { x: width - 16 * mm - font.widthOfTextAtSize(pg, 8), y: 8 * mm, size: 8, font, color: grey });
});
pdf.setTitle('ShaheenLMS Guide');
pdf.setAuthor('TenH Tech');
pdf.setSubject('Owner, developer and institute manual for ShaheenLMS');
writeFileSync(here('../ShaheenLMS-Guide.pdf'), await pdf.save());
console.log(JSON.stringify({ pages: total, drift, missing, toc: Object.fromEntries(toc.map(t => [t.id, found[t.id]])) }));
