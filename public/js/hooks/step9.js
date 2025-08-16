// public/js/hooks/step9.js
import * as store from "../store.js";

const SEL = {
  modal: "#previewModal",
  iframe: "#previewFrame",
  btnPreview: "#btnPreview",
  btnModalGenerate: "#modalGenerate",
  btnGenerate: "#btnGenerate",
  btnExport: "#btn-export",
  btnClose: "#closePreview",
  statusLive: "#statusLive",
};

// ===== cấu hình PDF A4 =====
const PDF_FORMAT = "A4";
const PDF_ORIENTATION = "portrait";

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
  pdf: (id) =>
    `${API_ORIGIN}/api/pdf/${encodeURIComponent(id)}?format=${PDF_FORMAT}&orientation=${PDF_ORIENTATION}`,
  previewUrl: (id, q = "") =>
    `${API_ORIGIN}/public/preview/preview.html?k=${encodeURIComponent(id)}${q}`, // preview A4
};

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

async function stashData(signal) {
  const res = await fetch(API.postStash(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(getAllData()),
    signal,
  });
  if (!res.ok) {
    const t = await safeText(res);
    throw new Error(`Stash failed (${res.status}): ${t || "server error"}`);
  }
  const { id } = await res.json();
  if (!id) throw new Error("Stash failed: missing id");
  lastStashId = id;
  return id;
}

// ---- PREVIEW ----
async function openPreviewModal() {
  const modal = document.querySelector(SEL.modal);
  const frame = document.querySelector(SEL.iframe);
  if (!frame) return alert("Missing #previewFrame");
  announce("Preparing preview…");

  let id = null;
  try {
    const res = await fetch(API.postStash(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getAllData()),
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

  if (modal?.showModal) modal.showModal();
  else window.open(url, "_blank", "noopener,noreferrer");

  if (!id) {
    frame.addEventListener("load", () => {
      try {
        frame.contentWindow?.postMessage(
          { type: "MCS_DATA", payload: getAllData() },
          window.location.origin
        );
        announce("Preview ready (local A4).");
      } catch (e) {
        console.error("[step9] postMessage failed:", e);
        announce("Preview loaded but could not post data.");
      }
    }, { once: true });
  } else {
    announce("Preview ready.");
  }
}

// ---- GENERATE PDF A4 ----
async function generateAccessiblePdf() {
  try {
    const id = lastStashId || (await stashData());
    announce("Generating PDF (A4)…");
    const res = await fetch(API.pdf(id));
    if (!res.ok) {
      const t = await safeText(res);
      throw new Error(`PDF failed (${res.status}): ${t || "server error"}`);
    }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Master-Customer-Summary.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    announce("PDF downloaded.");
    return;
  } catch (err) {
    console.warn("[step9] Puppeteer PDF failed, fallback print:", err);
  }

  const frame = document.querySelector(SEL.iframe);
  if (frame?.contentWindow) {
    try { frame.contentWindow.focus(); frame.contentWindow.print(); }
    catch { alert("Cannot print preview iframe. Open preview again and try."); }
  } else {
    alert("Preview is not open. Please click Preview first.");
  }
}

function exportJSONFile(filename="application.json"){
  const blob = new Blob([JSON.stringify(getAllData(), null, 2)], { type:"application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  announce("JSON exported.");
}

export function init(){
  document.querySelector(SEL.btnPreview)?.addEventListener("click", (e)=>{ e.preventDefault(); openPreviewModal(); });
  document.querySelector(SEL.btnModalGenerate)?.addEventListener("click", (e)=>{ e.preventDefault(); generateAccessiblePdf(); });
  document.querySelector(SEL.btnGenerate)?.addEventListener("click", (e)=>{ e.preventDefault(); generateAccessiblePdf(); });
  document.querySelector(SEL.btnExport)?.addEventListener("click", (e)=>{ e.preventDefault(); exportJSONFile(); });
  document.querySelector(SEL.btnClose)?.addEventListener("click", (e)=>{ e.preventDefault(); document.querySelector(SEL.modal)?.close?.(); });
  console.log("[step9] init. API_ORIGIN =", API_ORIGIN, "| PDF_FORMAT =", PDF_FORMAT);
}
export const initStep9 = init;
