/**
 * Validation des données de contenu avant utilisation.
 * Les erreurs sont lisibles et n'exposent pas de détails techniques au joueur.
 */

const DOCUMENT_TYPES = new Set([
  "photographie",
  "lettre",
  "dessin",
  "carnet",
  "document-administratif",
  "temoignage",
  "document-commemoratif",
  "document-judiciaire"
]);

const STATUSES = new Set(["verified", "review_required", "permission_required", "illustrative"]);

export class ContentValidationError extends Error {
  constructor(issues) {
    super("Le contenu du jeu est invalide.");
    this.name = "ContentValidationError";
    this.issues = issues;
  }
}

function listOf(data, key) {
  return data && Array.isArray(data[key]) ? data[key] : null;
}

function checkUnique(items, label, issues, getId = (item) => item.id) {
  const seen = new Set();
  for (const item of items) {
    const id = getId(item);
    if (!id) {
      issues.push(`${label} : un élément sans identifiant a été trouvé.`);
      continue;
    }
    if (seen.has(id)) issues.push(`${label} : identifiant dupliqué « ${id} ».`);
    seen.add(id);
  }
  return seen;
}

function checkRefs(ids, known, label, issues) {
  for (const id of ids || []) {
    if (!known.has(id)) issues.push(`${label} : référence inconnue « ${id} ».`);
  }
}

export function validateContent(data) {
  const issues = [];

  const chapters = listOf(data, "chapters") || listOf(data.chapters || {}, "chapters");
  const documents = listOf(data, "documents") || listOf(data.documents || {}, "documents");
  const people = listOf(data, "people") || listOf(data.people || {}, "people");
  const events = listOf(data, "timeline") || listOf(data.timeline || {}, "events");
  const sources = listOf(data, "sources") || listOf(data.sources || {}, "sources");
  const terms = listOf(data, "glossary") || listOf(data.glossary || {}, "terms");

  if (!chapters) issues.push("Chapitres : liste absente.");
  if (!documents) issues.push("Documents : liste absente.");
  if (!people) issues.push("Personnes : liste absente.");
  if (!events) issues.push("Chronologie : liste absente.");
  if (!sources) issues.push("Sources : liste absente.");

  if (issues.length) return { ok: false, issues, stats: {} };

  const chapterIds = checkUnique(chapters, "Chapitres", issues);
  const documentIds = checkUnique(documents, "Documents", issues);
  const peopleIds = checkUnique(people, "Personnes", issues);
  const eventIds = checkUnique(events, "Chronologie", issues);
  const sourceIds = checkUnique(sources, "Sources", issues);
  const termIds = terms ? checkUnique(terms, "Glossaire", issues) : new Set();

  for (const doc of documents) {
    if (!DOCUMENT_TYPES.has(doc.type)) {
      issues.push(`Document « ${doc.id} » : type inconnu « ${doc.type} ».`);
    }
    if (doc.status && !STATUSES.has(doc.status)) {
      issues.push(`Document « ${doc.id} » : statut inconnu « ${doc.status} ».`);
    }
    checkRefs(doc.sourceIds, sourceIds, `Document « ${doc.id} »`, issues);
    checkRefs(doc.relatedPeople, peopleIds, `Document « ${doc.id} »`, issues);
    checkRefs(doc.relatedEvents, eventIds, `Document « ${doc.id} »`, issues);
  }

  for (const person of people) {
    checkRefs(person.sourceIds, sourceIds, `Personne « ${person.id} »`, issues);
    if (person.status && !STATUSES.has(person.status)) {
      issues.push(`Personne « ${person.id} » : statut inconnu « ${person.status} ».`);
    }
  }

  for (const event of events) {
    checkRefs(event.sourceIds, sourceIds, `Événement « ${event.id} »`, issues);
    checkRefs(event.documents, documentIds, `Événement « ${event.id} »`, issues);
    checkRefs(event.people, peopleIds, `Événement « ${event.id} »`, issues);
    if (event.status && !STATUSES.has(event.status)) {
      issues.push(`Événement « ${event.id} » : statut inconnu « ${event.status} ».`);
    }
  }

  if (terms) {
    for (const term of terms) {
      checkRefs(term.sourceIds, sourceIds, `Glossaire « ${term.id} »`, issues);
    }
  }

  for (const chapter of chapters) {
    if (!Array.isArray(chapter.scenes) || chapter.scenes.length === 0) {
      issues.push(`Chapitre « ${chapter.id} » : aucune scène.`);
      continue;
    }
    checkRefs(
      [chapter.completion?.next].filter((value) => value && value !== "conclusion"),
      chapterIds,
      `Chapitre « ${chapter.id} » (suite)`,
      issues
    );

    for (const scene of chapter.scenes) {
      checkRefs(scene.readingList, new Set([...documentIds, ...peopleIds]), `Scène « ${scene.id} »`, issues);
      for (const required of scene.required || []) {
        const known = required.type === "document" ? documentIds : peopleIds;
        if (!known.has(required.id)) {
          issues.push(`Scène « ${scene.id} » : élément requis inconnu « ${required.id} ».`);
        }
      }
      for (const hotspot of scene.hotspots || []) {
        const action = hotspot.action;
        if (!action) continue;
        if (action.type === "document" && !documentIds.has(action.id)) {
          issues.push(`Scène « ${scene.id} » : document de point d'intérêt inconnu « ${action.id} ».`);
        }
        if (action.type === "person" && !peopleIds.has(action.id)) {
          issues.push(`Scène « ${scene.id} » : personne de point d'intérêt inconnue « ${action.id} ».`);
        }
      }
      if (scene.activity?.type === "chronology") {
        checkRefs(scene.activity.eventIds, eventIds, `Atelier « ${scene.activity.id} »`, issues);
      }
    }
  }

  const stats = {
    chapters: chapters.length,
    scenes: chapters.reduce((sum, chapter) => sum + (chapter.scenes?.length || 0), 0),
    documents: documents.length,
    people: people.length,
    events: events.length,
    sources: sources.length,
    terms: terms ? terms.length : 0
  };

  return { ok: issues.length === 0, issues, stats };
}

export function assertValidContent(data) {
  const result = validateContent(data);
  if (!result.ok) throw new ContentValidationError(result.issues);
  return result;
}
