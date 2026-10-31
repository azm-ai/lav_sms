// Contact sheets of review/pNN.png, 8 pages each, for quick visual review.
import { chromium } from 'playwright-core';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const dir = fileURLToPath(new URL('./review/', import.meta.url));
const pngs = readdirSync(dir).filter(f => /^p\d+\.png$/.test(f)).sort();
const b = await chromium.launch({ channel: 'chrome' });
const pg = await b.newPage({ viewport: { width: 1600, height: 1200 } });
for (let s = 0; s < pngs.length; s += 8) {
  const imgs = pngs.slice(s, s + 8).map(f => `<figure><img src="data:image/png;base64,${readFileSync(dir + f).toString('base64')}"><figcaption>${f}</figcaption></figure>`).join('');
  await pg.setContent(`<body style="margin:0;background:#666;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px">${imgs.replace(/<figure>/g,'<figure style="margin:0;color:#fff;font:12px Arial">').replace(/<img /g,'<img style="width:100%;display:block;background:#fff" ')}</body>`);
  await pg.screenshot({ path: `${dir}sheet${s / 8 + 1}.png`, fullPage: true });
}
await b.close();
