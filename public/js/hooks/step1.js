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
  ["kyc", "ind_reflect", "company_match", "related_updated"].forEach((name) => {
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
  prefillChecks(FIELD_MAP.buid_correct, saved.buid_correct);
  prefillChecks(FIELD_MAP.trust_letter, saved.trust_letter);

  // Clear errors on change
  industrySel?.addEventListener("change", (e) =>
    clearError(root, "f-industry", e.target)
  );

  ["kyc", "ind_reflect", "company_match", "related_updated"].forEach((name) => {
    root.querySelectorAll(`input[name="${name}"]`).forEach((radio) => {
      radio.addEventListener("change", () =>
        clearError(root, FIELD_MAP[name], radio)
      );
    });
  });

  [FIELD_MAP.buid_correct, FIELD_MAP.trust_letter].forEach((fid) => {
    root.querySelectorAll(`#${fid} input[type="checkbox"]`).forEach((cb) => {
      cb.addEventListener("change", () => clearError(root, fid, cb));
    });
  });
}

export function validate(root) {
  const errs = [];

  // 1) Industry required
  const industrySel = root.querySelector("#industry");
  if (!industrySel || !industrySel.value) {
    setError(
      root,
      "f-industry",
      "Choose an industry",
      industrySel || undefined
    );
    errs.push({ id: "f-industry", text: "Choose an industry" });
  } else {
    clearError(root, "f-industry", industrySel);
  }

  // 2) Radio groups required
  const radioRequired = [
    ["kyc", "Confirm KYC/AML compliance"],
    ["ind_reflect", "Confirm eBOS industry matches client’s industry"],
    ["company_match", "Confirm company details match eBOS/MAA"],
    [
      "related_updated",
      "Confirm related entities and beneficial owners are up to date",
    ],
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

  // 3) BUID checkboxes – must select at least one
  const buidChecked = [
    ...root.querySelectorAll(
      `#${FIELD_MAP.buid_correct} input[type="checkbox"]:checked`
    ),
  ];
  if (buidChecked.length === 0) {
    const first = root.querySelector(
      `#${FIELD_MAP.buid_correct} input[type="checkbox"]`
    );
    setError(
      root,
      FIELD_MAP.buid_correct,
      "Select at least one option",
      first || undefined
    );
    errs.push({
      id: FIELD_MAP.buid_correct,
      text: "Select at least one option",
    });
  } else {
    clearError(root, FIELD_MAP.buid_correct, buidChecked[0]);
  }

  // 4) Trust letter checkboxes – must select at least one
  const trustChecked = [
    ...root.querySelectorAll(
      `#${FIELD_MAP.trust_letter} input[type="checkbox"]:checked`
    ),
  ];
  if (trustChecked.length === 0) {
    const first = root.querySelector(
      `#${FIELD_MAP.trust_letter} input[type="checkbox"]`
    );
    setError(
      root,
      FIELD_MAP.trust_letter,
      "Select at least one option",
      first || undefined
    );
    errs.push({
      id: FIELD_MAP.trust_letter,
      text: "Select at least one option",
    });
  } else {
    clearError(root, FIELD_MAP.trust_letter, trustChecked[0]);
  }

  return errs;
}

export function collect(root, store) {
  const toArray = (fieldId) =>
    [
      ...root.querySelectorAll(`#${fieldId} input[type="checkbox"]:checked`),
    ].map((el) => el.value);

  const payload = {
    industry: root.querySelector("#industry")?.value || "",

    // radios
    kyc: root.querySelector('input[name="kyc"]:checked')?.value || "",
    ind_reflect:
      root.querySelector('input[name="ind_reflect"]:checked')?.value || "",
    company_match:
      root.querySelector('input[name="company_match"]:checked')?.value || "",
    related_updated:
      root.querySelector('input[name="related_updated"]:checked')?.value || "",

    // checkboxes
    buid_correct: toArray(FIELD_MAP.buid_correct),
    trust_letter: toArray(FIELD_MAP.trust_letter),
  };

  store.set("step1", payload);
}
