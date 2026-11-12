# Tests

Ce dossier contient les procédures et les outils de validation du projet.

## Fichiers

| Fichier | Usage |
|---|---|
| `validate_content.py` | Vérifie le JSON, les identifiants et les références croisées |
| `manual-qa.md` | Checklist de test manuel du parcours |
| `content-validation.md` | Règles de validation du contenu historique |
| `fixtures/save-v1.json` | Exemple de sauvegarde valide |
| `viewport-360.html` | Cadre de test 360 × 800 |
| `viewport-390.html` | Cadre de test 390 × 844 |
| `viewport-768.html` | Cadre de test 768 × 1024 |
| `viewport-1280.html` | Cadre de test 1280 × 720 |

## Lancer le jeu en local

Depuis la racine du projet :

```bash
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000/`.

Les cadres de test sont accessibles à :

```text
http://localhost:8000/tests/viewport-390.html
```

Ils chargent le jeu dans une iframe de largeur fixe, ce qui permet de vérifier les media queries.

## Valider le contenu

```bash
python tests/validate_content.py
```

Le script vérifie :

- la validité des fichiers JSON ;
- l'unicité des identifiants ;
- les références entre chapitres, scènes, documents, personnes, événements, sources et glossaire ;
- les types et statuts de documents ;
- les fichiers d'illustration référencés ;
- les sections obligatoires de `narratives.json`.

Un code de sortie non nul signale une erreur.

## Vérifier la syntaxe JavaScript

Avec Node.js (PowerShell) :

```powershell
Get-ChildItem -Recurse -Filter *.js js | ForEach-Object {
  Get-Content $_.FullName -Raw | node --input-type=module --check
}
```

Ou, fichier par fichier (PowerShell) :

```powershell
Get-Content js/main.js -Raw | node --input-type=module --check
```

## Tester la sauvegarde

1. Ouvrir le jeu.
2. Avancer dans un chapitre.
3. Recharger la page.
4. Vérifier que la progression est conservée.
5. Ouvrir les paramètres.
6. Supprimer les données locales.
7. Vérifier le retour à l'accueil et la disparition de la sauvegarde.

Le fichier `fixtures/save-v1.json` peut servir de référence pour comprendre le format. Pour l'injecter manuellement dans un navigateur :

```js
localStorage.setItem("avant-le-silence.save.v1", JSON.stringify(/* contenu du fichier */));
location.reload();
```

## Tester sans localStorage

Dans les outils de développement du navigateur, bloquer le stockage local ou utiliser une fenêtre de navigation privée restrictive. Le jeu doit :

- continuer à fonctionner ;
- afficher un avertissement ;
- conserver la progression en mémoire pendant la session ;
- ne pas planter.

## Tests recommandés avant publication

- Parcours complet des quatre chapitres.
- Ouverture de toutes les fiches.
- Ajout et retrait d'éléments du carnet.
- Recherche et filtres du carnet.
- Trois ateliers.
- Chronologie et filtres.
- Paramètres d'accessibilité.
- Suppression des données.
- Navigation clavier.
- Lecteur d'écran.
- Mobile réel.
- URL GitHub Pages.
- Liens externes.

Voir `manual-qa.md` et `../docs/RELEASE_CHECKLIST.md`.
