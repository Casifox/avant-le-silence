/**
 * Modales accessibles, confirmations et notifications discrètes.
 */

import { el, icon, append } from "../utils/helpers.js";
import { createFocusTrap } from "../utils/accessibility.js";

const modalStack = [];
let modalCounter = 0;

function setBodyLock() {
  document.body.classList.toggle("no-scroll", modalStack.length > 0);
}

function handleDocumentKeydown(event) {
  if (event.key !== "Escape" || modalStack.length === 0) return;
  event.preventDefault();
  closeTopModal();
}

document.addEventListener("keydown", handleDocumentKeydown);

export function openModal(options) {
  const {
    title,
    subtitle = "",
    eyebrow = "",
    content = null,
    footer = null,
    className = "",
    closeLabel = "Fermer",
    closeOnBackdrop = true,
    onClose = null
  } = options;

  modalCounter += 1;
  const titleId = `modal-title-${modalCounter}`;
  const previousFocus = document.activeElement;

  const closeButton = el(
    "button",
    {
      className: "btn btn--icon modal__close",
      attrs: { type: "button", "aria-label": closeLabel },
      on: { click: () => closeTopModal() }
    },
    icon("close", { size: 20 })
  );

  const header = el("header", { className: "modal__header" }, [
    el("div", { className: "modal__heading" }, [
      eyebrow ? el("p", { className: "eyebrow eyebrow--plain", text: eyebrow }) : null,
      el("h2", { className: "modal__title", id: titleId, text: title || "Information" }),
      subtitle ? el("p", { className: "modal__sub", text: subtitle }) : null
    ]),
    closeButton
  ]);

  const body = el("div", { className: "modal__body" });
  append(body, content);

  const dialog = el(
    "div",
    {
      className: `modal ${className}`.trim(),
      attrs: {
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": titleId
      }
    },
    [header, body]
  );

  if (footer) {
    const footerNode = el("footer", { className: "modal__footer" });
    append(footerNode, footer);
    dialog.appendChild(footerNode);
  }

  const backdrop = el("div", { className: "modal-backdrop" }, dialog);

  if (closeOnBackdrop) {
    backdrop.addEventListener("mousedown", (event) => {
      if (event.target === backdrop) closeTopModal();
    });
  }

  document.getElementById("modal-root")?.appendChild(backdrop);
  const releaseTrap = createFocusTrap(dialog);

  const entry = {
    backdrop,
    dialog,
    releaseTrap,
    previousFocus: previousFocus instanceof HTMLElement ? previousFocus : null,
    onClose,
    closed: false
  };
  modalStack.push(entry);
  setBodyLock();

  return {
    element: dialog,
    body,
    close: () => closeEntry(entry)
  };
}

function closeEntry(entry, restoreFocus = true) {
  if (!entry || entry.closed) return;
  entry.closed = true;
  const index = modalStack.indexOf(entry);
  if (index >= 0) modalStack.splice(index, 1);
  entry.releaseTrap();
  entry.backdrop.remove();
  setBodyLock();

  if (typeof entry.onClose === "function") {
    try {
      entry.onClose();
    } catch (error) {
      console.warn("[AVANT LE SILENCE] Erreur à la fermeture d'une modale", error);
    }
  }

  if (restoreFocus && entry.previousFocus && document.contains(entry.previousFocus)) {
    entry.previousFocus.focus({ preventScroll: true });
  }
}

export function closeTopModal(restoreFocus = true) {
  const entry = modalStack[modalStack.length - 1];
  if (!entry) return;
  closeEntry(entry, restoreFocus);
}

export function closeAllModals(restoreFocus = false) {
  while (modalStack.length) {
    closeEntry(modalStack[modalStack.length - 1], restoreFocus);
  }
}

export function confirmDialog(options) {
  const {
    title = "Confirmer",
    message = "",
    confirmLabel = "Confirmer",
    cancelLabel = "Annuler",
    danger = false
  } = options;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
      closeTopModal();
    };

    const paragraphs = Array.isArray(message) ? message : [message];
    const content = el("div", { className: "prose" }, paragraphs.map((text) => el("p", { text })));

    const cancel = el(
      "button",
      {
        className: "btn btn--quiet",
        attrs: { type: "button" },
        on: { click: () => finish(false) }
      },
      cancelLabel
    );

    const confirm = el(
      "button",
      {
        className: `btn ${danger ? "btn--danger" : "btn--primary"}`,
        attrs: { type: "button" },
        on: { click: () => finish(true) }
      },
      confirmLabel
    );

    const modal = openModal({
      title,
      content,
      className: "modal--narrow",
      closeOnBackdrop: false,
      onClose: () => {
        if (!settled) {
          settled = true;
          resolve(false);
        }
      },
      footer: el("div", { className: "modal__footer-actions" }, [cancel, confirm])
    });

    modal.element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && document.activeElement === cancel) {
        event.preventDefault();
        finish(false);
      }
    });
  });
}

export function toast(message, options = {}) {
  const root = document.getElementById("toast-root");
  if (!root) return;

  const variant = options.variant || "default";
  const duration = options.duration ?? 4200;

  const closeButton = el(
    "button",
    {
      className: "toast__close",
      attrs: { type: "button", "aria-label": "Fermer la notification" },
      on: {
        click: () => {
          node.remove();
        }
      }
    },
    "Fermer"
  );

  const node = el("div", { className: `toast ${variant === "soft" ? "toast--soft" : variant === "warning" ? "toast--warning" : ""}`.trim() }, [
    el("span", { text: message }),
    closeButton
  ]);

  root.appendChild(node);
  window.setTimeout(() => {
    if (node.isConnected) node.remove();
  }, duration);
}
