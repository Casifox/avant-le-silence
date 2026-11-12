/**
 * Validation et normalisation d'une sauvegarde.
 * Les données inconnues sont retirées, jamais interprétées arbitrairement.
 */

import { CURRENT_VERSION } from "./migrations.js";

const TEXT_SIZES = new Set(["normal", "large", "xlarge"]);
const CONTRASTS = new Set(["normal", "high"]);
const ROUTE_PREFIX = "#/";

function asStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function uniqueStrings(value) {
  return Array.from(new Set(asStringArray(value)));
}

function clamp01(value, fallback) {
  const number = Number(value);
  if (Number.isNaN(number)) return fallback;
  return Math.min(1, Math.max(0, number));
}

export function createDefaultState(chapterIds = []) {
  const now = new Date().toISOString();
  const chapters = {};
  for (const chapterId of chapterIds) {
    chapters[chapterId] = {
      visitedScenes: [],
      completed: false,
      completedAt: null
    };
  }
  return {
    version: CURRENT_VERSION,
    createdAt: now,
    updatedAt: now,
    lastRoute: "#/accueil",
    warningAcknowledged: false,
    chapterWarnings: {},
    chapters,
    documentsRead: [],
    peopleMet: [],
    activitiesCompleted: [],
    eventsSeen: [],
    notebook: {
      documents: [],
      people: [],
      events: []
    },
    preferences: {
      textSize: "normal",
      contrast: "normal",
      reducedMotion: false,
      music: 0.32,
      sfx: 0.5,
      muted: false
    },
    conclusionSeen: false
  };
}

export function validateSave(raw, content) {
  const warnings = [];
  if (!raw || typeof raw !== "object") {
    return { state: null, warnings: ["Sauvegarde illisible."] };
  }

  const chapterIds = new Set((content.chapters?.chapters || []).map((chapter) => chapter.id));
  const documentIds = new Set((content.documents?.documents || []).map((document) => document.id));
  const peopleIds = new Set((content.people?.people || []).map((person) => person.id));
  const eventIds = new Set((content.timeline?.events || []).map((event) => event.id));
  const activityIds = new Set();
  for (const chapter of content.chapters?.chapters || []) {
    for (const scene of chapter.scenes || []) {
      if (scene.activity?.id) activityIds.add(scene.activity.id);
    }
  }

  const base = createDefaultState(Array.from(chapterIds));

  const state = {
    ...base,
    version: CURRENT_VERSION,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : base.createdAt,
    updatedAt: new Date().toISOString(),
    lastRoute:
      typeof raw.lastRoute === "string" && raw.lastRoute.startsWith(ROUTE_PREFIX)
        ? raw.lastRoute
        : base.lastRoute,
    warningAcknowledged: Boolean(raw.warningAcknowledged),
    conclusionSeen: Boolean(raw.conclusionSeen)
  };

  const preferences = raw.preferences && typeof raw.preferences === "object" ? raw.preferences : {};
  state.preferences = {
    textSize: TEXT_SIZES.has(preferences.textSize) ? preferences.textSize : "normal",
    contrast: CONTRASTS.has(preferences.contrast) ? preferences.contrast : "normal",
    reducedMotion: Boolean(preferences.reducedMotion),
    music: clamp01(preferences.music, 0.32),
    sfx: clamp01(preferences.sfx, 0.5),
    muted: Boolean(preferences.muted)
  };

  const rawChapters = raw.chapters && typeof raw.chapters === "object" ? raw.chapters : {};
  for (const chapterId of chapterIds) {
    const rawChapter = rawChapters[chapterId];
    if (!rawChapter || typeof rawChapter !== "object") continue;
    const chapter = content.chapters.chapters.find((item) => item.id === chapterId);
    const sceneIds = new Set((chapter?.scenes || []).map((scene) => scene.id));
    const visitedScenes = uniqueStrings(rawChapter.visitedScenes).filter((sceneId) => sceneIds.has(sceneId));
    if (visitedScenes.length !== asStringArray(rawChapter.visitedScenes).length) {
      warnings.push("Certaines scènes enregistrées n'existent plus et ont été ignorées.");
    }
    state.chapters[chapterId] = {
      visitedScenes,
      completed: Boolean(rawChapter.completed),
      completedAt: typeof rawChapter.completedAt === "string" ? rawChapter.completedAt : null
    };
  }

  state.documentsRead = uniqueStrings(raw.documentsRead).filter((id) => documentIds.has(id));
  state.peopleMet = uniqueStrings(raw.peopleMet).filter((id) => peopleIds.has(id));
  state.activitiesCompleted = uniqueStrings(raw.activitiesCompleted).filter((id) => activityIds.has(id));
  state.eventsSeen = uniqueStrings(raw.eventsSeen).filter((id) => eventIds.has(id));

  const notebook = raw.notebook && typeof raw.notebook === "object" ? raw.notebook : {};
  state.notebook = {
    documents: uniqueStrings(notebook.documents).filter((id) => documentIds.has(id)),
    people: uniqueStrings(notebook.people).filter((id) => peopleIds.has(id)),
    events: uniqueStrings(notebook.events).filter((id) => eventIds.has(id))
  };

  const rawWarnings = raw.chapterWarnings && typeof raw.chapterWarnings === "object" ? raw.chapterWarnings : {};
  for (const [chapterId, value] of Object.entries(rawWarnings)) {
    if (chapterIds.has(chapterId) && value === true) state.chapterWarnings[chapterId] = true;
  }

  if (state.documentsRead.length !== asStringArray(raw.documentsRead).length) {
    warnings.push("Certains documents enregistrés n'existent plus et ont été ignorés.");
  }
  if (state.peopleMet.length !== asStringArray(raw.peopleMet).length) {
    warnings.push("Certaines personnes enregistrées n'existent plus et ont été ignorées.");
  }

  return { state, warnings };
}
