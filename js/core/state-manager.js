/**
 * État applicatif et persistance.
 */

import { SaveManager } from "../storage/save-manager.js";
import { createDefaultState, validateSave } from "../storage/save-validator.js";
import { migrate } from "../storage/migrations.js";

export class StateManager {
  constructor(content, events) {
    this.content = content;
    this.events = events;
    this.chapterIds = (content.chapters?.chapters || []).map((chapter) => chapter.id);
    this.save = new SaveManager();
    this.state = createDefaultState(this.chapterIds);
    this.loadedFromSave = false;
    this.loadWarnings = [];
    this.storageWarningEmitted = false;
    this.listeners = new Set();
  }

  load() {
    const raw = this.save.read();
    if (!raw) {
      if (this.save.lastError) {
        this.loadWarnings.push(
          "La sauvegarde locale n'a pas pu être relue. Une nouvelle progression a été commencée."
        );
      }
      return;
    }

    const migrated = migrate(raw);
    if (!migrated) {
      this.loadWarnings.push("La sauvegarde n'est pas compatible avec cette version du jeu.");
      return;
    }

    const result = validateSave(migrated, this.content);
    if (!result.state) {
      this.loadWarnings.push("La sauvegarde n'a pas pu être relue.");
      return;
    }

    this.state = result.state;
    this.loadedFromSave = true;
    this.loadWarnings.push(...result.warnings);
  }

  get() {
    return this.state;
  }

  subscribe(handler) {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  notify() {
    for (const handler of Array.from(this.listeners)) {
      try {
        handler(this.state);
      } catch (error) {
        console.error("[AVANT LE SILENCE] Erreur dans un abonné à l'état", error);
      }
    }
  }

  update(mutator, options = {}) {
    const result = mutator(this.state);
    if (result === false) return this.state;
    this.state.updatedAt = new Date().toISOString();

    const persisted = this.save.write(this.state);
    if (!persisted && !this.storageWarningEmitted) {
      this.storageWarningEmitted = true;
      this.events.emit("storage:unavailable");
    }

    if (!options.silent) {
      this.notify();
      this.events.emit("state:changed", this.state);
    }
    return this.state;
  }

  setPreference(key, value) {
    return this.update((state) => {
      state.preferences[key] = value;
    });
  }

  setLastRoute(route) {
    if (!route || this.state.lastRoute === route) return;
    return this.update((state) => {
      state.lastRoute = route;
    }, { silent: true });
  }

  acknowledgeWarning() {
    return this.update((state) => {
      state.warningAcknowledged = true;
    });
  }

  acknowledgeChapterWarning(chapterId) {
    return this.update((state) => {
      state.chapterWarnings[chapterId] = true;
    });
  }

  reset() {
    this.save.clear();
    this.state = createDefaultState(this.chapterIds);
    this.storageWarningEmitted = false;
    this.loadedFromSave = false;
    this.notify();
    this.events.emit("state:changed", this.state);
    this.events.emit("save:reset");
  }

  getInfo() {
    return {
      ...this.save.getInfo(),
      loadedFromSave: this.loadedFromSave,
      warnings: this.loadWarnings
    };
  }
}
