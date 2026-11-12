# Confidentialité

**Dernière mise à jour : 11 novembre 2026**

## 1. Aucune collecte de données personnelles

**AVANT LE SILENCE** ne collecte aucune donnée personnelle.

Le jeu :

- ne demande aucun compte ;
- ne demande aucun mot de passe ;
- ne demande aucune adresse e-mail ;
- n'envoie aucune donnée à un serveur ;
- n'utilise aucun cookie de suivi ;
- n'utilise aucun outil d'analyse d'audience ;
- n'intègre aucune publicité ;
- n'intègre aucun traceur tiers ;
- ne réalise aucun profilage.

## 2. Sauvegarde locale

La progression est enregistrée uniquement dans le navigateur du joueur, avec l'API `localStorage`.

Clé utilisée :

```text
avant-le-silence.save.v1
```

Données enregistrées :

- chapitre et scène en cours ;
- scènes visitées ;
- documents consultés ;
- personnes rencontrées ;
- ateliers terminés ;
- éléments ajoutés au carnet ;
- dates consultées ;
- préférences d'affichage et de son ;
- version du format de sauvegarde ;
- date de dernière mise à jour.

Ces données restent sur l'appareil du joueur. Elles ne sont jamais transmises.

## 3. Suppression

Le joueur peut supprimer ses données à tout moment :

1. ouvrir **Paramètres** ;
2. faire défiler jusqu'à **Sauvegarde locale** ;
3. cliquer sur **Supprimer les données locales** ;
4. confirmer.

La suppression efface la progression, le carnet et les préférences. Elle est irréversible.

Le joueur peut également effacer les données de site de son navigateur.

## 4. Stockage indisponible

Si `localStorage` est indisponible ou plein, le jeu utilise un stockage temporaire en mémoire pour la session en cours.

Dans ce cas :

- le jeu continue de fonctionner ;
- la progression n'est pas conservée après fermeture du navigateur ;
- un message l'indique dans les paramètres.

## 5. Liens externes

Les fiches documentaires et la page Sources contiennent des liens vers des sites institutionnels, notamment :

- le Mémorial de la Maison d'Izieu ;
- la Bibliothèque nationale de France ;
- GitHub Docs pour la documentation technique.

Ces liens ouvrent des sites tiers. Leur politique de confidentialité s'applique une fois le lien activé. Le jeu ne contrôle pas ces sites et ne leur transmet aucune donnée.

## 6. Absence de backend

Le jeu est un site statique. Il ne dispose d'aucun serveur applicatif, d'aucune base de données distante, d'aucune API privée et d'aucun secret.

## 7. Public et mineurs

Le jeu est conseillé à partir de 14 ans. Il ne collecte aucune donnée, y compris pour les mineurs.

L'absence de compte et de collecte limite les risques liés à la protection des données personnelles.

## 8. Sécurité

Le projet applique les principes suivants :

- pas de `innerHTML` avec des données non contrôlées ;
- validation des fichiers JSON avant utilisation ;
- liens externes limités à `http` et `https` ;
- aucun script tiers ;
- aucun contenu arbitraire exécuté ;
- aucune ressource distante indispensable au parcours.

## 9. Modifications

Toute évolution de cette politique sera documentée dans `CHANGELOG.md`.

## 10. Contact

Pour toute question relative à la confidentialité, ouvrir une issue sur le dépôt du projet.

**AVANT LE SILENCE** ne collecte rien : le carnet de mémoire reste le vôtre, dans votre navigateur.
