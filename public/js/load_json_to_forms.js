// --- Dynamic module import & JSON fallback (no JSON assert) ---
let SubmittedData = { value: null };
let sampleData = {};
let applicationData = {};

function isNonEmptyObject(v){ return v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length>0; }

async function loadSampleData() {
  try {
    const response = await fetch('../data/application.json', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      console.log('Loaded sample data:', data); // Print data from JSON after getting it
      return data; // JSON data as JS object
    }
  } catch (e) {
    console.warn('Could not load application.json:', e);
  }
  return {};
}

// Use an IIFE to handle top-level await logic
(async function() {
  try {
    const mod = await import("./hooks/step9.js"); // ensure .js extension
    if (mod && (mod.SubmittedData || mod.default)) {
      SubmittedData = mod.SubmittedData || mod.default;
    }
  } catch (e) {
    console.warn("cannot import ./hooks/step9.js, dùng fallback:", e);
  }

  sampleData = await loadSampleData();
  applicationData = isNonEmptyObject(SubmittedData.value) ? SubmittedData.value : sampleData;
  window.applicationData = applicationData; // update global reference
  console.log('[loader] Using data source:', isNonEmptyObject(SubmittedData.value) ? 'SubmittedData' : 'sample JSON');
  setTimeout(autoLoadData, 500);
})();



// Utility functions
function setCheckbox(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.checked = value === 'Yes' || value === true || value === 'true' || value === 1;
    console.log(`Set ${elementId} = ${element.checked}`);
  }
}

function setInputValue(elementId, value) {
  if (typeof value === 'undefined' || value === null) return;
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


