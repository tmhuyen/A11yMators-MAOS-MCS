import * as store from "../store.js";

const SEL = {
  modal: "#previewModal",
  iframe: "#previewFrame",
  btnPreview: "#btnPreview",
  btnModalGenerate: "#modalGenerate",
  btnGenerate: "#btnGenerate",    // nếu bạn có nút này ngoài modal
  btnExport: "#btn-export",
  btnClose: "#closePreview",
  statusLive: "#statusLive",
};

// Chạy UI bằng Live Server (5500) thì API ở 5173, còn lại dùng origin hiện tại
function resolveApiOrigin() {
  if (window.MAOS_API_ORIGIN) return String(window.MAOS_API_ORIGIN);
  const isLive =
    (location.hostname === "127.0.0.1" || location.hostname === "localhost") &&
    location.port === "5500";
  return isLive ? "http://localhost:5173" : location.origin;
}
const API_ORIGIN = resolveApiOrigin();

const API = {
  postStash: () => `${API_ORIGIN}/api/stash`,
  pdf: (id)    => `${API_ORIGIN}/api/pdf/${encodeURIComponent(id)}`,
  previewUrl: (id, q = "") =>
    `${API_ORIGIN}/public/preview/preview.html?k=${encodeURIComponent(id)}${q}`,
};

// Preview local khi không có server (cùng origin đang chạy file này)
const LOCAL_PREVIEW = new URL("../../preview/preview.html", import.meta.url).href;

const __store = store || window.store || { data: {}, toObject: () => ({}) };
let lastStashId = null;

function announce(msg){
  const box = document.querySelector(SEL.statusLive);
  if (box) box.textContent = msg;
  console.log("[step9]", msg);
}
function getAllData(){
  try { return typeof __store.toObject === "function" ? __store.toObject() : {...(__store.data||{})}; }
  catch { return {}; }
}
async function safeText(res){ try { return await res.text(); } catch { return ""; } }

// ---- PREVIEW (mở modal & nạp iframe) ----
async function openPreviewModal() {
  const modal = document.querySelector(SEL.modal);
  const frame = document.querySelector(SEL.iframe);
  if (!frame) return alert("Missing #previewFrame");
  announce("Preparing preview…");

  // thử stash trước để có ?k=id
  let id = null;
  try {
    const res = await fetch(API.postStash(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getAllData())
    });
    if (res.ok) {
      const j = await res.json();
      id = j?.id || null;
      lastStashId = id;
    }
  } catch (e) {
    console.warn("[step9] stash failed, fallback local:", e);
  }

  const url = id ? API.previewUrl(id) : LOCAL_PREVIEW;
  frame.src = url;
  if (modal?.showModal) modal.showModal(); else window.open(url, "_blank", "noopener,noreferrer");

  // nếu không stash được (không có server) → bơm data qua postMessage cho preview
  if (!id) {
    frame.addEventListener("load", () => {
      try {
        frame.contentWindow?.postMessage(
          { type: "MCS_DATA", payload: getAllData() },
          window.location.origin
        );
        announce("Preview ready (local).");
      } catch (e) {
        console.error("[step9] postMessage failed:", e);
      }
    }, { once: true });
  } else {
    announce("Preview ready.");
  }
}

// ---- GENERATE PDF (WCAG-friendly) ----
// Ưu tiên: gọi Puppeteer (PDF từ DOM thật của preview model).
// Fallback: gọi window.print() trên iframe preview hiện tại.
async function generateAccessiblePdf() {
  // 1) nếu đang có stash id → gọi PDF API
  try {
    const id = lastStashId || (await (async () => {
      const r = await fetch(API.postStash(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getAllData())
      });
      if (!r.ok) throw new Error(`Stash failed (${r.status})`);
      const j = await r.json();
      lastStashId = j?.id || null;
      return lastStashId;
    })());

    if (!id) throw new Error("No stash id");

    announce("Generating PDF…");
    const res = await fetch(API.pdf(id));
    if (!res.ok) {
      const t = await safeText(res);
      throw new Error(`PDF failed (${res.status}): ${t || "server error"}`);
    }

    // tải file
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Master-Customer-Summary.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    announce("PDF downloaded.");
    return;
  } catch (e) {
    console.warn("[step9] Puppeteer PDF failed, try fallback print:", e);
  }

  // 2) fallback – in trực tiếp iframe preview hiện tại (vẫn là text thật)
  const frame = document.querySelector(SEL.iframe);
  if (frame?.contentWindow) {
    try {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      announce("Printed from iframe.");
    } catch (e) {
      alert("Cannot print preview iframe. Open preview again and try.");
    }
  } else {
    alert("Preview is not open. Please click Preview first.");
  }
}

// ---- EXPORT JSON (nếu bạn đang dùng nút này) ----
function exportJSONFile(filename="application.json"){
  const blob = new Blob([JSON.stringify(getAllData(), null, 2)], { type:"application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  announce("JSON exported.");
}

// ---- PUBLIC: gọi trong app.js sau khi render Step 9 ----
export function init(){
  document.querySelector(SEL.btnPreview)?.addEventListener("click", (e)=>{ e.preventDefault(); openPreviewModal(); });
  document.querySelector(SEL.btnModalGenerate)?.addEventListener("click", (e)=>{ e.preventDefault(); generateAccessiblePdf(); });
  document.querySelector(SEL.btnGenerate)?.addEventListener("click", (e)=>{ e.preventDefault(); generateAccessiblePdf(); });
  document.querySelector(SEL.btnExport)?.addEventListener("click", (e)=>{ e.preventDefault(); exportJSONFile(); });
  document.querySelector(SEL.btnClose)?.addEventListener("click", (e)=>{ e.preventDefault(); document.querySelector(SEL.modal)?.close?.(); });
  console.log("[step9] init. API_ORIGIN =", API_ORIGIN);
}
export const initStep9 = init;
