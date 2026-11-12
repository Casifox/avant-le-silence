# Validation du contenu

## 1. Objectif

S'assurer que les données historiques, documentaires et narratives sont :

- valides techniquement ;
- cohérentes entre les fichiers ;
- correctement référencées ;
- conformes aux règles de fidélité du projet.

## 2. Fichiers contrôlés

| Fichier | Contenu |
|---|---|
| `content/fr/chapters.json` | Chapitres, scènes, points d'intérêt, ateliers, progression |
| `content/fr/people.json` | Fiches personnes et groupes |
| `content/fr/documents.json` | Fiches documentaires |
| `content/fr/timeline.json` | Repères chronologiques |
| `content/fr/glossary.json` | Glossaire |
| `content/fr/narratives.json` | Textes de l'interface et de médiation |
| `content/fr/sources.json` | Sources et références |

## 3. Contrôles automatiques

```bash
python tests/validate_content.py
```

Le script vérifie :

- la parseabilité des fichiers JSON ;
- l'unicité des identifiants ;
- l'existence des références croisées :
  - sources ;
  - documents ;
  - personnes ;
  - événements ;
  - chapitres ;
  - scènes ;
- les types de documents autorisés ;
- les statuts autorisés ;
- les fichiers d'illustration référencés ;
- les sections obligatoires de `narratives.json` ;
- la présence des couvertures et illustrations.

## 4. Contrôles manuels

### 4.1 Fidélité historique

- [ ] Chaque fait important est relié à une source.
- [ ] Les chiffres sont cohérents.
- [ ] Les dates sont cohérentes.
- [ ] Les noms sont correctement orthographiés.
- [ ] Les parcours de déportation sont distincts.
- [ ] Les informations non établies sont signalées.
- [ ] Aucune citation n'est inventée.
- [ ] Aucun dialogue historique n'est inventé.
- [ ] Aucun document n'est imité.
- [ ] Aucun portrait n'est présenté comme authentique.

### 4.2 Statuts

- `verified` : information recoupée avec une source fiable.
- `review_required` : information à confirmer ou référence à préciser.
- `permission_required` : reproduction soumise à autorisation.
- `illustrative` : reconstitution ou illustration contemporaine.

Vérifier que les statuts affichés dans les fiches correspondent aux données.

### 4.3 Droits

- [ ] Aucune image d'archive sans autorisation.
- [ ] Aucune capture d'écran de site tiers.
- [ ] Les crédits sont exacts.
- [ ] Les liens ne sont pas présentés comme des ressources du jeu.
- [ ] `ASSET_RIGHTS.md` est à jour.

### 4.4 Cohérence des références

- [ ] Chaque `sourceIds` existe dans `sources.json`.
- [ ] Chaque `relatedPeople` existe dans `people.json`.
- [ ] Chaque `relatedEvents` existe dans `timeline.json`.
- [ ] Chaque `readingList` existe.
- [ ] Chaque `required` existe.
- [ ] Chaque point d'intérêt pointe vers une fiche existante.
- [ ] Chaque atelier de chronologie référence des événements existants.
- [ ] Chaque `completion.next` existe ou vaut `conclusion`.

## 5. Règles de rédaction

- Phrases courtes.
- Ton sobre.
- Pas de dramatisation excessive.
- Pas de vocabulaire complexe inutile.
- Pas d'affirmation sans source.
- Pas de citation inventée.
- Pas de complément automatique des informations inconnues.
- Distinguer clairement :
  - fait historique ;
  - interprétation ;
  - texte de médiation ;
  - reconstitution illustrative.

## 6. Ajout d'une fiche

1. Choisir un identifiant stable.
2. Renseigner les champs disponibles.
3. Laisser `null` pour les champs inconnus.
4. Ajouter les sources.
5. Ajouter les personnes et événements liés.
6. Définir le statut historique.
7. Définir le statut des droits.
8. Ajouter le texte alternatif.
9. Ajouter la fiche à une scène (`readingList`).
10. Ajouter éventuellement l'élément aux `required`.
11. Lancer la validation.
12. Relire la fiche dans le jeu.

## 7. Ajout d'une source

1. Vérifier qu'il s'agit d'une source fiable.
2. Identifier l'institution.
3. Vérifier l'URL.
4. Noter la date de consultation.
5. Décrire ce que la source permet d'établir.
6. Ajouter les restrictions.
7. Définir le statut.
8. Mettre à jour `SOURCES.md` et `content/fr/sources.json`.
9. Lancer la validation.

## 8. Avant publication

- [ ] Exécuter `python tests/validate_content.py`.
- [ ] Relire `docs/HISTORICAL_REVIEW.md`.
- [ ] Vérifier `ASSET_RIGHTS.md`.
- [ ] Vérifier `SOURCES.md`.
- [ ] Vérifier les fiches affichées dans le jeu.
- [ ] Vérifier les liens externes.
- [ ] Documenter les corrections dans `CHANGELOG.md`.
