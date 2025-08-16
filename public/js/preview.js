// js/preview.js – shared for both preview.html and step-9.html

// Only mount when we are on preview.html (this page has #step-container)
const mount = document.getElementById("step-container");
const BASE = new URL(".", document.baseURI);
const PREVIEW_URL = (new URL("../preview/preview.html", import.meta.url)).href;
const TOTAL = 6;
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
    .a4-inner { padding:10mm 12mm 22mm; } /* chừa đây cho footer */
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
(function initModalPreview() {
  const DATA_KEY = "MAOS_DRAFT_V1";
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

  // Function to wire modal events - can be called multiple times safely
  window.wireModalEvents = function() {
    const openBtn = document.getElementById("btnPreview");
    const modal = document.getElementById("previewModal");
    const closeBtn = document.getElementById("closePreview");
    const iframe = document.getElementById("previewFrame");
    const modalGen = document.getElementById("modalGenerate");

    if (!modal || !iframe) return;

    function openModal() {
      saveDraft();
      iframe.src = PREVIEW_URL;
      modal.showModal?.();
      document.body.style.overflow = "hidden";
      closeBtn?.focus?.();
      
      // Wire modalGenerate after iframe loads
      setTimeout(() => {
        wireModalGenerateButton();
      }, 1000);
    }

    function closeModal() {
      modal.close?.();
      iframe.src = "";
      document.body.style.overflow = "";
    }

    // Wire open button
    if (openBtn && !openBtn.dataset.wired) {
      openBtn.dataset.wired = "true";
      openBtn.onclick = openModal;
    }

    // Wire close button
    if (closeBtn && !closeBtn.dataset.wired) {
      closeBtn.dataset.wired = "true";
      closeBtn.onclick = closeModal;
    }

    // Wire modal close event
    if (!modal.dataset.closeWired) {
      modal.dataset.closeWired = "true";
      modal.addEventListener("close", closeModal);
    }

    // Wire modalGenerate immediately if it exists
    wireModalGenerateButton();
  };

  // Function to specifically wire the modalGenerate button
  window.wireModalGenerateButton = function() {
    const modalGen = document.getElementById("modalGenerate");
    const iframe = document.getElementById("previewFrame");
    
    if (!modalGen || modalGen.dataset.wired === "true" || modalGen.dataset.owner === "step9") return;
    modalGen.dataset.wired = "true";
    modalGen.onclick = async function(e) {
      e.preventDefault();
      console.log("[modalGenerate] Button clicked");
      
      if (!iframe?.contentWindow) {
        console.warn("[modalGenerate] No iframe contentWindow");
        return;
      }
      
      // Wait a bit for iframe to fully load
      let attempts = 0;
      const maxAttempts = 10;
      
      const tryGenerate = () => {
        attempts++;
        const contentWindow = iframe.contentWindow;
        
        if (typeof contentWindow.generatePDF === "function") {
          console.log("[modalGenerate] Calling generatePDF");
          contentWindow.generatePDF();
        } else if (typeof contentWindow.window?.generatePDF === "function") {
          console.log("[modalGenerate] Calling window.generatePDF");
          contentWindow.window.generatePDF();
        } else if (attempts < maxAttempts) {
          console.log(`[modalGenerate] generatePDF not found, attempt ${attempts}/${maxAttempts}`);
          setTimeout(tryGenerate, 500);
        } else {
          console.warn("[modalGenerate] generatePDF function not found after all attempts");
          // Fallback: try to call step9.js generateFromIframe
          if (window.generateFromIframe) {
            window.generateFromIframe();
          } else {
            console.warn("Unable to generate PDF. Please try again.");
          }
        }
      };
      
      tryGenerate();
    };
  };

  // Initial wire attempt
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => window.wireModalEvents(), 100);
  });
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
      err.textContent = `Không thể tải step-${n}.html – ${e.message}`;
      mount.appendChild(err);
    }
  }
}
window.addEventListener("DOMContentLoaded", loadAll);

/* Lock all form controls in preview without graying them out */
(function () {
  function lockPreview(container) {
    const root =
      container ||
      document.querySelector("#step-container") || // preview.html dùng id này
      document.querySelector("main") ||
      document.body;

    if (!root || root.dataset.previewLocked === "1") return;
    root.dataset.previewLocked = "1";
    root.classList.add("keep-colors"); // CSS giữ nguyên màu

    // 1) Khóa control hiện có
    freeze(root);

    // 2) Chặn mọi thao tác thay đổi (cho Tab/Ctrl+C/Ctrl+A)
    const blocker = (e) => {
      const t = e.target;
      if (!t || !root.contains(t) || !t.matches?.("input,textarea,select"))
        return;

      if (e.type === "keydown") {
        const k = e.key;
        if (k === "Tab" || k === "Shift") return;
        if ((e.ctrlKey || e.metaKey) && ["a", "c", "A", "C"].includes(k))
          return;
      }
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    [
      "beforeinput",
      "input",
      "change",
      "click",
      "mousedown",
      "pointerdown",
      "keydown",
    ].forEach((type) =>
      document.addEventListener(type, blocker, { capture: true })
    );

    // 3) Theo dõi nội dung merge động (steps 1–4 chèn vào sau)
    const mo = new MutationObserver((muts) => {
      muts.forEach((m) =>
        m.addedNodes?.forEach((n) => {
          if (n.nodeType === 1 && root.contains(n)) freeze(n);
        })
      );
    });
    mo.observe(root, { childList: true, subtree: true });

    function freeze(scope) {
      // text-like -> readOnly (giữ style)
      scope
        .querySelectorAll(
          'input:not([type]),input[type="text"],input[type="email"],input[type="tel"],input[type="number"],input[type="date"],textarea'
        )
        .forEach((el) => {
          el.readOnly = true;
          el.setAttribute("aria-readonly", "true");
          ["beforeinput", "paste", "drop"].forEach((ev) =>
            el.addEventListener(ev, (e) => e.preventDefault(), {
              capture: true,
            })
          );
        });

      // checkbox/radio/select -> KHÔNG disabled (khỏi xám), chỉ "niêm phong"
      scope
        .querySelectorAll('input[type="checkbox"],input[type="radio"],select')
        .forEach((el) => {
          el.setAttribute("data-locked", "1");
          el.setAttribute("aria-disabled", "true");
        });

      // tắt contenteditable nếu có
      scope
        .querySelectorAll('[contenteditable=""],[contenteditable="true"]')
        .forEach((el) => el.setAttribute("contenteditable", "false"));
    }
  }

  // Khóa ngay khi DOM sẵn sàng; MO sẽ bắt phần nội dung merge sau đó
  window.addEventListener("DOMContentLoaded", () => lockPreview());
})();

export function wirePreviewButtons() {
  // Use the global function
  if (window.wireModalEvents) {
    window.wireModalEvents();
  }
}