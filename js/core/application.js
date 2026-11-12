/**
 * Application : chargement du contenu, routes, état et coordination des systèmes.
 */

import { contentUrl, routes } from "../utils/paths.js";
import { assertValidContent } from "../utils/validation.js";
import {
  applyPreferences as applyDocumentPreferences,
  focusMainHeading,
  setPageTitle,
  announce
} from "../utils/accessibility.js";
import { isTypingTarget } from "../utils/helpers.js";
import { EventManager } from "./event-manager.js";
import { StateManager } from "./state-manager.js";
import { Navigation } from "./navigation.js";
import { Exploration } from "../systems/exploration.js";
import { DocumentSystem } from "../systems/document-system.js";
import { ChronologySystem } from "../systems/chronology-system.js";
import { MemoryNotebook } from "../systems/memory-notebook.js";
import { ProgressSystem } from "../systems/progress-system.js";
import { AudioSystem } from "../systems/audio-system.js";
import { renderHome, renderWarning, renderPrologue } from "../ui/home-screen.js";
import {
  renderChapterSelect,
  renderChapterWarning,
  renderLockedChapter,
  renderScene,
  renderChapterReview,
  refreshSceneStatus
} from "../ui/chapter-screen.js";
import { renderTimeline } from "../ui/chronology-ui.js";
import { renderNotebook } from "../ui/notebook-ui.js";
import { renderSettings } from "../ui/settings-ui.js";
import {
  renderSources,
  renderGlossary,
  renderAbout,
  renderConclusion,
  renderFinal,
  renderNotFound
} from "../ui/info-screens.js";
import { toast, closeAllModals } from "../ui/modal.js";

function mapById(items) {
  return new Map((items || []).map((item) => [item.id, item]));
}

function buildIndex(content) {
  return {
    chapters: mapById(content.chapters?.chapters),
    documents: mapById(content.documents?.documents),
    people: mapById(content.people?.people),
    events: mapById(content.timeline?.events),
    sources: mapById(content.sources?.sources),
    terms: mapById(content.glossary?.terms)
  };
}

export class Application {
  constructor() {
    this.content = null;
    this.index = null;
    this.events = null;
    this.stateManager = null;
    this.exploration = null;
    this.documentSystem = null;
    this.chronologySystem = null;
    this.memoryNotebook = null;
    this.progressSystem = null;
    this.audio = null;
    this.navigation = null;
    this.currentRoute = null;
    this.currentHash = null;
    this.returnTo = routes.home;
    this.pendingChapterRoute = null;
    this.pendingAfterWarning = null;
    this.hasRenderedOnce = false;
    this.bootWarningsShown = false;
    this.storageWarningShown = false;
  }

  async loadContent() {
    const files = {
      chapters: "chapters.json",
      people: "people.json",
      documents: "documents.json",
      timeline: "timeline.json",
      glossary: "glossary.json",
      narratives: "narratives.json",
      sources: "sources.json"
    };

    const entries = await Promise.all(
      Object.entries(files).map(async ([key, file]) => {
        const response = await fetch(contentUrl(file), { cache: "no-cache" });
        if (!response.ok) {
          throw new Error(`Impossible de charger ${file} (${response.status}).`);
        }
        return [key, await response.json()];
      })
    );

    const content = Object.fromEntries(entries);
    assertValidContent(content);
    return content;
  }

  async boot() {
    const content = await this.loadContent();
    this.content = content;
    this.index = buildIndex(content);

    this.events = new EventManager();
    this.stateManager = new StateManager(content, this.events);
    this.stateManager.load();

    this.exploration = new Exploration(this);
    this.documentSystem = new DocumentSystem(this);
    this.chronologySystem = new ChronologySystem(this);
    this.memoryNotebook = new MemoryNotebook(this);
    this.progressSystem = new ProgressSystem(this);
    this.audio = new AudioSystem(this.stateManager);

    this.applyPreferences();
    this.bindEvents();
    this.bindShortcuts();
    this.bindAudioGesture();

    this.navigation = new Navigation((route) => this.render(route));
    this.navigation.start();
  }

  applyPreferences() {
    applyDocumentPreferences(this.stateManager.get().preferences);
  }

  bindEvents() {
    this.events.on("document:read", () => refreshSceneStatus(this));
    this.events.on("person:met", () => refreshSceneStatus(this));
    this.events.on("storage:unavailable", () => {
      if (this.storageWarningShown) return;
      this.storageWarningShown = true;
      toast(this.content.narratives.errors.storage, { variant: "warning", duration: 9000 });
    });
  }

  bindShortcuts() {
    document.addEventListener("keydown", (event) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (isTypingTarget(event.target)) return;
      if (document.querySelector(".modal-backdrop")) return;

      const key = String(event.key || "").toLowerCase();
      if (key === "n") {
        event.preventDefault();
        if (this.currentRoute?.name === "notebook") {
          this.navigate(this.returnTo || routes.chapters);
        } else {
          this.openWithReturn(routes.notebook);
        }
      } else if (key === "t") {
        event.preventDefault();
        if (this.currentRoute?.name === "timeline") {
          this.navigate(this.returnTo || routes.chapters);
        } else {
          this.openWithReturn(routes.timeline);
        }
      }
    });
  }

  bindAudioGesture() {
    const start = () => {
      this.audio.start();
    };
    document.addEventListener("pointerdown", start, { once: true, passive: true });
    document.addEventListener("keydown", start, { once: true });
  }

  navigate(route) {
    this.navigation?.navigate(route);
  }

  openWithReturn(route) {
    const current = window.location.hash || routes.home;
    if (current && current !== route) this.returnTo = current;
    this.navigate(route);
  }

  startExperience() {
    this.pendingAfterWarning = null;
    if (!this.stateManager.get().warningAcknowledged) {
      this.navigate(routes.warning);
      return;
    }
    this.navigate(routes.intro);
  }

  continueExperience() {
    const lastRoute = this.stateManager.get().lastRoute;
    if (lastRoute && lastRoute !== routes.home && lastRoute !== routes.warning) {
      this.navigate(lastRoute);
      return;
    }
    this.navigate(routes.chapters);
  }

  resetProgress() {
    closeAllModals(false);
    this.stateManager.reset();
    this.applyPreferences();
    this.audio.applyPreferences(this.stateManager.get().preferences);
    this.audio.play("confirm");
    this.navigate(routes.home);
    toast("Les données locales ont été supprimées.", { variant: "soft" });
    announce("Les données locales ont été supprimées.");
  }

  showBootWarnings() {
    const info = this.stateManager.getInfo();
    if (info.warnings.length) {
      const message =
        info.warnings.length === 1
          ? info.warnings[0]
          : `${info.warnings[0]} (${info.warnings.length - 1} autre${info.warnings.length > 2 ? "s" : ""} avertissement${info.warnings.length > 2 ? "s" : ""})`;
      toast(message, { variant: "warning", duration: 8000 });
    }
    if (!info.persistent) {
      toast(this.content.narratives.errors.storage, { variant: "warning", duration: 9000 });
      this.storageWarningShown = true;
    }
  }

  getChapterForRoute(route) {
    return route.chapterId ? this.exploration.getChapter(route.chapterId) : null;
  }

  getSceneForRoute(route) {
    const chapter = this.getChapterForRoute(route);
    if (!chapter || !route.sceneId) return null;
    return this.exploration.getScene(chapter.id, route.sceneId);
  }

  requiresWarning(chapter, route) {
    if (!chapter?.requiresWarning) return false;
    if (this.stateManager.get().chapterWarnings[chapter.id]) return false;
    this.pendingChapterRoute =
      route.name === "scene" || route.name === "review" ? window.location.hash : null;
    return true;
  }

  buildRouteScreen(route) {
    const guardedRoutes = new Set([
      "chapters",
      "chapter",
      "scene",
      "review",
      "timeline",
      "conclusion"
    ]);
    if (
      guardedRoutes.has(route.name) &&
      !this.stateManager.get().warningAcknowledged
    ) {
      this.pendingAfterWarning = window.location.hash;
      this.navigation.replace(routes.warning);
      return null;
    }

    switch (route.name) {
      case "home":
        return renderHome(this);
      case "warning":
        return renderWarning(this);
      case "intro":
        if (!this.stateManager.get().warningAcknowledged) {
          this.navigation.replace(routes.warning);
          return null;
        }
        return renderPrologue(this);
      case "chapters":
        return renderChapterSelect(this);
      case "chapter": {
        const chapter = this.getChapterForRoute(route);
        if (!chapter) return renderNotFound(this);
        if (!this.progressSystem.canAccessChapter(chapter.id)) return renderLockedChapter(this, chapter);
        if (this.requiresWarning(chapter, route)) return renderChapterWarning(this, chapter);
        const scene = this.exploration.getFirstUnvisitedScene(chapter.id);
        if (scene) {
          this.navigation.replace(routes.scene(chapter.id, scene.id));
          return null;
        }
        return renderChapterReview(this, chapter);
      }
      case "scene": {
        const chapter = this.getChapterForRoute(route);
        const scene = this.getSceneForRoute(route);
        if (!chapter || !scene) return renderNotFound(this);
        if (!this.progressSystem.canAccessChapter(chapter.id)) return renderLockedChapter(this, chapter);
        if (this.requiresWarning(chapter, route)) return renderChapterWarning(this, chapter);
        return renderScene(this, chapter, scene);
      }
      case "review": {
        const chapter = this.getChapterForRoute(route);
        if (!chapter) return renderNotFound(this);
        if (!this.progressSystem.canAccessChapter(chapter.id)) return renderLockedChapter(this, chapter);
        return renderChapterReview(this, chapter);
      }
      case "timeline":
        return renderTimeline(this);
      case "notebook":
        return renderNotebook(this);
      case "sources":
        return renderSources(this);
      case "glossary":
        return renderGlossary(this);
      case "about":
        return renderAbout(this);
      case "settings":
        return renderSettings(this);
      case "conclusion":
        if (!this.progressSystem.canAccessConclusion()) {
          this.navigation.replace(routes.chapters);
          return null;
        }
        return renderConclusion(this);
      case "end":
        return renderFinal(this);
      case "notFound":
      default:
        return renderNotFound(this);
    }
  }

  getRouteTitle(route) {
    switch (route.name) {
      case "home":
        return "Une maison. Des vies. Une mémoire.";
      case "warning":
        return "Avertissement de contenu";
      case "intro":
        return "Une mémoire à transmettre";
      case "chapters":
        return "Parcours";
      case "chapter": {
        const chapter = this.getChapterForRoute(route);
        return chapter ? `Chapitre ${chapter.number} — ${chapter.title}` : "Chapitre";
      }
      case "scene": {
        const chapter = this.getChapterForRoute(route);
        const scene = this.getSceneForRoute(route);
        return chapter && scene ? `${chapter.title} — ${scene.title}` : "Scène";
      }
      case "review": {
        const chapter = this.getChapterForRoute(route);
        return chapter ? `${chapter.title} — bilan` : "Bilan";
      }
      case "timeline":
        return "Chronologie";
      case "notebook":
        return "Carnet de mémoire";
      case "sources":
        return "Sources et crédits";
      case "glossary":
        return "Glossaire";
      case "about":
        return "À propos du projet";
      case "settings":
        return "Paramètres";
      case "conclusion":
        return "Conclusion";
      case "end":
        return "Fin du parcours";
      default:
        return "Page introuvable";
    }
  }

  getMoodForRoute(route) {
    if (route.name === "scene" || route.name === "review" || route.name === "chapter") {
      return this.getChapterForRoute(route)?.mood || "default";
    }
    if (route.name === "home" || route.name === "intro") return "day";
    if (route.name === "conclusion" || route.name === "end") return "memory";
    return "default";
  }

  shouldRememberRoute(route) {
    return ["chapters", "scene", "review", "conclusion", "end"].includes(route.name);
  }

  render(route) {
    if (document.querySelector(".modal-backdrop")) {
      closeAllModals(false);
    }
    const screen = this.buildRouteScreen(route);
    if (!screen) return;

    const root = document.getElementById("app");
    if (!root) return;
    root.replaceChildren(screen);
    root.setAttribute("aria-busy", "false");

    this.currentRoute = route;
    this.currentHash = window.location.hash || routes.home;
    setPageTitle(this.getRouteTitle(route));
    this.audio.setMood(this.getMoodForRoute(route));

    if (this.shouldRememberRoute(route)) {
      this.stateManager.setLastRoute(this.currentHash);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (this.hasRenderedOnce) {
      window.setTimeout(() => {
        if (!document.querySelector(".modal-backdrop")) focusMainHeading(document);
      }, 0);
    } else {
      this.hasRenderedOnce = true;
    }

    if (!this.bootWarningsShown) {
      this.bootWarningsShown = true;
      window.setTimeout(() => this.showBootWarnings(), 350);
    }
  }
}
