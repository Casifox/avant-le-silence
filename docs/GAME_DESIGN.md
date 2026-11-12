# Game design — AVANT LE SILENCE

## 1. Intention

**AVANT LE SILENCE** est une expérience narrative documentaire. Le joueur n'incarne pas une victime et ne peut pas modifier le résultat historique. Il traverse un parcours de découverte fondé sur des documents, des dates, des personnes et des textes de médiation.

La progression repose sur la compréhension, pas sur la performance.

## 2. Boucle de jeu

1. Arriver dans un espace.
2. Observer l'illustration et ses points d'intérêt.
3. Ouvrir une fiche documentaire ou une fiche personne.
4. Lire les informations, le contexte et les limites de la source.
5. Ajouter éventuellement l'élément au carnet.
6. Réaliser un atelier documentaire quand il est proposé.
7. Consulter les éléments essentiels.
8. Terminer le chapitre et lire le bilan.
9. Poursuivre vers le chapitre suivant ou revenir au carnet.

Aucun chronomètre, aucun score, aucun classement, aucune récompense morale.

## 3. Structure

### Prologue

- Accueil.
- Avertissement de contenu.
- Introduction éditoriale.
- Sélection des chapitres.

### Chapitre I — La maison

- Bienvenue à Izieu.
- Un refuge : Sabine et Miron Zlatin.
- Les enfants.
- Une vie quotidienne.

### Chapitre II — Les traces

- Les photographies.
- Les lettres.
- Les dessins.
- Le travail d'archive.
- Ateliers : distinguer les preuves, classer un document.

### Chapitre III — Le 6 avril 1944

- Le contexte.
- La rafle.
- Le parcours : Montluc, Drancy, convois, Auschwitz-Birkenau, Reval.
- Les destins.
- Le témoignage.
- Atelier : remettre les événements dans l'ordre.
- Avertissement renforcé avant le chapitre.

### Chapitre IV — Après

- Le retour.
- Le souvenir.
- La justice.
- Les archives.
- Le mémorial.
- Conclusion.

## 4. Mécaniques

### 4.1 Observer

Chaque scène propose des points d'intérêt numérotés. Ils ouvrent :

- une fiche documentaire ;
- une fiche personne ;
- un repère de médiation.

Les points d'intérêt sont également disponibles sous forme de liste pour le clavier et les lecteurs d'écran.

### 4.2 Consulter une fiche

Une fiche documentaire contient :

- un cadre graphique indiquant qu'aucune archive n'est reproduite ;
- le type, le statut et les droits ;
- les métadonnées disponibles ;
- la description, le contexte et ce que le document permet d'établir ;
- les personnes et les repères liés ;
- les sources officielles ;
- l'ajout au carnet.

Les valeurs inconnues sont affichées comme non établies. Elles ne sont jamais inventées.

### 4.3 Ajouter au carnet

Le carnet conserve les documents, personnes et dates choisis par le joueur. Il permet :

- la recherche ;
- le filtrage par type et par chapitre ;
- la consultation ;
- la suppression avec confirmation ;
- une synthèse finale.

### 4.4 Ateliers

**Distinguer les preuves** : classer une affirmation comme confirmée, interprétée ou non établie.

**Classer un document** : associer une description à un type de document.

**Ordonner une chronologie** : placer des événements dans l'ordre, sans chronomètre. Une validation affiche les corrections et l'ordre attendu.

Les ateliers n'attribuent pas de note. Ils enregistrent seulement leur réalisation.

### 4.5 Progression

Chaque scène possède des éléments essentiels (documents ou personnes). Un chapitre peut être terminé lorsque tous les éléments essentiels ont été consultés. Le joueur peut tenter de terminer le chapitre à tout moment ; une fiche liste alors les éléments manquants.

Le déblocage des chapitres est séquentiel.

### 4.6 Sauvegarde

La sauvegarde est automatique :

- à chaque scène visitée ;
- à chaque document lu ;
- à chaque personne rencontrée ;
- à chaque atelier terminé ;
- à chaque modification du carnet ;
- à chaque changement de préférence ;
- à chaque chapitre terminé.

En cas d'indisponibilité de `localStorage`, un repli en mémoire permet de terminer la session.

## 5. Modèle d'état

```json
{
  "version": 1,
  "createdAt": "2026-11-11T00:00:00.000Z",
  "updatedAt": "2026-11-11T00:00:00.000Z",
  "lastRoute": "#/accueil",
  "warningAcknowledged": false,
  "chapterWarnings": {},
  "chapters": {
    "chapitre-1": {
      "visitedScenes": [],
      "completed": false,
      "completedAt": null
    }
  },
  "documentsRead": [],
  "peopleMet": [],
  "activitiesCompleted": [],
  "eventsSeen": [],
  "notebook": {
    "documents": [],
    "people": [],
    "events": []
  },
  "preferences": {
    "textSize": "normal",
    "contrast": "normal",
    "reducedMotion": false,
    "music": 0.32,
    "sfx": 0.5,
    "muted": false
  },
  "conclusionSeen": false
}
```

La sauvegarde est validée et normalisée avant utilisation. Les identifiants inconnus sont retirés. Les versions futures sont refusées proprement.

## 6. Contenu

Le contenu est séparé du code, dans `content/fr/`.

- `chapters.json` : chapitres, scènes, points d'intérêt, ateliers, conditions de progression.
- `people.json` : fiches personnes et groupes.
- `documents.json` : fiches documentaires.
- `timeline.json` : repères chronologiques.
- `glossary.json` : définitions.
- `narratives.json` : accueil, avertissements, prologue, conclusion, écrans d'erreur.
- `sources.json` : sources et références.

Les identifiants sont stables. Toute modification doit être répercutée dans les références croisées.

## 7. Routes

| Route | Écran |
|---|---|
| `#/accueil` | Accueil |
| `#/avertissement` | Avertissement de contenu |
| `#/introduction` | Prologue |
| `#/chapitres` | Sélection des chapitres |
| `#/chapitre/:id` | Entrée de chapitre |
| `#/chapitre/:id/scene/:sceneId` | Scène |
| `#/chapitre/:id/bilan` | Bilan |
| `#/chronologie` | Chronologie |
| `#/carnet` | Carnet |
| `#/sources` | Sources |
| `#/glossaire` | Glossaire |
| `#/apropos` | À propos |
| `#/parametres` | Paramètres |
| `#/conclusion` | Conclusion |
| `#/fin` | Écran final |

La navigation utilise le hash, ce qui évite toute configuration serveur et fonctionne sur GitHub Pages.

## 8. Architecture

```text
main.js
  └── Application
      ├── chargement des JSON
      ├── validation du contenu
      ├── StateManager
      ├── systèmes (exploration, documents, chronologie, carnet, progression, audio)
      ├── Navigation (hash)
      └── écrans UI
```

### Principes

- Aucun backend.
- Aucune compilation.
- Aucune dépendance externe.
- Modules ES natifs.
- DOM construit sans `innerHTML` non contrôlé.
- Modales accessibles.
- Sauvegarde validée.
- Contenu séparé du code.

## 9. Direction artistique

Palette :

- ivoire ;
- beige papier ;
- brun doux ;
- gris anthracite ;
- vert sauge ;
- bleu ardoise ;
- noir doux.

Le style évoque le papier, le bois, la lumière naturelle et les espaces d'exposition. Les illustrations sont originales, sans visages inventés et sans faux documents.

## 10. Son

L'ambiance est synthétisée avec la Web Audio API. Elle ne démarre qu'après une interaction. Les volumes sont réglables et le son peut être coupé.

Aucune voix synthétique ne fait parler une victime.

## 11. Accessibilité

- Structure de titres cohérente.
- Landmarks et lien d'évitement.
- Focus visible.
- Piège de focus dans les modales.
- Alternatives textuelles.
- Tailles de texte.
- Contraste élevé.
- Réduction des mouvements.
- Zones tactiles de 44 px.
- Aucune information uniquement par la couleur.
- Avertissements de contenu.

## 12. Ce que le jeu ne fait pas

- Il ne montre pas de scène de violence.
- Il ne crée pas de faux documents.
- Il n'invente pas de témoignages.
- Il ne fait pas parler les victimes.
- Il ne donne pas de note.
- Il ne chronomètre pas la lecture.
- Il ne permet pas de modifier le résultat historique.
- Il ne transforme pas les victimes en personnages contrôlables.
