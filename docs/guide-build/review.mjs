// Renders ../ShaheenLMS-Guide.pdf pages to review/pNN.png (and contact sheets) with pdf.js in Chrome.
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const out = here('./review/');
mkdirSync(out, { recursive: true });
const files = {
  '/pdf.mjs': [here('./node_modules/pdfjs-dist/legacy/build/pdf.mjs'), 'text/javascript'],
  '/pdf.worker.mjs': [here('./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'), 'text/javascript'],
  '/guide.pdf': [here('../ShaheenLMS-Guide.pdf'), 'application/pdf'],
  '/': [null, 'text/html'],
};
const html = `<!doctype html><body style="margin:0;background:#888"><div id="w"></div><script type="module">
import * as pdfjs from '/pdf.mjs';
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
const doc = await pdfjs.getDocument('/guide.pdf').promise;
window.N = doc.numPages;
window.renderPage = async (i, scale) => {
  const p = await doc.getPage(i); const v = p.getViewport({ scale });
  const c = document.createElement('canvas'); c.width = v.width; c.height = v.height; c.id = 'c';
  document.getElementById('w').replaceChildren(c);
  await p.render({ canvasContext: c.getContext('2d'), viewport: v }).promise; return [v.width, v.height];
};
window.ready = true;
</script></body>`;

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1300, height: 1800 } });
await page.route('http://review.local/**', (r) => {
  const p = new URL(r.request().url()).pathname;
  const [f, type] = files[p] || [];
  if (!type) return r.fulfill({ status: 404 });
  r.fulfill({ status: 200, contentType: type, body: f ? readFileSync(f) : html });
});
await page.goto('http://review.local/');
await page.waitForFunction('window.ready');
const n = await page.evaluate('window.N');
const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
for (let i = 1; i <= n; i++) {
  if (only && !only.includes(i)) continue;
  const [w, h] = await page.evaluate(([i]) => window.renderPage(i, 1.4), [i]);
  await page.locator('#c').screenshot({ path: `${out}p${String(i).padStart(2, '0')}.png` });
}
await browser.close();
console.log('rendered', n);
