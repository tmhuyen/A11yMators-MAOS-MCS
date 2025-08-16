// server.js
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import crypto from "node:crypto";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ✅ static root: ./public (đúng theo cấu trúc của bạn)
const STATIC_ROOT = path.join(__dirname, "public");
const PORT = process.env.PORT || 5173;

const app = express();

// CORS cho dev khi mở UI ở 127.0.0.1:5500
app.use(cors({
  origin: ["http://127.0.0.1:5500","http://localhost:5500","http://localhost:5173","http://127.0.0.1:5173"],
  methods: ["GET","POST"]
}));

app.use(express.json({ limit: "2mb" }));

// ✅ phục vụ tĩnh tại /public/* (giữ nguyên URL như Live Server)
app.use("/public", express.static(STATIC_ROOT, { extensions: ["html"] }));
// (tùy chọn) cũng cho phép truy cập không có prefix nếu cần
app.use(express.static(STATIC_ROOT, { extensions: ["html"] }));

// "/" → chuyển về /public/index.html
app.get("/", (req, res) => res.redirect("/public/index.html"));

// ====== STASH API ======
const STASH = new Map();
const newId = () => crypto.randomBytes(8).toString("hex");

app.post("/api/stash", (req, res) => {
  const id = newId();
  STASH.set(id, { json: req.body ?? {}, t: Date.now() });
  res.json({ id });
});

app.get("/api/stash/:id", (req, res) => {
  const row = STASH.get(req.params.id);
  if (!row) return res.status(404).json({ error: "not found" });
  res.json(row.json);
});

// ====== PDF API (Puppeteer in từ preview model) ======
app.get("/api/pdf/:id", async (req, res) => {
  const id = req.params.id;
  if (!STASH.has(id)) return res.status(404).json({ error: "stash not found" });

  const origin = `http://localhost:${PORT}`;
  // ✅ preview.html nằm ở /public/preview/preview.html
  const url = `${origin}/public/preview/preview.html?k=${encodeURIComponent(id)}&print=1`;

  let browser;
  try {
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.emulateMediaType("print");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="Master-Customer-Summary.pdf"');
    res.send(pdf);
  } catch (e) {
    console.error("[/api/pdf] error:", e);
    res.status(500).json({ error: String(e) });
  } finally {
    await browser?.close();
  }
});

// fallback 404 cho API
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

app.listen(PORT, () => {
  console.log(`Open UI:   http://localhost:${PORT}/public/index.html`);
  console.log(`Preview :  http://localhost:${PORT}/public/preview/preview.html`);
});
