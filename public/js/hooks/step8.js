// public/js/hooks/step8.js

function setError(root, fieldId, msg) {
  var wrap = root.querySelector("#" + fieldId);
  if (!wrap) return;
  wrap.classList.add("error");
  var slot = wrap.querySelector(".error-text span:last-child");
  if (slot) slot.textContent = msg;
}
function clearError(root, fieldId) {
  var wrap = root.querySelector("#" + fieldId);
  if (!wrap) return;
  wrap.classList.remove("error");
  var slot = wrap.querySelector(".error-text span:last-child");
  if (slot) slot.textContent = "";
}

var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
var phoneRe = /^[0-9()+\-\s]{6,}$/;
var bsbRe = /^\d{6}$/;
var buidRe = /^[A-Za-z0-9]{4,10}$/;
var tdRe = /^\d{6,16}$/;

export function init(root, store) {
  var saved = store.get("step8") || {};

  // restore values if present
  var map = [
    ["#p_name", saved.p_name],
    ["#p_title", saved.p_title],
    ["#p_email", saved.p_email],
    ["#p_phone", saved.p_phone],
    ["#p_buid", saved.p_buid],
    ["#p_bsb", saved.p_bsb],
    ["#p_osa", saved.p_osa],
    ["#p_td", saved.p_td],
    ["#s_name", saved.s_name],
    ["#s_title", saved.s_title],
    ["#s_email", saved.s_email],
    ["#s_phone", saved.s_phone],
  ];
  for (var i = 0; i < map.length; i++) {
    var el = root.querySelector(map[i][0]);
    if (el && map[i][1] != null) el.value = map[i][1];
  }

  // clear errors while typing
  root.addEventListener("input", function (e) {
    var f = e.target.closest(".field");
    if (f) f.classList.remove("error");
  });
  root.addEventListener("change", function (e) {
    var f = e.target.closest(".field");
    if (f) f.classList.remove("error");
  });
}

export function validate(root) {
  var errs = [];

  // Primary (all required)
  var p_name = (root.querySelector("#p_name") || {}).value || "";
  var p_title = (root.querySelector("#p_title") || {}).value || "";
  var p_email = (root.querySelector("#p_email") || {}).value || "";
  var p_phone = (root.querySelector("#p_phone") || {}).value || "";
  var p_buid = (root.querySelector("#p_buid") || {}).value || "";
  var p_bsb = (root.querySelector("#p_bsb") || {}).value || "";
  var p_osa = (root.querySelector("#p_osa") || {}).value || "";
  var p_td = (root.querySelector("#p_td") || {}).value || "";

  if (!p_name.trim()) {
    setError(root, "f-p-name", "Enter banker name");
    errs.push({ id: "f-p-name", text: "Enter banker name" });
  }
  if (!p_title.trim()) {
    setError(root, "f-p-title", "Enter banker position title");
    errs.push({ id: "f-p-title", text: "Enter banker position title" });
  }
  if (!emailRe.test(p_email.trim())) {
    setError(root, "f-p-email", "Enter a valid email");
    errs.push({ id: "f-p-email", text: "Enter a valid email" });
  }
  if (!phoneRe.test(p_phone.trim())) {
    setError(root, "f-p-phone", "Enter a valid phone number");
    errs.push({ id: "f-p-phone", text: "Enter a valid phone number" });
  }
  if (!buidRe.test(p_buid.trim())) {
    setError(root, "f-p-buid", "Enter a valid BUID (4–10 letters/numbers)");
    errs.push({ id: "f-p-buid", text: "Enter a valid BUID" });
  }
  if (!bsbRe.test(p_bsb.trim())) {
    setError(root, "f-p-bsb", "Enter a 6-digit BSB");
    errs.push({ id: "f-p-bsb", text: "Enter a 6-digit BSB" });
  }
  if (!p_osa.trim()) {
    setError(root, "f-p-osa", "Enter Banker OSA");
    errs.push({ id: "f-p-osa", text: "Enter Banker OSA" });
  }
  if (!tdRe.test(p_td.trim())) {
    setError(
      root,
      "f-p-td",
      "Enter a valid TD Disposals Account Number (6–16 digits)"
    );
    errs.push({
      id: "f-p-td",
      text: "Enter a valid TD Disposals Account Number",
    });
  }

  // Secondary (optional; validate only if filled)
  var s_name = (root.querySelector("#s_name") || {}).value || "";
  var s_title = (root.querySelector("#s_title") || {}).value || "";
  var s_email = (root.querySelector("#s_email") || {}).value || "";
  var s_phone = (root.querySelector("#s_phone") || {}).value || "";

  if (s_email.trim() && !emailRe.test(s_email.trim())) {
    setError(root, "f-s-email", "Enter a valid email");
    errs.push({ id: "f-s-email", text: "Secondary: enter a valid email" });
  }
  if (s_phone.trim() && !phoneRe.test(s_phone.trim())) {
    setError(root, "f-s-phone", "Enter a valid phone number");
    errs.push({
      id: "f-s-phone",
      text: "Secondary: enter a valid phone number",
    });
  }

  return errs;
}

export function collect(root, store) {
  var data = {
    p_name:
      (root.querySelector("#p_name") && root.querySelector("#p_name").value) ||
      "",
    p_title:
      (root.querySelector("#p_title") &&
        root.querySelector("#p_title").value) ||
      "",
    p_email:
      (root.querySelector("#p_email") &&
        root.querySelector("#p_email").value) ||
      "",
    p_phone:
      (root.querySelector("#p_phone") &&
        root.querySelector("#p_phone").value) ||
      "",
    p_buid:
      (root.querySelector("#p_buid") && root.querySelector("#p_buid").value) ||
      "",
    p_bsb:
      (root.querySelector("#p_bsb") && root.querySelector("#p_bsb").value) ||
      "",
    p_osa:
      (root.querySelector("#p_osa") && root.querySelector("#p_osa").value) ||
      "",
    p_td:
      (root.querySelector("#p_td") && root.querySelector("#p_td").value) || "",
    s_name:
      (root.querySelector("#s_name") && root.querySelector("#s_name").value) ||
      "",
    s_title:
      (root.querySelector("#s_title") &&
        root.querySelector("#s_title").value) ||
      "",
    s_email:
      (root.querySelector("#s_email") &&
        root.querySelector("#s_email").value) ||
      "",
    s_phone:
      (root.querySelector("#s_phone") &&
        root.querySelector("#s_phone").value) ||
      "",
  };

  store.set("step8", data);
  for (var k in data) store.data[k] = data[k];
}
