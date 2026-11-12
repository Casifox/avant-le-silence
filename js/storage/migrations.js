/**
 * Migrations de sauvegarde.
 * La version 1 est la première version publique du format.
 */

export const CURRENT_VERSION = 1;

export function migrate(raw) {
  if (!raw || typeof raw !== "object") return null;

  const version = Number(raw.version);
  if (Number.isNaN(version)) return migrateV0toV1(raw);
  if (version === CURRENT_VERSION) return raw;
  if (version > CURRENT_VERSION) return null;

  let data = raw;
  if (version < 1) data = migrateV0toV1(data);
  return data;
}

function migrateV0toV1(raw) {
  return {
    ...raw,
    version: CURRENT_VERSION,
    chapterWarnings: raw.chapterWarnings || {},
    notebook: raw.notebook || { documents: [], people: [], events: [] },
    preferences: raw.preferences || {},
    documentsRead: raw.documentsRead || [],
    peopleMet: raw.peopleMet || [],
    activitiesCompleted: raw.activitiesCompleted || [],
    eventsSeen: raw.eventsSeen || []
  };
}
