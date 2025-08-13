// Script để load JSON data vào các trang HTML riêng biệt

// JSON Data từ application.json
const applicationData = {
  "step1": {
    "industry": "Legal",
    "kyc": "Yes",
    "ind_reflect": "No",
    "company_match": "Yes",
    "buid_correct": "N/A",
    "related_updated": "Yes",
    "trust_letter": "N/A"
  },
  "step2": {
    "maa_current": "Yes",
    "maa_mandatory": "Yes",
    "maa_min_auth": "No",
    "maa_ebobs": "Yes",
    "maa_sections": "No",
    "maa_signed": "Yes",
    "maa_callback": "No"
  },
  "step3": {
    "cs_legalname": "Yes",
    "cs_relgroup": "No",
    "cs_signatories": "Yes",
    "cs_accpricing": "No",
    "cs_ebanking": "Yes",
    "cs_bsb": "Yes",
    "cs_kycsection": "No",
    "cs_followup": "Yes"
  },
  "step4": {
    "legalName": "treter",
    "mcn": "123456789",
    "abnAcn": "12345678901",
    "relNo": "2343244",
    "relName": "erwer",
    "contactName": "rwer",
    "contactNumber": "+44365843929",
    "emails": "abc@gmail.com"
  },
  "step5": {
    "people": [
      {
        "name": "fgfdfg",
        "number": "1244324"
      }
    ]
  },
  "step6": {
    "apraCode": "423423",
    "industryClass": "34234",
    "orgType": "efsfsd",
    "kycConfirm": true,
    "kycDate": "2025-08-23"
  },
  "step7": {
    "acc_cca": true,
    "acc_bia": false,
    "acc_bca": false,
    "acc_bcm": true,
    "acc_td": false,
    "cca_fee": "H",
    "cca_rate": "CC",
    "cca_margin": "",
    "bia_fee": "",
    "bca_fee": "",
    "bcm_rate": "standard",
    "bcm_margin": "",
    "td_rate": "",
    "stmt_cycle": "quarterly",
    "ea_nabc": true,
    "ea_ib": true,
    "ea_dlr_tx": false,
    "ea_dlr_td": false,
    "ea_dsi": false,
    "readd": false,
    "nabc_meid": "42342334235",
    "nabc_users": "all",
    "nabc_users_list": "",
    "nabc_services": "all",
    "nabc_services_list": "",
    "ib_users": "1243432423",
    "dlr_tx_mailbox": "",
    "dlr_tx_services": "",
    "dlr_td_mailbox": "",
    "readd_users": "",
    "readd_users_list": ""
  },
  "step8": {
    "p_name": "fdfasdf",
    "p_title": "4324234",
    "p_email": "tranuyen721@gmail.com",
    "p_phone": "+44365843929",
    "p_buid": "4534534",
    "p_bsb": "234234",
    "p_osa": "423425",
    "p_td": "5435345346",
    "s_name": "asfdf",
    "s_title": "safdf",
    "s_email": "abc@gmail.com",
    "s_phone": "+44365843929"
  }
};

// Utility functions
function setCheckbox(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.checked = value === 'Yes' || value === true;
    console.log(`Set ${elementId} = ${element.checked}`);
  }
}

function setInputValue(elementId, value) {
  const element = document.getElementById(elementId);
  if (element && value) {
    element.value = value;
    console.log(`Set ${elementId} = ${value}`);
  }
}

function checkRadioByValue(name, value) {
  const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (radio) {
    radio.checked = true;
    console.log(`Checked radio ${name} = ${value}`);
  }
}

// =================
// LOAD DATA CHO STEP-1.HTML
// =================
function loadDataForStep1() {
  console.log('Loading data for Step 1...');
  
  // Industry checkboxes
  const industryMap = {
    'Legal': 'ind_legal',
    'External Administration': 'ind_external', 
    'Real Estate/Settlement Agents': 'ind_realestate',
    'Strata': 'ind_strata',
    'Accounting': 'ind_accounting'
  };
  
  // Clear all industry checkboxes first
  Object.values(industryMap).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });
  
  // Set correct industry
  if (applicationData.step1.industry && industryMap[applicationData.step1.industry]) {
    setCheckbox(industryMap[applicationData.step1.industry], true);
  }

  // MCN Section checkboxes
  setCheckbox('kyc_compliant', applicationData.step1.kyc);
  setCheckbox('industry_classification', applicationData.step1.ind_reflect);
  setCheckbox('company_details_ok', applicationData.step1.company_match);
  setCheckbox('banker_buid_ok', applicationData.step1.buid_correct);
  setCheckbox('kyc_entities_updated', applicationData.step1.related_updated);
  
  // Trust letter - handle Yes/N/A
  if (applicationData.step1.trust_letter === 'Yes') {
    setCheckbox('trust_letter_yes', true);
  } else if (applicationData.step1.trust_letter === 'N/A') {
    setCheckbox('trust_letter_na', true);
  }

  // MAA Section (step2 data)
  setCheckbox('maa_current_version', applicationData.step2.maa_current);
  setCheckbox('maa_mandatory_details', applicationData.step2.maa_mandatory);
  setCheckbox('maa_min_auth_persons', applicationData.step2.maa_min_auth);
  setCheckbox('signatories_profiles_kyc', applicationData.step2.maa_ebobs);
  setCheckbox('authorisations_done', applicationData.step2.maa_sections);
  setCheckbox('maa_dated_signed', applicationData.step2.maa_signed);
  
  // Callback - handle Yes/N/A
  if (applicationData.step2.maa_callback === 'Yes') {
    setCheckbox('callback_followed', true);
  } else if (applicationData.step2.maa_callback === 'N/A') {
    setCheckbox('callback_letter_na', true);
  }

  // Customer Summary Section (step3 data)
  setCheckbox('cs_business_name', applicationData.step3.cs_legalname);
  setCheckbox('cs_rg_provided', applicationData.step3.cs_relgroup);
  setCheckbox('cs_cust_numbers', applicationData.step3.cs_signatories);
  setCheckbox('cs_account_details', applicationData.step3.cs_accpricing);
  setCheckbox('cs_eb_services', applicationData.step3.cs_ebanking);
  setCheckbox('cs_bsb_provided', applicationData.step3.cs_bsb);
  setCheckbox('cs_kyc_done', applicationData.step3.cs_kycsection);
  setCheckbox('cs_final_followup', applicationData.step3.cs_followup);

  console.log('Step 1 data loaded successfully');
}

// =================
// LOAD DATA CHO STEP-2.HTML  
// =================
function loadDataForStep2() {
  console.log('Loading data for Step 2...');
  
  // Master Customer Details (step4 data)
  setInputValue('businessName', applicationData.step4.legalName);
  setInputValue('mcn', applicationData.step4.mcn);
  setInputValue('abn', applicationData.step4.abnAcn);
  setInputValue('rgNumber', applicationData.step4.relNo);
  setInputValue('rgName', applicationData.step4.relName);
  setInputValue('contactName', applicationData.step4.contactName);
  setInputValue('contactNumber', applicationData.step4.contactNumber);
  setInputValue('emails', applicationData.step4.emails);

  // Authorised Person Details (step5 data)
  if (applicationData.step5.people && applicationData.step5.people.length > 0) {
    const authTable = document.querySelector('table.auth tbody');
    if (authTable) {
      const rows = authTable.querySelectorAll('tr');
      
      applicationData.step5.people.forEach((person, index) => {
        if (index < rows.length) {
          const row = rows[index];
          const nameInput = row.querySelector('td:nth-child(2) input');
          const numberInput = row.querySelector('td:nth-child(3) input');
          
          if (nameInput && person.name) {
            nameInput.value = person.name;
            console.log(`Set auth person ${index + 1} name = ${person.name}`);
          }
          if (numberInput && person.number) {
            numberInput.value = person.number;
            console.log(`Set auth person ${index + 1} number = ${person.number}`);
          }
        }
      });
    }
  }

  // KYC Details (step6 data)  
  setInputValue('apra', applicationData.step6.apraCode);
  setInputValue('industryCode', applicationData.step6.industryClass);
  setInputValue('orgType', applicationData.step6.orgType);
  setCheckbox('kyc_confirmation', applicationData.step6.kycConfirm);
  setInputValue('kycDate', applicationData.step6.kycDate);

  console.log('Step 2 data loaded successfully');
}

// =================
// LOAD DATA CHO STEP-3.HTML
// =================
function loadDataForStep3() {
  console.log('Loading data for Step 3...');
  
  const step7 = applicationData.step7;
  
  // Account Type selections
  const accountTypes = [
    { data: 'acc_cca', selector: 'input[type="checkbox"]:has(+ strong:contains("Corporate Cheque Account"))' },
    { data: 'acc_bia', selector: 'input[type="checkbox"]:has(+ strong:contains("Business Interest Account"))' },
    { data: 'acc_bca', selector: 'input[type="checkbox"]:has(+ strong:contains("Business Everyday Account"))' },
    { data: 'acc_bcm', selector: 'input[type="checkbox"]:has(+ strong:contains("Business Cash Maximiser"))' },
    { data: 'acc_td', selector: 'input[type="checkbox"]:has(+ strong:contains("Term Deposit"))' }
  ];

  // Set account types by finding checkboxes with specific text
  function setAccountType(containsText, value) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      const label = cb.closest('label');
      if (label && label.textContent.includes(containsText)) {
        cb.checked = value;
        console.log(`Set account type ${containsText} = ${value}`);
      }
    });
  }

  setAccountType('Corporate Cheque Account', step7.acc_cca);
  setAccountType('Business Interest Account', step7.acc_bia); 
  setAccountType('Business Everyday Account', step7.acc_bca);
  setAccountType('Business Cash Maximiser', step7.acc_bcm);
  setAccountType('Term Deposit', step7.acc_td);

  // CCA Fee options
  if (step7.cca_fee) {
    const feeOptionsMap = {
      'H': 'Standard fees (H)',
      'E': 'All fees exempted (E)', 
      'ASF': 'Only ASF fee exempted',
      'U': 'Fee code (U)',
      'S': 'Fee code (S)'
    };
    
    if (feeOptionsMap[step7.cca_fee]) {
      setAccountType(feeOptionsMap[step7.cca_fee], true);
    }
  }

  // CCA Interest rate
  if (step7.cca_rate) {
    const rateOptionsMap = {
      'KA': 'KA – Deposit reference rate',
      'CN': 'CN – RBA cash rate – Negotiated', 
      'CC': 'CC – RBA cash rate – Standard'
    };
    
    if (rateOptionsMap[step7.cca_rate]) {
      setAccountType(rateOptionsMap[step7.cca_rate], true);
    }
  }

  // Rate Margins - find textarea in CCA section
  if (step7.cca_margin) {
    const ccaMarginTextarea = document.querySelector('textarea');
    if (ccaMarginTextarea) {
      ccaMarginTextarea.value = step7.cca_margin;
    }
  }

  // BCM Rate options
  if (step7.bcm_rate === 'standard') {
    setAccountType('Standard BCM rates', true);
  } else if (step7.bcm_rate === 'negotiated') {
    setAccountType('Negotiated BCM pricing', true);
  }

  // Statement Cycle
  if (step7.stmt_cycle) {
    const stmtMap = {
      'monthly': 'Monthly',
      'quarterly': 'Quarterly', 
      'half-yearly': 'Half yearly'
    };
    
    if (stmtMap[step7.stmt_cycle]) {
      setAccountType(stmtMap[step7.stmt_cycle], true);
    }
  }

  // Electronic Banking Services
  setAccountType('NAB Connect', step7.ea_nabc);
  setAccountType('Internet Banking', step7.ea_ib);
  setAccountType('Direct Link Reporting', step7.ea_dlr_tx);
  setAccountType('Direct Link reporting', step7.ea_dlr_td);
  setAccountType('Data Share Integration', step7.ea_dsi);
  setAccountType('Re-adding closed accounts', step7.readd);

  // NAB Connect MEID
  const meidInput = document.querySelector('input[placeholder*="MEID"], input[class*="meid"]');
  if (meidInput && step7.nabc_meid) {
    meidInput.value = step7.nabc_meid;
  }

  // NAB Connect Users
  if (step7.nabc_users === 'all') {
    setAccountType('All Users', true);
  }

  // Internet Banking Users
  const ibUsersTextarea = document.querySelector('textarea[placeholder*="NAB ID"], textarea[class*="ib-users"]');
  if (ibUsersTextarea && step7.ib_users) {
    ibUsersTextarea.value = step7.ib_users;
  }

  console.log('Step 3 data loaded successfully');
}

// =================  
// LOAD DATA CHO STEP-4.HTML
// =================
function loadDataForStep4() {
  console.log('Loading data for Step 4...');
  
  const step8 = applicationData.step8;
  
  // Primary Banker Details
  setInputValue('bankerName', step8.p_name);
  setInputValue('bankerPosition', step8.p_title);
  setInputValue('bankerEmail', step8.p_email);
  setInputValue('bankerPhone', step8.p_phone);
  setInputValue('bankerBuid', step8.p_buid);
  setInputValue('bankerBsb', step8.p_bsb);
  setInputValue('bankerOsa', step8.p_osa);
  setInputValue('tdDisposalsAcct', step8.p_td);

  // Secondary Banker Details
  setInputValue('secBankerName', step8.s_name);
  setInputValue('secBankerPosition', step8.s_title);
  setInputValue('secBankerEmail', step8.s_email);
  setInputValue('secBankerPhone', step8.s_phone);

  console.log('Step 4 data loaded successfully');
}

// =================
// AUTO DETECT PAGE AND LOAD APPROPRIATE DATA
// =================
function autoLoadData() {
  // Detect which page we're on based on elements present
  if (document.getElementById('step-1')) {
    loadDataForStep1();
  } else if (document.getElementById('step-2')) {
    loadDataForStep2();  
  } else if (document.getElementById('step-3')) {
    loadDataForStep3();
  } else if (document.getElementById('step-4')) {
    loadDataForStep4();
  } else {
    console.log('Unknown page - no data loaded');
  }
}

// =================
// MANUAL LOAD FUNCTIONS
// =================
function loadAllData() {
  loadDataForStep1();
  loadDataForStep2();
  loadDataForStep3();
  loadDataForStep4();
}

// =================
// INITIALIZE ON PAGE LOAD
// =================
document.addEventListener('DOMContentLoaded', function() {
  console.log('Page loaded, attempting to load data...');
  
  /*// Add load button for manual testing
  const loadBtn = document.createElement('button');
  loadBtn.textContent = 'Load JSON Data';
  loadBtn.style.cssText = 'position:fixed;top:10px;right:10px;z-index:1000;padding:8px 12px;background:#3b82f6;color:white;border:none;border-radius:4px;cursor:pointer;';
  loadBtn.onclick = autoLoadData;
  document.body.appendChild(loadBtn);*/
  
  // Auto load data after short delay to ensure DOM is ready
  setTimeout(autoLoadData, 500);
  //lockPreviewMode('#doc');
  lockPreviewWithoutColor('#doc');
});

// =================
// EXPORT FUNCTIONS FOR MANUAL USE
// =================
window.loadDataForStep1 = loadDataForStep1;
window.loadDataForStep2 = loadDataForStep2;
window.loadDataForStep3 = loadDataForStep3;
window.loadDataForStep4 = loadDataForStep4;
window.autoLoadData = autoLoadData;
window.loadAllData = loadAllData;
window.applicationData = applicationData;

console.log('MAOS Data Loader initialized. Available functions:');
console.log('- loadDataForStep1()');
console.log('- loadDataForStep2()'); 
console.log('- loadDataForStep3()');
console.log('- loadDataForStep4()');
console.log('- autoLoadData()');
console.log('- loadAllData()');


// read only after load data
// Khóa mọi control trong vùng preview, vẫn cho TAB để đọc (không sửa được gì)
function lockPreviewMode(rootSel = '#doc') {
  const root = document.querySelector(rootSel) || document.body;
  if (!root || root.dataset.previewLocked === '1') return;
  root.dataset.previewLocked = '1';
  root.classList.add('ro', 'preview-locked'); // bật style read-only

  // 1) Đặt readonly/disabled cho tất cả control hiện có
  freezeControls(root);

  // 2) Chặn mọi thao tác dẫn tới thay đổi giá trị (chuột + bàn phím, trừ Tab/Shift)
  const block = (e) => {
    const t = e.target;
    if (!t?.matches) return;
    if (t.matches('input, textarea, select')) {
      if (e.type === 'keydown') {
        const k = e.key;
        if (k !== 'Tab' && k !== 'Shift') {
          e.preventDefault(); e.stopImmediatePropagation();
        }
      } else {
        e.preventDefault(); e.stopImmediatePropagation();
      }
    }
  };
  root.addEventListener('beforeinput', block, { capture: true });
  root.addEventListener('input', block, { capture: true });
  root.addEventListener('change', block, { capture: true });
  root.addEventListener('click', block, { capture: true });
  root.addEventListener('keydown', block, { capture: true });

  // 3) Không cho submit form trong preview
  root.addEventListener('submit', (e) => { e.preventDefault(); }, true);

  // 4) Nếu sau này có DOM mới chèn vào (lazy render), tự khóa tiếp
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes?.forEach((n) => {
        if (!(n instanceof Element)) return;
        if (n.matches('input,textarea,select,form,[contenteditable=""],[contenteditable="true"]')) {
          freezeControls(n.closest(rootSel) ? n : root); // khóa trong root
        }
        // Khóa mọi control bên trong node mới
        n.querySelectorAll?.('input,textarea,select,form,[contenteditable=""],[contenteditable="true"]').forEach(() => {
          freezeControls(n.closest(rootSel) ? n : root);
        });
      });
    }
  });
  mo.observe(root, { childList: true, subtree: true });

  function freezeControls(scope) {
    scope.querySelectorAll('input, textarea, select').forEach((el) => {
      if (el.matches('input[type="checkbox"], input[type="radio"], select')) {
        el.disabled = true;
        el.setAttribute('aria-disabled', 'true');
      } else {
        el.readOnly = true;
        el.setAttribute('aria-readonly', 'true');
      }
      // Không cho mở bàn phím ảo trên mobile
      el.setAttribute('inputmode', 'none');
      el.setAttribute('autocomplete', 'off');
      // Vô hiệu mọi contenteditable
      el.closest('[contenteditable=""], [contenteditable="true"]')?.setAttribute('contenteditable', 'false');
    });
    scope.querySelectorAll('[contenteditable=""], [contenteditable="true"]').forEach(el => {
      el.setAttribute('contenteditable', 'false');
    });
  }
}


// Khóa preview mà không đổi màu giao diện
function lockPreviewWithoutColor(rootSel = '#doc') {
  const root = document.querySelector(rootSel) || document.body;
  if (!root || root.dataset.lockedNoColor === '1') return;
  root.dataset.lockedNoColor = '1';
  root.classList.add('keep-colors');

  // 1) Text input & textarea -> readOnly (giữ style), báo ARIA
  root.querySelectorAll('input:not([type]), input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="date"], textarea')
    .forEach(el => {
      el.readOnly = true;
      el.setAttribute('aria-readonly', 'true');
      // tránh dán/drag-drop
      ['beforeinput','paste','drop'].forEach(ev => el.addEventListener(ev, e => e.preventDefault(), {capture:true}));
    });

  // 2) Checkbox / Radio / Select -> chặn tương tác, báo ARIA
  root.querySelectorAll('input[type="checkbox"], input[type="radio"], select')
    .forEach(el => {
      el.setAttribute('data-locked', 'true');
      el.setAttribute('aria-disabled', 'true');   // thông báo với SR, nhưng KHÔNG đặt disabled
    });

  // 3) Bộ chặn sự kiện (giữ được Tab/Shift+Tab để đọc)
  const block = (e) => {
    const t = e.target;
    if (!t?.matches) return;

    // Không can thiệp nếu target không phải form control
    if (!t.matches('input, textarea, select')) return;

    if (e.type === 'keydown') {
      const k = e.key;
      // cho phép Tab/Shift để di chuyển
      if (k === 'Tab' || k === 'Shift') return;
      // chặn phím làm thay đổi giá trị
      e.preventDefault(); e.stopImmediatePropagation();
      return;
    }

    if (e.type === 'mousedown' || e.type === 'pointerdown') {
      // chặn mở select dropdown / toggle checkbox/radio bằng chuột
      e.preventDefault(); e.stopImmediatePropagation();
      return;
    }

    // chặn mọi thay đổi giá trị
    if (e.type === 'input' || e.type === 'change' || e.type === 'beforeinput' || e.type === 'click') {
      e.preventDefault(); e.stopImmediatePropagation();
    }
  };

  // đăng ký ở capture phase để chặn sớm
  ['keydown','mousedown','pointerdown','click','input','change','beforeinput'].forEach(type => {
    root.addEventListener(type, block, { capture: true });
  });

  // 4) Không cho submit (phòng hờ)
  root.addEventListener('submit', (e) => e.preventDefault(), true);
}


