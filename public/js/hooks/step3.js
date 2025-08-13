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
  const saved = store.get("step3");
  const names = [
    "cs_legalname",
    "cs_relgroup",
    "cs_signatories",
    "cs_accpricing",
    "cs_ebanking",
    "cs_bsb",
    "cs_kycsection",
    "cs_followup",
  ];
  names.forEach((n) => {
    const v = saved?.[n];
    if (!v) return;
    const el = root.querySelector(`input[name="${n}"][value="${v}"]`);
    if (el) el.checked = true;
    root
      .querySelectorAll(`input[name="${n}"]`)
      .forEach((r) =>
        r.addEventListener("change", () => clearError(root, map[n], r))
      );
  });
  var map = {
    cs_legalname: "f-cs-legalname",
    cs_relgroup: "f-cs-relgroup",
    cs_signatories: "f-cs-signatories",
    cs_accpricing: "f-cs-accpricing",
    cs_ebanking: "f-cs-ebanking",
    cs_bsb: "f-cs-bsb",
    cs_kycsection: "f-cs-kycsection",
    cs_followup: "f-cs-followup",
  };
}

// export function validate(root) {
//   const fields = [
//     [
//       "cs_legalname",
//       "f-cs-legalname",
//       "Confirm business legal name matches MAA and MCN",
//     ],
//     [
//       "cs_relgroup",
//       "f-cs-relgroup",
//       "Confirm Relationship Group is valid and belongs to the client",
//     ],
//     [
//       "cs_signatories",
//       "f-cs-signatories",
//       "Confirm signatory customer numbers are correct",
//     ],
//     [
//       "cs_accpricing",
//       "f-cs-accpricing",
//       "Confirm Account Details/Pricing are complete and docs provided",
//     ],
//     [
//       "cs_ebanking",
//       "f-cs-ebanking",
//       "Confirm Electronic Banking Services reviewed and section completed",
//     ],
//     [
//       "cs_bsb",
//       "f-cs-bsb",
//       "Confirm eligible BSB is provided for account setup",
//     ],
//     [
//       "cs_kycsection",
//       "f-cs-kycsection",
//       "Confirm KYC section completed and dated",
//     ],
//     ["cs_followup", "f-cs-followup", "Confirm final follow-up call completed"],
//   ];
//   const errs = [];
//   fields.forEach(([name, fieldId, msg]) => {
//     const checked = root.querySelector(`input[name="${name}"]:checked`);
//     if (!checked) {
//       const first = root.querySelector(`input[name="${name}"]`);
//       setError(root, fieldId, msg, first);
//       errs.push({ id: fieldId, text: msg });
//     } else {
//       clearError(root, fieldId, checked);
//     }
//   });
//   return errs;
// }

export function collect(root, store) {
  const names = [
    "cs_legalname",
    "cs_relgroup",
    "cs_signatories",
    "cs_accpricing",
    "cs_ebanking",
    "cs_bsb",
    "cs_kycsection",
    "cs_followup",
  ];
  const payload = {};
  names.forEach((n) => {
    payload[n] = root.querySelector(`input[name="${n}"]:checked`)?.value || "";
  });
  store.set("step3", payload);

}
