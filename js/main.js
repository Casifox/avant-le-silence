/**
 * AVANT LE SILENCE — point d'entrée.
 * JavaScript natif, modules ES, aucune compilation.
 */

import { Application } from "./core/application.js";
import { renderBootError } from "./ui/info-screens.js";

const app = new Application();
window.avantLeSilence = app;

app.boot().catch((error) => {
  console.error("[AVANT LE SILENCE] Échec du chargement", error);
  renderBootError(
    "Le jeu n'a pas pu lire ses fichiers de contenu. Vérifiez que le dossier est complet et que les fichiers JSON sont accessibles. Sur GitHub Pages, rechargez la page. En local, utilisez un petit serveur statique indiqué dans le README."
  );
});
