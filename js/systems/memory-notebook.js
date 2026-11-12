/**
 * Carnet de mémoire : documents, personnes et dates conservés par le joueur.
 */

const KIND_TO_KEY = {
  document: "documents",
  person: "people",
  event: "events"
};

const KEY_TO_KIND = {
  documents: "document",
  people: "person",
  events: "event"
};

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export class MemoryNotebook {
  constructor(app) {
    this.app = app;
  }

  keyFor(kind) {
    return KIND_TO_KEY[kind] || null;
  }

  getIds(kind) {
    const key = this.keyFor(kind);
    return key ? this.app.stateManager.get().notebook[key] || [] : [];
  }

  has(kind, id) {
    return this.getIds(kind).includes(id);
  }

  add(kind, id) {
    const key = this.keyFor(kind);
    if (!key) return false;
    if (!this.itemExists(kind, id)) return false;
    if (this.has(kind, id)) return false;
    this.app.stateManager.update((state) => {
      state.notebook[key].push(id);
    });
    this.app.events.emit("notebook:added", { kind, id });
    return true;
  }

  remove(kind, id) {
    const key = this.keyFor(kind);
    if (!key) return false;
    const ids = this.getIds(kind);
    if (!ids.includes(id)) return false;
    this.app.stateManager.update((state) => {
      state.notebook[key] = state.notebook[key].filter((item) => item !== id);
    });
    this.app.events.emit("notebook:removed", { kind, id });
    return true;
  }

  toggle(kind, id) {
    if (this.has(kind, id)) {
      this.remove(kind, id);
      return "removed";
    }
    this.add(kind, id);
    return "added";
  }

  itemExists(kind, id) {
    if (kind === "document") return this.app.index.documents.has(id);
    if (kind === "person") return this.app.index.people.has(id);
    if (kind === "event") return this.app.index.events.has(id);
    return false;
  }

  getItems() {
    const items = [];
    const state = this.app.stateManager.get();

    for (const id of state.notebook.documents) {
      const data = this.app.index.documents.get(id);
      if (!data) continue;
      const chapter = this.app.index.chapters.get(data.chapter);
      items.push({
        kind: "document",
        id,
        data,
        title: data.title,
        summary: data.notebookSummary || data.description,
        chapterId: data.chapter || null,
        chapterTitle: chapter?.title || null,
        tags: data.tags || []
      });
    }

    for (const id of state.notebook.people) {
      const data = this.app.index.people.get(id);
      if (!data) continue;
      items.push({
        kind: "person",
        id,
        data,
        title: data.name,
        summary: data.role,
        chapterId: null,
        chapterTitle: null,
        tags: [data.kind === "perpetrator" ? "responsable" : "personne"]
      });
    }

    for (const id of state.notebook.events) {
      const data = this.app.index.events.get(id);
      if (!data) continue;
      items.push({
        kind: "event",
        id,
        data,
        title: data.title,
        summary: data.displayDate,
        chapterId: null,
        chapterTitle: data.period === "apres-guerre" ? "Après-guerre" : "1943–1944",
        tags: ["date"]
      });
    }

    return items;
  }

  getCounts() {
    const state = this.app.stateManager.get();
    return {
      documents: state.notebook.documents.length,
      people: state.notebook.people.length,
      events: state.notebook.events.length,
      total:
        state.notebook.documents.length +
        state.notebook.people.length +
        state.notebook.events.length
    };
  }

  isEmpty() {
    return this.getCounts().total === 0;
  }

  filterItems({ kind = "all", chapterId = "all", query = "" } = {}) {
    const normalizedQuery = normalize(query).trim();
    return this.getItems().filter((item) => {
      if (kind !== "all" && item.kind !== kind) return false;
      if (chapterId !== "all" && item.kind === "document" && item.chapterId !== chapterId) {
        return false;
      }
      if (!normalizedQuery) return true;
      const haystack = normalize(
        `${item.title} ${item.summary} ${item.chapterTitle || ""} ${(item.tags || []).join(" ")}`
      );
      return haystack.includes(normalizedQuery);
    });
  }

  getThemes() {
    const counts = new Map();
    for (const item of this.getItems()) {
      if (item.kind !== "document") continue;
      for (const tag of item.tags || []) {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }

  getSummary() {
    const counts = this.getCounts();
    const themes = this.getThemes().slice(0, 8);
    return {
      counts,
      themes,
      documents: this.getItems().filter((item) => item.kind === "document").map((item) => item.title),
      people: this.getItems().filter((item) => item.kind === "person").map((item) => item.title),
      events: this.getItems().filter((item) => item.kind === "event").map((item) => item.title)
    };
  }

  getChapterFilters() {
    return Array.from(this.app.index.chapters.values())
      .filter((chapter) => chapter.order >= 1)
      .map((chapter) => ({ id: chapter.id, title: chapter.title, number: chapter.number }));
  }

  getKnownKindCounts() {
    return {
      documents: this.app.index.documents.size,
      people: this.app.index.people.size,
      events: this.app.index.events.size
    };
  }
}
