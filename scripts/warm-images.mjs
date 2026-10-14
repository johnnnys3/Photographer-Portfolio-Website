// Pre-builds the Next image-optimizer cache in dev: crawls the pages, then requests every
// /_next/image variant they reference so the first real visit hits a warm cache.
// Usage: npm run warm   (dev server must be running; BASE=http://localhost:3001 to override)
const base = process.env.BASE || 'http://localhost:3000';

const html = async (path) => (await fetch(base + path)).text();
const links = (h, re) => [...new Set([...h.matchAll(re)].map((m) => m[1]))];

const pages = new Set(['/', '/work']);
for (const p of ['/', '/work']) {
  for (const slug of links(await html(p), /href="(\/work\/[a-z0-9-]+)"/g)) pages.add(slug);
}

const images = new Set();
for (const p of pages) {
  for (const u of links(await html(p), /(\/_next\/image\?[^"\s,]+)/g)) images.add(u.replaceAll('&amp;', '&'));
}

const t = performance.now();
let n = 0;
const queue = [...images];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    for (let u; (u = queue.pop()); ) {
      await fetch(base + u).then((r) => r.arrayBuffer()).catch(() => {});
      n++;
    }
  }),
);
console.log(`${pages.size} pages, warmed ${n} images in ${((performance.now() - t) / 1000).toFixed(1)}s`);
