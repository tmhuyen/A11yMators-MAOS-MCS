// public/js/hooks/step2.js

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

// ⚠️ Adjust these IDs to match the `id` attributes in step-2.html
const FIELD_MAP = {
  some_radio: "f-someRadio",
  another_radio: "f-anotherRadio",
  checklist_one: "f-checklistOne",
  checklist_two: "f-checklistTwo",
};

export function init(root, store) {
  const saved = store.get("step2") || {};

  // Prefill radios
  ["some_radio", "another_radio"].forEach((name) => {
    const v = saved[name];
    if (!v) return;
    const el = root.querySelector(`input[name="${name}"][value="${v}"]`);
    if (el) el.checked = true;
  });

  // Prefill checkboxes
  function prefillChecks(fieldId, vals) {
    const values = Array.isArray(vals) ? vals : vals ? [vals] : [];
    root
      .querySelectorAll(`#${fieldId} input[type="checkbox"]`)
      .forEach((cb) => {
        cb.checked = values.includes(cb.value);
      });
  }
  prefillChecks(FIELD_MAP.checklist_one, saved.checklist_one);
  prefillChecks(FIELD_MAP.checklist_two, saved.checklist_two);

  // Clear error on change
  ["some_radio", "another_radio"].forEach((name) => {
    root.querySelectorAll(`input[name="${name}"]`).forEach((radio) => {
      radio.addEventListener("change", () =>
        clearError(root, FIELD_MAP[name], radio)
      );
    });
  });
  [FIELD_MAP.checklist_one, FIELD_MAP.checklist_two].forEach((fid) => {
    root.querySelectorAll(`#${fid} input[type="checkbox"]`).forEach((cb) => {
      cb.addEventListener("change", () => clearError(root, fid, cb));
    });
  });
}

export function validate(root) {
  const errs = [];

  // Radios required
  const radioRequired = [
    ["some_radio", "Select an option for Some Radio"],
    ["another_radio", "Select an option for Another Radio"],
  ];
  radioRequired.forEach(([name, message]) => {
    const checked = root.querySelector(`input[name="${name}"]:checked`);
    if (!checked) {
      const first = root.querySelector(`input[name="${name}"]`);
      setError(root, FIELD_MAP[name], message, first || undefined);
      errs.push({ id: FIELD_MAP[name], text: message });
    } else {
      clearError(root, FIELD_MAP[name], checked);
    }
  });

  // Checkbox groups required
  [FIELD_MAP.checklist_one, FIELD_MAP.checklist_two].forEach((fid) => {
    const checked = [
      ...root.querySelectorAll(`#${fid} input[type="checkbox"]:checked`),
    ];
    if (checked.length === 0) {
      const first = root.querySelector(`#${fid} input[type="checkbox"]`);
      setError(root, fid, "Select at least one option", first || undefined);
      errs.push({ id: fid, text: "Select at least one option" });
    } else {
      clearError(root, fid, checked[0]);
    }
  });

  return errs;
}

export function collect(root, store) {
  const toArray = (fid) =>
    [...root.querySelectorAll(`#${fid} input[type="checkbox"]:checked`)].map(
      (el) => el.value
    );

  const payload = {
    some_radio:
      root.querySelector('input[name="some_radio"]:checked')?.value || "",
    another_radio:
      root.querySelector('input[name="another_radio"]:checked')?.value || "",
    checklist_one: toArray(FIELD_MAP.checklist_one),
    checklist_two: toArray(FIELD_MAP.checklist_two),
  };

  store.set("step2", payload);
}
