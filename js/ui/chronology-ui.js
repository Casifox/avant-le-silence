/**
 * Chronologie : frise consultable, filtres et fiches d'événements.
 */

import { el, icon, statusMeta } from "../utils/helpers.js";
import { routes } from "../utils/paths.js";
import { announce } from "../utils/accessibility.js";
import { pageHeader, siteFooter } from "./page-shell.js";
import {
  openDocument,
  openPerson,
  renderSourceLinks,
  renderNotebookButton
} from "./document-viewer.js";
import { openModal, closeTopModal } from "./modal.js";

function periodFilters(app) {
  return [
    { id: "all", label: "Tout" },
    { id: "1943-1944", label: "1943–1944" },
    { id: "apres-guerre", label: "Après-guerre" }
  ];
}

function eventBadge(event) {
  const meta = statusMeta(event.status);
  if (event.status === "review_required") {
    return el("span", { className: `badge ${meta.className}`.trim() }, [icon(meta.icon, { size: 12 }), meta.label]);
  }
  return null;
}

function relatedButtons(app, documents, people) {
  const items = [];
  for (const document of documents) {
    items.push(
      el("li", {}, [
        el(
          "button",
          {
            attrs: { type: "button" },
            on: { click: () => openDocument(app, document.id) }
          },
          [icon("document", { size: 15 }), document.title]
        )
      ])
    );
  }
  for (const person of people) {
    items.push(
      el("li", {}, [
        el(
          "button",
          {
            attrs: { type: "button" },
            on: { click: () => openPerson(app, person.id) }
          },
          [icon(person.kind === "group" ? "person" : "user", { size: 15 }), person.name]
        )
      ])
    );
  }
  return items.length ? el("ul", { className: "related-list" }, items) : null;
}

function eventDetails(app, event) {
  const documents = app.chronologySystem.getRelatedDocuments(event);
  const people = app.chronologySystem.getRelatedPeople(event);
  const sources = app.chronologySystem.getSources(event);

  return el("div", { className: "timeline-body" }, [
    eventBadge(event)
      ? el("div", { className: "cluster", style: { "margin-top": "0.8rem" } }, [eventBadge(event)])
      : null,
    el("p", { className: "prose", text: event.description }),
    event.dateNote
      ? el("div", { className: "notice notice--warning", style: { "margin-top": "0.7rem" } }, [
          icon("info", { size: 18 }),
          el("span", { text: event.dateNote })
        ])
      : null,
    documents.length || people.length
      ? el("section", { className: "doc-section" }, [
          el("h3", { text: "Éléments liés" }),
          relatedButtons(app, documents, people)
        ])
      : null,
    el("section", { className: "doc-section" }, [
      el("h3", { text: "Sources" }),
      renderSourceLinks(sources)
    ]),
    el("div", { className: "doc-actions" }, [renderNotebookButton(app, "event", event.id)])
  ]);
}

function eventNode(app, event) {
  const details = el("details", { className: "timeline-details" }, [
    el("summary", { className: "timeline-summary" }, [
      el("span", { className: "timeline-date", text: event.displayDate }),
      el("span", { className: "timeline-title", text: event.title }),
      icon("chevron-down", { size: 18, className: "timeline-chevron" })
    ]),
    eventDetails(app, event)
  ]);

  details.addEventListener("toggle", () => {
    if (!details.open) return;
    app.audio.play("page");
    if (app.chronologySystem.markSeen(event.id)) {
      announce(`Événement consulté : ${event.title}.`);
    }
  });

  return el(
    "article",
    {
      className: "timeline-item",
      dataset: { status: event.status || "verified", eventId: event.id }
    },
    [details]
  );
}

export function renderTimeline(app) {
  let activeFilter = "all";
  const filters = periodFilters(app);
  const list = el("div", { className: "timeline" });
  const chipGroup = el("div", {
    className: "chips",
    attrs: { role: "group", "aria-label": "Filtrer la chronologie" }
  });

  function renderList() {
    list.replaceChildren();
    const events = app.chronologySystem.getEventsByPeriod(activeFilter);
    for (const event of events) {
      list.appendChild(eventNode(app, event));
    }
    if (events.length === 0) {
      list.appendChild(
        el("div", { className: "empty-state" }, [
          el("p", { text: "Aucun événement pour ce filtre." })
        ])
      );
    }
  }

  for (const filter of filters) {
    const button = el(
      "button",
      {
        className: "chip",
        attrs: {
          type: "button",
          "aria-pressed": filter.id === activeFilter ? "true" : "false"
        },
        on: {
          click: () => {
            activeFilter = filter.id;
            app.audio.play("click");
            for (const chip of chipGroup.querySelectorAll("button")) {
              chip.setAttribute("aria-pressed", "false");
            }
            button.setAttribute("aria-pressed", "true");
            renderList();
          }
        }
      },
      filter.label
    );
    chipGroup.appendChild(button);
  }

  renderList();

  const main = el("main", { id: "main" }, [
    el("section", { className: "page-intro" }, [
      el("div", { className: "container" }, [
        el("p", { className: "eyebrow", text: "Repères" }),
        el("h1", { text: "Chronologie" }),
        el("p", {
          className: "lead",
          text:
            "De l'ouverture de la colonie au travail de mémoire, les dates permettent de situer les faits. Certaines précisions restent à vérifier."
        }),
        el("div", { style: { "margin-top": "1.3rem" } }, [chipGroup]),
        el("div", { className: "notice notice--quiet", style: { "margin-top": "1.2rem" } }, [
          icon("info", { size: 18 }),
          el("span", {
            text:
              "Les fiches signalées « Vérification en cours » contiennent une date ou une précision qui doit être confirmée dans les sources. Le jeu ne comble pas les lacunes par des hypothèses."
          })
        ])
      ])
    ]),
    el("section", { className: "page-content" }, [
      el("div", { className: "container" }, [
        el("h2", { className: "sr-only", text: "Événements de la chronologie" }),
        list
      ])
    ])
  ]);

  return el("div", { className: "screen" }, [
    pageHeader(app, {
      title: "Chronologie",
      subtitle: "AVANT LE SILENCE",
      backTo: app.returnTo || routes.chapters,
      backLabel: "Retour",
      actions: [
        {
          label: "Carnet de mémoire",
          icon: "book",
          onClick: () => app.openWithReturn(routes.notebook)
        },
        {
          label: "Paramètres",
          icon: "settings",
          onClick: () => app.openWithReturn(routes.settings)
        }
      ]
    }),
    main,
    siteFooter(app)
  ]);
}

function closeAndOpen(callback) {
  closeTopModal(false);
  window.setTimeout(callback, 0);
}

export function openEvent(app, eventId) {
  const event = app.chronologySystem.getEvent(eventId);
  if (!event) return;

  app.chronologySystem.markSeen(eventId);
  app.audio.play("open");

  const documents = app.chronologySystem.getRelatedDocuments(event);
  const people = app.chronologySystem.getRelatedPeople(event);
  const sources = app.chronologySystem.getSources(event);

  const content = el("div", {}, [
    el("div", { className: "cluster", style: { "margin-bottom": "0.8rem" } }, [
      el("span", { className: "badge badge--quiet", text: event.displayDate }),
      eventBadge(event)
    ]),
    el("p", { className: "prose", text: event.description }),
    event.dateNote
      ? el("div", { className: "notice notice--warning", style: { "margin-top": "0.8rem" } }, [
          icon("info", { size: 18 }),
          el("span", { text: event.dateNote })
        ])
      : null,
    documents.length || people.length
      ? el("section", { className: "doc-section" }, [
          el("h3", { text: "Éléments liés" }),
          el(
            "ul",
            { className: "related-list" },
            [
              ...documents.map((document) =>
                el("li", {}, [
                  el(
                    "button",
                    {
                      attrs: { type: "button" },
                      on: {
                        click: () => closeAndOpen(() => openDocument(app, document.id))
                      }
                    },
                    [icon("document", { size: 15 }), document.title]
                  )
                ])
              ),
              ...people.map((person) =>
                el("li", {}, [
                  el(
                    "button",
                    {
                      attrs: { type: "button" },
                      on: {
                        click: () => closeAndOpen(() => openPerson(app, person.id))
                      }
                    },
                    [icon(person.kind === "group" ? "person" : "user", { size: 15 }), person.name]
                  )
                ])
              )
            ]
          )
        ])
      : null,
    el("section", { className: "doc-section" }, [
      el("h3", { text: "Sources" }),
      renderSourceLinks(sources)
    ])
  ]);

  openModal({
    title: event.title,
    subtitle: event.displayDate,
    eyebrow: "Repère chronologique",
    content,
    className: "modal--medium",
    footer: el("div", { className: "modal__footer-actions" }, [
      renderNotebookButton(app, "event", event.id),
      el(
        "button",
        {
          className: "btn btn--quiet",
          attrs: { type: "button" },
          on: { click: () => closeTopModal() }
        },
        "Fermer"
      )
    ])
  });

  announce(`Repère chronologique : ${event.title}, ${event.displayDate}.`);
}
