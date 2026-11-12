/**
 * Sauvegarde locale.
 * Aucun compte, aucun serveur, aucune donnée personnelle.
 * En cas d'indisponibilité de localStorage, un repli en mémoire permet de
 * terminer la session sans perdre la progression en cours.
 */

const STORAGE_KEY = "avant-le-silence.save.v1";
const TEST_KEY = "avant-le-silence.test";

export class SaveManager {
  constructor() {
    this.memory = null;
    this.lastError = null;
    this.available = this.testAvailability();
  }

  testAvailability() {
    try {
      window.localStorage.setItem(TEST_KEY, "1");
      window.localStorage.removeItem(TEST_KEY);
      return true;
    } catch {
      return false;
    }
  }

  read() {
    try {
      const raw = this.available
        ? window.localStorage.getItem(STORAGE_KEY)
        : this.memory;
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      this.lastError = error;
      return null;
    }
  }

  write(state) {
    const json = JSON.stringify(state);
    this.memory = json;
    if (!this.available) return false;
    try {
      window.localStorage.setItem(STORAGE_KEY, json);
      return true;
    } catch (error) {
      this.lastError = error;
      this.available = false;
      return false;
    }
  }

  clear() {
    this.memory = null;
    if (!this.available) return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      this.lastError = error;
    }
  }

  isPersistent() {
    return this.available;
  }

  getInfo() {
    return {
      persistent: this.available,
      supported: this.testAvailability(),
      error: this.lastError ? String(this.lastError.name || "StorageError") : null
    };
  }
}
