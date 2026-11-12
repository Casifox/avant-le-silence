/**
 * Système documentaire : documents, personnes, lecture et liens.
 */

export class DocumentSystem {
  constructor(app) {
    this.app = app;
  }

  getDocument(id) {
    return this.app.index.documents.get(id) || null;
  }

  getPerson(id) {
    return this.app.index.people.get(id) || null;
  }

  getDocuments() {
    return Array.from(this.app.index.documents.values());
  }

  getPeople() {
    return Array.from(this.app.index.people.values());
  }

  getDocumentsForChapter(chapterId) {
    return this.getDocuments().filter((document) => document.chapter === chapterId);
  }

  isRead(documentId) {
    return this.app.stateManager.get().documentsRead.includes(documentId);
  }

  isMet(personId) {
    return this.app.stateManager.get().peopleMet.includes(personId);
  }

  markRead(documentId) {
    if (!this.getDocument(documentId)) return false;
    if (this.isRead(documentId)) return false;
    this.app.stateManager.update((state) => {
      state.documentsRead.push(documentId);
    });
    this.app.events.emit("document:read", this.getDocument(documentId));
    return true;
  }

  markPersonMet(personId) {
    if (!this.getPerson(personId)) return false;
    if (this.isMet(personId)) return false;
    this.app.stateManager.update((state) => {
      state.peopleMet.push(personId);
    });
    this.app.events.emit("person:met", this.getPerson(personId));
    return true;
  }

  getRelatedPeople(document) {
    return (document?.relatedPeople || [])
      .map((id) => this.getPerson(id))
      .filter(Boolean);
  }

  getRelatedDocuments(person) {
    return this.getDocuments().filter((document) => (document.relatedPeople || []).includes(person.id));
  }

  getRelatedEvents(document) {
    return (document?.relatedEvents || [])
      .map((id) => this.app.index.events.get(id))
      .filter(Boolean);
  }

  getEventsForPerson(person) {
    return Array.from(this.app.index.events.values()).filter((event) =>
      (event.people || []).includes(person.id)
    );
  }

  getSources(sourceIds) {
    return (sourceIds || []).map((id) => this.app.index.sources.get(id)).filter(Boolean);
  }

  getDocumentChapter(document) {
    return this.app.index.chapters.get(document?.chapter) || null;
  }

  getTypeLabel(document) {
    return document?.type || "document";
  }

  getReadingStatus(documentId) {
    return this.isRead(documentId) ? "read" : "unread";
  }
}
