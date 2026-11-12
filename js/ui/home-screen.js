/**
 * Accueil, avertissement de contenu et prologue.
 */

import { el, icon } from "../utils/helpers.js";
import { routes } from "../utils/paths.js";

export function hasProgress(app) {
  const state = app.stateManager.get();
  const chaptersDone = Object.values(state.chapters).some((chapter) => chapter.completed);
  const visitedScene = Object.values(state.chapters).some(
    (chapter) => (chapter.visitedScenes || []).length > 0
  );
  return (
    app.stateManager.loadedFromSave ||
    state.documentsRead.length > 0 ||
    state.peopleMet.length > 0 ||
    state.notebook.documents.length +
      state.notebook.people.length +
      state.notebook.events.length >
      0 ||
    chaptersDone ||
    visitedScene
  );
}

function homeHeader() {
  return el("header", { className: "page-header" }, [
    el("div", { className: "page-header__inner" }, [
      el("div", {}, [
        el("p", { className: "page-header__sub", text: "Une maison. Des vies. Une mémoire." }),
        el("p", { className: "page-header__title", text: "AVANT LE SILENCE" })
      ]),
      el("div", { className: "page-header__actions" }, [
        el(
          "button",
          {
            className: "btn btn--icon",
            attrs: { type: "button", "aria-label": "Revenir à l'accueil" },
            on: {
              click: () => {
                appNavigateHome();
              }
            }
          },
          icon("home")
        )
      ])
    ])
  ]);
}

function appNavigateHome() {
  window.location.hash = routes.home;
}

export function renderHome(app) {
  const narrative = app.content.narratives.home;
  const progress = hasProgress(app);

  const visual = el("div", { className: "home-visual" }, [
    el("img", {
      className: "home-visual__image",
      attrs: {
        src: "./assets/illustrations/maison-exterieur.svg",
        alt: "Illustration originale : une maison rurale au milieu des arbres, dans une lumière douce.",
        fetchpriority: "high"
      }
    }),
    el("p", { className: "home-visual__caption", text: narrative.visualCaption })
  ]);

  const buttons = [
    el(
      "button",
      {
        className: "btn btn--primary",
        attrs: { type: "button" },
        on: {
          click: () => {
            app.audio.start();
            app.startExperience();
          }
        }
      },
      [el("span", { text: narrative.start }), icon("arrow-right", { size: 18 })]
    ),
    el(
      "button",
      {
        className: "btn btn--secondary",
        attrs: { type: "button", ...(progress ? {} : { disabled: true }) },
        on: {
          click: () => {
            if (!progress) return;
            app.audio.start();
            app.continueExperience();
          }
        }
      },
      [el("span", { text: narrative.continue }), icon("play", { size: 17 })]
    )
  ];

  const secondary = [
    [narrative.sources, "link", () => app.openWithReturn(routes.sources)],
    [narrative.about, "info", () => app.openWithReturn(routes.about)],
    [narrative.settings, "settings", () => app.openWithReturn(routes.settings)]
  ].map(([label, iconName, handler]) =>
    el(
      "button",
      {
        className: "btn btn--quiet",
        attrs: { type: "button" },
        on: {
          click: () => {
            app.audio.play("click");
            handler();
          }
        }
      },
      [el("span", { text: label }), icon(iconName, { size: 16 })]
    )
  );

  const panel = el("div", { className: "home-panel" }, [
    el("div", { className: "home-panel__inner" }, [
      el("p", { className: "eyebrow", text: narrative.eyebrow }),
      el("h1", { className: "home-title", text: narrative.title }),
      el("p", { className: "home-subtitle", text: narrative.subtitle }),
      el("p", { className: "home-intro", text: narrative.intro }),
      el("div", { className: "home-actions" }, [...buttons, ...secondary]),
      el(
        "div",
        { className: "home-meta" },
        narrative.notice.map((line) => el("p", { text: line }))
      ),
      progress
        ? el("p", {
            className: "tiny",
            text: "Une progression est enregistrée dans ce navigateur."
          })
        : null
    ])
  ]);

  return el("main", { className: "screen home-screen", id: "main" }, [visual, panel]);
}

export function renderWarning(app) {
  const narrative = app.content.narratives.warning;

  const content = el("div", { className: "screen" }, [
    homeHeader(),
    el("main", { id: "main", className: "section" }, [
      el("div", { className: "container--narrow" }, [
        el("div", { className: "warning-panel" }, [
          el("div", { className: "warning-panel__icon" }, icon("warning", { size: 25 })),
          el("p", { className: "eyebrow eyebrow--plain", text: "Avertissement de contenu" }),
          el("h1", { text: narrative.title }),
          el("div", { className: "prose" }, narrative.paragraphs.map((text) => el("p", { text }))),
          el("p", { className: "warning-panel__care", text: narrative.care }),
          el("p", { className: "tiny", text: narrative.note }),
          el("div", { className: "warning-panel__actions" }, [
            el(
              "button",
              {
                className: "btn btn--primary",
                attrs: { type: "button" },
                on: {
                  click: () => {
                    app.audio.start();
                    app.audio.play("confirm");
                    app.stateManager.acknowledgeWarning();
                    const target = app.pendingAfterWarning || routes.intro;
                    app.pendingAfterWarning = null;
                    app.navigate(target);
                  }
                }
              },
              [el("span", { text: narrative.accept }), icon("arrow-right", { size: 18 })]
            ),
            el(
              "button",
              {
                className: "btn btn--quiet",
                attrs: { type: "button" },
                on: {
                  click: () => {
                    app.audio.play("click");
                    app.pendingAfterWarning = null;
                    app.navigate(routes.home);
                  }
                }
              },
              narrative.back
            )
          ])
        ])
      ])
    ])
  ]);

  return content;
}

export function renderPrologue(app) {
  const narrative = app.content.narratives.prologue;

  return el("div", { className: "screen" }, [
    homeHeader(),
    el("main", { id: "main", className: "prologue" }, [
      el("div", { className: "container" }, [
        el("div", { className: "prologue__grid" }, [
          el("div", {}, [
            el("p", { className: "eyebrow", text: "Prologue" }),
            el("h1", { className: "text-balance", text: narrative.title }),
            el("p", { className: "lead", text: narrative.lead }),
            el("div", { className: "prose prose--lead" }, narrative.paragraphs.map((text) => el("p", { text }))),
            el("blockquote", { className: "quote" }, [
              narrative.quote,
              el("span", { className: "quote__label", text: narrative.quoteLabel })
            ]),
            el("div", { className: "cluster", style: { "margin-top": "1.5rem" } }, [
              el(
                "button",
                {
                  className: "btn btn--primary",
                  attrs: { type: "button" },
                  on: {
                    click: () => {
                      app.audio.play("confirm");
                      app.navigate(routes.chapters);
                    }
                  }
                },
                [el("span", { text: narrative.start }), icon("arrow-right", { size: 18 })]
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
                narrative.back
              )
            ])
          ]),
          el("aside", { className: "prologue__aside" }, [
            el("figure", { className: "archive-plate" }, [
              el("img", {
                attrs: {
                  src: "./assets/illustrations/maison-exterieur.svg",
                  alt: "Illustration originale : une maison rurale au milieu des arbres, dans une lumière douce.",
                  width: "640",
                  height: "400",
                  loading: "lazy"
                }
              }),
              el("figcaption", { className: "archive-plate__caption" }, [
                el("span", { className: "archive-plate__label", text: "Légende" }),
                el("span", { text: app.content.narratives.home.visualCaption })
              ])
            ]),
            el("p", { className: "eyebrow eyebrow--plain", text: "Repères" }),
            el("h2", { text: "Le parcours en bref" }),
            el(
              "ul",
              { className: "prologue__facts" },
              narrative.facts.map((fact) =>
                el("li", {}, [
                  el("strong", { text: fact.label }),
                  el("span", { text: fact.value })
                ])
              )
            ),
            el("div", { className: "notice notice--quiet", style: { "margin-top": "1rem" } }, [
              icon("info", { size: 18 }),
              el("span", {
                text: "Les documents d'archives ne sont pas reproduits dans cette version. Les fiches renvoient aux sources officielles."
              })
            ])
          ])
        ])
      ])
    ])
  ]);
}
