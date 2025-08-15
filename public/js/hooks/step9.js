const TOTAL = 4;
const DATA_KEY = "MAOS_DRAFT_V1";

// (tùy) cố gắng import store.js nếu có (để export JSON chuẩn)
let store = null;
try {
  store = await import("../store.js");
} catch { /* fallback localStorage */ }

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
  const modal = document.getElementById("previewModal");
  const btnPreview = document.getElementById("btnPreview");
  const iframe = document.getElementById("previewFrame");
  
  if (!modal?.open) {
    // phát sự kiện click vào nút Preview
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

// ========= Load Required Libraries =========
async function ensureLibrariesLoaded() {
  // Check if jsPDF is already loaded
  if (window.jspdf && window.html2canvas) {
    console.log("[Libraries] Already loaded");
    return;
  }

  console.log("[Libraries] Loading jsPDF and html2canvas...");

  const promises = [];

  // Load html2canvas if not present
  if (!window.html2canvas) {
    promises.push(new Promise((resolve, reject) => {
      // Check if there's already a script loading this
      if (document.querySelector('script[src*="html2canvas"]')) {
        // Wait for existing script to load
        const checkLoaded = () => {
          if (window.html2canvas) {
            resolve();
          } else {
            setTimeout(checkLoaded, 50);
          }
        };
        checkLoaded();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    }));
  }

  // Load jsPDF if not present
  if (!window.jspdf) {
    promises.push(new Promise((resolve, reject) => {
      // Check if there's already a script loading this
      if (document.querySelector('script[src*="jspdf"]')) {
        // Wait for existing script to load
        const checkLoaded = () => {
          if (window.jspdf) {
            resolve();
          } else {
            setTimeout(checkLoaded, 50);
          }
        };
        checkLoaded();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    }));
  }

  if (promises.length > 0) {
    await Promise.all(promises);
    // Wait a bit for libraries to initialize
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log("[Libraries] jsPDF and html2canvas loaded successfully");
}

// ========= Generate PDF =========
async function generateFromIframe() {
  const btnGenerate = document.getElementById("btnGenerate");
  const modalGen = document.getElementById("modalGenerate");
  const targets = [btnGenerate, modalGen].filter(Boolean);
  
  setBusy(targets, true);

  try {
    // Ensure libraries are loaded first
    await ensureLibrariesLoaded();

    const doc = await ensurePreviewReady();
    const pages = Array.from(doc.querySelectorAll(".a4-page"));
    if (!pages.length) throw new Error("No pages in preview");

    // Check if jsPDF is available
    if (!window.jspdf) {
      throw new Error("jsPDF library failed to load");
    }

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
    setBusy(targets, false);
  }
}

// Make generateFromIframe available globally
window.generateFromIframe = generateFromIframe;

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

// ========= Wire Events =========
function wireStep9Events() {
  const btnGenerate = document.getElementById("btnGenerate");
  const btnExport = document.getElementById("btn-export");
  
  // Wire Generate button (main page)
  if (btnGenerate && !btnGenerate.dataset.wired) {
    btnGenerate.dataset.wired = "true";
    btnGenerate.addEventListener("click", (e) => { 
      e.preventDefault(); 
      generateFromIframe(); 
    });
  }

  // Wire Export button
  if (btnExport && !btnExport.dataset.wired) {
    btnExport.dataset.wired = "true";
    btnExport.addEventListener("click", (e) => {
      e.preventDefault();
      const data = getAllData();
      downloadJSON(data, "application.json");
    });
  }

  // Wire modal events using global function from preview.js
  if (window.wireModalEvents) {
    window.wireModalEvents();
  }
}

// Export function for app.js to call
export function init(container, storeRef) {
  if (storeRef) store = storeRef;
  
  // Wire events when step 9 is loaded
  setTimeout(() => {
    wireStep9Events();
  }, 100);
}

// Also wire events immediately if script is loaded directly
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(wireStep9Events, 100);
});

// Legacy export for compatibility
export function wireStep9Generate() {
  generateFromIframe();
}