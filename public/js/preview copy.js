// === BEGIN: add/ensure exports in preview.js ===

// dùng lại các helper sẵn có của bạn, hoặc copy minimal từ đây:
const DATA_KEY = window.DATA_KEY || "MAOS_DRAFT_V1";
const TOTAL = window.TOTAL || 4;

// nơi chứa step-*.html:  /preview/
const STEPS_BASE = new URL("../preview/", import.meta.url); // chỉnh .. nếu path khác

function collectFormData(scope = document) {
  const out = {};
  scope.querySelectorAll("input, textarea, select").forEach((el) => {
    if (!el.id && !(el.type === "radio" && el.name)) return;
    if (el.type === "checkbox") {
      if (el.id) out[el.id] = !!el.checked;
    } else if (el.type === "radio") {
      if (el.checked) out[el.name] = el.value;
    } else {
      if (el.id) out[el.id] = el.value ?? "";
    }
  });
  return out;
}
function saveDraft(scope = document) {
  try { localStorage.setItem(DATA_KEY, JSON.stringify(collectFormData(scope))); }
  catch (e) { console.warn("[preview] saveDraft failed:", e); }
}
function restoreDraft(doc = document) {
  let data = {};
  try { data = JSON.parse(localStorage.getItem(DATA_KEY) || "{}"); } catch {}
  Object.entries(data).forEach(([k, v]) => {
    const el = doc.getElementById(k) || doc.querySelector(`[name="${k}"]`);
    if (!el) return;
    if (el.type === "checkbox") el.checked = !!v;
    else if (el.type === "radio") {
      const r = doc.querySelector(`[name="${k}"][value="${v}"]`);
      if (r) r.checked = true;
    } else el.value = v ?? "";
  });
}
function ensurePageStyles(doc = document) {
  if (doc.getElementById("__a4_styles")) return;
  const css = `
    #step-container { width:210mm; margin:12px auto; }
    .a4-page{width:210mm;min-height:297mm;background:#fff;margin:0 auto 14px;
      box-shadow:0 2px 10px rgba(0,0,0,.08);page-break-after:always;box-sizing:border-box}
    .a4-inner{padding:10mm 12mm 22mm}
    .pdf-footer{position:relative;display:flex;justify-content:space-between;font-size:10px;margin:8mm 12mm 0}
    @media print{.a4-page{box-shadow:none;margin:0}}
  `;
  const s = doc.createElement("style"); s.id="__a4_styles"; s.textContent = css; doc.head.appendChild(s);
}
async function fetchStepHTML(n) {
  const url = new URL(`step-${n}.html`, STEPS_BASE);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} when loading ${url.pathname}`);
  return await res.text();
}
function stripActions(root) {
  root.querySelectorAll("script,button,.actions,[data-action]").forEach((el) => el.remove());
  return root;
}
function withFooter(node, pageNo, doc = document) {
  const shell = doc.createElement("section"); shell.className = "a4-page";
  const inner = doc.createElement("div"); inner.className = "a4-inner"; inner.appendChild(node);
  const footer = doc.createElement("div"); footer.className = "pdf-footer";
  footer.innerHTML = `<span>${pageNo < TOTAL ? "7641EA1019-0325" :
    "©2025 National Australia Bank Limited ABN 12 004 044 937 AFSL and Australian Credit Licence 230686. 7641EA1019-0325"}</span>
    <span>Page ${pageNo} of ${TOTAL}</span>`;
  shell.appendChild(inner); shell.appendChild(footer);
  return shell;
}
async function loadAllStepsInto(doc) {
  ensurePageStyles(doc);
  let container = doc.getElementById("step-container");
  if (!container) { container = doc.createElement("div"); container.id = "step-container"; doc.body.appendChild(container); }
  container.innerHTML = "";
  for (let i = 1; i <= TOTAL; i++) {
    const html = await fetchStepHTML(i);
    const wrap = doc.createElement("div"); wrap.innerHTML = html;
    const stepRoot = wrap.querySelector(`#step-${i}`) || wrap.firstElementChild || wrap;
    stripActions(stepRoot);
    container.appendChild(withFooter(stepRoot, i, doc));
  }
}
function lockPreview(doc = document) {
  if (doc.body.dataset.previewLocked === "1") return;
  doc.body.dataset.previewLocked = "1";
  const freeze = (scope) => {
    scope.querySelectorAll('input:not([type]),input[type="text"],input[type="email"],input[type="tel"],input[type="number"],input[type="date"],textarea')
      .forEach((el)=>{ el.readOnly = true; el.setAttribute("aria-readonly","true");
        ["beforeinput","paste","drop"].forEach(ev=> el.addEventListener(ev,(e)=>e.preventDefault(),{capture:true})); });
    scope.querySelectorAll('input[type="checkbox"],input[type="radio"],select')
      .forEach((el)=>{ el.setAttribute("data-locked","1"); el.setAttribute("aria-disabled","true");
        ["change","click","input"].forEach(ev=> el.addEventListener(ev,(e)=>{e.preventDefault(); e.stopImmediatePropagation();},{capture:true})); });
    scope.querySelectorAll('[contenteditable=""],[contenteditable="true"]').forEach((el)=> el.setAttribute("contenteditable","false"));
  };
  freeze(doc);
  const blocker = (e) => {
    const t = e.target;
    if (!t || !doc.body.contains(t) || !t.matches?.("input,textarea,select")) return;
    if (e.type === "keydown") {
      const k = e.key; if (k==="Tab"||k==="Shift") return;
      if ((e.ctrlKey||e.metaKey)&&["a","c","A","C"].includes(k)) return;
    }
    e.preventDefault(); e.stopImmediatePropagation();
  };
  ["beforeinput","input","change","click","mousedown","pointerdown","keydown"]
    .forEach((type)=> doc.addEventListener(type, blocker, { capture:true }));
}
function writeIframeSkeleton(iframe) {
  const idoc = iframe.contentDocument; if (!idoc) return;
  idoc.open(); idoc.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preview</title></head><body></body></html>`); idoc.close();
}

/**
 * Hàm init: gắn hành vi cho nút Preview ở step-9
 * - mở modal
 * - merge 4 trang vào iframe
 * - load data từ localStorage
 * - khóa tất cả fields (read-only)
 */
export async function init({ doc = document } = {}) {
  const btnPreview = doc.getElementById("btnPreview");
  const modal      = doc.getElementById("previewModal");
  const iframe     = doc.getElementById("previewFrame");
  const btnClose   = doc.getElementById("closePreview");
  if (!(btnPreview && modal && iframe)) return;

  const formScope = doc.getElementById("wizard") || doc;

  function lockBodyScroll(lock){ document.body.style.overflow = lock ? "hidden" : ""; }

  async function openModal() {
    saveDraft(formScope);
    writeIframeSkeleton(iframe);
    const idoc = iframe.contentDocument;
    ensurePageStyles(idoc);
    await loadAllStepsInto(idoc);
    restoreDraft(idoc);
    lockPreview(idoc);
    try { modal.showModal(); } catch { modal.setAttribute("open","true"); }
    lockBodyScroll(true);
    btnClose?.focus({ preventScroll:true });
  }
  function closeModal() {
    try { modal.close(); } catch { modal.removeAttribute("open"); }
    writeIframeSkeleton(iframe);
    lockBodyScroll(false);
    btnPreview?.focus({ preventScroll:true });
  }

  // wire
  btnPreview.addEventListener("click", (e)=>{ e.preventDefault(); e.stopPropagation(); openModal(); }, { capture:true });
  btnClose?.addEventListener("click", (e)=>{ e.preventDefault(); closeModal(); }, { capture:true });
  modal.addEventListener("cancel", (e)=>{ e.preventDefault(); closeModal(); });
  modal.addEventListener("click", (e)=>{
    const r = modal.getBoundingClientRect();
    const inside = e.clientX>=r.left && e.clientX<=r.right && e.clientY>=r.top && e.clientY<=r.bottom;
    if (!inside) closeModal();
  });
}

// (nếu muốn export thêm để dùng nơi khác)
export { saveDraft, restoreDraft, ensurePageStyles, loadAllStepsInto, lockPreview, DATA_KEY, TOTAL };
// === END: add/ensure exports in preview.js ===
