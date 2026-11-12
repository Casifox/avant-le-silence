/**
 * Chronologie : données, découverte et atelier d'ordonnancement.
 */

export class ChronologySystem {
  constructor(app) {
    this.app = app;
  }

  getEvents() {
    return this.app.content.timeline?.events || [];
  }

  getEvent(id) {
    return this.app.index.events.get(id) || null;
  }

  getPeriods() {
    const periods = new Map();
    for (const event of this.getEvents()) {
      if (!periods.has(event.period)) periods.set(event.period, []);
      periods.get(event.period).push(event);
    }
    return periods;
  }

  getEventsByPeriod(period) {
    if (!period || period === "all") return this.getEvents();
    return this.getEvents().filter((event) => event.period === period);
  }

  isSeen(eventId) {
    return this.app.stateManager.get().eventsSeen.includes(eventId);
  }

  markSeen(eventId) {
    if (!this.getEvent(eventId)) return false;
    if (this.isSeen(eventId)) return false;
    this.app.stateManager.update((state) => {
      state.eventsSeen.push(eventId);
    });
    return true;
  }

  getRelatedDocuments(event) {
    return (event?.documents || [])
      .map((id) => this.app.index.documents.get(id))
      .filter(Boolean);
  }

  getRelatedPeople(event) {
    return (event?.people || [])
      .map((id) => this.app.index.people.get(id))
      .filter(Boolean);
  }

  getSources(event) {
    return (event?.sourceIds || [])
      .map((id) => this.app.index.sources.get(id))
      .filter(Boolean);
  }

  getPlayableEvents(eventIds) {
    return (eventIds || []).map((id) => this.getEvent(id)).filter(Boolean);
  }

  checkOrder(orderIds, correctIds) {
    return (orderIds || []).map((id, index) => ({
      id,
      expected: correctIds[index],
      correct: id === correctIds[index]
    }));
  }

  isCorrectOrder(orderIds, correctIds) {
    if (orderIds.length !== correctIds.length) return false;
    return orderIds.every((id, index) => id === correctIds[index]);
  }

  getCorrectOrder(eventIds) {
    const events = this.getPlayableEvents(eventIds);
    return events
      .slice()
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((event) => event.id);
  }
}
