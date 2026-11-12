/**
 * Visionneuses de fiches documentaires et de fiches personnes.
 */

import {
  el,
  icon,
  typeMeta,
  statusMeta,
  safeExternalUrl,
  initials
} from "../utils/helpers.js";
import { announce } from "../utils/accessibility.js";
import { openModal, closeTopModal, toast } from "./modal.js";
import { routes } from "../utils/paths.js";

function badge(label, className = "", iconName = null) {
  const content = [];
  if (iconName) content.push(icon(iconName, { size: 12 }));
  content.push(el("span", { text: label }));
  return el("span", { className: `badge ${className}`.trim() }, content);
}

function unknown(value) {
  return value === null || value === undefined || value === "" ? null : String(value);
}

function metaRow(label, value, note = null) {
  return [
    el("dt", { text: label }),
    value
      ? el("dd", {}, [el("span", { text: value }), note ? el("span", { className: "tiny", text: ` ${note}` }) : null])
      : el("dd", { className: "is-unknown", text: note || "Non établi dans les sources consultées." })
  ];
}

function buildDocumentFrame(document) {
  const meta = typeMeta(document.type);
  const isEditorial = document.assetKind === "editorial";
  const frame = el(
    "div",
    {
      className: `doc-frame doc-frame--large ${isEditorial ? "doc-frame--editorial" : ""}`.trim(),
      attrs: {
        role: "img",
        "aria-label": document.alt || `Emplacement du document : ${document.title}`
      }
    },
    [
      el("div", { className: "doc-frame__icon" }, icon(meta.icon, { size: 26 })),
      el("p", {
        className: "doc-frame__label",
        text: isEditorial ? "Fiche de médiation" : "Document non reproduit"
      }),
      el("p", {
        className: "doc-frame__note",
        text:
          document.assetNote ||
          (isEditorial
            ? "Texte original du jeu. Aucun document historique n'est imité."
            : "Aucune image d'archive n'est reproduite dans cette version.")
      }),
      el("span", { className: "doc-frame__mark", text: isEditorial ? "Texte original" : "Archive" })
    ]
  );

  if (document.asset) {
    const image = el("img", {
      className: "doc-frame__image",
      attrs: { src: document.asset, alt: document.alt || document.title, loading: "lazy" }
    });
    const wrapper = el("div", { className: "doc-frame doc-frame--large" }, image);
    return wrapper;
  }

  return frame;
}

export function renderSourceLinks(sources) {
  if (!sources.length) {
    return el("p", { className: "tiny", text: "Aucune source n'est associée à cette fiche." });
  }
  return el(
    "div",
    { className: "source-links" },
    sources.map((source) => {
      const url = safeExternalUrl(source.url);
      const content = [
        icon(url ? "external" : "info", { size: 15 }),
        el("span", {}, [
          el("span", { className: "source-link__title", text: source.title }),
          el("span", {
            className: "source-link__meta",
            text: `${source.institution}${source.nature ? ` · ${source.nature}` : ""}${url ? " · nouvel onglet" : ""}`
          })
        ])
      ];
      if (!url) {
        return el("div", { className: "source-link" }, content);
      }
      return el(
        "a",
        {
          className: "source-link",
          attrs: {
            href: url,
            target: "_blank",
            rel: "noopener noreferrer",
            "aria-label": `${source.title} — ${source.institution} (nouvel onglet)`
          }
        },
        content
      );
    })
  );
}

export function renderNotebookButton(app, kind, id) {
  const active = app.memoryNotebook.has(kind, id);
  const label = el("span", {
    text: active ? "Retirer du carnet" : "Ajouter au carnet"
  });
  const button = el(
    "button",
    {
      className: "btn btn--secondary",
      attrs: { type: "button", "aria-pressed": active ? "true" : "false" },
      on: {
        click: () => {
          const result = app.memoryNotebook.toggle(kind, id);
          const isActive = result === "added";
          button.setAttribute("aria-pressed", isActive ? "true" : "false");
          label.textContent = isActive ? "Retirer du carnet" : "Ajouter au carnet";
          app.audio.play(isActive ? "confirm" : "click");
          toast(isActive ? "Élément ajouté au carnet de mémoire." : "Élément retiré du carnet.", {
            variant: "soft"
          });
          announce(isActive ? "Ajouté au carnet." : "Retiré du carnet.");
        }
      }
    },
    [icon("book", { size: 17 }), label]
  );
  return button;
}

function closeAndOpen(callback) {
  closeTopModal(false);
  window.setTimeout(callback, 0);
}

export function openDocument(app, documentId) {
  const document = app.documentSystem.getDocument(documentId);
  if (!document) {
    toast("Ce document n'est pas disponible.", { variant: "warning" });
    return;
  }

  app.documentSystem.markRead(documentId);
  app.audio.play("open");

  const meta = typeMeta(document.type);
  const status = statusMeta(document.status);
  const chapter = app.documentSystem.getDocumentChapter(document);
  const relatedPeople = app.documentSystem.getRelatedPeople(document);
  const relatedEvents = app.documentSystem.getRelatedEvents(document);
  const sources = app.documentSystem.getSources(document.sourceIds);

  const content = el("div", { className: "doc-viewer" }, [
    el("div", { className: "doc-viewer__visual" }, buildDocumentFrame(document)),
    el("div", { className: "doc-viewer__content" }, [
      el("div", { className: "doc-viewer__kicker" }, [
        badge(meta.label, "badge--quiet", meta.icon),
        badge(status.label, status.className, status.icon),
        chapter ? badge(`Chapitre ${chapter.number}`, "badge--quiet") : null,
        document.rightsStatus === "permission_required"
          ? badge("Reproduction non intégrée", "badge--rights", "lock")
          : null
      ]),
      el("h3", { className: "doc-viewer__title", text: document.title }),
      el("p", {
        className: "doc-viewer__lead",
        text:
          document.notebookSummary ||
          "Fiche documentaire proposée par AVANT LE SILENCE."
      }),
      el("dl", { className: "meta-list" }, [
        metaRow(
          "Date",
          unknown(document.displayDate),
          document.dateNote || (document.displayDate ? null : "Non établie dans les sources consultées.")
        ),
        metaRow("Auteur / producteur", unknown(document.creator)),
        metaRow("Destinataire", unknown(document.recipient)),
        metaRow("Institution", unknown(document.institution)),
        metaRow("Référence", unknown(document.reference))
      ]),
      el("section", { className: "doc-section" }, [
        el("h3", { text: "Description" }),
        el("p", { text: document.description })
      ]),
      el("section", { className: "doc-section" }, [
        el("h3", { text: "Contexte historique" }),
        el("p", { text: document.historicalContext })
      ]),
      el("section", { className: "doc-section" }, [
        el("h3", { text: "Ce que ce document permet d'établir" }),
        el("p", { text: document.establishes })
      ]),
      document.questions?.length
        ? el("section", { className: "doc-section" }, [
            el("h3", { text: "Question à approfondir" }),
            el("ul", {}, document.questions.map((question) => el("li", { text: question })))
          ])
        : null,
      relatedPeople.length
        ? el("section", { className: "doc-section" }, [
            el("h3", { text: "Personnes liées" }),
            el(
              "ul",
              { className: "related-list" },
              relatedPeople.map((person) =>
                el("li", {}, [
                  el(
                    "button",
                    {
                      attrs: { type: "button" },
                      on: {
                        click: () =>
                          closeAndOpen(() => openPerson(app, person.id))
                      }
                    },
                    [icon(person.kind === "group" ? "person" : "user", { size: 15 }), person.name]
                  )
                ])
              )
            )
          ])
        : null,
      relatedEvents.length
        ? el("section", { className: "doc-section" }, [
            el("h3", { text: "Repères chronologiques" }),
            el(
              "ul",
              { className: "related-list" },
              relatedEvents.map((event) =>
                el("li", {}, [
                  el(
                    "button",
                    {
                      attrs: { type: "button" },
                      on: {
                        click: () => {
                          app.returnTo = window.location.hash;
                          closeTopModal(false);
                          app.navigate(routes.timeline);
                        }
                      }
                    },
                    [icon("clock", { size: 15 }), `${event.displayDate} — ${event.title}`]
                  )
                ])
              )
            )
          ])
        : null,
      el("section", { className: "doc-section" }, [
        el("h3", { text: "Sources" }),
        renderSourceLinks(sources)
      ]),
      document.rightsStatus === "permission_required"
        ? el("div", { className: "rights-note" }, [
            icon("lock", { size: 16 }),
            el("span", {
              text:
                "Aucune image d'archive n'est reproduite dans cette version. La fiche présente des informations documentaires et renvoie aux sources officielles. Toute reproduction reste soumise à autorisation."
            })
          ])
        : el("div", { className: "rights-note" }, [
            icon("info", { size: 16 }),
            el("span", {
              text:
                "Cette fiche ne contient pas de reproduction d'archive. Elle est présentée comme une fiche de médiation ou de synthèse."
            })
          ])
    ])
  ]);

  const footer = el("div", { className: "modal__footer-actions" }, [
    renderNotebookButton(app, "document", document.id),
    el(
      "button",
      {
        className: "btn btn--quiet",
        attrs: { type: "button" },
        on: { click: () => closeTopModal() }
      },
      "Fermer"
    )
  ]);

  openModal({
    title: document.title,
    subtitle: `${meta.label}${document.displayDate ? ` · ${document.displayDate}` : ""}`,
    eyebrow: "Fiche documentaire",
    content,
    footer,
    className: "modal--document"
  });

  announce(`Fiche documentaire ouverte : ${document.title}.`);
}

export function openPerson(app, personId) {
  const person = app.documentSystem.getPerson(personId);
  if (!person) {
    toast("Cette fiche personne n'est pas disponible.", { variant: "warning" });
    return;
  }

  app.documentSystem.markPersonMet(personId);
  app.audio.play("open");

  const relatedDocuments = app.documentSystem.getRelatedDocuments(person);
  const relatedEvents = app.documentSystem.getEventsForPerson(person);
  const sources = app.documentSystem.getSources(person.sourceIds);
  const status = statusMeta(person.status);
  const isGroup = person.kind === "group";
  const isPerpetrator = person.kind === "perpetrator";

  const monogram = el(
    "div",
    {
      className: "person-monogram",
      attrs: { role: "img", "aria-label": isGroup ? "Symbole de groupe" : `Monogramme de ${person.name}` }
    },
    isGroup ? person.initials || "44" : person.initials || initials(person.name)
  );

  const content = el("div", { className: "person-viewer" }, [
    el("div", { className: "person-viewer__aside" }, [
      monogram,
      el("p", {
        className: "tiny text-center",
        text: person.portraitNote || "Aucun portrait n'est reproduit dans cette version."
      })
    ]),
    el("div", { className: "person-viewer__content" }, [
      el("div", { className: "doc-viewer__kicker" }, [
        badge(isGroup ? "Groupe" : isPerpetrator ? "Responsable des persécutions" : "Personne", "badge--quiet", isGroup ? "person" : "user"),
        badge(status.label, status.className, status.icon)
      ]),
      el("h3", { className: "person-viewer__name", text: person.name }),
      el("p", { className: "person-viewer__role", text: person.role }),
      isPerpetrator && person.notice
        ? el("div", { className: "notice notice--warning person-viewer__notice" }, [
            icon("warning", { size: 18 }),
            el("span", { text: person.notice })
          ])
        : null,
      el("div", { className: "prose" }, person.description.map((paragraph) => el("p", { text: paragraph }))),
      relatedDocuments.length
        ? el("section", { className: "doc-section" }, [
            el("h3", { text: "Documents associés" }),
            el(
              "ul",
              { className: "related-list" },
              relatedDocuments.map((document) =>
                el("li", {}, [
                  el(
                    "button",
                    {
                      attrs: { type: "button" },
                      on: {
                        click: () => closeAndOpen(() => openDocument(app, document.id))
                      }
                    },
                    [icon(typeMeta(document.type).icon, { size: 15 }), document.title]
                  )
                ])
              )
            )
          ])
        : null,
      relatedEvents.length
        ? el("section", { className: "doc-section" }, [
            el("h3", { text: "Repères chronologiques" }),
            el(
              "ul",
              { className: "related-list" },
              relatedEvents.map((event) =>
                el("li", {}, [
                  el(
                    "button",
                    {
                      attrs: { type: "button" },
                      on: {
                        click: () => {
                          app.returnTo = window.location.hash;
                          closeTopModal(false);
                          app.navigate(routes.timeline);
                        }
                      }
                    },
                    [icon("clock", { size: 15 }), `${event.displayDate} — ${event.title}`]
                  )
                ])
              )
            )
          ])
        : null,
      el("section", { className: "doc-section" }, [
        el("h3", { text: "Sources" }),
        renderSourceLinks(sources)
      ])
    ])
  ]);

  const footer = el("div", { className: "modal__footer-actions" }, [
    renderNotebookButton(app, "person", person.id),
    el(
      "button",
      {
        className: "btn btn--quiet",
        attrs: { type: "button" },
        on: { click: () => closeTopModal() }
      },
      "Fermer"
    )
  ]);

  openModal({
    title: person.name,
    subtitle: person.role,
    eyebrow: isGroup ? "Fiche groupe" : "Fiche personne",
    content,
    footer,
    className: "modal--person"
  });

  announce(`Fiche personne ouverte : ${person.name}.`);
}

