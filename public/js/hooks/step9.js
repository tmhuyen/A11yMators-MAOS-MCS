// js/hooks/step9.js
import * as store from "../store.js";

/* ---------------------------
   Singleton for submitted data
---------------------------- */
export const SubmittedData = { value: null };

/* ---------------------------
   Utilities
---------------------------- */
function getAllData(storeApi = store) {
  return typeof storeApi.toObject === "function"
    ? storeApi.toObject()
    : { ...storeApi.data };
}

function makePrintableHTML(data) {
  const pretty = JSON.stringify(data, null, 2);
  const esc = (s) =>
    s.replace(/[<>&]/g, (m) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[m]));
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
    <div class="no-print" style="margin-top:8px;color:var(--muted)">This is a print-friendly preview.</div>
  </header>
  <section class="card">
    <h2 style="margin:0 0 8px;font-size:16px;">Collected Data (JSON)</h2>
    <pre><code>${esc(pretty)}</code></pre>
  </section>
</body>
</html>`;
}

function openPreview(html, autoPrint = false) {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank", "noopener,noreferrer");
  if (!w) return;
  if (autoPrint) {
    const onLoad = () => {
      w.removeEventListener("load", onLoad);
      try {
        w.focus();
      } catch {}
      try {
        w.print();
      } catch {}
    };
    w.addEventListener("load", onLoad);
  }
}

/* ---------------------------
   File System Access API helpers
---------------------------- */
async function ensureSubdir(dirHandle, name) {
  return dirHandle.getDirectoryHandle(name, { create: true });
}

async function deleteIfExists(dirHandle, name) {
  try {
    await dirHandle.removeEntry(name, { recursive: false });
    return true;
  } catch {
    return false;
  }
}

async function writeFile(
  dirHandle,
  filename,
  contents,
  mime = "application/json"
) {
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(new Blob([contents], { type: mime }));
  await writable.close();
  return fileHandle;
}

// Main export using FS API; overwrites if exists
export async function exportStoreToDataFolderFSAPI(
  filename = "application.json"
) {
  if (!("showDirectoryPicker" in window)) {
    return downloadJSON(filename);
  }

  const rootDir = await window.showDirectoryPicker({
    id: "maos-project-root",
    mode: "readwrite",
    startIn: "documents",
  });

  const dataDir = await ensureSubdir(rootDir, "data");
  const payload = JSON.stringify(getAllData(), null, 2);

  await deleteIfExists(dataDir, filename);
  await writeFile(dataDir, filename, payload, "application/json");

  const status = document.getElementById("status");
  if (status) status.textContent = `Saved to /data/${filename}`;
}

// Fallback: normal download
export function downloadJSON(filename = "application.json") {
  const blob = new Blob([JSON.stringify(getAllData(), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ---------------------------
   Preview / Generate / Export wiring
---------------------------- */
export function init(root) {
  const previewBtn = root.querySelector("#btnPreview");
  const generateBtn = root.querySelector("#generatePdfBtn");
  const exportBtn = root.querySelector("#btn-export");

  // Preview PDF
  previewBtn?.addEventListener("click", () => {
    SubmittedData.value = getAllData(); // save singleton
    const previewURL = "../preview/preview.html";
    const w = window.open(previewURL, "_blank", "noopener,noreferrer");
    if (!w) return;
    const onMsg = (e) => {
      if (e?.source === w && e.data === "PREVIEW_READY") {
        window.removeEventListener("message", onMsg);
        try {
          w.postMessage("GENERATE_PDF", "*");
        } catch {}
      }
    };
    window.addEventListener("message", onMsg);
  });

  // Generate PDF
  generateBtn?.addEventListener("click", () => {
    SubmittedData.value = getAllData(); // save singleton
    const html = makePrintableHTML(SubmittedData.value);
    openPreview(html, true);
  });

  // Export JSON
  exportBtn?.addEventListener("click", async () => {
    SubmittedData.value = getAllData(); // save singleton
    try {
      await exportStoreToDataFolderFSAPI("application.json");
    } catch (err) {
      console.error(err);
      downloadJSON("application.json");
    }
  });
}

/* ---------------------------
   No-op validation for Step 9
---------------------------- */
export async function validate() {
  return [];
}
export function collect() {}
