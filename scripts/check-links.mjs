// Link check: starts the production server (run `npm run build` first), crawls every internal
// link reachable from "/" plus sitemap.xml, and exits 1 if anything is not a 200.
import { spawn } from 'node:child_process';

const PORT = process.env.PORT || '3199';
const BASE = `http://localhost:${PORT}`;
const server = spawn('npx', ['next', 'start', '-p', PORT], { stdio: 'ignore' });
const stop = () => server.kill();
process.on('exit', stop);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; ; i++) {
  try {
    if ((await fetch(BASE)).ok) break;
  } catch {}
  if (i > 60) {
    console.error('Server did not start');
    process.exit(1);
  }
  await sleep(500);
}

const seen = new Set();
const queue = ['/', '/sitemap.xml', '/robots.txt', '/llms.txt'];
const broken = [];

// Sitemap URLs are absolute (site.url); keep only their path.
const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
for (const [, loc] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) queue.push(new URL(loc).pathname);

while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);
  const res = await fetch(BASE + path, { redirect: 'manual' });
  if (res.status >= 300 && res.status < 400) {
    queue.push(new URL(res.headers.get('location'), BASE).pathname);
    continue;
  }
  if (res.status !== 200) {
    broken.push(`${res.status} ${path}`);
    continue;
  }
  if (!(res.headers.get('content-type') || '').includes('text/html')) continue;
  const html = await res.text();
  for (const [, href] of html.matchAll(/href="(\/[^"#?]*)/g)) if (!href.startsWith('/_next')) queue.push(href);
}

console.log(`Checked ${seen.size} URLs`);
if (broken.length) {
  console.error('Broken links:\n' + broken.join('\n'));
  process.exit(1);
}
console.log('No broken links.');
process.exit(0);
