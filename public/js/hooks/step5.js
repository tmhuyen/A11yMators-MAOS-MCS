function rowTemplate(index, data = {}) {
  const idBase = `auth-${index}`;
  const safe = (s) => (s || "").replace(/"/g, "&quot;");

  return `
  <div class="auth-row field" id="${idBase}" data-index="${index}">
    <div class="auth-grid">
      <!-- Name -->
      <div>
        <label class="label" for="${idBase}-name">Name</label>
        <input id="${idBase}-name" name="${idBase}-name" class="input" value="${safe(
    data.name
  )}" />
      </div>

      <!-- Customer Number -->
      <div>
        <label class="label" for="${idBase}-number">Customer Number</label>
        <input id="${idBase}-number" name="${idBase}-number" class="input" inputmode="numeric" value="${safe(
    data.number
  )}" />
      </div>

      <!-- Remove icon button -->
      <div style="display:flex; align-items:flex-end; justify-content:flex-end;">
        <button type="button" class="icon-btn icon-btn--danger btn-remove" data-remove="${index}" aria-label="Remove row ${index}">
          <!-- trash icon -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
            <path d="M10 11v6"></path><path d="M14 11v6"></path>
            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Inline row error -->
    <div class="error-text mt-8" id="${idBase}-err">
      <span class="icon" aria-hidden="true"></span><span></span>
    </div>

    <hr class="mt-16" style="border:0;border-top:1px solid var(--border)" />
  </div>`;
}

/* helpers unchanged */
function setRowError(row, msg) {
  row.classList.add("error");
  const err = row.querySelector(".error-text span:last-child");
  if (err) err.textContent = msg;
}
function clearRowError(row) {
  row.classList.remove("error");
  const err = row.querySelector(".error-text span:last-child");
  if (err) err.textContent = "";
}
function setListError(root, msg) {
  const wrap = root.querySelector("#authList");
  const err = root.querySelector("#authListErr span:last-child");
  if (msg) {
    wrap.classList.add("error");
    if (err) err.textContent = msg;
  } else {
    wrap.classList.remove("error");
    if (err) err.textContent = "";
  }
}
function addRow(root, data) {
  const rowsHolder = root.querySelector("#authRows");
  const nextIndex = rowsHolder.children.length + 1;
  rowsHolder.insertAdjacentHTML("beforeend", rowTemplate(nextIndex, data));
}
function getRows(root) {
  return Array.from(root.querySelectorAll(".auth-row"));
}

export function init(root, store) {
  const saved = store.get("step5");
  const holder = root.querySelector("#authRows");
  holder.innerHTML = "";

  if (saved?.people?.length) {
    saved.people.forEach((p) => addRow(root, p));
  } else {
    addRow(root);
  }

  root.querySelector("#addRowBtn").addEventListener("click", () => {
    addRow(root);
    setListError(root, "");
  });

  root.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-remove");
    if (!btn) return;
    const idx = btn.getAttribute("data-remove");
    const row = root.querySelector(`#auth-${idx}`);
    if (row) row.remove();
    if (getRows(root).length === 0) addRow(root);
    setListError(root, "");
  });

  root.addEventListener("input", (e) => {
    const row = e.target.closest(".auth-row");
    if (row) clearRowError(row);
    setListError(root, "");
  });
}

// export function validate(root) {
//   const errs = [];
//   setListError(root, "");

//   const rows = getRows(root);
//   let completed = 0;

//   rows.forEach((row) => {
//     const idx = row.getAttribute("data-index");
//     const name = row.querySelector(`#auth-${idx}-name`)?.value.trim() || "";
//     const number = row.querySelector(`#auth-${idx}-number`)?.value.trim() || "";

//     if (!name && !number) {
//       setRowError(row, "This row is empty — remove it or fill in both fields.");
//       errs.push({
//         id: row.id,
//         text: "Remove or complete the empty authorised person row.",
//       });
//       return;
//     }
//     if (!name || !number) {
//       setRowError(row, "Please fill in both Name and Customer Number.");
//       errs.push({ id: row.id, text: "Fill in both Name and Customer Number." });
//       return;
//     }
//     completed++;
//   });

//   if (completed === 0) {
//     setListError(root, "Add at least one authorised person.");
//     errs.push({ id: "authList", text: "Add at least one authorised person." });
//   }

//   return errs;
// }

export function collect(root, store) {
  const people = getRows(root)
    .map((row) => {
      const idx = row.getAttribute("data-index");
      return {
        name: row.querySelector(`#auth-${idx}-name`)?.value.trim() || "",
        number: row.querySelector(`#auth-${idx}-number`)?.value.trim() || "",
      };
    })
    .filter((p) => p.name && p.number);

  store.set("step5", { people });

}
