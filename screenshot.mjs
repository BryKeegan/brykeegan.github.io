import puppeteer from "puppeteer";
import { existsSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, "temporary screenshots");

// Ensure output directory exists
if (!existsSync(SCREENSHOTS_DIR)) mkdirSync(SCREENSHOTS_DIR, { recursive: true });

// Auto-increment screenshot number
function nextScreenshotPath(label) {
  const files = existsSync(SCREENSHOTS_DIR)
    ? readdirSync(SCREENSHOTS_DIR).filter((f) => f.endsWith(".png"))
    : [];
  const nums = files
    .map((f) => parseInt(f.match(/screenshot-(\d+)/)?.[1] ?? "0"))
    .filter(Boolean);
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  const suffix = label ? `-${label}` : "";
  return join(SCREENSHOTS_DIR, `screenshot-${next}${suffix}.png`);
}

const url = process.argv[2] || "http://localhost:3000";
const label = process.argv[3] || "";

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

// Scroll through the page to trigger intersection observers
await page.evaluate(async () => {
  const height = document.body.scrollHeight;
  const step = 400;
  for (let y = 0; y < height; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 80));
  }
  window.scrollTo(0, 0);
});

// Wait for fallback animation reveal (3s) + extra buffer
await new Promise((r) => setTimeout(r, 3500));

const outputPath = nextScreenshotPath(label);
await page.screenshot({ path: outputPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: ${outputPath}`);
