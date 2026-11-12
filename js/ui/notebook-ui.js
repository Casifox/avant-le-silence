/**
 * Carnet de mémoire : recherche, filtres, consultation et suppression.
 */

import { el, icon, typeMeta, truncate } from "../utils/helpers.js";
import { routes } from "../utils/paths.js";
import { announce } from "../utils/accessibility.js";
import { pageHeader, siteFooter } from "./page-shell.js";
import { openDocument, openPerson } from "./document-viewer.js";
import { openEvent } from "./chronology-ui.js";
import { toast, confirmDialog } from "./modal.js";

function itemTypeLabel(item) {
  if (item.kind === "document") return typeMeta(item.data.type).label;
  if (item.kind === "person") {
    if (item.data.kind === "group") return "Groupe";
    if (item.data.kind === "perpetrator") return "Fiche";
    return "Personne";
  }
  return "Date";
}

function itemIcon(item) {
  if (item.kind === "document") return typeMeta(item.data.type).icon;
  if (item.kind === "person") return item.data.kind === "group" ? "person" : "user";
  return "clock";
}

function openItem(app, item) {
  if (item.kind === "document") openDocument(app, item.id);
  else if (item.kind === "person") openPerson(app, item.id);
  else openEvent(app, item.id);
}

function notebookCard(app, item, onRemove) {
  const removeButton = el(
    "button",
    {
      className: "btn btn--icon btn--small",
      attrs: { type: "button", "aria-label": `Retirer ${item.title} du carnet` },
      on: {
        click: () => onRemove(item)
      }
    },
    icon("trash", { size: 16 })
  );

  return el("article", { className: "notebook-card" }, [
    el("div", { className: "notebook-card__head" }, [
      el("div", { className: "cluster", style: { gap: "0.45rem" } }, [
        icon(itemIcon(item), { size: 16 }),
        el("span", { className: "tiny", text: itemTypeLabel(item) })
      ]),
      removeButton
    ]),
    el("h3", { text: item.title }),
    el("p", { text: truncate(item.summary, 190) }),
    el("div", { className: "notebook-card__foot" }, [
      el("span", { className: "tiny", text: item.chapterTitle || "Carnet" }),
      el(
        "button",
        {
          className: "notebook-card__open",
          attrs: { type: "button" },
          on: {
            click: () => {
              app.audio.play("open");
              openItem(app, item);
            }
          }
        },
        "Ouvrir"
      )
    ])
  ]);
}

export function renderNotebook(app) {
  const narrative = app.content.narratives.notebook;
  let kind = "all";
  let chapterId = "all";
  let query = "";

  const grid = el("div", { className: "notebook-grid" });
  const chipGroup = el("div", {
    className: "chips",
    attrs: { role: "group", "aria-label": "Filtrer le carnet" }
  });
  const chapterSelect = el("select", {
    className: "select",
    attrs: { "aria-label": "Filtrer par chapitre" }
  });
  const searchInput = el("input", {
    className: "input input--search",
    attrs: {
      type: "search",
      placeholder: "Rechercher dans le carnet…",
      "aria-label": "Rechercher dans le carnet"
    },
    on: {
      input: (event) => {
        query = event.target.value;
        refresh();
      }
    }
  });

  const countBadge = el("span", { className: "badge badge--quiet" });
  const sideCounts = el("div");
  const themesContainer = el("div", { className: "inline-list" });

  chapterSelect.appendChild(el("option", { attrs: { value: "all" }, text: "Tous les chapitres" }));
  for (const chapter of app.memoryNotebook.getChapterFilters()) {
    chapterSelect.appendChild(
      el("option", {
        attrs: { value: chapter.id },
        text: `Chapitre ${chapter.number} — ${chapter.title}`
      })
    );
  }
  chapterSelect.addEventListener("change", (event) => {
    chapterId = event.target.value;
    refresh();
  });

  const chips = [
    { id: "all", label: "Tout", countKey: "total" },
    { id: "document", label: "Documents", countKey: "documents" },
    { id: "person", label: "Personnes", countKey: "people" },
    { id: "event", label: "Dates", countKey: "events" }
  ];

  const chipButtons = [];
  for (const chip of chips) {
    const count = el("span", { className: "chip__count" });
    const button = el(
      "button",
      {
        className: "chip",
        attrs: { type: "button", "aria-pressed": chip.id === kind ? "true" : "false" },
        on: {
          click: () => {
            kind = chip.id;
            app.audio.play("click");
            for (const other of chipButtons) other.setAttribute("aria-pressed", "false");
            button.setAttribute("aria-pressed", "true");
            refresh();
          }
        }
      },
      [chip.label, count]
    );
    button.dataset.countKey = chip.countKey;
    chipButtons.push(button);
    chipGroup.appendChild(button);
  }

  function updateCounts() {
    const counts = app.memoryNotebook.getCounts();
    for (const button of chipButtons) {
      const key = button.dataset.countKey;
      const countNode = button.querySelector(".chip__count");
      if (countNode) countNode.textContent = ` (${counts[key] ?? 0})`;
    }
    countBadge.textContent = `${counts.total} ${counts.total === 1 ? "élément" : "éléments"} au carnet`;
    sideCounts.replaceChildren(
      el("p", {
        className: "small",
        text: `${counts.documents} ${counts.documents === 1 ? "document" : "documents"}`
      }),
      el("p", {
        className: "small",
        text: `${counts.people} ${counts.people === 1 ? "personne" : "personnes"}`
      }),
      el("p", {
        className: "small",
        text: `${counts.events} ${counts.events === 1 ? "date" : "dates"}`
      })
    );

    const themes = app.memoryNotebook.getThemes().slice(0, 10);
    themesContainer.replaceChildren();
    if (themes.length) {
      for (const theme of themes) {
        themesContainer.appendChild(
          el("span", { className: "badge badge--quiet", text: `${theme.tag} · ${theme.count}` })
        );
      }
    } else {
      themesContainer.appendChild(
        el("span", { className: "tiny", text: "Aucun thème pour l'instant." })
      );
    }
  }

  function refresh() {
    updateCounts();
    const items = app.memoryNotebook.filterItems({ kind, chapterId, query });
    grid.replaceChildren();

    if (items.length === 0) {
      const empty = el("div", { className: "empty-state" }, [
        el("div", { className: "empty-state__icon" }, icon("book", { size: 24 })),
        el("h2", {
          text: app.memoryNotebook.isEmpty() ? narrative.emptyTitle : "Aucun résultat"
        }),
        el(
          "p",
          {
            text: app.memoryNotebook.isEmpty()
              ? narrative.emptyText
              : "Aucun élément ne correspond à ces filtres. Essayez une autre recherche ou réinitialisez les filtres."
          }
        ),
        app.memoryNotebook.isEmpty()
          ? el(
              "a",
              {
                className: "btn btn--primary",
                attrs: { href: routes.chapters },
                on: { click: () => app.audio.play("click") }
              },
              "Parcourir les chapitres"
            )
          : el(
              "button",
              {
                className: "btn btn--quiet",
                attrs: { type: "button" },
                on: {
                  click: () => {
                    kind = "all";
                    chapterId = "all";
                    query = "";
                    searchInput.value = "";
                    chapterSelect.value = "all";
                    for (const button of chipButtons) {
                      button.setAttribute("aria-pressed", button.dataset.countKey === "total" ? "true" : "false");
                    }
                    refresh();
                  }
                }
              },
              "Réinitialiser les filtres"
            )
      ]);
      grid.appendChild(empty);
      return;
    }

    for (const item of items) {
      grid.appendChild(
        notebookCard(app, item, async (selected) => {
          const confirmed = await confirmDialog({
            title: "Retirer du carnet ?",
            message: `« ${selected.title} » sera retiré de votre carnet. Vous pourrez le consulter à nouveau depuis les chapitres.`,
            confirmLabel: "Retirer",
            cancelLabel: "Annuler",
            danger: true
          });
          if (!confirmed) return;
          app.memoryNotebook.remove(selected.kind, selected.id);
          app.audio.play("click");
          toast("Élément retiré du carnet.", { variant: "soft" });
          announce("Élément retiré du carnet.");
          refresh();
        })
      );
    }
  }

  const overall = app.progressSystem.getOverallProgress();

  const side = el("aside", { className: "notebook-side" }, [
    el("section", { className: "settings-section" }, [
      el("h2", { text: "Votre parcours" }),
      el("p", { text: "Quelques repères de progression. Aucune note n'est attribuée." }),
      el("div", { className: "stack", style: { gap: "0.6rem" } }, [
        el("div", {}, [
          el("div", { className: "scene-progress__row" }, [
            el("span", { text: "Chapitres" }),
            el("span", { text: `${overall.chaptersCompleted} / ${overall.chaptersTotal}` })
          ]),
          el("div", { className: "progress" }, [
            el("span", { className: "progress__bar", style: { width: `${overall.percentChapters}%` } })
          ])
        ]),
        el("p", {
          className: "small",
          text: `${overall.documentsRead} / ${overall.documentsTotal} documents consultés`
        }),
        el("p", {
          className: "small",
          text: `${overall.peopleMet} / ${overall.peopleTotal} personnes rencontrées`
        }),
        el("p", {
          className: "small",
          text: `${overall.activitiesCompleted} / ${overall.activitiesTotal} ateliers terminés`
        })
      ]),
      sideCounts
    ]),
    el("section", { className: "settings-section" }, [
      el("h2", { text: "Thèmes" }),
      themesContainer
    ]),
    el("section", { className: "settings-section" }, [
      el("h2", { text: "À propos du carnet" }),
      el("p", { className: "small", text: narrative.note }),
      el(
        "button",
        {
          className: "btn btn--secondary btn--small",
          attrs: { type: "button" },
          on: { click: () => app.openWithReturn(routes.timeline) }
        },
        [icon("timeline", { size: 15 }), "Ouvrir la chronologie"]
      )
    ])
  ]);

  const main = el("main", { id: "main" }, [
    el("section", { className: "page-intro" }, [
      el("div", { className: "container" }, [
        el("p", { className: "eyebrow", text: "Mémoire personnelle" }),
        el("h1", { text: narrative.title }),
        el("p", { className: "lead", text: narrative.lead }),
        el("div", { className: "cluster", style: { "margin-top": "0.9rem" } }, [countBadge])
      ])
    ]),
    el("section", { className: "page-content" }, [
      el("div", { className: "container" }, [
        el("div", { className: "notebook-layout" }, [
          el("div", { className: "notebook-main" }, [
            el("div", { className: "notebook-toolbar" }, [
              el("div", { className: "field" }, [
                el("label", { className: "field__label", attrs: { for: "notebook-search" }, text: "Rechercher" }),
                (() => {
                  searchInput.id = "notebook-search";
                  return searchInput;
                })()
              ]),
              chipGroup,
              el("div", { className: "field" }, [
                el("label", { className: "field__label", attrs: { for: "notebook-chapter" }, text: "Filtrer les documents par chapitre" }),
                (() => {
                  chapterSelect.id = "notebook-chapter";
                  return chapterSelect;
                })()
              ])
            ]),
            el("h2", { className: "sr-only", text: "Éléments du carnet" }),
            grid
          ]),
          side
        ])
      ])
    ])
  ]);

  refresh();

  return el("div", { className: "screen" }, [
    pageHeader(app, {
      title: "Carnet de mémoire",
      subtitle: "AVANT LE SILENCE",
      backTo: app.returnTo || routes.chapters,
      backLabel: "Retour",
      actions: [
        {
          label: "Chronologie",
          icon: "timeline",
          onClick: () => app.openWithReturn(routes.timeline)
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
