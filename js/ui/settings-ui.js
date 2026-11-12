/**
 * Paramètres : affichage, accessibilité, son et sauvegarde locale.
 */

import { el, icon } from "../utils/helpers.js";
import { routes, APP_VERSION } from "../utils/paths.js";
import { announce } from "../utils/accessibility.js";
import { pageHeader, siteFooter } from "./page-shell.js";
import { confirmDialog } from "./modal.js";

function segmented(app, options, current, onChange, label) {
  const group = el("div", {
    className: "segmented",
    attrs: { role: "group", "aria-label": label }
  });

  for (const option of options) {
    const button = el(
      "button",
      {
        attrs: {
          type: "button",
          "aria-pressed": option.value === current ? "true" : "false"
        },
        on: {
          click: () => {
            app.audio.play("click");
            onChange(option.value);
            for (const child of group.querySelectorAll("button")) {
              child.setAttribute("aria-pressed", "false");
            }
            button.setAttribute("aria-pressed", "true");
          }
        }
      },
      option.label
    );
    group.appendChild(button);
  }

  return group;
}

function settingRow(label, hint, control) {
  return el("div", { className: "setting-row" }, [
    el("div", {}, [
      el("span", { className: "setting-row__label", text: label }),
      hint ? el("span", { className: "setting-row__hint", text: hint }) : null
    ]),
    control
  ]);
}

function rangeControl(app, key, label, value) {
  const output = el("output", {
    className: "badge badge--quiet",
    text: `${Math.round(value * 100)} %`,
    attrs: { for: `${key}-range` }
  });

  const input = el("input", {
    className: "range",
    attrs: {
      id: `${key}-range`,
      type: "range",
      min: "0",
      max: "100",
      step: "5",
      value: String(Math.round(value * 100)),
      "aria-label": label
    },
    on: {
      input: (event) => {
        const next = Number(event.target.value) / 100;
        output.textContent = `${event.target.value} %`;
        app.stateManager.setPreference(key, next);
        app.audio.applyPreferences(app.stateManager.get().preferences);
      },
      change: () => {
        app.audio.start();
        app.audio.play("click");
        announce(`${label} réglé.`);
      }
    }
  });

  return el("div", { className: "cluster", style: { gap: "0.6rem" } }, [input, output]);
}

export function renderSettings(app) {
  const preferences = app.stateManager.get().preferences;
  const info = app.stateManager.getInfo();
  const backTo = app.returnTo && app.returnTo !== routes.settings ? app.returnTo : routes.home;

  const displaySection = el("section", { className: "settings-section" }, [
    el("h2", { text: "Affichage et accessibilité" }),
    el("p", {
      text: "Ces réglages sont enregistrés dans votre navigateur et s'appliquent immédiatement."
    }),
    settingRow(
      "Taille du texte",
      "Agrandit l'ensemble des textes de l'interface.",
      segmented(
        app,
        [
          { value: "normal", label: "Normal" },
          { value: "large", label: "Grand" },
          { value: "xlarge", label: "Très grand" }
        ],
        preferences.textSize,
        (value) => {
          app.stateManager.setPreference("textSize", value);
          app.applyPreferences();
          announce("Taille du texte modifiée.");
        },
        "Taille du texte"
      )
    ),
    settingRow(
      "Contraste",
      "Renforce les contrastes et les bordures.",
      segmented(
        app,
        [
          { value: "normal", label: "Standard" },
          { value: "high", label: "Élevé" }
        ],
        preferences.contrast,
        (value) => {
          app.stateManager.setPreference("contrast", value);
          app.applyPreferences();
          announce("Contraste modifié.");
        },
        "Contraste"
      )
    ),
    settingRow(
      "Réduire les mouvements",
      "Diminue les animations et les transitions.",
      el("label", { className: "check" }, [
        el("input", {
          attrs: { type: "checkbox", ...(preferences.reducedMotion ? { checked: true } : {}) },
          on: {
            change: (event) => {
              app.stateManager.setPreference("reducedMotion", event.target.checked);
              app.applyPreferences();
              if (event.target.nextElementSibling) {
                event.target.nextElementSibling.textContent = event.target.checked ? "Activé" : "Désactivé";
              }
              app.audio.play("click");
              announce(event.target.checked ? "Animations réduites." : "Animations rétablies.");
            }
          }
        }),
        el("span", { text: preferences.reducedMotion ? "Activé" : "Désactivé" })
      ])
    )
  ]);

  const soundSection = el("section", { className: "settings-section" }, [
    el("h2", { text: "Son" }),
    el("p", {
      text: "L'ambiance sonore est synthétisée localement. Elle ne démarre qu'après une interaction et peut être coupée à tout moment."
    }),
    settingRow(
      "Couper le son",
      "Désactive la musique d'ambiance et les effets.",
      el("label", { className: "check" }, [
        el("input", {
          attrs: { type: "checkbox", ...(preferences.muted ? { checked: true } : {}) },
          on: {
            change: (event) => {
              app.stateManager.setPreference("muted", event.target.checked);
              app.audio.applyPreferences(app.stateManager.get().preferences);
              if (!event.target.checked) app.audio.start();
              if (event.target.nextElementSibling) {
                event.target.nextElementSibling.textContent = event.target.checked
                  ? "Silencieux"
                  : "Son activé";
              }
              app.audio.play("click");
              announce(event.target.checked ? "Son coupé." : "Son activé.");
            }
          }
        }),
        el("span", { text: preferences.muted ? "Silencieux" : "Son activé" })
      ])
    ),
    settingRow(
      "Volume de la musique",
      "Ambiance très discrète, sans voix.",
      rangeControl(app, "music", "Volume de la musique", preferences.music)
    ),
    settingRow(
      "Volume des effets",
      "Sons d'ouverture, de navigation et de validation.",
      rangeControl(app, "sfx", "Volume des effets", preferences.sfx)
    )
  ]);

  const storageSection = el("section", { className: "settings-section" }, [
    el("h2", { text: "Sauvegarde locale" }),
    el("p", {
      text:
        "Le jeu ne collecte aucune donnée personnelle. La progression est enregistrée uniquement dans ce navigateur, avec localStorage."
    }),
    el("div", { className: `notice ${info.persistent ? "notice--quiet" : "notice--warning"}` }, [
      icon(info.persistent ? "info" : "warning", { size: 18 }),
      el("span", {
        text: info.persistent
          ? "La sauvegarde locale est disponible. Vous pouvez fermer le jeu et reprendre plus tard sur ce navigateur."
          : "La sauvegarde locale est indisponible. La progression reste valable pendant cette session, mais elle ne sera pas conservée après fermeture."
      })
    ]),
    el("div", { className: "divider" }),
    el("div", { className: "cluster", style: { "justify-content": "space-between" } }, [
      el("span", { className: "small", text: `Version ${APP_VERSION}` }),
      el(
        "button",
        {
          className: "btn btn--danger btn--small",
          attrs: { type: "button" },
          on: {
            click: async () => {
              const confirmed = await confirmDialog({
                title: "Supprimer les données locales ?",
                message: [
                  "Cette action efface la progression, le carnet de mémoire et les préférences enregistrées dans ce navigateur.",
                  "Elle ne peut pas être annulée."
                ],
                confirmLabel: "Supprimer",
                cancelLabel: "Annuler",
                danger: true
              });
              if (!confirmed) return;
              app.resetProgress();
            }
          }
        },
        [icon("trash", { size: 15 }), "Supprimer les données locales"]
      )
    ])
  ]);

  const helpSection = el("section", { className: "settings-section" }, [
    el("h2", { text: "Navigation et raccourcis" }),
    el("p", {
      text: "Toutes les actions sont accessibles à la souris, au clavier et au tactile. Les raccourcis sont facultatifs."
    }),
    el("ul", { className: "summary-list" }, [
      el("li", {}, [el("span", { className: "kbd", text: "N" }), " Ouvrir ou fermer le carnet de mémoire"]),
      el("li", {}, [el("span", { className: "kbd", text: "T" }), " Ouvrir la chronologie"]),
      el("li", {}, [el("span", { className: "kbd", text: "Échap" }), " Fermer une fiche ou une modale"]),
      el("li", {}, [el("span", { className: "kbd", text: "Tab" }), " Naviguer entre les éléments interactifs"])
    ]),
    el("p", {
      className: "tiny",
      style: { "margin-top": "0.8rem" },
      text: "Les raccourcis sont désactivés lorsque vous saisissez du texte dans un champ."
    })
  ]);

  const main = el("main", { id: "main" }, [
    el("section", { className: "page-intro" }, [
      el("div", { className: "container" }, [
        el("p", { className: "eyebrow", text: "Réglages" }),
        el("h1", { text: "Paramètres" }),
        el("p", {
          className: "lead",
          text: "Adapter le confort de lecture, le son et la sauvegarde. Aucun réglage n'affecte le contenu historique."
        })
      ])
    ]),
    el("section", { className: "page-content" }, [
      el("div", { className: "container" }, [
        el("div", { className: "settings-grid" }, [
          displaySection,
          soundSection,
          storageSection,
          helpSection
        ]),
        el("p", { className: "tiny", style: { "margin-top": "1.4rem" } }, [
          "Voir aussi ",
          el(
            "button",
            {
              className: "btn btn--ghost btn--small",
              attrs: { type: "button" },
              on: { click: () => app.openWithReturn(routes.sources) }
            },
            "les sources"
          ),
          " et ",
          el(
            "button",
            {
              className: "btn btn--ghost btn--small",
              attrs: { type: "button" },
              on: { click: () => app.openWithReturn(routes.about) }
            },
            "les informations sur le projet"
          ),
          "."
        ])
      ])
    ])
  ]);

  return el("div", { className: "screen" }, [
    pageHeader(app, {
      title: "Paramètres",
      subtitle: "AVANT LE SILENCE",
      backTo,
      backLabel: "Retour"
    }),
    main,
    siteFooter(app)
  ]);
}
