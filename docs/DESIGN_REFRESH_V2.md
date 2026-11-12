# Refonte visuelle v2 — catalogue d'exposition

Date : 2026-11-12. Branche : `design/refresh-v2`.

## Objectif

Donner à AVANT LE SILENCE une direction artistique de catalogue d'exposition imprimé, sans modifier le contenu historique, les données JSON, les sources ni le gameplay. Le site reste statique, hors-ligne et sans dépendance ajoutée.

## Principes appliqués

- **Palette** : ivoire plus chaud (`#f2eadb`), encre plus dense (`#1c1915`), brun, sauge, ardoise et ambre conservés. Aucun dégradé décoratif ; texture de papier locale conservée.
- **Typographie** : serif éditorial pour les titres, sans-serif système pour l'interface, monospace pour les métadonnées, cotes, dates et légendes. Surtitre à 11 px avec approche large, corps à 17 px, légende à 12–13 px, chiffres tabulaires.
- **Composition** : grille éditoriale, filets de 1 px, numérotation de catalogue (`N° 01` à `N° 04`, index de scène `01`…), suppression des cartes flottantes, des ombres décoratives et des grands rayons.
- **Boutons** : rectangles à bord de 1,5 px, libellés en capitales espacées, inversion au survol, focus visible de 3 px.
- **Prologue** : colonne de lecture + colonne latérale avec planche illustrée, légende, repères de visite et note sur les archives.
- **Avertissements** : mise en page en deux colonnes avec rail de catalogue et filet vertical, au lieu d'une carte collée à gauche.
- **Scènes** : illustration maintenue visible pendant la lecture sur grand écran, panneau de lecture séparé par un filet.
- **Accessibilité** : contrastes AA vérifiés sur les couples de couleurs principaux, focus visible, `prefers-reduced-motion`, contraste élevé et tailles de texte conservés.

## Fichiers modifiés

- `css/global.css`, `css/typography.css`, `css/layout.css`, `css/interface.css`, `css/documents.css`, `css/chapters.css`, `css/responsive.css`, `css/accessibility.css`.
- `index.html` : seule la chaîne de version des feuilles de style et du module JS change (`?v=0.8.0-d2`), pour éviter un cache périmé.
- `js/ui/home-screen.js` : ajout de la planche illustrée et de sa légende dans la colonne latérale du prologue. Aucun texte historique ajouté ; la légende réutilise `narratives.home.visualCaption`.
- `js/ui/chapter-screen.js` : attributs de numérotation de catalogue sur les fiches de chapitre et l'en-tête de scène. Aucun changement de logique.

## Non modifié

- `content/fr/*.json` et le contenu éditorial/historique.
- Systèmes de progression, de sauvegarde, de carnet, d'activités et de documents.
- Sources, avertissements, paramètres, fonctionnalités bilingues et fichiers de test.

## Vérifications exécutées

- `python tests/validate_content.py` : 4 chapitres, 18 scènes, 16 documents, 8 personnes, 13 événements, 9 sources, 16 termes ; aucune erreur.
- `node --check` sur `js/ui/home-screen.js` et `js/ui/chapter-screen.js` : OK.
- Playwright (Chromium) sur serveur statique local : chargement de l'accueil, de l'avertissement, du prologue, des chapitres, d'une scène, des sources, du glossaire, d'À propos, des paramètres, du carnet, de la chronologie, d'une fiche documentaire, d'un atelier et de la conclusion.
- 0 erreur console et 0 erreur de page sur les parcours testés.
- Aucun débordement horizontal : 1366 px, 390 px et 360 px, en taille de texte normale ; 1366 px et 390 px en taille « très grand ».
- Captures : `C:\Users\Noah\AppData\Local\Temp\opencode\design-audit\after-avant-desktop.png`, `after-avant-mobile.png`, `after-avant-prologue.png`, plus `after-avant-warning.png`.

## Limites

- Tests effectués avec Chromium headless uniquement ; pas de test sur appareil réel ni sur lecteur d'écran.
- Pas d'audit Lighthouse automatisé lors de cette refonte.
- Les contrastes ont été calculés sur les couples de couleurs du système, pas mesurés sur chaque état de composant.
- La version anglaise du contenu n'existe toujours pas dans le dépôt ; elle n'a pas été modifiée.
