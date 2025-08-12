// public/js/hooks/step7.js

/* --------- small helpers --------- */
function setErr(root, wrapId, msg) {
  var wrap = root.querySelector("#" + wrapId);
  if (!wrap) return;
  wrap.classList.add("error");
  var slot = wrap.querySelector(".error-text span:last-child");
  if (slot) slot.textContent = msg;
}
function clearErr(root, wrapId) {
  var wrap = root.querySelector("#" + wrapId);
  if (!wrap) return;
  wrap.classList.remove("error");
  var slot = wrap.querySelector(".error-text span:last-child");
  if (slot) slot.textContent = "";
}
function getRadio(root, name) {
  var el = root.querySelector('input[name="' + name + '"]:checked');
  return el ? el.value : "";
}
function setChecked(root, id, val) {
  var el = root.querySelector("#" + id);
  if (el) el.checked = !!val;
}
function setValue(root, sel, val) {
  var el = root.querySelector(sel);
  if (el != null && val != null) el.value = val;
}
function enableWithin(panel, on) {
  if (!panel) return;
  var ctrls = panel.querySelectorAll("input,textarea,select,button");
  for (var i = 0; i < ctrls.length; i++) ctrls[i].disabled = !on;
}

/* --------- visibility toggles --------- */
function togglePanels(root) {
  // Account sections
  var accMap = {
    acc_cca: "accCCA",
    acc_bia: "accBIA",
    acc_bca: "accBCA",
    acc_bcm: "accBCM",
    acc_td: "accTD",
  };
  var anyAcc = false;
  for (var cbId in accMap) {
    var cb = root.querySelector("#" + cbId);
    var panel = root.querySelector("#" + accMap[cbId]);
    if (!cb || !panel) continue;
    var show = !!cb.checked;
    panel.classList.toggle("hidden", !show);
    cb.setAttribute("aria-expanded", show ? "true" : "false");
    enableWithin(panel, show);
    if (show) anyAcc = true;
  }
  var stmt = root.querySelector("#accStatement");
  if (stmt) {
    stmt.classList.toggle("hidden", !anyAcc);
    enableWithin(stmt, anyAcc);
  }

  // Electronic Access sections
  var eaMap = {
    ea_nabc: "eaNABC",
    ea_ib: "eaIB",
    ea_dlr_tx: "eaDLRTX",
    ea_dlr_td: "eaDLRTD",
    ea_dsi: "eaDSI",
    readd: "eaReAdd",
  };
  for (var k in eaMap) {
    var cb2 = root.querySelector("#" + k);
    var p2 = root.querySelector("#" + eaMap[k]);
    if (!cb2 || !p2) continue;
    var show2 = !!cb2.checked;
    p2.classList.toggle("hidden", !show2);
    cb2.setAttribute("aria-expanded", show2 ? "true" : "false");
    enableWithin(p2, show2);
  }
}

/* --------- lifecycle --------- */
export function init(root, store) {
  var saved = store.get("step7") || {};

  // restore checkboxes
  var ids = [
    "acc_cca",
    "acc_bia",
    "acc_bca",
    "acc_bcm",
    "acc_td",
    "ea_nabc",
    "ea_ib",
    "ea_dlr_tx",
    "ea_dlr_td",
    "ea_dsi",
    "readd",
  ];
  for (var i = 0; i < ids.length; i++) setChecked(root, ids[i], saved[ids[i]]);

  // restore radios
  var radioNames = [
    "cca_fee",
    "cca_rate",
    "bia_fee",
    "bca_fee",
    "bcm_rate",
    "td_rate",
    "stmt_cycle",
    "nabc_users",
    "nabc_services",
    "readd_users",
  ];
  for (var r = 0; r < radioNames.length; r++) {
    var nm = radioNames[r];
    if (!saved[nm]) continue;
    var rEl = root.querySelector(
      'input[name="' + nm + '"][value="' + saved[nm] + '"]'
    );
    if (rEl) rEl.checked = true;
  }

  // restore text/textarea values
  setValue(root, "#cca_margin", saved.cca_margin || "");
  setValue(root, "#bcm_margin", saved.bcm_margin || "");
  setValue(root, "#nabc_meid", saved.nabc_meid || "");
  setValue(root, "#nabc_users_list", saved.nabc_users_list || "");
  setValue(root, "#nabc_services_list", saved.nabc_services_list || "");
  setValue(root, "#ib_users", saved.ib_users || "");
  setValue(root, "#dlr_tx_mailbox", saved.dlr_tx_mailbox || "");
  setValue(root, "#dlr_tx_services", saved.dlr_tx_services || "");
  setValue(root, "#dlr_td_mailbox", saved.dlr_td_mailbox || "");
  setValue(root, "#readd_users_list", saved.readd_users_list || "");

  // initial visibility & disabled states
  togglePanels(root);

  // react to top-level checkboxes (account + EA)
  var changeSelectors = [
    "#acc_cca",
    "#acc_bia",
    "#acc_bca",
    "#acc_bcm",
    "#acc_td",
    "#ea_nabc",
    "#ea_ib",
    "#ea_dlr_tx",
    "#ea_dlr_td",
    "#ea_dsi",
    "#readd",
  ];
  for (var c = 0; c < changeSelectors.length; c++) {
    var el = root.querySelector(changeSelectors[c]);
    if (el)
      el.addEventListener("change", function () {
        togglePanels(root);
      });
  }

  // clear errors on interaction
  root.addEventListener("input", function (e) {
    var w = e.target.closest(".field");
    if (w) w.classList.remove("error");
  });
  root.addEventListener("change", function (e) {
    var w = e.target.closest(".field");
    if (w) w.classList.remove("error");
  });
}

// export function validate(root) {
//   var errs = [];

//   // validate a panel only if visible
//   function requireVisible(panelId, checks) {
//     var p = root.querySelector("#" + panelId);
//     if (!p || p.classList.contains("hidden")) return;
//     for (var i = 0; i < checks.length; i++) {
//       var ck = checks[i];
//       var wrapId = ck[0],
//         type = ck[1],
//         key = ck[2],
//         msg = ck[3],
//         extra = ck[4];
//       if (type === "radio") {
//         var v = getRadio(root, key);
//         if (!v) {
//           setErr(root, wrapId, msg);
//           errs.push({ id: wrapId, text: msg });
//         } else {
//           clearErr(root, wrapId);
//         }
//         if (extra && extra.depValue && v === extra.depValue) {
//           var el = root.querySelector(extra.sel);
//           var has = el && el.value && el.value.trim().length > 0;
//           if (!has) {
//             setErr(root, wrapId, extra.msg);
//             errs.push({ id: wrapId, text: extra.msg });
//           }
//         }
//       }
//     }
//   }

//   // accounts
//   requireVisible("accCCA", [
//     ["accCCA", "radio", "cca_fee", "Choose one CCA fee code"],
//     ["accCCA", "radio", "cca_rate", "Choose one CCA interest rate code"],
//   ]);
//   requireVisible("accBIA", [
//     ["accBIA", "radio", "bia_fee", "Choose one BIA fee code"],
//   ]);
//   requireVisible("accBCA", [
//     ["accBCA", "radio", "bca_fee", "Choose one BCA fee code"],
//   ]);
//   requireVisible("accBCM", [
//     [
//       "accBCM",
//       "radio",
//       "bcm_rate",
//       "Choose BCM rate option",
//       {
//         depValue: "negotiated",
//         sel: "#bcm_margin",
//         msg: "Enter margin for negotiated pricing",
//       },
//     ],
//   ]);
//   requireVisible("accTD", [
//     ["accTD", "radio", "td_rate", "Choose TD rate option"],
//   ]);

//   // statement cycle required if any account panel is visible
//   var anyAccVisible = ["accCCA", "accBIA", "accBCA", "accBCM", "accTD"].some(
//     function (id) {
//       var n = root.querySelector("#" + id);
//       return n && !n.classList.contains("hidden");
//     }
//   );
//   if (anyAccVisible) {
//     var sc = getRadio(root, "stmt_cycle");
//     if (!sc) {
//       setErr(root, "accStatement", "Select a statement cycle");
//       errs.push({ id: "accStatement", text: "Select a statement cycle" });
//     } else clearErr(root, "accStatement");
//   } else {
//     clearErr(root, "accStatement");
//   }

//   // Electronic Access
//   requireVisible("eaNABC", [
//     ["eaNABC", "radio", "nabc_users", "Choose user option (All or Nominated)"],
//     [
//       "eaNABC",
//       "radio",
//       "nabc_services",
//       "Choose service option (All or Nominated)",
//     ],
//   ]);
//   var nabcShown =
//     root.querySelector("#eaNABC") &&
//     !root.querySelector("#eaNABC").classList.contains("hidden");
//   if (nabcShown) {
//     if (getRadio(root, "nabc_users") === "nominated") {
//       var ul = root.querySelector("#nabc_users_list");
//       if (!ul || !ul.value.trim()) {
//         setErr(root, "eaNABC", "List nominated users for NAB Connect");
//         errs.push({
//           id: "eaNABC",
//           text: "List nominated users for NAB Connect",
//         });
//       }
//     }
//     if (getRadio(root, "nabc_services") === "nominated") {
//       var sl = root.querySelector("#nabc_services_list");
//       if (!sl || !sl.value.trim()) {
//         setErr(root, "eaNABC", "Specify nominated services for NAB Connect");
//         errs.push({
//           id: "eaNABC",
//           text: "Specify nominated services for NAB Connect",
//         });
//       }
//     }
//   }

//   var ibShown =
//     root.querySelector("#eaIB") &&
//     !root.querySelector("#eaIB").classList.contains("hidden");
//   if (ibShown) {
//     var ib = root.querySelector("#ib_users");
//     if (!ib || !ib.value.trim()) {
//       setErr(root, "eaIB", "Provide NAB ID / name(s) & access level");
//       errs.push({
//         id: "eaIB",
//         text: "Provide NAB ID / name(s) & access level",
//       });
//     } else clearErr(root, "eaIB");
//   }

//   var txShown =
//     root.querySelector("#eaDLRTX") &&
//     !root.querySelector("#eaDLRTX").classList.contains("hidden");
//   if (txShown) {
//     var m1 = root.querySelector("#dlr_tx_mailbox");
//     var s1 = root.querySelector("#dlr_tx_services");
//     if (!m1 || !m1.value.trim() || !s1 || !s1.value.trim()) {
//       setErr(root, "eaDLRTX", "Enter mailbox name and services");
//       errs.push({ id: "eaDLRTX", text: "Enter mailbox name and services" });
//     } else clearErr(root, "eaDLRTX");
//   }

//   var tdShown =
//     root.querySelector("#eaDLRTD") &&
//     !root.querySelector("#eaDLRTD").classList.contains("hidden");
//   if (tdShown) {
//     var m2 = root.querySelector("#dlr_td_mailbox");
//     if (!m2 || !m2.value.trim()) {
//       setErr(root, "eaDLRTD", "Enter mailbox name for Term Deposits");
//       errs.push({
//         id: "eaDLRTD",
//         text: "Enter mailbox name for Term Deposits",
//       });
//     } else clearErr(root, "eaDLRTD");
//   }

//   var readdShown =
//     root.querySelector("#eaReAdd") &&
//     !root.querySelector("#eaReAdd").classList.contains("hidden");
//   if (readdShown) {
//     var ru = getRadio(root, "readd_users");
//     if (!ru) {
//       setErr(root, "eaReAdd", "Select users to be re-added");
//       errs.push({ id: "eaReAdd", text: "Select users to be re-added" });
//     }
//     if (ru === "nominated") {
//       var rl = root.querySelector("#readd_users_list");
//       if (!rl || !rl.value.trim()) {
//         setErr(root, "eaReAdd", "Specify nominated users or IDs");
//         errs.push({ id: "eaReAdd", text: "Specify nominated users or IDs" });
//       }
//     }
//   }

//   return errs;
// }

export function collect(root, store) {
  var payload = {
    // accounts toggles
    acc_cca: root.querySelector("#acc_cca")
      ? !!root.querySelector("#acc_cca").checked
      : false,
    acc_bia: root.querySelector("#acc_bia")
      ? !!root.querySelector("#acc_bia").checked
      : false,
    acc_bca: root.querySelector("#acc_bca")
      ? !!root.querySelector("#acc_bca").checked
      : false,
    acc_bcm: root.querySelector("#acc_bcm")
      ? !!root.querySelector("#acc_bcm").checked
      : false,
    acc_td: root.querySelector("#acc_td")
      ? !!root.querySelector("#acc_td").checked
      : false,

    // account radios/inputs
    cca_fee: getRadio(root, "cca_fee"),
    cca_rate: getRadio(root, "cca_rate"),
    cca_margin: (
      (root.querySelector("#cca_margin") &&
        root.querySelector("#cca_margin").value) ||
      ""
    ).trim(),
    bia_fee: getRadio(root, "bia_fee"),
    bca_fee: getRadio(root, "bca_fee"),
    bcm_rate: getRadio(root, "bcm_rate"),
    bcm_margin: (
      (root.querySelector("#bcm_margin") &&
        root.querySelector("#bcm_margin").value) ||
      ""
    ).trim(),
    td_rate: getRadio(root, "td_rate"),
    stmt_cycle: getRadio(root, "stmt_cycle"),

    // EA toggles
    ea_nabc: root.querySelector("#ea_nabc")
      ? !!root.querySelector("#ea_nabc").checked
      : false,
    ea_ib: root.querySelector("#ea_ib")
      ? !!root.querySelector("#ea_ib").checked
      : false,
    ea_dlr_tx: root.querySelector("#ea_dlr_tx")
      ? !!root.querySelector("#ea_dlr_tx").checked
      : false,
    ea_dlr_td: root.querySelector("#ea_dlr_td")
      ? !!root.querySelector("#ea_dlr_td").checked
      : false,
    ea_dsi: root.querySelector("#ea_dsi")
      ? !!root.querySelector("#ea_dsi").checked
      : false,
    readd: root.querySelector("#readd")
      ? !!root.querySelector("#readd").checked
      : false,

    // EA details
    nabc_meid: (
      (root.querySelector("#nabc_meid") &&
        root.querySelector("#nabc_meid").value) ||
      ""
    ).trim(),
    nabc_users: getRadio(root, "nabc_users"),
    nabc_users_list: (
      (root.querySelector("#nabc_users_list") &&
        root.querySelector("#nabc_users_list").value) ||
      ""
    ).trim(),
    nabc_services: getRadio(root, "nabc_services"),
    nabc_services_list: (
      (root.querySelector("#nabc_services_list") &&
        root.querySelector("#nabc_services_list").value) ||
      ""
    ).trim(),

    ib_users: (
      (root.querySelector("#ib_users") &&
        root.querySelector("#ib_users").value) ||
      ""
    ).trim(),

    dlr_tx_mailbox: (
      (root.querySelector("#dlr_tx_mailbox") &&
        root.querySelector("#dlr_tx_mailbox").value) ||
      ""
    ).trim(),
    dlr_tx_services: (
      (root.querySelector("#dlr_tx_services") &&
        root.querySelector("#dlr_tx_services").value) ||
      ""
    ).trim(),

    dlr_td_mailbox: (
      (root.querySelector("#dlr_td_mailbox") &&
        root.querySelector("#dlr_td_mailbox").value) ||
      ""
    ).trim(),

    readd_users: getRadio(root, "readd_users"),
    readd_users_list: (
      (root.querySelector("#readd_users_list") &&
        root.querySelector("#readd_users_list").value) ||
      ""
    ).trim(),
  };

  store.set("step7", payload);
  for (var k in payload) {
    store.data[k] = payload[k];
  }
}
