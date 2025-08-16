/* preview.js — scope all "freeze" behavior to preview.html only
   - Prevents editing of inputs *only* on preview.html
   - Leaves all step pages fully interactive
   - Works even if preview content is injected dynamically (MutationObserver)
   - Allows explicit opt-in interactivity via [data-allow-interaction]
*/

(() => {
  "use strict";

  // --- Detect preview page ---------------------------------------------------
  // Works whether preview.html is top-level or loaded in an <iframe>.
  const isPreviewPage = /(^|\/)preview\.html(\?|#|$)/i.test(
    window.location.pathname
  );

  if (!isPreviewPage) {
    // If this file is included on other pages by mistake, it won’t do anything.
    console.debug("[preview] Not on preview.html — skipping freeze logic.");
    return;
  }

  // --- Config: where to apply the freeze inside preview.html -----------------
  // Put your primary preview root first for best accuracy.
  const PREVIEW_SCOPE_SELECTORS = [
    "#previewRoot", // preferred: an explicit wrapper you control
    ".a4-page", // typical page block used for A4 previews
    ".page-wrap", // common outer wrapper
    "main", // last-resort semantic container
    "body", // absolute fallback
  ];

  function pickScope() {
    for (const sel of PREVIEW_SCOPE_SELECTORS) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return document.body || document.documentElement;
  }

  // --- Core: make controls non-editable within the preview scope -------------
  function freezeControl(el) {
    if (!el || el.dataset._previewFrozen === "1") return;

    const tag = el.tagName.toLowerCase();
    const type = (el.getAttribute("type") || "").toLowerCase();

    // Remember original state so we never leak effects across navigations.
    if (el.disabled) el.dataset._wasDisabled = "1";
    if (el.readOnly) el.dataset._wasReadonly = "1";
    if (el.hasAttribute("contenteditable") && el.isContentEditable) {
      el.dataset._wasContentEditable = "1";
    }
    if (el.hasAttribute("tabindex")) {
      el.dataset._wasTabindex = el.getAttribute("tabindex") || "";
    }

    // Text-like fields → readonly (keeps value/selectable text, blocks edits)
    if (
      tag === "input" &&
      ![
        "checkbox",
        "radio",
        "button",
        "submit",
        "reset",
        "file",
        "image",
      ].includes(type)
    ) {
      el.readOnly = true;
      el.setAttribute("aria-readonly", "true");
    } else if (tag === "textarea") {
      el.readOnly = true;
      el.setAttribute("aria-readonly", "true");
    }
    // Choice widgets → disabled (prevents toggling)
    else if (tag === "select" || type === "checkbox" || type === "radio") {
      el.disabled = true;
      el.setAttribute("aria-disabled", "true");
    }

    // Contenteditable regions → turn off editing
    if (el.hasAttribute("contenteditable")) {
      el.setAttribute("contenteditable", "false");
      el.setAttribute("aria-readonly", "true");
    }

    // Avoid keyboard focus inside preview (except explicitly allowed areas)
    el.setAttribute("tabindex", "-1");

    // Mark as handled
    el.dataset._previewFrozen = "1";
  }

  function freezeWithin(scope) {
    if (!scope) return;

    scope.classList.add("preview-frozen");

    // Everything users could interact with
    const controls = scope.querySelectorAll(
      [
        'input:not([type="hidden"])',
        "textarea",
        "select",
        "[contenteditable]",
        "button",
        "a[href]",
        "[role='button']",
      ].join(",")
    );

    controls.forEach((el) => {
      // Allow elements to opt-out of freezing if needed
      if (el.closest("[data-allow-interaction]")) return;
      // Don’t freeze controls used for explicit actions like print if they’re outside preview content
      freezeControl(el);
    });

    // Block clicks and key events that could mutate UI/state inside preview
    const onClickCapture = (e) => {
      // Permit clicks in explicitly allowed islands
      if (e.target && e.target.closest("[data-allow-interaction]")) return;

      const interactive = e.target?.closest?.(
        "button, a, input, select, textarea, label, [role='button']"
      );
      if (interactive) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const onKeydownCapture = (e) => {
      // Block any key that might change values (typing, space/enter on controls, etc.)
      const target = e.target;
      if (!target || target.closest("[data-allow-interaction]")) return;

      const tag = target.tagName?.toLowerCase?.() || "";
      const type = (target.getAttribute?.("type") || "").toLowerCase();

      const isFormField =
        tag === "textarea" ||
        tag === "select" ||
        (tag === "input" && !["button", "submit", "reset"].includes(type));

      // If it’s a form field or clickable control, block editing keys
      if (isFormField || target.closest("button, [role='button'], a[href]")) {
        // Allow Tab to navigate out of the preview area if needed
        if (e.key !== "Tab") {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    // Attach listeners in capture phase so we stop before app handlers
    scope.addEventListener("click", onClickCapture, true);
    scope.addEventListener("keydown", onKeydownCapture, true);

    // Keep freezing any content that gets injected later (e.g., async rendering)
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            // Freeze the node itself if it’s interactive
            if (
              node.matches?.(
                'input:not([type="hidden"]), textarea, select, [contenteditable], button, a[href], [role="button"]'
              ) &&
              !node.closest("[data-allow-interaction]")
            ) {
              freezeControl(node);
            }
            // Freeze any interactive descendants
            node
              .querySelectorAll?.(
                'input:not([type="hidden"]), textarea, select, [contenteditable], button, a[href], [role="button"]'
              )
              .forEach((el) => {
                if (!el.closest("[data-allow-interaction]")) {
                  freezeControl(el);
                }
              });
          });
        }
      }
    });

    mo.observe(scope, { childList: true, subtree: true });
  }

  // --- Optional helpers: print/close buttons on preview page -----------------
  function wirePreviewActions() {
    const printBtn = document.querySelector("[data-action='print']");
    if (printBtn) {
      printBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.print();
      });
    }

    const closeBtn = document.querySelector("[data-action='close-preview']");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // Navigate back or close modal/iframe if that’s how preview is shown
        if (window.top === window.self && document.referrer) {
          window.history.back();
        } else {
          // If embedded, try to postMessage or just hide the frame (no-op by default)
          console.debug("[preview] Close requested (implement as needed).");
        }
      });
    }
  }

  // --- Boot ------------------------------------------------------------------
  function init() {
    const scope = pickScope();
    freezeWithin(scope);
    wirePreviewActions();
    console.debug("[preview] Frozen UI inside scope:", scope);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
