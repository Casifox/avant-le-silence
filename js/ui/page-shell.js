/**
 * En-têtes, actions et pied de page communs aux écrans intérieurs.
 */

import { el, icon } from "../utils/helpers.js";
import { APP_VERSION, routes } from "../utils/paths.js";

export function headerAction(app, { label, iconName, onClick, ariaLabel = null, className = "btn btn--icon" }) {
  return el(
    "button",
    {
      className,
      attrs: {
        type: "button",
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
        ...(!ariaLabel && label ? { title: label } : {})
      },
      on: {
        click: () => {
          app.audio.play("click");
          onClick();
        }
      }
    },
    [icon(iconName, { size: 20 }), label ? el("span", { className: "sr-only", text: label }) : null]
  );
}

export function headerTextAction(app, { label, iconName = null, onClick }) {
  return el(
    "button",
    {
      className: "btn btn--quiet btn--small",
      attrs: { type: "button" },
      on: {
        click: () => {
          app.audio.play("click");
          onClick();
        }
      }
    },
    [iconName ? icon(iconName, { size: 16 }) : null, el("span", { text: label })]
  );
}

export function pageHeader(app, options = {}) {
  const {
    title = "AVANT LE SILENCE",
    subtitle = "",
    backTo = null,
    backLabel = "Retour",
    actions = []
  } = options;

  const left = el("div", { className: "page-header__text" }, [
    subtitle ? el("span", { className: "page-header__sub", text: subtitle }) : null,
    el("p", { className: "page-header__title", text: title })
  ]);

  const right = el("div", { className: "page-header__actions" });

  if (backTo) {
    right.appendChild(
      headerAction(app, {
        label: backLabel,
        iconName: "arrow-left",
        onClick: () => app.navigate(backTo),
        ariaLabel: backLabel
      })
    );
  }

  for (const action of actions) {
    if (!action) continue;
    right.appendChild(
      headerAction(app, {
        label: action.label,
        iconName: action.icon,
        onClick: action.onClick,
        ariaLabel: action.ariaLabel || action.label
      })
    );
  }

  return el("header", { className: "page-header" }, [
    el("div", { className: "page-header__inner" }, [left, right])
  ]);
}

export function standardActions(app) {
  return [
    {
      label: "Carnet de mémoire",
      icon: "book",
      onClick: () => app.openWithReturn(routes.notebook)
    },
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
  ];
}

export function siteFooter(app) {
  const links = [
    ["Sources", routes.sources],
    ["Glossaire", routes.glossary],
    ["À propos", routes.about],
    ["Paramètres", routes.settings]
  ];

  return el("footer", { className: "site-footer" }, [
    el("div", { className: "site-footer__inner" }, [
      el("div", {}, [
        el("p", { text: `AVANT LE SILENCE · Version ${APP_VERSION}` }),
        el("p", {
          text: "Œuvre de médiation indépendante. Aucune donnée personnelle n'est collectée."
        })
      ]),
      el(
        "nav",
        { className: "site-footer__links", attrs: { "aria-label": "Informations et réglages" } },
        links.map(([label, route]) =>
          el(
            "button",
            {
              className: "btn btn--ghost btn--small",
              attrs: { type: "button" },
              on: {
                click: () => {
                  app.audio.play("click");
                  app.openWithReturn(route);
                }
              }
            },
            label
          )
        )
      )
    ])
  ]);
}

export function standardPage(app, { header, main, footer = true }) {
  return el("div", { className: "screen" }, [
    header,
    main,
    footer ? siteFooter(app) : null
  ]);
}
