// tools/print.js
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";

const url = new URL("../preview/preview.html", import.meta.url).pathname;

const browser = await puppeteer.launch({ headless: "new", args: ["--font-render-hinting=none"] });
const page = await browser.newPage();
await page.goto("file://" + url, { waitUntil: "networkidle0" });

// nếu cần, bơm data vào trang giống postMessage (tuỳ app của bạn)
// await page.evaluate((data) => { window.__INJECT_DATA__(data); }, myData);

await page.emulateMediaType("print");
await page.pdf({
  path: "Master-Customer-Summary.pdf",
  format: "A4",
  printBackground: true,
  margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" }
});

await browser.close();
