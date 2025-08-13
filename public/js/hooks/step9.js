// public/js/hooks/step9.js

function setError(root, fieldId, msg, control) {
  const wrap = root.querySelector(`#${fieldId}`);
  if (!wrap) return;
  wrap.classList.add("error");
  const err = wrap.querySelector(".error-text span:last-child");
  if (err) err.textContent = msg;
  if (control) {
    control.setAttribute("aria-invalid", "true");
    const errId = wrap.querySelector(".error-text")?.id;
    if (errId) {
      const prev = (control.getAttribute("aria-describedby") || "").trim();
      if (!prev.includes(errId)) {
        control.setAttribute("aria-describedby", `${prev} ${errId}`.trim());
      }
    }
  }
}

function clearError(root, fieldId, control) {
  const wrap = root.querySelector(`#${fieldId}`);
  if (!wrap) return;
  wrap.classList.remove("error");
  const err = wrap.querySelector(".error-text span:last-child");
  if (err) err.textContent = "";
  if (control) control.setAttribute("aria-invalid", "false");
}

// Map id wrapper nếu cần validate cụ thể
const FIELD_MAP = {
  // ví dụ: review_ack: "f-reviewAck"
};

export function init(root, storeApi) {
  // Prefill dữ liệu nếu có
  const saved = storeApi.get("step9") || {};
  root.querySelectorAll("input, textarea, select").forEach((el) => {
    const key = el.id || el.name;
    if (!key) return;
    const v = saved[key];
    if (v === undefined) return;
    if (el.type === "checkbox") {
      el.checked = !!v;
    } else if (el.type === "radio") {
      if (String(el.value) === String(v)) el.checked = true;
    } else {
      el.value = v;
    }
  });

  // Clear error on change
  Object.entries(FIELD_MAP).forEach(([name, wrapId]) => {
    root.querySelectorAll(`input[name="${name}"]`).forEach((el) => {
      el.addEventListener("change", () => clearError(root, wrapId, el));
    });
    const byId = root.querySelector(`#${name}`);
    if (byId) {
      byId.addEventListener("input", (e) => clearError(root, wrapId, e.target));
      byId.addEventListener("change", (e) =>
        clearError(root, wrapId, e.target)
      );
    }
  });

  // ==== Buttons & modal logic for Step 9 ====
  const generateBtn = root.querySelector("#generatePdfBtn");
  const exportBtn = root.querySelector("#btn-export");

  // Modal/preview elements (at document level)
  const previewModal = document.getElementById("previewModal");
  const previewHtml = document.getElementById("previewHtml");
  const previewJson = document.getElementById("previewJson");
  const closePreview = document.getElementById("closePreview");
  const previewFrame = document.getElementById("previewFrame");

  // Open modal helper
  function openModal() {
    if (previewModal?.showModal) {
      previewModal.showModal();
    } else if (previewModal) {
      previewModal.classList.add("open");
    }
  }
  function closeModal() {
    if (previewModal?.close) {
      previewModal.close();
    } else if (previewModal) {
      previewModal.classList.remove("open");
    }
  }

  function makePrintableHTML(data) {
    const pretty = JSON.stringify(data, null, 2);
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Application – Printable Preview</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root { --ink:#111; --muted:#666; --border:#ddd; }
  body { font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; color: var(--ink); margin: 24px; }
  header { margin-bottom: 16px; }
  h1 { font-size: 20px; margin: 0 0 8px; }
  .meta { color: var(--muted); font-size: 12px; }
  .card { border:1px solid var(--border); border-radius: 8px; padding:16px; margin-top:16px; }
  pre { overflow:auto; white-space:pre-wrap; word-break:break-word; }
  @media print { .no-print { display:none !important; } body { margin: 0.5in; } }
</style>
</head>
<body>
  <header>
    <h1>Application – Preview</h1>
    <div class="meta">Generated: ${new Date().toLocaleString()}</div>
    <div class="no-print" style="margin-top:8px;color:var(--muted)">This is a print‑friendly preview.</div>
  </header>

  <section class="card">
    <h2 style="margin:0 0 8px;font-size:16px;">Collected Data (JSON)</h2>
    <pre><code>${pretty.replace(
      /[<>&]/g,
      (m) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[m])
    )}</code></pre>
  </section>
</body>
</html>`;
  }

  function openPreview(html, autoPrint = false) {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) return; // popup blocked
    if (autoPrint) {
      // Print as soon as the new window finishes loading
      const onLoad = () => {
        w.removeEventListener("load", onLoad);
        w.focus();
        w.print();
      };
      w.addEventListener("load", onLoad);
    }
  }
  function openModal() {
    iframe.src = PREVIEW_URL; // tải lại mỗi lần bấm
    modal.showModal();
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeModal() {
    modal.close();
    iframe.src = ""; // giải phóng
    document.body.style.overflow = "";
  }
  // Open preview HTML in new tab
  const previewBtn = root.querySelector("#btnPreview");
  previewBtn?.addEventListener("click", () => {
    openModal();
  });

  // Close preview handlers
  closePreview?.addEventListener("click", closeModal);
  previewModal?.addEventListener("click", (e) => {
    if (e.target === previewModal && !previewModal.showModal) closeModal();
  });

  //   // Generate PDF
  //   generateBtn?.addEventListener("click", () => {
  //     if (previewFrame?.contentWindow) {
  //       if (!previewModal?.open) openModal();
  //       previewFrame.contentWindow.postMessage("GENERATE_PDF", "*");
  //       return;
  //     }
  //     // Nếu không dùng iframe, tự tạo HTML printable
  //     const html = makePrintableHTML(getAllData(storeApi));
  //     openPreview(html, true);
  //   });

  // Export JSON
  exportBtn?.addEventListener("click", () => {
    exportStoreAsJSON(storeApi);
  });
}

// Bật validate nếu cần
export function validate(root) {
  const errs = [];
  // thêm luật validate ở đây nếu cần
  return errs;
}

export function collect(root, storeApi) {
  const payload = {};
  root.querySelectorAll("input, textarea, select").forEach((el) => {
    const key = el.id || el.name;
    if (!key) return;
    if (el.type === "checkbox") {
      payload[key] = !!el.checked;
    } else if (el.type === "radio") {
      if (el.checked) payload[key] = el.value;
    } else {
      payload[key] = el.value ?? "";
    }
  });
  storeApi.set("step9", payload);
}

// ==== Helpers cho generate PDF / export JSON ====

function getAllData(storeApi) {
  // Lấy toàn bộ data trong store (tuỳ storeApi hiện tại)
  if (storeApi?.getAll) return storeApi.getAll();
  if (window.store?.getAll) return window.store.getAll();
  return {};
}

function makePrintableHTML(data) {
  // Build HTML từ data để in ra PDF
  return `<html><body><pre>${JSON.stringify(
    data,
    null,
    2
  )}</pre></body></html>`;
}

function openPreview(html, autoPrint) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  if (autoPrint) w.print();
}

function exportStoreAsJSON(storeApi) {
  const data = getAllData(storeApi);
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "application.json";
  a.click();
  URL.revokeObjectURL(url);
}
