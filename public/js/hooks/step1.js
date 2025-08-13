// public/js/hooks/step1.js

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

const FIELD_MAP = {
  kyc: "f-kyc",
  ind_reflect: "f-indReflect",
  company_match: "f-company",
  buid_correct: "f-buid",
  related_updated: "f-related",
  trust_letter: "f-letter",
};

export function init(root, store) {
  const saved = store.get("step1") || {};

  // Prefill dropdown
  const industrySel = root.querySelector("#industry");
  if (saved.industry) industrySel.value = saved.industry;

  // Prefill radios
  Object.keys(FIELD_MAP).forEach((name) => {
    const v = saved[name];
    if (!v) return;
    const el = root.querySelector(`input[name="${name}"][value="${v}"]`);
    if (el) el.checked = true;
  });

  // Clear errors on change
  industrySel?.addEventListener("change", (e) =>
    clearError(root, "f-industry", e.target)
  );
  Object.keys(FIELD_MAP).forEach((name) => {
    root.querySelectorAll(`input[name="${name}"]`).forEach((radio) => {
      radio.addEventListener("change", () =>
        clearError(root, FIELD_MAP[name], radio)
      );
    });
  });
}

// export function validate(root) {
//   const errs = [];

//   // 1) Industry required
//   const industrySel = root.querySelector("#industry");
//   if (!industrySel || !industrySel.value) {
//     setError(
//       root,
//       "f-industry",
//       "Choose an industry",
//       industrySel || undefined
//     );
//     errs.push({ id: "f-industry", text: "Choose an industry" });
//   } else {
//     clearError(root, "f-industry", industrySel);
//   }

//   // 2) Required radios
//   const requiredGroups = [
//     ["kyc", "Confirm KYC/AML compliance"],
//     ["ind_reflect", "Confirm eBOS industry matches client’s industry"],
//     ["company_match", "Confirm company details match eBOS/MAA"],
//     ["buid_correct", "Confirm banker details and BUIDs are correct"],
//     [
//       "related_updated",
//       "Confirm related entities and beneficial owners are up to date",
//     ],
//   ];

//   requiredGroups.forEach(([name, message]) => {
//     const checked = root.querySelector(`input[name="${name}"]:checked`);
//     if (!checked) {
//       const first = root.querySelector(`input[name="${name}"]`);
//       setError(root, FIELD_MAP[name], message, first || undefined);
//       errs.push({ id: FIELD_MAP[name], text: message });
//     } else {
//       clearError(root, FIELD_MAP[name], checked);
//     }
//   });

//   // 3) Trust letter required only when industry = Accounting
//   const needLetter = industrySel?.value === "Accounting";
//   const letterChecked = root.querySelector(
//     `input[name="trust_letter"]:checked`
//   );
//   if (needLetter) {
//     if (!letterChecked || letterChecked.value === "N/A") {
//       const first = root.querySelector(`input[name="trust_letter"]`);
//       setError(
//         root,
//         FIELD_MAP.trust_letter,
//         "Confirm Trust Account letter status (required for Accounting)",
//         first || undefined
//       );
//       errs.push({
//         id: FIELD_MAP.trust_letter,
//         text: "Confirm Trust Account letter status (required for Accounting)",
//       });
//     } else {
//       clearError(root, FIELD_MAP.trust_letter, letterChecked);
//     }
//   } else {
//     // Not Accounting → allow any selection (including none)
//     if (letterChecked) clearError(root, FIELD_MAP.trust_letter, letterChecked);
//   }

//   return errs;
// }

export function collect(root, store) {
  const payload = {
    industry: root.querySelector("#industry")?.value || "",
    kyc: root.querySelector('input[name="kyc"]:checked')?.value || "",
    ind_reflect:
      root.querySelector('input[name="ind_reflect"]:checked')?.value || "",
    company_match:
      root.querySelector('input[name="company_match"]:checked')?.value || "",
    buid_correct:
      root.querySelector('input[name="buid_correct"]:checked')?.value || "",
    related_updated:
      root.querySelector('input[name="related_updated"]:checked')?.value || "",
    trust_letter:
      root.querySelector('input[name="trust_letter"]:checked')?.value || "",
  };
  store.set("step1", payload);

}
