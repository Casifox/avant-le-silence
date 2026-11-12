/**
 * Navigation par hash.
 * Compatible GitHub Pages : aucun chemin serveur n'est requis.
 */

import { parseRoute, routes } from "../utils/paths.js";

export class Navigation {
  constructor(onRoute) {
    this.onRoute = onRoute;
    this.currentHash = null;
    this.previousHash = null;
    this.started = false;
    this.handleHashChange = this.handleHashChange.bind(this);
  }

  start() {
    if (this.started) return;
    this.started = true;
    window.addEventListener("hashchange", this.handleHashChange);

    if (!window.location.hash) {
      window.history.replaceState(null, "", routes.home);
      this.currentHash = routes.home;
      this.onRoute(parseRoute(routes.home), { previousHash: null });
      return;
    }

    this.handleHashChange();
  }

  handleHashChange() {
    const hash = window.location.hash || routes.home;
    if (hash === this.currentHash) return;
    this.previousHash = this.currentHash;
    this.currentHash = hash;
    this.onRoute(parseRoute(hash), { previousHash: this.previousHash });
  }

  navigate(hash, options = {}) {
    if (!hash) return;
    if (options.replace) {
      window.history.replaceState(null, "", hash);
      this.previousHash = this.currentHash;
      this.currentHash = hash;
      this.onRoute(parseRoute(hash), { previousHash: this.previousHash });
      return;
    }

    if (window.location.hash === hash) {
      if (this.currentHash !== hash) this.handleHashChange();
      return;
    }
    window.location.hash = hash;
  }

  replace(hash) {
    this.navigate(hash, { replace: true });
  }

  back(fallback = routes.home) {
    if (this.previousHash) {
      window.history.back();
    } else {
      this.navigate(fallback);
    }
  }

  getCurrentHash() {
    return this.currentHash || window.location.hash || routes.home;
  }
}
