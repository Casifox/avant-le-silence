/**
 * Petits utilitaires partagés.
 * Aucune dépendance externe, aucun innerHTML avec des données non contrôlées.
 */

const ICON_PATHS = {
  book: [
    "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z",
    "M4 5.5v16",
    "M8 7h8",
    "M8 11h6"
  ],
  timeline: [
    "M12 3v18",
    "M12 6h5",
    "M12 12h7",
    "M12 18h4"
  ],
  close: ["M6 6l12 12", "M18 6L6 18"],
  "arrow-left": ["M19 12H5", "M11 18l-6-6 6-6"],
  "arrow-right": ["M5 12h14", "M13 6l6 6-6 6"],
  "arrow-up": ["M12 19V5", "M6 11l6-6 6 6"],
  "arrow-down": ["M12 5v14", "M6 13l6 6 6-6"],
  "chevron-down": ["M6 9l6 6 6-6"],
  menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
  settings: [
    "M4 6h10",
    "M18 6h2",
    "M4 12h2",
    "M10 12h10",
    "M4 18h10",
    "M18 18h2",
    "M16 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4",
    "M8 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4",
    "M16 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4"
  ],
  volume: [
    "M4 9h4l5-4v14l-5-4H4z",
    "M16 9a4 4 0 0 1 0 6",
    "M18 6a8 8 0 0 1 0 12"
  ],
  "volume-off": [
    "M4 9h4l5-4v14l-5-4H4z",
    "M17 9l4 6",
    "M21 9l-4 6"
  ],
  external: [
    "M14 4h6v6",
    "M20 4l-9 9",
    "M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5"
  ],
  check: ["M5 12l5 5L20 7"],
  lock: ["M7 10h10v10H7z", "M9 10V7a3 3 0 0 1 6 0v3"],
  play: ["M8 5l11 7-11 7z"],
  search: ["M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z", "M16.5 16.5L21 21"],
  info: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M12 11v6", "M12 7.5v.5"],
  photo: [
    "M4 5h16v14H4z",
    "M8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    "M4 16l5-5 4 4 3-3 4 4"
  ],
  letter: ["M3 6h18v12H3z", "M3 7l9 6 9-6"],
  drawing: ["M4 20l4-1 11-11-3-3L5 16z", "M14 6l3 3"],
  archive: ["M3 7h18v13H3z", "M3 7l2-4h14l2 4", "M9 11h6"],
  person: [
    "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    "M4 21c1-4 4-6 8-6s7 2 8 6"
  ],
  scale: [
    "M12 3v18",
    "M6 21h12",
    "M12 6l-6 8h12z",
    "M6 14l-3-5",
    "M18 14l3-5",
    "M3 9h6",
    "M15 9h6"
  ],
  memorial: ["M3 21h18", "M5 21V10", "M9 21V10", "M15 21V10", "M19 21V10", "M3 10l9-6 9 6z"],
  warning: ["M12 3L2 21h20z", "M12 9v5", "M12 17.5v.5"],
  home: ["M3 11l9-8 9 8", "M5 10v11h14V10", "M9 21v-7h6v7"],
  link: [
    "M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1",
    "M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"
  ],
  document: ["M6 3h8l4 4v14H6z", "M14 3v4h4", "M9 12h6", "M9 16h6"],
  pause: ["M8 5v14", "M16 5v14"],
  trash: ["M4 7h16", "M9 7V4h6v3", "M6 7l1 14h10l1-14", "M10 11v6", "M14 11v6"],
  plus: ["M12 5v14", "M5 12h14"],
  eye: ["M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6"],
  clock: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M12 7v5l3 2"],
  filter: ["M3 5h18l-7 8v6l-4 2v-8z"],
  grid: ["M4 4h6v6H4z", "M14 4h6v6h-6z", "M4 14h6v6H4z", "M14 14h6v6h-6z"],
  quote: ["M7 7h4v4H7z", "M13 7h4v4h-4z", "M7 11c0 3 1 5 4 6", "M13 11c0 3 1 5 4 6"],
  user: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M4 21c1-4 4-6 8-6s7 2 8 6"],
  chevronRight: ["M9 6l6 6-6 6"],
  square: ["M5 5h14v14H5z"]
};

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Crée un élément DOM.
 * @param {string} tag
 * @param {Object} [options]
 * @param {Node|string|Array<Node|string>|null} [children]
 * @returns {HTMLElement}
 */
export function el(tag, options = {}, children = null) {
  const node = document.createElement(tag);

  if (options.className) node.className = options.className;
  if (options.text !== undefined && options.text !== null) node.textContent = String(options.text);
  if (options.id) node.id = options.id;

  if (options.attrs) {
    for (const [key, value] of Object.entries(options.attrs)) {
      if (value === false || value === null || value === undefined) continue;
      node.setAttribute(key, value === true ? "" : String(value));
    }
  }

  if (options.dataset) {
    for (const [key, value] of Object.entries(options.dataset)) {
      if (value === null || value === undefined) continue;
      node.dataset[key] = String(value);
    }
  }

  if (options.style) {
    for (const [key, value] of Object.entries(options.style)) {
      node.style.setProperty(key, value);
    }
  }

  if (options.on) {
    for (const [eventName, handler] of Object.entries(options.on)) {
      node.addEventListener(eventName, handler);
    }
  }

  append(node, children);
  return node;
}

/**
 * Ajoute un ou plusieurs enfants à un nœud.
 */
export function append(parent, children) {
  if (children === null || children === undefined) return parent;
  const list = Array.isArray(children) ? children.flat(Infinity) : [children];
  for (const child of list) {
    if (child === null || child === undefined || child === false) continue;
    if (child instanceof Node) {
      parent.appendChild(child);
    } else {
      parent.appendChild(document.createTextNode(String(child)));
    }
  }
  return parent;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function frag(children) {
  const fragment = document.createDocumentFragment();
  append(fragment, children);
  return fragment;
}

/**
 * Icône SVG décorative (aria-hidden) construite à partir d'un registre statique.
 */
export function icon(name, options = {}) {
  const size = options.size || 20;
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", options.strokeWidth || "1.7");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  if (options.className) svg.setAttribute("class", options.className);

  const paths = ICON_PATHS[name] || ICON_PATHS.info;
  for (const d of paths) {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    svg.appendChild(path);
  }
  return svg;
}

export const TYPE_META = {
  photographie: { label: "Photographie", icon: "photo" },
  lettre: { label: "Lettre", icon: "letter" },
  dessin: { label: "Dessin", icon: "drawing" },
  carnet: { label: "Carnet", icon: "book" },
  "document-administratif": { label: "Document administratif", icon: "document" },
  temoignage: { label: "Témoignage", icon: "quote" },
  "document-commemoratif": { label: "Document commémoratif", icon: "memorial" },
  "document-judiciaire": { label: "Document judiciaire", icon: "scale" }
};

export const STATUS_META = {
  verified: { label: "Fait vérifié", className: "badge--verified", icon: "check" },
  review_required: { label: "Vérification en cours", className: "badge--review", icon: "info" },
  permission_required: { label: "Reproduction soumise à autorisation", className: "badge--rights", icon: "lock" },
  illustrative: { label: "Reconstitution illustrative", className: "badge--illustrative", icon: "eye" },
  not_applicable: { label: "Aucune reproduction d'archive", className: "badge--quiet", icon: "info" }
};

export function typeMeta(type) {
  return TYPE_META[type] || { label: "Document", icon: "document" };
}

export function statusMeta(status) {
  return STATUS_META[status] || STATUS_META.review_required;
}

export function initials(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function plural(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm || `${singular}s`;
}

export function dedupe(values) {
  return Array.from(new Set(values));
}

export function shuffle(values) {
  const result = values.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function safeExternalUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return parsed.href;
  } catch {
    return null;
  }
}

export function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function debounce(fn, wait = 150) {
  let timer = null;
  return (...args) => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
}

export function formatRange(displayDate, dateNote) {
  if (displayDate) return displayDate;
  if (dateNote) return "Date non établie";
  return "Date non établie";
}

export function truncate(text, max = 160) {
  const value = String(text || "").trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

export function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function byOrder(a, b) {
  return (a.order || 0) - (b.order || 0);
}

export function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function isReducedMotionPreferred() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
