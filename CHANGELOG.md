# Changelog

Toutes les modifications notables du projet sont documentées ici.

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).
Versionnement sémantique : `MAJOR.MINOR.PATCH`.

## [Non publié]

### Modifié

- Refonte visuelle « catalogue d'exposition / archive imprimée » (branche `design/refresh-v2`, 2026-11-12) : palette papier/encre plus tranchée, filets de 1 px, boutons rectangulaires à inversion, échelle typographique éditoriale, prologue rééquilibré avec une planche illustrée et ses repères, scènes et chapitres numérotés comme un catalogue. Aucun contenu historique, aucune donnée JSON et aucun gameplay modifiés. Détail et tests : `docs/DESIGN_REFRESH_V2.md`.

### À faire avant la version 1.0.0

- Relecture historique indépendante.
- Autorisations de reproduction pour les documents et images d'archives.
- Intégration éventuelle de reproductions autorisées.
- Vérification des références judiciaires du procès Barbie.
- Précision de la date des exécutions à Reval.
- Tests multi-navigateurs et lecteurs d'écran.
- Traduction anglaise éventuelle.

## [0.8.0] — 2026-11-11

### Ajouté

- Application statique complète en HTML, CSS et JavaScript natif.
- Quatre chapitres, 18 scènes et quatre bilans de chapitre.
- 16 fiches documentaires et 8 fiches personnes.
- 13 repères chronologiques filtrables.
- Trois ateliers : distinguer les preuves, classer un document, ordonner une chronologie.
- Carnet de mémoire avec recherche, filtres, suppression et synthèse finale.
- Système de progression par éléments essentiels.
- Sauvegarde locale avec validation, migrations et repli en mémoire.
- Paramètres : taille du texte, contraste, réduction des mouvements, volumes, suppression des données.
- Ambiance sonore synthétisée avec la Web Audio API.
- Illustration et direction artistique originales.
- Avertissements de contenu.
- Conclusion personnalisée et écran final.
- Documentation : README, sources, droits, confidentialité, contribution, game design, revue historique, checklist de publication.
- Tests manuels et script de validation du contenu.
- Page 404 et fichier `.nojekyll`.

### Sécurité et accessibilité

- Navigation clavier complète.
- Piège de focus dans les modales.
- Alternatives textuelles.
- Respect de `prefers-reduced-motion`.
- Contraste élevé.
- Tailles de texte ajustables.
- Zones tactiles principales de 44 px.
- Liens externes ouverts dans un nouvel onglet avec `rel="noopener noreferrer"`.
- Aucun `innerHTML` avec des données non contrôlées.
- Validation des données JSON au chargement.

### Vérifications

- Audit Lighthouse sur les écrans principaux : accessibilité 100, bonnes pratiques 100, SEO 100.
- Test des parcours complets sur serveur local.
- Test des viewports 360 × 800, 390 × 844, 768 × 1024 et 1280 × 720.
- Aucun débordement horizontal constaté sur ces viewports.
- Aucune erreur JavaScript bloquante lors du parcours de test.

### Limites connues

- Aucune image d'archive n'est reproduite.
- Aucune citation de témoignage n'est reproduite.
- La liste nominative complète des enfants n'est pas intégrée.
- La relecture historique indépendante reste à faire.
- Les références judiciaires du procès Barbie restent à préciser.
- La version anglaise n'est pas commencée.
- Les tests multi-navigateurs et lecteurs d'écran restent à compléter.

## [0.5.0] — Non publié

### Ajouté

- Première version jouable de bout en bout : accueil, avertissement, introduction, chapitres, carnet, chronologie, conclusion.
- Premières fiches documentaires et personnes.
- Sauvegarde locale.
- Interface responsive.
- Illustrations originales.

## [0.3.0] — Non publié

### Ajouté

- Premiers chapitres et premières scènes.
- Navigation par hash.
- Structure des données JSON.
- Premiers styles éditoriaux.

## [0.2.0] — Non publié

### Ajouté

- Première mécanique documentaire.
- Visionneuse de fiche.
- Début du carnet.

## [0.1.0] — Non publié

### Ajouté

- Prototype de navigation.
- Écran d'accueil.
- Structure initiale du dépôt.

---

## Règles de maintenance

- Toute correction historique doit être documentée ici.
- Toute modification de contenu doit être vérifiée avant publication.
- Toute ressource ajoutée doit être enregistrée dans `ASSET_RIGHTS.md`.
- Toute modification de version doit être cohérente avec `js/utils/paths.js`.
