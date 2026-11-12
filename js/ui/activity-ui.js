/**
 * Ateliers documentaires : distinguer les preuves, classer un document,
 * remettre des événements dans l'ordre.
 */

import { el, icon, clear, shuffle } from "../utils/helpers.js";
import { announce } from "../utils/accessibility.js";

function markCompleted(app, activity) {
  const state = app.stateManager.get();
  if (!state.activitiesCompleted.includes(activity.id)) {
    app.stateManager.update((current) => {
      current.activitiesCompleted.push(activity.id);
    });
    app.events.emit("activity:completed", activity);
  }
}

function completionCard(app, activity, container, onRestart) {
  clear(container);
  const card = el("div", { className: "activity" }, [
    el("div", { className: "activity__done" }, [
      el("div", { className: "cluster" }, [
        icon("check", { size: 20 }),
        el("p", { text: activity.completion || "Atelier terminé." })
      ]),
      el(
        "button",
        {
          className: "btn btn--small btn--quiet",
          attrs: { type: "button" },
          on: { click: onRestart }
        },
        "Refaire l'atelier"
      )
    ])
  ]);
  container.appendChild(card);
}

function activityHeader(activity, index, total) {
  return el("div", { className: "activity__head" }, [
    el("div", {}, [
      el("p", { className: "eyebrow eyebrow--plain", text: "Atelier documentaire" }),
      el("h2", { text: activity.title })
    ]),
    total
      ? el("span", { className: "badge badge--quiet", text: `Question ${index + 1} sur ${total}` })
      : null
  ]);
}

function progressBlock(index, total) {
  if (!total) return null;
  return el("div", { className: "activity__progress" }, [
    el("div", { className: "progress" }, [
      el("span", {
        className: "progress__bar",
        style: { width: `${Math.round(((index + 1) / total) * 100)}%` }
      })
    ]),
    el("span", { text: `${index + 1} / ${total}` })
  ]);
}

function renderQuiz(app, activity, container) {
  const total = activity.items.length;
  let index = 0;
  let selected = null;
  let answered = false;

  function restart() {
    index = 0;
    selected = null;
    answered = false;
    render();
  }

  function render() {
    clear(container);
    const item = activity.items[index];

    const options = activity.categories.map((category) => {
      const button = el(
        "button",
        {
          className: "activity-option",
          attrs: { type: "button" },
          on: {
            click: () => {
              if (answered) return;
              selected = category.id;
              answered = true;
              app.audio.play("click");
              render();
            }
          }
        },
        category.label
      );
      if (answered) {
        if (category.id === item.answer) {
          button.dataset.state = "correct";
        } else if (category.id === selected) {
          button.dataset.state = "incorrect";
        } else {
          button.dataset.state = "muted";
        }
        button.disabled = true;
      }
      return button;
    });

    const correct = selected === item.answer;
    const correctLabel =
      activity.categories.find((category) => category.id === item.answer)?.label || item.answer;

    const feedback = answered
      ? el(
          "div",
          {
            className: `activity-feedback ${correct ? "activity-feedback--correct" : "activity-feedback--incorrect"}`,
            attrs: { role: "status", "aria-live": "polite" }
          },
          [
            el("strong", { text: correct ? "Bien vu. " : "À retenir. " }),
            el("span", { text: item.feedback }),
            correct ? null : el("span", { text: ` Réponse attendue : ${correctLabel}.` })
          ]
        )
      : null;

    const nextButton = answered
      ? el(
          "button",
          {
            className: "btn btn--primary",
            attrs: { type: "button" },
            on: {
              click: () => {
                if (index < total - 1) {
                  index += 1;
                  selected = null;
                  answered = false;
                  render();
                } else {
                  markCompleted(app, activity);
                  app.audio.play("confirm");
                  announce("Atelier terminé.");
                  completionCard(app, activity, container, restart);
                }
              }
            }
          },
          index < total - 1 ? "Question suivante" : "Terminer l'atelier"
        )
      : null;

    const card = el("div", { className: "activity" }, [
      activityHeader(activity, index, total),
      el("p", { className: "activity__intro", text: activity.intro }),
      progressBlock(index, total),
      el("p", { className: "activity__question", text: item.text }),
      el("div", { className: "activity-options" }, options),
      feedback,
      el("div", { className: "activity-actions" }, [
        nextButton,
        el(
          "button",
          {
            className: "btn btn--quiet btn--small",
            attrs: { type: "button" },
            on: { click: restart }
          },
          "Recommencer l'atelier"
        )
      ])
    ]);
    container.appendChild(card);
  }

  render();
}

function renderChronology(app, activity, container) {
  const correctOrder = app.chronologySystem.getCorrectOrder(activity.eventIds);
  let available = shuffle(correctOrder);
  let order = [];
  let result = null;

  function restart() {
    available = shuffle(correctOrder);
    order = [];
    result = null;
    render();
  }

  function addEvent(id) {
    available = available.filter((eventId) => eventId !== id);
    order.push(id);
    app.audio.play("click");
    render();
  }

  function removeEvent(index) {
    const [id] = order.splice(index, 1);
    available.push(id);
    app.audio.play("click");
    render();
  }

  function verify() {
    result = app.chronologySystem.checkOrder(order, correctOrder);
    markCompleted(app, activity);
    app.audio.play("confirm");
    announce("Chronologie vérifiée.");
    render();
  }

  function render() {
    clear(container);

    const eventLabel = (id, index = null) => {
      const event = app.chronologySystem.getEvent(id);
      if (!event) return null;
      const classes = ["order-item"];
      if (result) {
        const check = result[index];
        classes.push(check?.correct ? "order-item--correct" : "order-item--incorrect");
      }
      return el(
        "li",
        { className: classes.join(" ") },
        [
          index !== null ? el("span", { className: "order-item__index", text: String(index + 1) }) : null,
          el("span", { className: "order-item__text", text: `${event.displayDate} — ${event.title}` }),
          index !== null && !result
            ? el(
                "button",
                {
                  className: "order-item__remove",
                  attrs: { type: "button", "aria-label": `Retirer ${event.title}` },
                  on: { click: () => removeEvent(index) }
                },
                icon("close", { size: 15 })
              )
            : null
        ]
      );
    };

    const bank = el(
      "ul",
      { className: "order-list order-bank" },
      available.map((id) => {
        const event = app.chronologySystem.getEvent(id);
        if (!event) return null;
        return el("li", {}, [
          el(
            "button",
            {
              className: "order-item",
              attrs: { type: "button" },
              on: { click: () => addEvent(id) }
            },
            [
              icon("plus", { size: 14 }),
              el("span", { text: `${event.displayDate} — ${event.title}` })
            ]
          )
        ]);
      })
    );

    if (available.length === 0) {
      bank.appendChild(el("li", { className: "order-empty", text: "Tous les événements sont placés." }));
    }

    const sequence = el(
      "ul",
      { className: "order-list" },
      order.length
        ? order.map((id, index) => eventLabel(id, index))
        : [
            el("li", {
              className: "order-empty",
              text: "Cliquez sur les événements pour construire la chronologie."
            })
          ]
    );

    const resultBlock = result
      ? el(
          "div",
          {
            className: `activity-feedback ${result.every((item) => item.correct) ? "activity-feedback--correct" : "activity-feedback--incorrect"}`,
            attrs: { role: "status", "aria-live": "polite" }
          },
          [
            el("strong", {
              text: result.every((item) => item.correct)
                ? "Chronologie correcte. "
                : "Chronologie à revoir. "
            }),
            el("span", {
              text: result.every((item) => item.correct)
                ? "Vous avez reconstitué l'ordre des événements."
                : "Les éléments signalés en rouge ne sont pas à la bonne place. Le corrigé ci-dessous présente l'ordre attendu."
            }),
            result.some((item) => !item.correct)
              ? el("ol", { className: "summary-list", style: { "margin-top": "0.7rem" } }, correctOrder.map((id) => {
                  const event = app.chronologySystem.getEvent(id);
                  return el("li", { text: `${event.displayDate} — ${event.title}` });
                }))
              : null
          ]
        )
      : null;

    const card = el("div", { className: "activity" }, [
      activityHeader(activity, 0, 0),
      el("p", { className: "activity__intro", text: activity.intro }),
      el("div", { className: "order-columns" }, [
        el("div", { className: "order-column" }, [
          el("h3", { text: "Événements disponibles" }),
          bank
        ]),
        el("div", { className: "order-column" }, [
          el("h3", { text: "Votre chronologie" }),
          sequence
        ])
      ]),
      resultBlock,
      el("div", { className: "activity-actions" }, [
        !result
          ? el(
              "button",
              {
                className: "btn btn--primary",
                attrs: { type: "button", ...(order.length !== correctOrder.length ? { disabled: true } : {}) },
                on: { click: verify }
              },
              "Vérifier l'ordre"
            )
          : null,
        el(
          "button",
          {
            className: "btn btn--quiet btn--small",
            attrs: { type: "button" },
            on: { click: restart }
          },
          "Recommencer"
        )
      ])
    ]);

    container.appendChild(card);
  }

  render();
}

export function renderActivity(app, activity, container) {
  if (!activity || !container) return;

  const alreadyDone = app.stateManager.get().activitiesCompleted.includes(activity.id);
  const restart = () => {
    if (activity.type === "chronology") {
      renderChronology(app, activity, container);
    } else {
      renderQuiz(app, activity, container);
    }
  };

  if (alreadyDone) {
    completionCard(app, activity, container, restart);
    return;
  }

  if (activity.type === "chronology") {
    renderChronology(app, activity, container);
  } else {
    renderQuiz(app, activity, container);
  }
}
