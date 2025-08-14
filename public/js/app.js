import * as store from "./store.js";
import * as s1 from "./hooks/step1.js";
import * as s2 from "./hooks/step2.js";
import * as s3 from "./hooks/step3.js";
import * as s4 from "./hooks/step4.js";
import * as s5 from "./hooks/step5.js";
import * as s6 from "./hooks/step6.js";
import * as s7 from "./hooks/step7.js";
import * as s8 from "./hooks/step8.js";
import * as s9 from "./hooks/step9.js";

const hooks = { 1: s1, 2: s2, 3: s3, 4: s4, 5: s5, 6: s6, 7: s7, 8: s8, 9: s9 };
const TOTAL = 9; // set to your actual number of steps
let step = 1;

const container = document.getElementById("step-container");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progressEl = document.getElementById("progressFill");
const errorSummary = document.getElementById("errorSummary");
const statusEl = document.getElementById("status");
const stepIndicator = document.getElementById("stepIndicator");

function setStepIndicator(n) {
  if (stepIndicator) stepIndicator.textContent = `Step ${n} of ${TOTAL}`;
}
// put near top of app.js
function ensureErrorSummary() {
  let el = document.getElementById("errorSummary");
  if (!el) {
    el = document.createElement("div");
    el.id = "errorSummary";
    el.className = "status status--error mt-16";
    el.hidden = true;
    el.setAttribute("role", "alert");
    el.tabIndex = -1;
    const container = document.querySelector(".container");
    const anchor = document.getElementById("step-container");
    container.insertBefore(el, anchor); // insert just above the step
  }
  return el;
}

function setProgress() {
  progressEl.style.width = `${Math.round((step / TOTAL) * 100)}%`;
}

// Turn .status.status--info into tooltip icons
function convertStatusesToTooltips(root = document) {
  root.querySelectorAll(".field").forEach((field) => {
    const status = field.querySelector(".status.status--info");
    if (!status) return;

    const labelEl =
      field.querySelector(".label") || field.querySelector("label");
    if (!labelEl) {
      status.remove();
      return;
    }

    const tipText = status.textContent.replace(/\s+/g, " ").trim();
    if (!tipText) {
      status.remove();
      return;
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "info-btn";
    btn.setAttribute("aria-label", tipText);
    btn.textContent = "i";

    labelEl.appendChild(document.createTextNode(" "));
    labelEl.appendChild(btn);
    status.remove();
  });
}

function convertYesNoToButtonGroups(root = document) {
  root.querySelectorAll('.choices[role="radiogroup"]').forEach((choices) => {
    const radios = [...choices.querySelectorAll('input[type="radio"]')];
    if (radios.length !== 2) return; // Only Yes/No
    const labels = radios.map((r) => r.value.trim().toLowerCase());
    if (!labels.includes("yes") || !labels.includes("no")) return;

    // Hide original choices visually
    choices.classList.add("visually-hidden");
    choices.setAttribute("aria-hidden", "true");

    const yesRadio = radios.find((r) => r.value.toLowerCase() === "yes");
    const noRadio = radios.find((r) => r.value.toLowerCase() === "no");

    // Create button group
    const group = document.createElement("div");
    group.className = "btn-group";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", choices.getAttribute("aria-label") || "");

    const yesBtn = document.createElement("button");
    yesBtn.type = "button";
    yesBtn.className = "btn-option";
    yesBtn.textContent = "Yes";

    const noBtn = document.createElement("button");
    noBtn.type = "button";
    noBtn.className = "btn-option";
    noBtn.textContent = "No";

    function update(selected) {
      yesBtn.setAttribute("aria-pressed", String(selected === "yes"));
      noBtn.setAttribute("aria-pressed", String(selected === "no"));
      yesRadio.checked = selected === "yes";
      noRadio.checked = selected === "no";
      (selected === "yes" ? yesRadio : noRadio).dispatchEvent(
        new Event("change", { bubbles: true })
      );
    }

    yesBtn.addEventListener("click", () => update("yes"));
    noBtn.addEventListener("click", () => update("no"));

    // Initialize from radio state
    update(yesRadio.checked ? "yes" : "no");

    group.appendChild(yesBtn);
    group.appendChild(noBtn);

    choices.parentElement.insertBefore(group, choices);
  });
}

async function loadStep(n) {
  const url = `./steps/step-${n}.html`;
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url} (${res.status})`);
    }
    const html = await res.text();
    container.innerHTML = html;
    updateStepUI(n);
    container.focus({ preventScroll: true });
    setProgress();
    convertStatusesToTooltips(container);
    convertYesNoToButtonGroups(container);
    setStepIndicator(n);
    hooks[n]?.init?.(container, store);
    updateButtons();
    console.log(`[router] loaded step ${n}`);
  } catch (e) {
    console.error(`[router] loadStep(${n}) error:`, e);
    container.innerHTML = `
      <div class="status status--error">
        Unable to load step ${n}. ${e?.message || ""}
      </div>`;
  }
}

function updateButtons() {
  prevBtn.disabled = step === 1;
  nextBtn.textContent = step === TOTAL ? "Submit" : "Next";
}

function showErrors(messages) {
  const summary = ensureErrorSummary(); // <— always exists now
  if (!messages?.length) {
    summary.hidden = true;
    return;
  }
  summary.hidden = false;
  summary.innerHTML = `<strong>There’s a problem</strong><ul style="margin:.5rem 0 0 1rem">
    ${messages.map((m) => `<li><a href="#${m.id}">${m.text}</a></li>`).join("")}
  </ul>`;
  summary.focus();

  // scroll first bad field into view
  const firstId = messages[0]?.id;
  if (firstId) {
    const el = document.getElementById(firstId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function updateStepUI(currentStep) {
  const btnPreview = document.getElementById("btnPreview");
  const btnExport = document.getElementById("btn-export");
  const tip = document.getElementById("tip");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (currentStep === 8) {
    nextBtn.textContent = "Submit";
  }
  if (currentStep === 9) {
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
  } else {
  }
}

prevBtn.addEventListener("click", async () => {
  try {
    // Save whatever the user has on this step before going back (no validation on prev)
    hooks[step]?.collect?.(container, store);

    // Clear any visible errors
    showErrors(null);

    if (step > 1) {
      step--;
      await loadStep(step);
      const nextBtn = document.getElementById("nextBtn");
      nextBtn.style.display = "inline-block"; // loadStep already calls updateStepUI() + updateButtons() + setProgress()
      // No need to call updateStepUI(step) here again
    }
  } catch (e) {
    console.error("[prev] click handler crashed:", e);
    statusEl.className = "status status--error mt-16";
    statusEl.textContent = `Something went wrong: ${e?.message || e}`;
  }
});

nextBtn.addEventListener("click", async () => {
  try {
    console.log(`[next] validating step ${step}…`);

    // validate current step
    const errs = (await hooks[step]?.validate?.(container, store)) || [];
    console.log(`[next] validation result: ${errs.length} error(s)`, errs);

    if (errs.length) {
      showErrors(errs);
      return;
    }
    showErrors(null);

    // collect current step data
    hooks[step]?.collect?.(container, store);
    console.log(
      `[next] collected data snapshot:`,
      JSON.parse(JSON.stringify(store.data))
    );

    if (step < TOTAL) {
      step++;
      await loadStep(step);
      updateStepUI(step);
    } else {
      // already on step 9; nothing else
    }
  } catch (e) {
    console.error("[next] click handler crashed:", e);
    statusEl.className = "status status--error mt-16";
    statusEl.textContent = `Something went wrong: ${e?.message || e}`;
  }
});

loadStep(step);
