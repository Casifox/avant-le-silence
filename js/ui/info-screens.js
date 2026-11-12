/**
 * Sources, glossaire, à propos, conclusion, fin et écrans d'erreur.
 */

import { el, icon, statusMeta, safeExternalUrl } from "../utils/helpers.js";
import { routes, APP_VERSION } from "../utils/paths.js";
import { pageHeader, standardActions, siteFooter } from "./page-shell.js";

function sourceCard(source) {
  const meta = statusMeta(source.status);
  const url = safeExternalUrl(source.url);

  const head = el("div", { className: "source-card__head" }, [
    el("h2", { text: source.title }),
    el("div", { className: "cluster" }, [
      el("span", { className: `badge ${meta.className}`.trim() }, [icon(meta.icon, { size: 12 }), meta.label]),
      source.official ? el("span", { className: "badge badge--quiet", text: "Site officiel" }) : null
    ])
  ]);

  const body = el("div", {}, [
    el("p", { text: `${source.institution}${source.nature ? ` · ${source.nature}` : ""}` }),
    el("p", {
      className: "source-card__meta",
      text: `Consultée le ${source.consultedAt}${source.restrictions ? ` · ${source.restrictions}` : ""}`
    }),
    source.establishes?.length
      ? el("div", { className: "doc-section" }, [
          el("h3", { text: "Ce que cette source permet d'établir" }),
          el("ul", {}, source.establishes.map((item) => el("li", { text: item })))
        ])
      : null,
    source.note
      ? el("p", { className: "tiny", style: { "margin-top": "0.5rem" }, text: source.note })
      : null,
    url
      ? el(
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
          [
            icon("external", { size: 15 }),
            el("span", {}, [
              el("span", { className: "source-link__title", text: "Consulter la source" }),
              el("span", { className: "source-link__meta", text: "Site officiel · nouvel onglet" })
            ])
          ]
        )
      : el("div", { className: "source-link" }, [
          icon("info", { size: 15 }),
          el("span", {}, [
            el("span", { className: "source-link__title", text: "Référence à préciser" }),
            el("span", {
              className: "source-link__meta",
              text: "Cette référence doit être complétée avant la version 1.0.0."
            })
          ])
        ])
  ]);

  return el("article", { className: "source-card" }, [head, body]);
}

export function renderSources(app) {
  const narrative = app.content.narratives.sources;
  const sources = app.content.sources.sources;

  const main = el("main", { id: "main" }, [
    el("section", { className: "page-intro" }, [
      el("div", { className: "container" }, [
        el("p", { className: "eyebrow", text: "Références" }),
        el("h1", { text: narrative.title }),
        el("p", { className: "lead", text: narrative.lead }),
        el("div", { className: "notice notice--quiet", style: { "margin-top": "1.2rem" } }, [
          icon("info", { size: 18 }),
          el("span", { text: narrative.note })
        ]),
        el("div", { className: "cluster", style: { "margin-top": "1rem" } }, [
          el(
            "a",
            {
              className: "btn btn--secondary btn--small",
              attrs: { href: routes.glossary },
              on: { click: () => app.audio.play("click") }
            },
            [icon("book", { size: 15 }), narrative.glossaryLink]
          ),
          el(
            "a",
            {
              className: "btn btn--quiet btn--small",
              attrs: { href: routes.about },
              on: { click: () => app.audio.play("click") }
            },
            "À propos du projet"
          )
        ])
      ])
    ]),
    el("section", { className: "page-content" }, [
      el("div", { className: "container" }, [
        el("div", { className: "source-list" }, sources.map(sourceCard)),
        el("div", { className: "notice notice--warning", style: { "margin-top": "1.5rem" } }, [
          icon("lock", { size: 18 }),
          el("span", { text: narrative.rights })
        ])
      ])
    ])
  ]);

  return el("div", { className: "screen" }, [
    pageHeader(app, {
      title: "Sources et crédits",
      subtitle: "AVANT LE SILENCE",
      backTo: app.returnTo || routes.home,
      backLabel: "Retour",
      actions: standardActions(app)
    }),
    main,
    siteFooter(app)
  ]);
}

export function renderGlossary(app) {
  const narrative = app.content.narratives.glossary;
  const terms = app.content.glossary.terms;

  const main = el("main", { id: "main" }, [
    el("section", { className: "page-intro" }, [
      el("div", { className: "container" }, [
        el("p", { className: "eyebrow", text: "Repères de vocabulaire" }),
        el("h1", { text: narrative.title }),
        el("p", { className: "lead", text: narrative.lead }),
        el("p", { className: "tiny", style: { "margin-top": "0.8rem" }, text: narrative.note })
      ])
    ]),
    el("section", { className: "page-content" }, [
      el("div", { className: "container" }, [
        el(
          "dl",
          { className: "glossary-list" },
          terms.map((term) =>
            el("div", { className: "glossary-item" }, [
              el("dt", { text: term.term }),
              el("dd", { text: term.definition }),
              el(
                "dd",
                { className: "tiny", style: { "margin-top": "0.45rem" } },
                [
                  "Sources : ",
                  term.sourceIds
                    .map((id) => app.index.sources.get(id)?.title)
                    .filter(Boolean)
                    .join(" · ")
                ]
              )
            ])
          )
        ),
        el("div", { className: "cluster", style: { "margin-top": "1.4rem" } }, [
          el(
            "a",
            {
              className: "btn btn--secondary btn--small",
              attrs: { href: routes.sources },
              on: { click: () => app.audio.play("click") }
            },
            "Voir toutes les sources"
          ),
          el(
            "a",
            {
              className: "btn btn--quiet btn--small",
              attrs: { href: routes.about },
              on: { click: () => app.audio.play("click") }
            },
            "À propos du projet"
          )
        ])
      ])
    ])
  ]);

  return el("div", { className: "screen" }, [
    pageHeader(app, {
      title: "Glossaire",
      subtitle: "AVANT LE SILENCE",
      backTo: app.returnTo || routes.sources,
      backLabel: "Retour",
      actions: standardActions(app)
    }),
    main,
    siteFooter(app)
  ]);
}

export function renderAbout(app) {
  const narrative = app.content.narratives.about;

  const main = el("main", { id: "main" }, [
    el("section", { className: "page-intro" }, [
      el("div", { className: "container--reading" }, [
        el("p", { className: "eyebrow", text: "Le projet" }),
        el("h1", { text: narrative.title }),
        el("p", { className: "lead", text: narrative.lead })
      ])
    ]),
    el("section", { className: "page-content" }, [
      el("div", { className: "container--reading" }, [
        el("div", { className: "prose prose--lead" }, narrative.paragraphs.map((text) => el("p", { text }))),
        el("section", { className: "settings-section", style: { "margin-top": "1.6rem" } }, [
          el("h2", { text: "Catégories de contenu" }),
          el("p", {
            text: "Le jeu distingue trois catégories, affichées dans les fiches et les points d'intérêt."
          }),
          el("ul", { className: "prose" }, narrative.categories.map((text) => el("li", { text })))
        ]),
        el("section", { className: "settings-section", style: { "margin-top": "1rem" } }, [
          el("h2", { text: "Crédits" }),
          el("p", { className: "small", text: narrative.credits }),
          el("p", { className: "tiny", text: narrative.version }),
          el("div", { className: "cluster", style: { "margin-top": "0.9rem" } }, [
            el(
              "a",
              {
                className: "btn btn--secondary btn--small",
                attrs: { href: routes.sources },
                on: { click: () => app.audio.play("click") }
              },
              "Sources et crédits"
            ),
            el(
              "a",
              {
                className: "btn btn--quiet btn--small",
                attrs: { href: routes.glossary },
                on: { click: () => app.audio.play("click") }
              },
              "Glossaire"
            )
          ])
        ]),
        el("div", { className: "notice notice--warning", style: { "margin-top": "1.2rem" } }, [
          icon("warning", { size: 18 }),
          el("span", {
            text:
              "AVANT LE SILENCE est une œuvre de médiation indépendante. Elle n'est pas une publication officielle du Mémorial de la Maison d'Izieu ni de la Bibliothèque nationale de France."
          })
        ])
      ])
    ])
  ]);

  return el("div", { className: "screen" }, [
    pageHeader(app, {
      title: "À propos",
      subtitle: "AVANT LE SILENCE",
      backTo: app.returnTo || routes.home,
      backLabel: "Retour",
      actions: standardActions(app)
    }),
    main,
    siteFooter(app)
  ]);
}

export function renderConclusion(app) {
  const narrative = app.content.narratives.conclusion;
  const summary = app.memoryNotebook.getSummary();
  const overall = app.progressSystem.getOverallProgress();

  if (!app.stateManager.get().conclusionSeen) {
    app.stateManager.update((state) => {
      state.conclusionSeen = true;
    });
  }

  const summaryCards = el("div", { className: "summary-grid" }, [
    el("div", { className: "summary-card" }, [
      el("span", { className: "summary-card__value", text: String(overall.chaptersCompleted) }),
      el("span", { className: "summary-card__label", text: "chapitres terminés" })
    ]),
    el("div", { className: "summary-card" }, [
      el("span", { className: "summary-card__value", text: String(overall.documentsRead) }),
      el("span", { className: "summary-card__label", text: "documents consultés" })
    ]),
    el("div", { className: "summary-card" }, [
      el("span", { className: "summary-card__value", text: String(overall.peopleMet) }),
      el("span", { className: "summary-card__label", text: "personnes rencontrées" })
    ]),
    el("div", { className: "summary-card" }, [
      el("span", { className: "summary-card__value", text: String(summary.counts.events) }),
      el("span", { className: "summary-card__label", text: "dates au carnet" })
    ]),
    el("div", { className: "summary-card" }, [
      el("span", { className: "summary-card__value", text: String(overall.activitiesCompleted) }),
      el("span", { className: "summary-card__label", text: "ateliers terminés" })
    ])
  ]);

  const listBlock = (title, values, emptyText) =>
    el("div", { className: "settings-section" }, [
      el("h2", { text: title }),
      values.length
        ? el("ul", { className: "summary-list" }, values.map((value) => el("li", { text: value })))
        : el("p", { className: "small", text: emptyText })
    ]);

  const main = el("main", { id: "main", className: "conclusion-screen" }, [
    el("section", { className: "conclusion-hero" }, [
      el("div", { className: "container--reading" }, [
        el("p", { className: "eyebrow eyebrow--plain", text: "Conclusion" }),
        el("h1", { text: narrative.title }),
        el("p", { className: "lead", text: narrative.lead }),
        el("div", { className: "prose prose--lead", style: { "margin-top": "1.4rem" } }, narrative.paragraphs.map((text) => el("p", { text }))),
        el("blockquote", { className: "conclusion-quote" }, [
          narrative.quote,
          el("span", { className: "quote__label", text: narrative.quoteLabel })
        ]),
        el("p", { className: "eyebrow eyebrow--plain", text: narrative.closing }),
        summaryCards,
        el("div", { className: "stack", style: { gap: "0.8rem", "margin-top": "1.2rem" } }, [
          listBlock(
            "Documents au carnet",
            summary.documents,
            "Aucun document n'a été ajouté au carnet. Vous pouvez encore en consulter."
          ),
          listBlock(
            "Personnes au carnet",
            summary.people,
            "Aucune personne n'a été ajoutée au carnet."
          ),
          listBlock(
            "Dates au carnet",
            summary.events,
            "Aucune date n'a été ajoutée au carnet. La chronologie reste accessible."
          )
        ]),
        summary.themes.length
          ? el("div", { className: "settings-section", style: { "margin-top": "0.8rem" } }, [
              el("h2", { text: "Thèmes rencontrés" }),
              el(
                "div",
                { className: "inline-list" },
                summary.themes.map((theme) =>
                  el("span", { className: "badge badge--quiet", text: `${theme.tag} · ${theme.count}` })
                )
              )
            ])
          : null,
        el("div", { className: "cluster", style: { "justify-content": "center", "margin-top": "1.6rem" } }, [
          el(
            "button",
            {
              className: "btn btn--primary",
              attrs: { type: "button" },
              on: {
                click: () => {
                  app.audio.play("confirm");
                  app.navigate(routes.end);
                }
              }
            },
            [el("span", { text: narrative.continue }), icon("arrow-right", { size: 18 })]
          ),
          el(
            "a",
            {
              className: "btn btn--quiet",
              attrs: { href: routes.sources },
              on: { click: () => app.audio.play("click") }
            },
            narrative.sources
          ),
          el(
            "button",
            {
              className: "btn btn--quiet",
              attrs: { type: "button" },
              on: { click: () => app.openWithReturn(routes.notebook) }
            },
            "Revoir mon carnet"
          )
        ]),
        el("p", { className: "tiny", style: { "margin-top": "1.2rem" } }, [
          "Ce jeu est une œuvre de médiation indépendante. Il n'est pas une publication officielle du Mémorial de la Maison d'Izieu ni de la Bibliothèque nationale de France."
        ])
      ])
    ])
  ]);

  return el("div", { className: "screen" }, [
    pageHeader(app, {
      title: "Conclusion",
      subtitle: "AVANT LE SILENCE",
      backTo: routes.chapters,
      backLabel: "Chapitres",
      actions: standardActions(app)
    }),
    main,
    siteFooter(app)
  ]);
}

export function renderFinal(app) {
  const narrative = app.content.narratives.final;

  return el("div", { className: "screen conclusion-screen" }, [
    pageHeader(app, {
      title: "Fin du parcours",
      subtitle: "AVANT LE SILENCE",
      backTo: routes.conclusion,
      backLabel: "Conclusion"
    }),
    el("main", { id: "main", className: "conclusion-hero" }, [
      el("div", { className: "container--reading" }, [
        el("img", {
          attrs: {
            src: "./assets/illustrations/logo.svg",
            alt: "Emblème original d'AVANT LE SILENCE : une maison, un chemin et un soleil.",
            width: "132",
            height: "132"
          },
          style: { "margin": "0 auto 1.5rem", "border-radius": "50%" }
        }),
        el("h1", { text: narrative.title }),
        el("p", { className: "subtitle", text: narrative.subtitle }),
        el("p", { className: "lead", style: { "margin-top": "1.2rem" }, text: narrative.text }),
        el("p", { className: "tiny", style: { "margin-top": "1rem" }, text: narrative.note }),
        el("div", { className: "cluster", style: { "justify-content": "center", "margin-top": "1.6rem" } }, [
          el(
            "button",
            {
              className: "btn btn--primary",
              attrs: { type: "button" },
              on: { click: () => app.openWithReturn(routes.notebook) }
            },
            [icon("book", { size: 17 }), narrative.notebook]
          ),
          el(
            "a",
            {
              className: "btn btn--quiet",
              attrs: { href: routes.sources },
              on: { click: () => app.audio.play("click") }
            },
            narrative.sources
          ),
          el(
            "button",
            {
              className: "btn btn--quiet",
              attrs: { type: "button" },
              on: {
                click: () => {
                  app.audio.play("click");
                  app.navigate(routes.home);
                }
              }
            },
            narrative.home
          )
        ]),
        el("p", { className: "tiny", style: { "margin-top": "1.5rem" }, text: `Version ${APP_VERSION}` })
      ])
    ]),
    siteFooter(app)
  ]);
}

export function renderNotFound(app) {
  return el("div", { className: "screen" }, [
    pageHeader(app, {
      title: "Page introuvable",
      subtitle: "AVANT LE SILENCE",
      backTo: routes.home,
      backLabel: "Accueil"
    }),
    el("main", { id: "main" }, [
      el("div", { className: "container" }, [
        el("div", { className: "locked-panel" }, [
          el("div", { className: "locked-panel__icon" }, icon("search", { size: 26 })),
          el("h1", {
            text: app.content.narratives.errors.notFoundTitle
          }),
          el("p", { text: app.content.narratives.errors.notFoundText }),
          el(
            "a",
            {
              className: "btn btn--primary",
              attrs: { href: routes.home },
              on: { click: () => app.audio.play("click") }
            },
            "Revenir à l'accueil"
          )
        ])
      ])
    ]),
    siteFooter(app)
  ]);
}

export function renderBootError(message) {
  const root = document.getElementById("app");
  if (!root) return;
  root.replaceChildren(
    el("div", { className: "screen" }, [
      el("main", { id: "main", className: "section" }, [
        el("div", { className: "container--narrow" }, [
          el("div", { className: "warning-panel" }, [
            el("div", { className: "warning-panel__icon" }, icon("warning", { size: 25 })),
            el("p", { className: "eyebrow eyebrow--plain", text: "Chargement interrompu" }),
            el("h1", { text: "Le contenu n'a pas pu être chargé" }),
            el("p", { className: "prose", text: message }),
            el("div", { className: "warning-panel__actions" }, [
              el(
                "button",
                {
                  className: "btn btn--primary",
                  attrs: { type: "button" },
                  on: { click: () => window.location.reload() }
                },
                [icon("arrow-right", { size: 17 }), "Réessayer"]
              ),
              el(
                "a",
                { className: "btn btn--quiet", attrs: { href: "./" } },
                "Revenir à l'accueil"
              )
            ]),
            el("p", {
              className: "tiny",
              style: { "margin-top": "1rem" },
              text: "Si vous ouvrez le dossier directement depuis votre disque, utilisez un petit serveur local. Consultez le README pour la commande à utiliser."
            })
          ])
        ])
      ])
    ])
  );
  root.setAttribute("aria-busy", "false");
}
