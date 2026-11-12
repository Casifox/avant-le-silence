/**
 * Accessibilité : préférences, annonces et piège de focus des modales.
 */

import { APP_NAME } from "./paths.js";

export function applyPreferences(preferences) {
  const root = document.documentElement;
  const textSize = ["normal", "large", "xlarge"].includes(preferences.textSize)
    ? preferences.textSize
    : "normal";
  const contrast = preferences.contrast === "high" ? "high" : "normal";
  const reducedMotion = Boolean(preferences.reducedMotion);

  root.dataset.textSize = textSize;
  root.dataset.contrast = contrast;
  root.dataset.reducedMotion = reducedMotion ? "true" : "false";
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function announce(message) {
  const live = document.getElementById("live-region");
  if (!live) return;
  live.textContent = "";
  window.setTimeout(() => {
    live.textContent = String(message || "");
  }, 30);
}

export function setPageTitle(title) {
  document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
}

/**
 * Piège le focus dans un conteneur. Retourne une fonction de libération.
 */
export function createFocusTrap(container) {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  function getFocusable() {
    return Array.from(container.querySelectorAll(selector)).filter(
      (node) => node instanceof HTMLElement && node.offsetParent !== null
    );
  }

  function handleKeydown(event) {
    if (event.key !== "Tab") return;
    const focusable = getFocusable();
    if (focusable.length === 0) {
      event.preventDefault();
      container.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  container.addEventListener("keydown", handleKeydown);
  const firstFocusable = getFocusable();
  if (firstFocusable.length) {
    firstFocusable[0].focus();
  } else {
    container.setAttribute("tabindex", "-1");
    container.focus();
  }

  return () => container.removeEventListener("keydown", handleKeydown);
}

/**
 * Place le focus sur le titre principal après un changement de vue.
 */
export function focusMainHeading(root = document) {
  const heading = root.querySelector("main h1, [role='main'] h1, h1");
  if (!heading) return;
  heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
}
