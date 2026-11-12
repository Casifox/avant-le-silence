/**
 * Routes et chemins relatifs.
 * Tous les chemins sont compatibles avec un site GitHub Pages de type
 * https://utilisateur.github.io/avant-le-silence/
 */

export const APP_NAME = "AVANT LE SILENCE";
export const APP_VERSION = "0.8.0";
export const CONTENT_BASE = "./content/fr/";

export const routes = {
  home: "#/accueil",
  warning: "#/avertissement",
  intro: "#/introduction",
  chapters: "#/chapitres",
  chapter: (chapterId) => `#/chapitre/${encodeURIComponent(chapterId)}`,
  scene: (chapterId, sceneId) =>
    `#/chapitre/${encodeURIComponent(chapterId)}/scene/${encodeURIComponent(sceneId)}`,
  review: (chapterId) => `#/chapitre/${encodeURIComponent(chapterId)}/bilan`,
  timeline: "#/chronologie",
  notebook: "#/carnet",
  sources: "#/sources",
  glossary: "#/glossaire",
  about: "#/apropos",
  settings: "#/parametres",
  conclusion: "#/conclusion",
  end: "#/fin"
};

export function contentUrl(file) {
  return `${CONTENT_BASE}${file}`;
}

export function parseRoute(rawHash) {
  const raw = String(rawHash || window.location.hash || "").replace(/^#\/?/, "");
  const segments = raw
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });

  if (segments.length === 0) return { name: "home" };

  const [first, second, third, fourth] = segments;

  if (first === "accueil") return { name: "home" };
  if (first === "avertissement") return { name: "warning" };
  if (first === "introduction") return { name: "intro" };
  if (first === "chapitres") return { name: "chapters" };
  if (first === "chronologie") return { name: "timeline" };
  if (first === "carnet") return { name: "notebook" };
  if (first === "sources") return { name: "sources" };
  if (first === "glossaire") return { name: "glossary" };
  if (first === "apropos") return { name: "about" };
  if (first === "parametres") return { name: "settings" };
  if (first === "conclusion") return { name: "conclusion" };
  if (first === "fin") return { name: "end" };

  if (first === "chapitre" && second) {
    if (third === "scene" && fourth) {
      return { name: "scene", chapterId: second, sceneId: fourth };
    }
    if (third === "bilan") {
      return { name: "review", chapterId: second };
    }
    return { name: "chapter", chapterId: second };
  }

  return { name: "notFound" };
}

export function isMainRoute(route) {
  return !["notFound"].includes(route.name);
}

export function routeLabel(route) {
  const labels = {
    home: "Accueil",
    warning: "Avertissement",
    intro: "Introduction",
    chapters: "Chapitres",
    chapter: "Chapitre",
    scene: "Scène",
    review: "Bilan",
    timeline: "Chronologie",
    notebook: "Carnet",
    sources: "Sources",
    glossary: "Glossaire",
    about: "À propos",
    settings: "Paramètres",
    conclusion: "Conclusion",
    end: "Fin",
    notFound: "Page introuvable"
  };
  return labels[route.name] || "AVANT LE SILENCE";
}
