# Contribuer à AVANT LE SILENCE

Merci de l'intérêt porté au projet. Avant toute contribution, lire les principes ci-dessous.

## 1. Règle fondamentale

**On ne joue pas avec leur tragédie. On découvre leur histoire.**

Toute contribution doit respecter les victimes, les témoins, leurs familles et le travail des historiens.

## 2. Rigueur historique

Il est interdit de :

- inventer une lettre, un dessin ou un document ;
- inventer un témoignage, un souvenir ou une conversation ;
- attribuer des pensées ou des paroles à une personne réelle sans source ;
- créer un faux document historique ;
- utiliser une voix synthétique pour faire parler une victime ;
- reconstituer une scène de violence ;
- modifier le sens d'un document ;
- transformer l'histoire en énigme dont la résolution changerait le résultat réel.

Toute information doit être reliée à une source et classée dans l'une des catégories prévues :

- `verified` — fait vérifié ;
- `review_required` — vérification nécessaire ;
- `permission_required` — droit de reproduction à obtenir ;
- `illustrative` — reconstitution pédagogique.

Lorsque les sources ne permettent pas d'établir une information, le jeu doit l'indiquer. Les lacunes ne doivent jamais être comblées par une invention.

## 3. Droits et ressources

Avant d'ajouter une image, un son, un texte ou un document :

1. vérifier les droits ;
2. obtenir une autorisation si nécessaire ;
3. enregistrer le crédit exact ;
4. mettre à jour [`ASSET_RIGHTS.md`](ASSET_RIGHTS.md) ;
5. ajouter le texte alternatif ;
6. tester l'affichage.

Les documents d'archives ne doivent pas être republiés sans autorisation. Les captures d'écran de sites tiers ne sont pas acceptées comme ressources du jeu.

## 4. Style de code

Le projet utilise :

- HTML5 ;
- CSS3 ;
- JavaScript natif en modules ES ;
- SVG ;
- aucune compilation ;
- aucune dépendance externe obligatoire.

Règles :

- chemins relatifs uniquement ;
- pas de framework ;
- pas de CDN obligatoire ;
- pas de secret dans le dépôt ;
- éviter `innerHTML` avec des données non contrôlées ;
- valider les données JSON ;
- conserver la séparation entre contenu (`content/`) et code (`js/`) ;
- respecter la nomenclature existante ;
- tester sur mobile et au clavier.

## 5. Contenu

Les fichiers de contenu sont dans `content/fr/` :

- `chapters.json` ;
- `people.json` ;
- `documents.json` ;
- `timeline.json` ;
- `glossary.json` ;
- `narratives.json` ;
- `sources.json`.

Toute modification doit conserver les identifiants existants ou mettre à jour toutes les références croisées.

Après modification :

```bash
python tests/validate_content.py
```

## 6. Tests

Avant de proposer une contribution :

- lancer le jeu en local ;
- parcourir le chapitre concerné ;
- tester au clavier ;
- tester sur un écran mobile ou une fenêtre étroite ;
- vérifier la sauvegarde locale ;
- vérifier les liens externes ;
- lancer la validation du contenu ;
- consulter [`tests/manual-qa.md`](tests/manual-qa.md).

## 7. Commits et pull requests

Format recommandé :

```text
type(scope): description courte
```

Exemples :

```text
fix(chapitre-3): corriger la date du convoi 71
feat(carnet): ajouter un filtre par thème
docs(sources): préciser la référence du procès Barbie
```

Types : `feat`, `fix`, `docs`, `content`, `style`, `test`, `chore`.

Une pull request doit :

- expliquer le changement ;
- citer les sources historiques utilisées ;
- indiquer les tests effectués ;
- signaler les droits éventuels ;
- ne pas mélanger correction historique et refonte graphique.

## 8. Relecture historique

Les corrections historiques sont prioritaires. Elles doivent être vérifiées par une source fiable avant publication.

Une contribution peut être refusée si :

- elle invente un contenu ;
- elle cite une source non vérifiable ;
- elle reproduit un document sans droit ;
- elle présente une interprétation comme un fait ;
- elle met en scène la violence ;
- elle transforme les victimes en personnages de jeu.

## 9. Accessibilité

Toute nouvelle interface doit :

- être utilisable au clavier ;
- avoir des libellés accessibles ;
- ne pas transmettre une information uniquement par la couleur ;
- respecter les préférences de réduction des mouvements ;
- conserver des zones tactiles suffisantes ;
- avoir des alternatives textuelles pour les images.

## 10. Signaler un problème

Pour signaler une erreur historique, un problème de droits ou un bug :

- ouvrir une issue sur le dépôt ;
- décrire précisément le problème ;
- indiquer la page ou la fiche concernée ;
- fournir une source ou une capture si utile ;
- ne pas publier de données personnelles.

Les signalements relatifs au respect des victimes et aux droits sont traités en priorité.
