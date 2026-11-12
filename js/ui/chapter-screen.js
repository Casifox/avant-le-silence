/**
 * Écrans de chapitre : sélection, avertissement, scène, bilan.
 */

import { el, icon, typeMeta, percent } from "../utils/helpers.js";
import { routes } from "../utils/paths.js";
import { announce } from "../utils/accessibility.js";
import { pageHeader, standardActions, siteFooter } from "./page-shell.js";
import { openDocument, openPerson } from "./document-viewer.js";
import { renderActivity } from "./activity-ui.js";
import { openModal, closeTopModal, toast } from "./modal.js";

function chapterStatusBadge(status) {
  if (status === "completed") {
    return el("span", { className: "badge badge--complete" }, [icon("check", { size: 12 }), "Terminé"]);
  }
  if (status === "in-progress") {
    return el("span", { className: "badge badge--quiet" }, "En cours");
  }
  if (status === "locked") {
    return el("span", { className: "badge badge--locked" }, [icon("lock", { size: 12 }), "Verrouillé"]);
  }
  return el("span", { className: "badge badge--quiet" }, "À découvrir");
}

function chapterCard(app, chapter) {
  const status = app.progressSystem.getChapterStatus(chapter.id);
  const progress = app.progressSystem.getChapterProgress(chapter.id);
  const locked = status === "locked";
  const linkLabel =
    status === "completed" ? "Rejouer" : status === "in-progress" ? "Reprendre" : "Ouvrir";

  const cover = el("div", { className: "chapter-card__cover" }, [
    el("img", {
      attrs: {
        src: chapter.cover,
        alt: chapter.coverAlt,
        loading: "lazy"
      }
    }),
    el("span", { className: "chapter-card__number", text: chapter.number })
  ]);

  const footer = el("div", { className: "chapter-card__footer" }, [
    el("span", {
      className: "chapter-card__progress",
      text: locked
        ? "Terminez le chapitre précédent"
        : progress.requiredTotal
          ? `${progress.requiredDone} / ${progress.requiredTotal} éléments essentiels`
          : "Parcours complet"
    }),
    locked
      ? el("span", { className: "chapter-card__lock" }, [icon("lock", { size: 14 }), "Verrouillé"])
      : el(
          "a",
          {
            className: "chapter-card__link",
            attrs: { href: routes.chapter(chapter.id) },
            on: { click: () => app.audio.play("click") }
          },
          [el("span", { text: linkLabel }), icon("arrow-right", { size: 14 })]
        )
  ]);

  const body = el("div", { className: "chapter-card__body" }, [
    el("div", { className: "cluster", style: { "justify-content": "space-between" } }, [
      el("p", { className: "chapter-card__meta", text: chapter.period }),
      chapterStatusBadge(status)
    ]),
    el("h2", { text: chapter.title }),
    el("p", { text: chapter.description }),
    footer
  ]);

  return el(
    "article",
    { className: `chapter-card ${locked ? "chapter-card--locked" : "chapter-card--open"}` },
    [cover, body]
  );
}

export function renderChapterSelect(app) {
  const chapters = app.exploration.getChapters();
  const overall = app.progressSystem.getOverallProgress();

  const intro = el("section", { className: "page-intro" }, [
    el("div", { className: "container" }, [
      el("p", { className: "eyebrow", text: "Parcours" }),
      el("h1", { className: "text-balance", text: "Quatre chapitres, une histoire" }),
      el("p", {
        className: "lead",
        text:
          "La maison, les traces, le 6 avril 1944, puis le travail de mémoire. Les chapitres se débloquent au fil de votre progression."
      }),
      el("div", { style: { "max-width": "560px", "margin-top": "1.6rem" } }, [
        el("div", { className: "scene-progress__row" }, [
          el("span", {
            text: `${overall.chaptersCompleted} / ${overall.chaptersTotal} chapitres terminés`
          }),
          el("span", { text: `${overall.percentChapters} %` })
        ]),
        el("div", { className: "progress" }, [
          el("span", {
            className: "progress__bar",
            style: { width: `${overall.percentChapters}%` }
          })
        ]),
        el("p", {
          className: "tiny",
          style: { "margin-top": "0.55rem" },
          text: `${overall.documentsRead} / ${overall.documentsTotal} documents consultés · ${overall.notebookCount} éléments au carnet`
        })
      ])
    ])
  ]);

  const content = el("section", { className: "page-content" }, [
    el("div", { className: "container" }, [
      el("div", { className: "chapter-grid" }, chapters.map((chapter) => chapterCard(app, chapter))),
      el("div", { className: "notice notice--quiet", style: { "margin-top": "1.6rem" } }, [
        icon("info", { size: 18 }),
        el("span", {
          text:
            "Chaque chapitre demande de consulter quelques éléments essentiels. Aucun chronomètre ne s'applique. Vous pouvez revenir à tout moment."
        })
      ])
    ])
  ]);

  return el("div", { className: "screen" }, [
    pageHeader(app, {
      title: "Parcours",
      subtitle: "AVANT LE SILENCE",
      backTo: routes.home,
      backLabel: "Accueil",
      actions: standardActions(app)
    }),
    el("main", { id: "main" }, [intro, content]),
    siteFooter(app)
  ]);
}

export function renderChapterWarning(app, chapter) {
  const narrative = app.content.narratives.chapterWarning;

  return el("div", { className: "screen" }, [
    pageHeader(app, {
      title: chapter.title,
      subtitle: `Chapitre ${chapter.number}`,
      backTo: routes.chapters,
      backLabel: "Chapitres"
    }),
    el("main", { id: "main", className: "section" }, [
      el("div", { className: "container--narrow" }, [
        el("div", { className: "warning-panel" }, [
          el("div", { className: "warning-panel__icon" }, icon("warning", { size: 25 })),
          el("p", { className: "eyebrow eyebrow--plain", text: `Chapitre ${chapter.number}` }),
          el("h1", { text: narrative.title }),
          el("div", { className: "prose" }, narrative.paragraphs.map((text) => el("p", { text }))),
          el("p", { className: "warning-panel__care", text: narrative.note }),
          el("div", { className: "warning-panel__actions" }, [
            el(
              "button",
              {
                className: "btn btn--primary",
                attrs: { type: "button" },
                on: {
                  click: () => {
                    app.audio.play("confirm");
                    app.stateManager.acknowledgeChapterWarning(chapter.id);
                    const target = app.pendingChapterRoute || routes.chapter(chapter.id);
                    app.pendingChapterRoute = null;
                    app.navigation.replace(target);
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
                    app.pendingChapterRoute = null;
                    app.navigate(routes.chapters);
                  }
                }
              },
              narrative.back
            )
          ])
        ])
      ])
    ]),
    siteFooter(app)
  ]);
}

export function renderLockedChapter(app, chapter) {
  const previous = app.exploration
    .getChapters()
    .find((item) => item.order === chapter.order - 1);

  return el("div", { className: "screen" }, [
    pageHeader(app, {
      title: "Chapitre verrouillé",
      subtitle: "AVANT LE SILENCE",
      backTo: routes.chapters,
      backLabel: "Chapitres"
    }),
    el("main", { id: "main" }, [
      el("div", { className: "container" }, [
        el("div", { className: "locked-panel" }, [
          el("div", { className: "locked-panel__icon" }, icon("lock", { size: 26 })),
          el("p", { className: "eyebrow eyebrow--plain", text: `Chapitre ${chapter.number}` }),
          el("h1", { text: chapter.title }),
          el("p", {
            text: `Ce chapitre se débloque après avoir terminé « ${previous?.title || "le chapitre précédent"} ». La progression est enregistrée automatiquement.`
          }),
          el("div", { className: "cluster", style: { "justify-content": "center" } }, [
            previous
              ? el(
                  "a",
                  {
                    className: "btn btn--primary",
                    attrs: { href: routes.chapter(previous.id) },
                    on: { click: () => app.audio.play("click") }
                  },
                  [icon("arrow-left", { size: 17 }), `Ouvrir ${previous.title}`]
                )
              : null,
            el(
              "a",
              {
                className: "btn btn--quiet",
                attrs: { href: routes.chapters },
                on: { click: () => app.audio.play("click") }
              },
              "Retour aux chapitres"
            )
          ])
        ])
      ])
    ]),
    siteFooter(app)
  ]);
}

function hotspotTypeLabel(app, hotspot) {
  const action = hotspot.action;
  if (!action) return "Repère";
  if (action.type === "document") {
    const document = app.index.documents.get(action.id);
    return document ? typeMeta(document.type).label : "Document";
  }
  if (action.type === "person") {
    const person = app.index.people.get(action.id);
    if (person?.kind === "group") return "Groupe";
    if (person?.kind === "perpetrator") return "Fiche";
    return "Personne";
  }
  if (action.type === "note") return action.category || "Repère";
  return "Repère";
}

function itemKey(type, id) {
  return `${type}:${id}`;
}

function applyDoneState(button, done) {
  button.dataset.done = done ? "true" : "false";
  const state = button.querySelector('[data-role="done-state"]');
  if (state) state.hidden = !done;
}

function openSceneAction(app, action) {
  if (!action) return;
  if (action.type === "note") {
    openNoteModal(app, action);
    return;
  }
  if (action.type === "document") {
    openDocument(app, action.id);
    return;
  }
  if (action.type === "person") {
    openPerson(app, action.id);
  }
}

function openNoteModal(app, note) {
  app.audio.play("open");
  const category = note.category || "Texte de médiation";
  const content = el("div", {}, [
    el("div", { className: "cluster", style: { "margin-bottom": "0.8rem" } }, [
      el("span", { className: "badge badge--quiet", text: category })
    ]),
    el("p", { className: "prose", text: note.text }),
    el("div", { className: "notice notice--quiet", style: { "margin-top": "1.1rem" } }, [
      icon("info", { size: 18 }),
      el("span", {
        text: category === "Texte de médiation"
          ? "Ce texte est une médiation originale du jeu. Il n'est pas présenté comme une citation historique."
          : category.includes("Reconstitution") || category.includes("illustrative")
            ? "Cette illustration est une reconstitution contemporaine. Elle ne reproduit pas un document historique."
            : "Cette information est référencée dans les sources du jeu. Consultez la page Sources pour les références."
      })
    ])
  ]);

  openModal({
    title: note.title,
    subtitle: "Point d'intérêt",
    eyebrow: category,
    content,
    className: "modal--narrow",
    footer: el("div", { className: "modal__footer-actions" }, [
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
  announce(`${note.title}. ${note.text}`);
}

function readingListButton(app, item, required) {
  const isDocument = item.type === "document";
  const meta = isDocument
    ? typeMeta(item.data.type)
    : {
        label:
          item.data.kind === "group"
            ? "Groupe"
            : item.data.kind === "perpetrator"
              ? "Fiche"
              : "Personne",
        icon: item.data.kind === "group" ? "person" : "user"
      };
  const done = isDocument
    ? app.documentSystem.isRead(item.id)
    : app.documentSystem.isMet(item.id);
  const detail = isDocument
    ? item.data.displayDate || "Date non établie"
    : item.data.role;

  const state = el("span", { className: "item-button__state", attrs: { "data-role": "done-state" } }, [
    icon("check", { size: 16 })
  ]);
  state.hidden = !done;

  const button = el(
    "button",
    {
      className: "item-button",
      attrs: { type: "button" },
      dataset: { itemKey: itemKey(item.type, item.id), done: done ? "true" : "false" },
      on: {
        click: () => {
          if (isDocument) openDocument(app, item.id);
          else openPerson(app, item.id);
        }
      }
    },
    [
      el("span", { className: "item-button__icon" }, icon(meta.icon, { size: 17 })),
      el("span", { className: "item-button__text" }, [
        el("span", { className: "item-button__title", text: isDocument ? item.data.title : item.data.name }),
        el("span", {
          className: "item-button__meta",
          text: `${meta.label} · ${detail}${required ? " · Élément essentiel" : ""}`
        })
      ]),
      state
    ]
  );

  if (done) button.dataset.done = "true";
  return button;
}

function hotspotLegendButton(app, hotspot, index) {
  const action = hotspot.action;
  let done = false;
  if (action?.type === "document") done = app.documentSystem.isRead(action.id);
  if (action?.type === "person") done = app.documentSystem.isMet(action.id);

  const state = el("span", { className: "hotspot-legend__state", attrs: { "data-role": "done-state" } }, [
    icon("check", { size: 14 })
  ]);
  state.hidden = !done;

  const button = el(
    "button",
    {
      attrs: { type: "button" },
      dataset: action ? { itemKey: itemKey(action.type, action.id), done: done ? "true" : "false" } : {},
      on: { click: () => openSceneAction(app, action) }
    },
    [
      el("span", { className: "hotspot-legend__num", text: String(index + 1) }),
      el("span", { className: "hotspot-legend__label", text: hotspot.label }),
      el("span", { className: "hotspot-legend__type", text: hotspotTypeLabel(app, hotspot) }),
      state
    ]
  );
  return button;
}

function updateSceneProgress(root, app, chapterId) {
  const progress = app.progressSystem.getChapterProgress(chapterId);
  const bar = root.querySelector('[data-role="chapter-progress-bar"]');
  const text = root.querySelector('[data-role="chapter-progress-text"]');
  const detail = root.querySelector('[data-role="chapter-progress-detail"]');
  if (bar) bar.style.width = `${percent(progress.requiredDone, progress.requiredTotal)}%`;
  if (text) {
    text.textContent = `${progress.requiredDone} / ${progress.requiredTotal} éléments essentiels consultés`;
  }
  if (detail) {
    detail.textContent = `${progress.docsRead} / ${progress.docsTotal} documents · ${progress.peopleMet} / ${progress.peopleTotal} personnes`;
  }
}

export function refreshSceneStatus(app) {
  const root = document.querySelector("[data-scene-root]");
  if (!root) return;
  const chapterId = root.dataset.chapterId;

  root.querySelectorAll("[data-item-key]").forEach((button) => {
    const [type, ...rest] = String(button.dataset.itemKey || "").split(":");
    const id = rest.join(":");
    if (!type || !id) return;
    const done =
      type === "document" ? app.documentSystem.isRead(id) : app.documentSystem.isMet(id);
    applyDoneState(button, done);
  });

  if (chapterId) updateSceneProgress(root, app, chapterId);
}

export function renderScene(app, chapter, scene) {
  const sceneIndex = app.exploration.getSceneIndex(chapter.id, scene.id);
  const scenes = app.exploration.getScenes(chapter.id);
  const previous = app.exploration.getPreviousScene(chapter.id, scene.id);
  const next = app.exploration.getNextScene(chapter.id, scene.id);
  const reading = app.exploration.getReadingList(scene);
  const requiredKeys = new Set((scene.required || []).map((item) => itemKey(item.type, item.id)));
  const chapterState = app.stateManager.get().chapters[chapter.id];

  if (chapterState && !chapterState.visitedScenes.includes(scene.id)) {
    app.stateManager.update((state) => {
      state.chapters[chapter.id].visitedScenes.push(scene.id);
    });
  }

  const hotspots = scene.hotspots || [];
  const illustration = el("figure", { className: "illustration" }, [
    el("img", {
      className: "illustration__image",
      attrs: { src: scene.illustration, alt: scene.illustrationAlt }
    }),
    ...hotspots.map((hotspot, index) => {
      const typeLabel = hotspotTypeLabel(app, hotspot);
      return el(
        "button",
        {
          className: "hotspot",
          style: { left: `${hotspot.x}%`, top: `${hotspot.y}%` },
          attrs: {
            type: "button",
            "aria-label": `${index + 1}. ${hotspot.label} — ${typeLabel}`
          },
          on: { click: () => openSceneAction(app, hotspot.action) }
        },
        [
          el("span", { className: "hotspot__dot" }, [
            el("span", { className: "hotspot__number", text: String(index + 1) })
          ]),
          el("span", { className: "hotspot__label", text: hotspot.label })
        ]
      );
    }),
    el("figcaption", { className: "illustration__caption" }, [
      el("span", { text: scene.illustrationCredit }),
      el("span", { text: `${sceneIndex + 1} / ${scenes.length}` })
    ])
  ]);

  const legend = hotspots.length
    ? el(
        "ul",
        { className: "hotspot-legend" },
        hotspots.map((hotspot, index) => el("li", {}, hotspotLegendButton(app, hotspot, index)))
      )
    : el("p", { className: "tiny", text: "Aucun point d'intérêt dans cet espace." });

  const readingItems = reading.length
    ? el(
        "ul",
        { className: "item-list" },
        reading.map((item) =>
          el(
            "li",
            {},
            readingListButton(app, item, requiredKeys.has(itemKey(item.type, item.id)))
          )
        )
      )
    : el("p", { className: "tiny", text: "Aucun élément à consulter dans cet espace." });

  const progress = app.progressSystem.getChapterProgress(chapter.id);

  const panel = el("aside", { className: "scene-panel" }, [
    el("div", { className: "scene-panel__inner" }, [
      el("h2", { className: "sr-only", text: "Espace de découverte" }),
      el("p", { className: "eyebrow eyebrow--plain", text: "Espace de découverte" }),
      el("p", { className: "lead", text: scene.lead }),
      el(
        "div",
        { className: "prose" },
        scene.paragraphs.map((text) => el("p", { text }))
      ),
      el("hr", { className: "scene-panel__divider" }),
      el("h3", { text: "Points d'intérêt" }),
      legend,
      el("hr", { className: "scene-panel__divider" }),
      el("h3", { text: "À consulter" }),
      readingItems,
      el("div", { className: "scene-actions" }, [
        previous
          ? el(
              "a",
              {
                className: "btn btn--quiet",
                attrs: { href: routes.scene(chapter.id, previous.id) },
                on: { click: () => app.audio.play("page") }
              },
              [icon("arrow-left", { size: 16 }), "Espace précédent"]
            )
          : el(
              "a",
              {
                className: "btn btn--quiet",
                attrs: { href: routes.chapters },
                on: { click: () => app.audio.play("click") }
              },
              [icon("grid", { size: 16 }), "Chapitres"]
            ),
        next
          ? el(
              "a",
              {
                className: "btn btn--primary",
                attrs: { href: routes.scene(chapter.id, next.id) },
                on: { click: () => app.audio.play("page") }
              },
              ["Espace suivant", icon("arrow-right", { size: 16 })]
            )
          : el(
              "button",
              {
                className: "btn btn--primary",
                attrs: { type: "button" },
                on: {
                  click: () => {
                    app.audio.play("confirm");
                    attemptChapterCompletion(app, chapter.id);
                  }
                }
              },
              [el("span", { text: "Achever le chapitre" }), icon("check", { size: 16 })]
            )
      ])
    ])
  ]);

  const hud = el("header", { className: "hud" }, [
    el("div", { className: "hud__inner" }, [
      el("div", { className: "hud__chapter" }, [
        el("span", { className: "hud__chapter-mark", text: chapter.number }),
        el("div", { className: "hud__chapter-text" }, [
          el("span", { className: "hud__chapter-name", text: chapter.title }),
          el("span", { className: "hud__chapter-period", text: chapter.period })
        ])
      ]),
      el("div", { className: "hud__actions" }, [
        el(
          "button",
          {
            className: "btn btn--icon",
            attrs: { type: "button", "aria-label": "Ouvrir le carnet de mémoire" },
            on: { click: () => app.openWithReturn(routes.notebook) }
          },
          icon("book")
        ),
        el(
          "button",
          {
            className: "btn btn--icon",
            attrs: { type: "button", "aria-label": "Ouvrir la chronologie" },
            on: { click: () => app.openWithReturn(routes.timeline) }
          },
          icon("timeline")
        ),
        el(
          "button",
          {
            className: "btn btn--icon",
            attrs: { type: "button", "aria-label": "Menu, pause et paramètres" },
            on: { click: () => openSceneMenu(app, chapter, scene) }
          },
          icon("menu")
        )
      ])
    ])
  ]);

  const progressStrip = el("div", { className: "scene-progress" }, [
    el("div", { className: "scene-progress__row" }, [
      el("span", { attrs: { "data-role": "chapter-progress-text" }, text: `${progress.requiredDone} / ${progress.requiredTotal} éléments essentiels consultés` }),
      el("span", { attrs: { "data-role": "chapter-progress-detail" }, text: `${progress.docsRead} / ${progress.docsTotal} documents · ${progress.peopleMet} / ${progress.peopleTotal} personnes` })
    ]),
    el("div", { className: "progress progress--chapter" }, [
      el("span", {
        className: "progress__bar",
        attrs: { "data-role": "chapter-progress-bar" },
        style: { width: `${percent(progress.requiredDone, progress.requiredTotal)}%` }
      })
    ])
  ]);

  const activityContainer = el("div", { className: "scene-activity" });
  if (scene.activity) {
    renderActivity(app, scene.activity, activityContainer);
  }

  const root = el(
    "div",
    {
      className: `screen scene-screen mood-${chapter.mood || "day"}`,
      dataset: { sceneRoot: "true", chapterId: chapter.id, sceneId: scene.id }
    },
    [
      hud,
      el("main", { id: "main" }, [
        el("div", { className: "scene-heading" }, [
          el("p", { className: "scene-heading__kicker", text: `${chapter.kicker || `Chapitre ${chapter.number}`} · Espace ${sceneIndex + 1} sur ${scenes.length}` }),
          el("h1", { text: scene.title })
        ]),
        el("div", { className: "scene-layout" }, [illustration, panel]),
        scene.activity ? activityContainer : null,
        progressStrip
      ])
    ]
  );

  return root;
}

function openSceneMenu(app, chapter, scene) {
  app.audio.play("click");
  const progress = app.progressSystem.getChapterProgress(chapter.id);

  const actions = [
    {
      label: "Reprendre la lecture",
      icon: "play",
      onClick: () => closeTopModal()
    },
    {
      label: "Carnet de mémoire",
      icon: "book",
      onClick: () => {
        closeTopModal(false);
        app.openWithReturn(routes.notebook);
      }
    },
    {
      label: "Chronologie",
      icon: "timeline",
      onClick: () => {
        closeTopModal(false);
        app.openWithReturn(routes.timeline);
      }
    },
    {
      label: "Paramètres et accessibilité",
      icon: "settings",
      onClick: () => {
        closeTopModal(false);
        app.openWithReturn(routes.settings);
      }
    },
    {
      label: "Achever le chapitre",
      icon: "check",
      onClick: () => {
        closeTopModal(false);
        attemptChapterCompletion(app, chapter.id);
      }
    },
    {
      label: "Retour aux chapitres",
      icon: "grid",
      onClick: () => {
        closeTopModal(false);
        app.navigate(routes.chapters);
      }
    },
    {
      label: "Revenir à l'accueil",
      icon: "home",
      onClick: () => {
        closeTopModal(false);
        app.navigate(routes.home);
      }
    }
  ];

  const content = el("div", {}, [
    el("div", { className: "notice notice--quiet", style: { "margin-bottom": "1rem" } }, [
      icon("info", { size: 18 }),
      el("span", {
        text: `Chapitre ${chapter.number} — ${chapter.title}. ${progress.requiredDone} / ${progress.requiredTotal} éléments essentiels consultés. La progression est enregistrée automatiquement.`
      })
    ]),
    el(
      "ul",
      { className: "item-list" },
      actions.map((action) =>
        el("li", {}, [
          el(
            "button",
            {
              className: "item-button",
              attrs: { type: "button" },
              on: {
                click: () => {
                  app.audio.play("click");
                  action.onClick();
                }
              }
            },
            [
              el("span", { className: "item-button__icon" }, icon(action.icon, { size: 17 })),
              el("span", { className: "item-button__text" }, [
                el("span", { className: "item-button__title", text: action.label })
              ]),
              icon("chevron-right", { size: 15 })
            ]
          )
        ])
      )
    )
  ]);

  openModal({
    title: "Menu et pause",
    subtitle: "Vous pouvez quitter à tout moment sans perdre votre progression.",
    content,
    className: "modal--narrow",
    footer: el("div", { className: "modal__footer-actions" }, [
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
}

export function attemptChapterCompletion(app, chapterId) {
  const chapter = app.exploration.getChapter(chapterId);
  if (!chapter) return false;
  const progress = app.progressSystem.getChapterProgress(chapterId);

  if (progress.completed) {
    app.navigate(routes.review(chapterId));
    return true;
  }

  if (progress.missing.length > 0) {
    app.audio.play("warn");
    openMissingItems(app, chapter, progress.missing);
    return false;
  }

  app.progressSystem.completeChapter(chapterId);
  app.audio.play("confirm");
  toast(`Chapitre ${chapter.number} terminé.`);
  app.navigate(routes.review(chapterId));
  return true;
}

function openMissingItems(app, chapter, missing) {
  const items = missing.map((item) => {
    const data =
      item.type === "document"
        ? app.index.documents.get(item.id)
        : app.index.people.get(item.id);
    return data ? { ...item, data } : null;
  }).filter(Boolean);

  const content = el("div", {}, [
    el("p", {
      className: "prose",
      text:
        "Le chapitre se termine lorsque les éléments essentiels ont été consultés. Vous pouvez ouvrir ceux qui restent, puis revenir au chapitre."
    }),
    el(
      "ul",
      { className: "item-list" },
      items.map((item) => {
        const isDocument = item.type === "document";
        return el("li", {}, [
          el(
            "button",
            {
              className: "item-button",
              attrs: { type: "button" },
              on: {
                click: () => {
                  closeTopModal(false);
                  if (isDocument) openDocument(app, item.id);
                  else openPerson(app, item.id);
                }
              }
            },
            [
              el(
                "span",
                { className: "item-button__icon" },
                icon(
                  isDocument ? typeMeta(item.data.type).icon : "user",
                  { size: 17 }
                )
              ),
              el("span", { className: "item-button__text" }, [
                el("span", {
                  className: "item-button__title",
                  text: isDocument ? item.data.title : item.data.name
                }),
                el("span", {
                  className: "item-button__meta",
                  text: isDocument ? "Document essentiel" : "Personne essentielle"
                })
              ]),
              icon("arrow-right", { size: 15 })
            ]
          )
        ]);
      })
    ),
    el("p", {
      className: "tiny",
      style: { "margin-top": "0.9rem" },
      text: "Aucun élément n'est chronométré. La progression est enregistrée à chaque consultation."
    })
  ]);

  openModal({
    title: missing.length === 1 ? "Il reste un élément essentiel" : `Il reste ${missing.length} éléments essentiels`,
    subtitle: `Chapitre ${chapter.number} — ${chapter.title}`,
    content,
    className: "modal--narrow",
    footer: el("div", { className: "modal__footer-actions" }, [
      el(
        "button",
        {
          className: "btn btn--quiet",
          attrs: { type: "button" },
          on: { click: () => closeTopModal() }
        },
        "Revenir au chapitre"
      )
    ])
  });
}

export function renderChapterReview(app, chapter) {
  const progress = app.progressSystem.getChapterProgress(chapter.id);

  if (!progress.completed) {
    return el("div", { className: "screen" }, [
      pageHeader(app, {
        title: "Bilan du chapitre",
        subtitle: `Chapitre ${chapter.number}`,
        backTo: routes.chapter(chapter.id),
        backLabel: "Chapitre"
      }),
      el("main", { id: "main" }, [
        el("div", { className: "container" }, [
          el("div", { className: "locked-panel" }, [
            el("div", { className: "locked-panel__icon" }, icon("info", { size: 26 })),
            el("h1", { text: "Le bilan n'est pas encore disponible" }),
            el("p", {
              text: "Terminez d'abord les éléments essentiels du chapitre. Votre progression est conservée."
            }),
            el(
              "button",
              {
                className: "btn btn--primary",
                attrs: { type: "button" },
                on: { click: () => app.navigate(routes.chapter(chapter.id)) }
              },
              "Revenir au chapitre"
            )
          ])
        ])
      ]),
      siteFooter(app)
    ]);
  }

  const next = app.progressSystem.getNextChapter(chapter.id);
  const conclusionNext = app.progressSystem.isConclusionNext(chapter.id);
  const markIcon = chapter.requiresWarning ? "memorial" : "check";

  const synthetic = el("div", { className: "synthesis" }, [
    el("h2", { text: "Ce que ce chapitre a mis en jeu" }),
    el(
      "div",
      { className: "prose" },
      chapter.completion.text.map((text) => el("p", { text }))
    ),
    el("div", { className: "synthesis__grid" }, [
      el("div", { className: "synthesis__item" }, [
        el("strong", { text: `${progress.requiredDone} / ${progress.requiredTotal}` }),
        "éléments essentiels consultés"
      ]),
      el("div", { className: "synthesis__item" }, [
        el("strong", { text: `${progress.docsRead} / ${progress.docsTotal}` }),
        "documents consultés dans ce chapitre"
      ]),
      el("div", { className: "synthesis__item" }, [
        el("strong", { text: `${progress.peopleMet} / ${progress.peopleTotal}` }),
        "personnes rencontrées"
      ]),
      el("div", { className: "synthesis__item" }, [
        el("strong", {
          text: `${progress.activitiesDone} / ${progress.activitiesTotal}`
        }),
        "ateliers documentaires"
      ])
    ])
  ]);

  const actions = el("div", { className: "chapter-review__actions" }, [
    next
      ? el(
          "a",
          {
            className: "btn btn--primary",
            attrs: { href: routes.chapter(next.id) },
            on: { click: () => app.audio.play("confirm") }
          },
          [`Chapitre ${next.number} — ${next.title}`, icon("arrow-right", { size: 17 })]
        )
      : conclusionNext
        ? el(
            "a",
            {
              className: "btn btn--primary",
              attrs: { href: routes.conclusion },
              on: { click: () => app.audio.play("confirm") }
            },
            ["Lire la conclusion", icon("arrow-right", { size: 17 })]
          )
        : null,
    el(
      "a",
      {
        className: "btn btn--quiet",
        attrs: { href: routes.chapters },
        on: { click: () => app.audio.play("click") }
      },
      "Retour aux chapitres"
    ),
    el(
      "button",
      {
        className: "btn btn--quiet",
        attrs: { type: "button" },
        on: { click: () => app.openWithReturn(routes.notebook) }
      },
      [icon("book", { size: 16 }), "Ouvrir le carnet"]
    )
  ]);

  return el("div", { className: "screen" }, [
    pageHeader(app, {
      title: chapter.completion.title,
      subtitle: `Chapitre ${chapter.number}`,
      backTo: routes.chapters,
      backLabel: "Chapitres",
      actions: standardActions(app)
    }),
    el("main", { id: "main", className: "chapter-review" }, [
      el("div", { className: "chapter-review__inner" }, [
        el("div", { className: "chapter-review__mark" }, icon(markIcon, { size: 28 })),
        el("p", { className: "eyebrow eyebrow--plain", text: "Chapitre terminé" }),
        el("h1", { className: "text-balance", text: chapter.completion.title }),
        el("blockquote", { className: "quote" }, [
          chapter.completion.quote,
          el("span", { className: "quote__label", text: chapter.completion.quoteLabel })
        ]),
        synthetic,
        el("p", {
          className: "tiny",
          style: { "margin-top": "1rem" },
          text: "Ce bilan n'attribue aucune note et ne mesure pas votre compréhension. Il indique simplement les éléments consultés."
        }),
        actions
      ])
    ]),
    siteFooter(app)
  ]);
}
