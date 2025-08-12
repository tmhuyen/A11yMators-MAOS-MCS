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
      if (!prev.includes(errId))
        control.setAttribute("aria-describedby", `${prev} ${errId}`.trim());
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

export function init(root, store) {
  const saved = store.get("step2");
  const names = [
    "maa_current",
    "maa_mandatory",
    "maa_min_auth",
    "maa_ebobs",
    "maa_sections",
    "maa_signed",
    "maa_callback",
  ];
  names.forEach((n) => {
    const v = saved?.[n];
    if (!v) return;
    const el = root.querySelector(`input[name="${n}"][value="${v}"]`);
    if (el) el.checked = true;
    // clear on change
    root
      .querySelectorAll(`input[name="${n}"]`)
      .forEach((r) =>
        r.addEventListener("change", () => clearError(root, map[n], r))
      );
  });
  var map = {
    maa_current: "f-maa-current",
    maa_mandatory: "f-maa-mandatory",
    maa_min_auth: "f-maa-min-auth",
    maa_ebobs: "f-maa-ebobs",
    maa_sections: "f-maa-sections",
    maa_signed: "f-maa-signed",
    maa_callback: "f-maa-callback",
  };
}

export function validate(root) {
  const fields = [
    [
      "maa_current",
      "f-maa-current",
      "Confirm the current MAA is completed and submitted",
    ],
    [
      "maa_mandatory",
      "f-maa-mandatory",
      "Confirm mandatory details are completed and match eBOS",
    ],
    [
      "maa_min_auth",
      "f-maa-min-auth",
      "Confirm minimum authorised persons with correct authority",
    ],
    [
      "maa_ebobs",
      "f-maa-ebobs",
      "Confirm signatories have eBOS profiles and KYC/AML completed",
    ],
    [
      "maa_sections",
      "f-maa-sections",
      "Confirm Authorisations & Declarations sections are completed",
    ],
    [
      "maa_signed",
      "f-maa-signed",
      "Confirm MAA is dated and signed per AAC policy",
    ],
    [
      "maa_callback",
      "f-maa-callback",
      "Confirm callback verification of signatories",
    ],
  ];
  const errs = [];
  fields.forEach(([name, fieldId, msg]) => {
    const checked = root.querySelector(`input[name="${name}"]:checked`);
    if (!checked) {
      const first = root.querySelector(`input[name="${name}"]`);
      setError(root, fieldId, msg, first);
      errs.push({ id: fieldId, text: msg });
    } else {
      clearError(root, fieldId, checked);
    }
  });
  return errs;
}

export function collect(root, store) {
  const names = [
    "maa_current",
    "maa_mandatory",
    "maa_min_auth",
    "maa_ebobs",
    "maa_sections",
    "maa_signed",
    "maa_callback",
  ];
  const payload = {};
  names.forEach((n) => {
    payload[n] = root.querySelector(`input[name="${n}"]:checked`)?.value || "";
  });
  store.set("step2", payload);
  Object.assign(store.data, payload);
}
