// server.js (CommonJS)
const express = require("express");
const path = require("path");
const cors = require("cors");
const crypto = require("crypto");
const puppeteer = require("puppeteer");

const PORT = process.env.PORT || 5173;
const STATIC_ROOT = path.join(__dirname, "public");

// ===== app & middlewares =====
const app = express();
app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
  ],
  methods: ["GET","POST"],
}));
app.use(express.json({ limit: "2mb" }));

// static
app.use("/public", express.static(STATIC_ROOT, { extensions: ["html"] }));
app.use(express.static(STATIC_ROOT, { extensions: ["html"] }));
app.get("/", (req, res) => res.redirect("/public/index.html"));

// ===== STASH =====
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

// ===== PDF (A4/portrait by default) =====
app.get("/api/pdf/:id", async (req, res) => {
  const id = req.params.id;
  if (!STASH.has(id)) return res.status(404).json({ error: "stash not found" });

  const origin = `http://localhost:${PORT}`;
  const url = `${origin}/public/preview/preview.html?k=${encodeURIComponent(id)}&print=1`;

  const format = (req.query.format || "A4").toString();           // A4
  const orientation = (req.query.orientation || "portrait").toString();

  let browser;
  try {
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.emulateMediaType("print");

    const pdf = await page.pdf({
      format,                                 // A4
      landscape: orientation === "landscape",
      printBackground: true,
      preferCSSPageSize: true,                // tôn trọng @page trong CSS
      scale: 1,                               // không thu/phóng
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Master-Customer-Summary.pdf"`);
    res.send(pdf);
  } catch (e) {
    console.error("[/api/pdf] error:", e);
    res.status(500).json({ error: String(e) });
  } finally {
    await browser?.close();
  }
});

// fallback
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

app.listen(PORT, () => {
  console.log("== MAOS dev server ==");
  console.log(`Open UI:   http://localhost:${PORT}/public/index.html`);
  console.log(`Preview :  http://localhost:${PORT}/public/preview/preview.html`);
});
