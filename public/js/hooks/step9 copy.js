// js/step9.js  (ES module)
import {
  init as initPreview,          // gắn handler Preview (open modal + merge + load + lock)
  DATA_KEY,
  TOTAL
} from "../preview.js";

// (tuỳ) cố gắng import store.js nếu có (để export JSON chuẩn)
let store = null;
try {
  store = await import("../store.js");
} catch { /* fallback localStorage */ }

// ========= DOM =========
const btnPreview   = document.getElementById("btnPreview");
const btnGenerate  = document.getElementById("btnGenerate");
const btnExport    = document.getElementById("btn-export");
const modal        = document.getElementById("previewModal");
const iframe       = document.getElementById("previewFrame");
const modalGen     = document.getElementById("modalGenerate");
const btnClose     = document.getElementById("closePreview");

// Gọi preview.init() để wire nút Preview: mở modal, merge 4 page, load data và lock fields
initPreview({ doc: document });

// ========= Helpers =========
function setBusy(btns, busy, label = "Generating...") {
  btns.forEach(b => {
    if (!b) return;
    if (busy) { b.dataset._txt = b.textContent; b.textContent = label; b.disabled = true; }
    else { b.textContent = b.dataset._txt || b.textContent; b.disabled = false; }
  });
}

function waitFor(condition, { interval=100, timeout=10000 } = {}) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    (function tick(){
      if (condition()) return resolve();
      if (Date.now() - t0 > timeout) return reject(new Error("Timeout"));
      setTimeout(tick, interval);
    })();
  });
}

// đảm bảo modal mở và iframe đã có đủ .a4-page
async function ensurePreviewReady() {
  if (!modal.open) {
    // phát sự kiện click vào nút Preview (đã được initPreview wire)
    btnPreview?.dispatchEvent(new MouseEvent("click", { bubbles:true, cancelable:true }));
  }
  // chờ iframe document sẵn sàng + có đủ số trang
  await waitFor(() => {
    const doc = iframe?.contentDocument;
    if (!doc) return false;
    const pages = doc.querySelectorAll(".a4-page");
    return pages.length >= (typeof TOTAL === "number" ? TOTAL : 4);
  }, { interval: 120, timeout: 15000 });
  return iframe.contentDocument;
}

// ========= Generate PDF =========
async function generateFromIframe() {
  const targets = [btnGenerate, modalGen];
  setBusy(targets, true);

  try {
    const doc = await ensurePreviewReady();
    const pages = Array.from(doc.querySelectorAll(".a4-page"));
    if (!pages.length) throw new Error("No pages in preview");

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });

    for (let i = 0; i < pages.length; i++) {
      const el = pages[i];
      // snapshot từng trang như ảnh để giữ y nguyên layout
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0, scrollY: 0
      });
      const img = canvas.toDataURL("image/jpeg", 0.95);

      // fit ảnh vào A4 full-bleed
      const pageW = 210, pageH = 297;
      const pxW = canvas.width, pxH = canvas.height;
      const aspect = pxW / pxH;
      let w = pageW, h = pageH, x = 0, y = 0;
      if (aspect > pageW/pageH) { // ảnh "rộng" hơn
        w = pageW; h = pageW / aspect; y = (pageH - h)/2;
      } else {
        h = pageH; w = pageH * aspect; x = (pageW - w)/2;
      }

      if (i > 0) pdf.addPage("a4", "portrait");
      pdf.addImage(img, "JPEG", x, y, w, h);
    }

    pdf.save("Master-Customer-Summary.pdf");
  } catch (e) {
    console.error("[Generate] failed:", e);
    alert("Generate PDF failed. Vui lòng thử lại.");
  } finally {
    setBusy([btnGenerate, modalGen], false);
  }
}

// ========= Export JSON =========
function getAllData() {
  if (store && (typeof store.toObject === "function")) {
    return store.toObject();
  }
  // fallback: lấy từ localStorage draft
  try { return JSON.parse(localStorage.getItem(DATA_KEY) || "{}"); }
  catch { return {}; }
}

function downloadJSON(data, filename = "application.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// ========= Wire 3 nút =========
btnGenerate?.addEventListener("click", (e) => { e.preventDefault(); generateFromIframe(); });
modalGen?.addEventListener("click", (e) => { e.preventDefault(); generateFromIframe(); });

btnExport?.addEventListener("click", (e) => {
  e.preventDefault();
  const data = getAllData();
  downloadJSON(data, "application.json");
});

// (tùy chọn) đóng modal khi ESC/backdrop đã được preview.init() xử lý.
// Nếu muốn chắc chắn:
const closeBtn = btnClose;
closeBtn?.addEventListener("click", (e) => { e.preventDefault(); /* preview.js đã close */ });
