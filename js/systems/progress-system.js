/**
 * Progression : éléments essentiels, déblocage des chapitres et bilan.
 */

import { percent, uniqueBy } from "../utils/helpers.js";

export class ProgressSystem {
  constructor(app) {
    this.app = app;
  }

  isItemDone(type, id) {
    if (type === "document") return this.app.documentSystem.isRead(id);
    if (type === "person") return this.app.documentSystem.isMet(id);
    return false;
  }

  getChapterRequired(chapterId) {
    return uniqueBy(this.app.exploration.getRequiredForChapter(chapterId), (item) => `${item.type}:${item.id}`);
  }

  getChapterProgress(chapterId) {
    const chapter = this.app.exploration.getChapter(chapterId);
    const state = this.app.stateManager.get();
    if (!chapter) {
      return {
        requiredTotal: 0,
        requiredDone: 0,
        ratio: 0,
        missing: [],
        docsRead: 0,
        docsTotal: 0,
        peopleMet: 0,
        peopleTotal: 0,
        activitiesDone: 0,
        activitiesTotal: 0,
        completed: false,
        visitedScenes: 0,
        scenesTotal: 0
      };
    }

    const required = this.getChapterRequired(chapterId);
    const missing = required.filter((item) => !this.isItemDone(item.type, item.id));
    const requiredDone = required.length - missing.length;

    const readingItems = uniqueBy(
      (chapter.scenes || []).flatMap((scene) => this.app.exploration.getReadingList(scene)),
      (item) => `${item.type}:${item.id}`
    );
    const documents = readingItems.filter((item) => item.type === "document");
    const people = readingItems.filter((item) => item.type === "person");

    const activities = (chapter.scenes || []).map((scene) => scene.activity).filter(Boolean);
    const activitiesDone = activities.filter((activity) =>
      state.activitiesCompleted.includes(activity.id)
    ).length;

    const chapterState = state.chapters[chapterId];
    const visitedScenes = chapterState?.visitedScenes?.length || 0;

    return {
      requiredTotal: required.length,
      requiredDone,
      ratio: required.length ? requiredDone / required.length : 0,
      missing,
      docsRead: documents.filter((item) => this.app.documentSystem.isRead(item.id)).length,
      docsTotal: documents.length,
      peopleMet: people.filter((item) => this.app.documentSystem.isMet(item.id)).length,
      peopleTotal: people.length,
      activitiesDone,
      activitiesTotal: activities.length,
      completed: Boolean(chapterState?.completed),
      visitedScenes,
      scenesTotal: (chapter.scenes || []).length
    };
  }

  getMissingItems(chapterId) {
    return this.getChapterRequired(chapterId)
      .filter((item) => !this.isItemDone(item.type, item.id))
      .map((item) => {
        const data =
          item.type === "document"
            ? this.app.index.documents.get(item.id)
            : this.app.index.people.get(item.id);
        return { ...item, data };
      })
      .filter((item) => item.data);
  }

  canAccessChapter(chapterId) {
    const chapter = this.app.exploration.getChapter(chapterId);
    if (!chapter) return false;
    if (chapter.order <= 1) return true;
    const previous = this.app.exploration
      .getChapters()
      .find((item) => item.order === chapter.order - 1);
    if (!previous) return false;
    return Boolean(this.app.stateManager.get().chapters[previous.id]?.completed);
  }

  getChapterStatus(chapterId) {
    const progress = this.getChapterProgress(chapterId);
    if (progress.completed) return "completed";
    if (!this.canAccessChapter(chapterId)) return "locked";
    if (progress.visitedScenes > 0) return "in-progress";
    return "available";
  }

  completeChapter(chapterId) {
    const chapter = this.app.exploration.getChapter(chapterId);
    if (!chapter) return false;
    const chapterState = this.app.stateManager.get().chapters[chapterId];
    if (chapterState?.completed) return false;

    this.app.stateManager.update((state) => {
      state.chapters[chapterId].completed = true;
      state.chapters[chapterId].completedAt = new Date().toISOString();
    });
    this.app.events.emit("chapter:completed", chapter);
    return true;
  }

  getNextChapter(chapterId) {
    const chapter = this.app.exploration.getChapter(chapterId);
    const next = chapter?.completion?.next;
    if (!next) return null;
    return this.app.exploration.getChapter(next) || null;
  }

  isConclusionNext(chapterId) {
    return this.app.exploration.getChapter(chapterId)?.completion?.next === "conclusion";
  }

  canAccessConclusion() {
    const lastChapter = this.app.exploration.getChapters().slice(-1)[0];
    return Boolean(lastChapter && this.app.stateManager.get().chapters[lastChapter.id]?.completed);
  }

  getOverallProgress() {
    const chapters = this.app.exploration.getChapters();
    const state = this.app.stateManager.get();
    const completedChapters = chapters.filter(
      (chapter) => state.chapters[chapter.id]?.completed
    ).length;

    const totalDocuments = this.app.index.documents.size;
    const totalPeople = this.app.index.people.size;
    const totalActivities = chapters.reduce(
      (sum, chapter) =>
        sum + (chapter.scenes || []).filter((scene) => scene.activity).length,
      0
    );

    return {
      chaptersCompleted: completedChapters,
      chaptersTotal: chapters.length,
      chaptersRatio: chapters.length ? completedChapters / chapters.length : 0,
      documentsRead: state.documentsRead.length,
      documentsTotal: totalDocuments,
      documentsRatio: totalDocuments ? state.documentsRead.length / totalDocuments : 0,
      peopleMet: state.peopleMet.length,
      peopleTotal: totalPeople,
      peopleRatio: totalPeople ? state.peopleMet.length / totalPeople : 0,
      activitiesCompleted: state.activitiesCompleted.length,
      activitiesTotal: totalActivities,
      activitiesRatio: totalActivities ? state.activitiesCompleted.length / totalActivities : 0,
      notebookCount:
        state.notebook.documents.length + state.notebook.people.length + state.notebook.events.length,
      percentChapters: percent(completedChapters, chapters.length)
    };
  }

  getResumeChapter() {
    const accessible = this.app.exploration
      .getChapters()
      .filter((chapter) => this.canAccessChapter(chapter.id));
    return (
      accessible.find((chapter) => !this.app.stateManager.get().chapters[chapter.id]?.completed) ||
      accessible.slice(-1)[0] ||
      null
    );
  }

  getFirstIncompleteScene(chapterId) {
    return this.app.exploration.getFirstUnvisitedScene(chapterId);
  }
}
