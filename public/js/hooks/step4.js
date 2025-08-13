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

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const phoneRe = /^[0-9()+\-\s]{6,}$/;
const validAbnAcn = (v) => {
  const s = (v || "").replace(/\s+/g, "");
  return /^\d{11}$/.test(s) || /^\d{9}$/.test(s);
};
const validMcn = (v) => /^\d{9}$/.test((v || "").replace(/\s+/g, ""));
const parseEmails = (t) =>
  (t || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

export function init(root, store) {
  const saved = store.get("step4");
  if (saved) {
    [
      ["legalName", "#legalName", "f-legal-name"],
      ["mcn", "#mcn", "f-mcn"],
      ["abnAcn", "#abnAcn", "f-abnacn"],
      ["relNo", "#relNo", "f-rel-no"],
      ["relName", "#relName", "f-rel-name"],
      ["contactName", "#contactName", "f-contact-name"],
      ["contactNumber", "#contactNumber", "f-contact-number"],
      ["emails", "#emails", "f-emails"],
    ].forEach(([k, sel]) => {
      const el = root.querySelector(sel);
      if (el && saved[k] != null) el.value = saved[k];
    });
  }

  // clear errors on input/change
  root.querySelectorAll("input,textarea,select").forEach((ctrl) => {
    const fieldId = ctrl.closest(".field")?.id;
    ctrl.addEventListener("input", () => clearError(root, fieldId, ctrl));
    ctrl.addEventListener("change", () => clearError(root, fieldId, ctrl));
  });
}

// export function validate(root) {
//   const errs = [];

//   const legalName = root.querySelector("#legalName");
//   if (!legalName.value.trim()) {
//     setError(
//       root,
//       "f-legal-name",
//       "Enter the business full legal name",
//       legalName
//     );
//     errs.push({
//       id: "f-legal-name",
//       text: "Enter the business full legal name",
//     });
//   } else clearError(root, "f-legal-name", legalName);

//   const mcn = root.querySelector("#mcn");
//   if (!validMcn(mcn.value)) {
//     setError(root, "f-mcn", "Enter a 9-digit MCN", mcn);
//     errs.push({ id: "f-mcn", text: "Enter a 9-digit MCN" });
//   } else clearError(root, "f-mcn", mcn);

//   const abnAcn = root.querySelector("#abnAcn");
//   if (!validAbnAcn(abnAcn.value)) {
//     setError(
//       root,
//       "f-abnacn",
//       "Enter a valid ABN (11 digits) or ACN (9 digits)",
//       abnAcn
//     );
//     errs.push({
//       id: "f-abnacn",
//       text: "Enter a valid ABN (11 digits) or ACN (9 digits)",
//     });
//   } else clearError(root, "f-abnacn", abnAcn);

//   const relNo = root.querySelector("#relNo");
//   if (!relNo.value.trim()) {
//     setError(root, "f-rel-no", "Enter the Relationship Group Number", relNo);
//     errs.push({ id: "f-rel-no", text: "Enter the Relationship Group Number" });
//   } else clearError(root, "f-rel-no", relNo);

//   const relName = root.querySelector("#relName");
//   if (!relName.value.trim()) {
//     setError(root, "f-rel-name", "Enter the Relationship Group Name", relName);
//     errs.push({ id: "f-rel-name", text: "Enter the Relationship Group Name" });
//   } else clearError(root, "f-rel-name", relName);

//   const contactName = root.querySelector("#contactName");
//   if (!contactName.value.trim()) {
//     setError(root, "f-contact-name", "Enter the contact name", contactName);
//     errs.push({ id: "f-contact-name", text: "Enter the contact name" });
//   } else clearError(root, "f-contact-name", contactName);

//   const contactNumber = root.querySelector("#contactNumber");
//   if (!phoneRe.test(contactNumber.value.trim())) {
//     setError(
//       root,
//       "f-contact-number",
//       "Enter a valid contact number",
//       contactNumber
//     );
//     errs.push({ id: "f-contact-number", text: "Enter a valid contact number" });
//   } else clearError(root, "f-contact-number", contactNumber);

//   const emails = root.querySelector("#emails");
//   const list = parseEmails(emails.value);
//   if (list.length === 0 || !list.every((e) => emailRe.test(e))) {
//     setError(
//       root,
//       "f-emails",
//       "Enter at least one valid email (one per line)",
//       emails
//     );
//     errs.push({
//       id: "f-emails",
//       text: "Enter at least one valid email (one per line)",
//     });
//   } else clearError(root, "f-emails", emails);

//   return errs;
// }

export function collect(root, store) {
  const payload = {
    legalName: root.querySelector("#legalName")?.value.trim() || "",
    mcn: root.querySelector("#mcn")?.value.trim() || "",
    abnAcn: root.querySelector("#abnAcn")?.value.trim() || "",
    relNo: root.querySelector("#relNo")?.value.trim() || "",
    relName: root.querySelector("#relName")?.value.trim() || "",
    contactName: root.querySelector("#contactName")?.value.trim() || "",
    contactNumber: root.querySelector("#contactNumber")?.value.trim() || "",
    emails: root.querySelector("#emails")?.value.trim() || "",
  };
  store.set("step4", payload);

}
