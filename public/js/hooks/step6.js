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
  const saved = store.get("step6");
  if (saved) {
    const apraEl = root.querySelector("#apraCode");
    if (apraEl) apraEl.value = saved.apraCode || "";

    const industryEl = root.querySelector("#industryClass");
    if (industryEl) industryEl.value = saved.industryClass || "";

    const orgEl = root.querySelector("#orgType");
    if (orgEl) orgEl.value = saved.orgType || "";

    const confirmEl = root.querySelector("#kycConfirm");
    if (confirmEl) confirmEl.checked = !!saved.kycConfirm;

    const dateEl = root.querySelector("#kycDate");
    if (dateEl) dateEl.value = saved.kycDate || "";
  }

  // Clear errors on input/change
  [
    ["f-apra", "#apraCode"],
    ["f-industry-class", "#industryClass"],
    ["f-orgtype", "#orgType"],
    ["f-kyc-date", "#kycDate"],
  ].forEach(([fid, sel]) => {
    const el = root.querySelector(sel);
    if (el) {
      el.addEventListener("input", () => clearError(root, fid, el));
      el.addEventListener("change", () => clearError(root, fid, el));
    }
  });
  const cb = root.querySelector("#kycConfirm");
  if (cb)
    cb.addEventListener("change", () => clearError(root, "f-kyc-confirm", cb));
}

// export function validate(root) {
//   const errs = [];

//   const apra = root.querySelector("#apraCode");
//   if (!apra.value.trim()) {
//     setError(root, "f-apra", "Enter the APRA Code", apra);
//     errs.push({ id: "f-apra", text: "Enter the APRA Code" });
//   } else clearError(root, "f-apra", apra);

//   const ind = root.querySelector("#industryClass");
//   if (!ind.value.trim()) {
//     setError(root, "f-industry-class", "Enter the Industry Class Code", ind);
//     errs.push({
//       id: "f-industry-class",
//       text: "Enter the Industry Class Code",
//     });
//   } else clearError(root, "f-industry-class", ind);

//   const org = root.querySelector("#orgType");
//   if (!org.value.trim()) {
//     setError(root, "f-orgtype", "Enter the Organisation Type", org);
//     errs.push({ id: "f-orgtype", text: "Enter the Organisation Type" });
//   } else clearError(root, "f-orgtype", org);

//   const cb = root.querySelector("#kycConfirm");
//   if (!cb.checked) {
//     setError(root, "f-kyc-confirm", "You must confirm the KYC declaration", cb);
//     errs.push({
//       id: "f-kyc-confirm",
//       text: "You must confirm the KYC declaration",
//     });
//   } else clearError(root, "f-kyc-confirm", cb);

//   const dateEl = root.querySelector("#kycDate");
//   if (!dateEl.value) {
//     setError(root, "f-kyc-date", "Select the date", dateEl);
//     errs.push({ id: "f-kyc-date", text: "Select the date" });
//   } else {
//     clearError(root, "f-kyc-date", dateEl);
//   }

//   return errs;
// }

export function collect(root, store) {
  const payload = {
    apraCode: root.querySelector("#apraCode")?.value.trim() || "",
    industryClass: root.querySelector("#industryClass")?.value.trim() || "",
    orgType: root.querySelector("#orgType")?.value.trim() || "",
    kycConfirm: !!root.querySelector("#kycConfirm")?.checked,
    kycDate: root.querySelector("#kycDate")?.value || "", // yyyy-mm-dd
  };
  store.set("step6", payload);
  Object.assign(store.data, payload);
}
