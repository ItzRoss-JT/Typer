import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(ROOT, 'temporary screenshots');

// On this machine the bundled Chrome binary fails to spawn (macOS error -88),
// but chrome-headless-shell works. Resolve a working binary at runtime.
async function resolveChromiumExecutable() {
  const cacheRoot = path.join(os.homedir(), '.cache', 'puppeteer', 'chrome-headless-shell');
  try {
    const entries = await fs.readdir(cacheRoot);
    for (const entry of entries) {
      const candidate = path.join(cacheRoot, entry, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell');
      try {
        await fs.access(candidate);
        return candidate;
      } catch {
        // try next
      }
    }
  } catch {
    // fall through
  }
  return undefined;
}

const url = process.argv[2];
const label = process.argv[3];

if (!url) {
  console.error('Usage: node screenshot.mjs <url> [label]');
  console.error('Example: node screenshot.mjs http://localhost:3000');
  console.error('Example: node screenshot.mjs http://localhost:3000 mobile');
  process.exit(1);
}

await fs.mkdir(OUT_DIR, { recursive: true });

const existing = await fs.readdir(OUT_DIR);
let maxN = 0;
for (const name of existing) {
  const m = name.match(/^screenshot-(\d+)(?:-.*)?\.png$/);
  if (m) maxN = Math.max(maxN, parseInt(m[1], 10));
}
const n = maxN + 1;
const filename = label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`;
const outPath = path.join(OUT_DIR, filename);

const executablePath = await resolveChromiumExecutable();
const browser = await puppeteer.launch({
  headless: true,
  executablePath,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`Saved: ${outPath}`);
} finally {
  await browser.close();
}
