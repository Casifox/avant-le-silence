/**
 * Exploration : chapitres, scènes, points d'intérêt et listes de lecture.
 */

import { byOrder, dedupe } from "../utils/helpers.js";

export class Exploration {
  constructor(app) {
    this.app = app;
  }

  getChapters() {
    return (this.app.content.chapters?.chapters || []).slice().sort(byOrder);
  }

  getChapter(chapterId) {
    return this.app.index.chapters.get(chapterId) || null;
  }

  getScenes(chapterId) {
    return this.getChapter(chapterId)?.scenes || [];
  }

  getScene(chapterId, sceneId) {
    return this.getScenes(chapterId).find((scene) => scene.id === sceneId) || null;
  }

  getSceneIndex(chapterId, sceneId) {
    return this.getScenes(chapterId).findIndex((scene) => scene.id === sceneId);
  }

  getNextScene(chapterId, sceneId) {
    const scenes = this.getScenes(chapterId);
    const index = this.getSceneIndex(chapterId, sceneId);
    return index >= 0 && index < scenes.length - 1 ? scenes[index + 1] : null;
  }

  getPreviousScene(chapterId, sceneId) {
    const scenes = this.getScenes(chapterId);
    const index = this.getSceneIndex(chapterId, sceneId);
    return index > 0 ? scenes[index - 1] : null;
  }

  getFirstScene(chapterId) {
    return this.getScenes(chapterId)[0] || null;
  }

  getFirstUnvisitedScene(chapterId) {
    const chapterState = this.app.stateManager.get().chapters[chapterId];
    const visited = new Set(chapterState?.visitedScenes || []);
    return this.getScenes(chapterId).find((scene) => !visited.has(scene.id)) || this.getFirstScene(chapterId);
  }

  resolveItem(id) {
    if (this.app.index.documents.has(id)) {
      return { type: "document", id, data: this.app.index.documents.get(id) };
    }
    if (this.app.index.people.has(id)) {
      return { type: "person", id, data: this.app.index.people.get(id) };
    }
    return null;
  }

  getReadingList(scene) {
    return (scene?.readingList || [])
      .map((id) => this.resolveItem(id))
      .filter(Boolean);
  }

  getRequiredForChapter(chapterId) {
    const chapter = this.getChapter(chapterId);
    if (!chapter) return [];
    const items = [];
    for (const scene of chapter.scenes || []) {
      for (const required of scene.required || []) {
        items.push({ type: required.type, id: required.id });
      }
    }
    const seen = new Set();
    return items.filter((item) => {
      const key = `${item.type}:${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  getRequiredForScene(scene) {
    return (scene?.required || []).map((item) => ({ type: item.type, id: item.id }));
  }

  getSceneTarget(hotspot) {
    const action = hotspot?.action;
    if (!action) return null;
    if (action.type === "document") {
      const document = this.app.index.documents.get(action.id);
      return document ? { type: "document", data: document } : null;
    }
    if (action.type === "person") {
      const person = this.app.index.people.get(action.id);
      return person ? { type: "person", data: person } : null;
    }
    if (action.type === "note") {
      return { type: "note", data: action };
    }
    return null;
  }

  getChapterTags(chapterId) {
    const tags = [];
    for (const scene of this.getScenes(chapterId)) {
      for (const item of this.getReadingList(scene)) {
        if (item.type === "document") tags.push(...(item.data.tags || []));
      }
    }
    return dedupe(tags);
  }
}
