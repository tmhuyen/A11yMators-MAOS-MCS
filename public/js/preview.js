// js/preview.js — shared for both preview.html and step-9.html

// Only mount when we are on preview.html (this page has #step-container)
const mount = document.getElementById("step-container");
const BASE = new URL(".", document.baseURI);
const TOTAL = 4;
const FOOTER_SHORT = "7641EA1019-0325";
const FOOTER_LONG =
  "©2025 National Australia Bank Limited ABN 12 004 044 937 AFSL and Australian Credit Licence 230686. 7641EA1019-0325";

// Inject minimal page styles for A4 pages (used only on preview.html)
(function ensurePageStyles() {
  if (document.getElementById("__page_styles")) return;
  const css = `
    .a4-page {
      width:210mm; min-height:297mm; margin:0 auto 16px; background:#fff; position:relative;
      box-shadow:0 2px 8px rgba(0,0,0,.08);
    }
    .a4-inner { padding:10mm 12mm 22mm; } /* chừa đáy cho footer */
    .pdf-footer {
      position:absolute; left:12mm; right:12mm; bottom:10mm;
      border-top:none; padding-top:0;
      display:flex; justify-content:space-between; font-size:10px; color:#111;
    }
    @media print {
      body { background:#fff; }
      .a4-page { box-shadow:none; page-break-after:always; margin:0; }
    }
  `;
  const tag = document.createElement("style");
  tag.id = "__page_styles";
  tag.textContent = css;
  document.head.appendChild(tag);
})();

// Load step-N only when on preview.html
async function fetchStep(n) {
  const url = new URL(`step-${n}.html`, BASE);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok)
    throw new Error(`HTTP ${res.status} when loading ${url.pathname}`);
  const html = await res.text();
  const wrap = document.createElement("div");
  wrap.innerHTML = html;
  return wrap.querySelector(`#step-${n}`) || wrap.firstElementChild || wrap;
}
// ===== Modal + Preview button on steps/step-9.html =====
(function () {
  const PREVIEW_URL = "../preview/preview.html";

  const DATA_KEY = "MAOS_DRAFT_V1";

  const openBtn = document.getElementById("btnPreview");
  const modal = document.getElementById("previewModal");
  const closeBtn = document.getElementById("closePreview");
  const iframe = document.getElementById("previewFrame");

  // If any of these are missing (e.g., running on preview.html), do nothing.
  if (!(openBtn && modal && closeBtn && iframe)) return;

  const FORM_SCOPE = document.getElementById("wizard") || document;

  function saveDraft() {
    const data = {};
    FORM_SCOPE.querySelectorAll("input, textarea, select").forEach((el) => {
      if (!el.id && !(el.type === "radio" && el.name)) return;
      if (el.type === "checkbox") {
        if (el.id) data[el.id] = !!el.checked;
      } else if (el.type === "radio") {
        if (el.checked) data[el.name] = el.value;
      } else {
        if (el.id) data[el.id] = el.value ?? "";
      }
    });
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }

  function openModal() {
    saveDraft();
    iframe.src = PREVIEW_URL;
    modal.showModal();
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeModal() {
    modal.close();
    iframe.src = "";
    document.body.style.overflow = "";
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("close", closeModal);
})();

function stripActions(root) {
  root
    .querySelectorAll("button,.actions,[data-action]")
    .forEach((el) => el.remove());
  return root;
}

function withFooter(node, pageNo) {
  const shell = document.createElement("section");
  shell.className = "a4-page";
  const inner = document.createElement("div");
  inner.className = "a4-inner";
  inner.appendChild(node);
  const footer = document.createElement("div");
  footer.className = "pdf-footer";
  const legal = pageNo === TOTAL ? FOOTER_LONG : FOOTER_SHORT;
  footer.innerHTML = `<span>${legal}</span><span>Page ${pageNo} of ${TOTAL}</span>`;
  shell.appendChild(inner);
  shell.appendChild(footer);
  return shell;
}

async function loadAll() {
  if (!mount) return; // only do this on preview.html
  mount.innerHTML = "";
  for (let n = 1; n <= TOTAL; n++) {
    try {
      const stepNode = await fetchStep(n);
      stripActions(stepNode);
      mount.appendChild(withFooter(stepNode, n));
    } catch (e) {
      console.error(e);
      const err = document.createElement("div");
      err.style.color = "#b91c1c";
      err.textContent = `Không thể tải step-${n}.html — ${e.message}`;
      mount.appendChild(err);
    }
  }
}
window.addEventListener("DOMContentLoaded", loadAll);
