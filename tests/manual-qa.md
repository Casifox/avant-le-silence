# Checklist de test manuel

**Version testée : 0.8.0**  
**Navigateur de référence : Chrome / Edge récent**  
**Serveur local : `python -m http.server 8000`**

## 1. Chargement

- [ ] L'écran de chargement s'affiche.
- [ ] L'accueil apparaît sans erreur.
- [ ] Aucun message dans la console.
- [ ] Les illustrations se chargent.
- [ ] Le titre de l'onglet est correct.

## 2. Accueil

- [ ] Le titre « AVANT LE SILENCE » est visible.
- [ ] Le sous-titre est visible.
- [ ] « Commencer le parcours » est actif.
- [ ] « Continuer » est désactivé sans sauvegarde.
- [ ] « Explorer les sources » fonctionne.
- [ ] « À propos du projet » fonctionne.
- [ ] « Paramètres » fonctionne.

## 3. Avertissement

- [ ] Le texte d'avertissement est lisible.
- [ ] « J'ai compris, continuer » mène au prologue.
- [ ] « Revenir à l'accueil » fonctionne.
- [ ] Le choix est mémorisé si l'on revient.

## 4. Prologue

- [ ] Le titre et le texte sont visibles.
- [ ] Le bloc « Repères » s'affiche.
- [ ] La citation est signalée comme texte de médiation.
- [ ] « Commencer le parcours » mène aux chapitres.

## 5. Sélection des chapitres

- [ ] Les quatre chapitres sont visibles.
- [ ] Le chapitre I est ouvert.
- [ ] Les chapitres II à IV sont verrouillés.
- [ ] Le bouton « Ouvrir » du chapitre I fonctionne.
- [ ] La progression globale s'affiche.

## 6. Scène

- [ ] L'illustration s'affiche.
- [ ] Les points d'intérêt sont numérotés.
- [ ] Chaque point d'intérêt ouvre une fiche ou un repère.
- [ ] La liste « À consulter » fonctionne.
- [ ] Les états « consulté » se mettent à jour.
- [ ] La barre de progression se met à jour.
- [ ] « Espace suivant » fonctionne.
- [ ] « Espace précédent » fonctionne.
- [ ] Le HUD permet d'ouvrir le carnet, la chronologie et le menu.
- [ ] Le menu permet de quitter sans perdre la progression.

## 7. Fiche documentaire

- [ ] Le titre, le type et le statut s'affichent.
- [ ] La mention « Document non reproduit » est visible.
- [ ] Les métadonnées inconnues sont signalées.
- [ ] La description et le contexte s'affichent.
- [ ] Les sources officielles sont cliquables.
- [ ] Les personnes liées s'ouvrent.
- [ ] « Ajouter au carnet » fonctionne.
- [ ] Le bouton devient « Retirer du carnet ».
- [ ] La fermeture par bouton fonctionne.
- [ ] La fermeture par `Échap` fonctionne.
- [ ] Le focus revient au déclencheur.

## 8. Fiche personne

- [ ] Le monogramme s'affiche.
- [ ] La mention d'absence de portrait est visible.
- [ ] Le rôle et la description s'affichent.
- [ ] Les documents associés s'ouvrent.
- [ ] Les repères chronologiques s'affichent.
- [ ] Les sources s'affichent.
- [ ] L'ajout au carnet fonctionne.
- [ ] La fiche de Klaus Barbie affiche l'avertissement prévu.
- [ ] Aucune parole n'est attribuée à une personne réelle.

## 9. Ateliers

### Distinguer les preuves

- [ ] Les trois affirmations s'affichent.
- [ ] Chaque choix affiche un retour explicatif.
- [ ] La bonne réponse est indiquée.
- [ ] Aucun score n'est affiché.
- [ ] La fin de l'atelier est enregistrée.

### Classer un document

- [ ] Les quatre descriptions s'affichent.
- [ ] Les catégories sont compréhensibles.
- [ ] Le retour pédagogique s'affiche.
- [ ] La fin de l'atelier est enregistrée.

### Chronologie

- [ ] Les huit événements sont mélangés.
- [ ] Les clics ajoutent les événements dans l'ordre choisi.
- [ ] Les éléments peuvent être retirés.
- [ ] « Vérifier l'ordre » fonctionne.
- [ ] Le corrigé s'affiche.
- [ ] Aucun chronomètre n'est présent.
- [ ] La fin de l'atelier est enregistrée.

## 10. Bilan de chapitre

- [ ] Le bouton « Achever le chapitre » liste les éléments manquants si nécessaire.
- [ ] Une fois les éléments consultés, le bilan s'affiche.
- [ ] Le bilan indique les éléments consultés, sans note.
- [ ] Le chapitre suivant se débloque.
- [ ] « Retour aux chapitres » fonctionne.
- [ ] « Ouvrir le carnet » fonctionne.

## 11. Chronologie

- [ ] Les 13 événements s'affichent.
- [ ] Les filtres « Tout », « 1943–1944 » et « Après-guerre » fonctionnent.
- [ ] Chaque événement s'ouvre.
- [ ] Les événements à vérifier sont signalés.
- [ ] Les documents et personnes liés s'ouvrent.
- [ ] « Ajouter au carnet » fonctionne.
- [ ] Les sources s'affichent.

## 12. Carnet

- [ ] Les compteurs s'affichent.
- [ ] La recherche fonctionne.
- [ ] Les filtres par type fonctionnent.
- [ ] Le filtre par chapitre fonctionne.
- [ ] Les fiches s'ouvrent.
- [ ] La suppression demande confirmation.
- [ ] La suppression met à jour les compteurs.
- [ ] L'état vide s'affiche correctement.
- [ ] Les thèmes s'affichent.
- [ ] La progression est visible.

## 13. Paramètres

- [ ] La taille du texte change immédiatement.
- [ ] Le contraste élevé s'applique.
- [ ] La réduction des mouvements s'applique.
- [ ] Le son peut être coupé.
- [ ] Les volumes se règlent.
- [ ] Les préférences persistent après rechargement.
- [ ] La suppression des données demande confirmation.
- [ ] La suppression ramène à l'accueil.
- [ ] Les raccourcis clavier sont indiqués.

## 14. Conclusion et fin

- [ ] La conclusion s'affiche après le chapitre IV.
- [ ] La citation est signalée comme conclusion éditoriale.
- [ ] Le résumé du carnet s'affiche.
- [ ] Les thèmes s'affichent.
- [ ] « Terminer le parcours » mène à l'écran final.
- [ ] L'écran final contient l'emblème et les actions.
- [ ] Les mentions d'indépendance sont visibles.

## 15. Sauvegarde

- [ ] La progression survit à un rechargement.
- [ ] Le dernier écran est proposé via « Continuer ».
- [ ] Les préférences survivent.
- [ ] La sauvegarde est invalidée proprement si les données sont corrompues.
- [ ] Le jeu fonctionne si `localStorage` est indisponible.
- [ ] La suppression des données fonctionne.

## 16. Accessibilité

- [ ] Navigation complète au clavier.
- [ ] Focus visible.
- [ ] `Échap` ferme les modales.
- [ ] Le focus revient au déclencheur après fermeture.
- [ ] Les images ont un texte alternatif.
- [ ] Les titres sont dans un ordre logique.
- [ ] Les contrastes sont suffisants.
- [ ] La taille du texte peut être augmentée.
- [ ] Les animations peuvent être réduites.
- [ ] Aucune information n'est transmise uniquement par la couleur.
- [ ] Les boutons tactiles principaux mesurent au moins 44 px.

## 17. Responsive

- [ ] 360 × 800 : pas de débordement horizontal.
- [ ] 390 × 844 : pas de débordement horizontal.
- [ ] 768 × 1024 : pas de débordement horizontal.
- [ ] 1280 × 720 : pas de débordement horizontal.
- [ ] Les fiches restent lisibles sur mobile.
- [ ] Les points d'intérêt restent utilisables.
- [ ] Le HUD reste accessible.
- [ ] Les modales s'affichent correctement.

## 18. GitHub Pages

- [ ] L'URL publique charge le jeu.
- [ ] Les chemins relatifs fonctionnent.
- [ ] Les JSON se chargent.
- [ ] Les SVG se chargent.
- [ ] La sauvegarde fonctionne.
- [ ] La page 404 s'affiche.
- [ ] Les accents sont corrects.
- [ ] Les liens externes fonctionnent.

## 19. Contenu historique

- [ ] Aucune citation inventée.
- [ ] Aucun document inventé.
- [ ] Aucun portrait généré.
- [ ] Les parcours de déportation sont distincts.
- [ ] Les informations non établies sont signalées.
- [ ] Les textes de médiation sont identifiés.
- [ ] Les sources sont accessibles.
- [ ] Les mentions d'indépendance sont présentes.

## 20. Journal de test

| Date | Navigateur | Appareil | Résultat | Notes |
|---|---|---|---|---|
| 2026-11-11 | Chrome | Desktop, viewport 1280 | OK | Parcours complet automatisé et manuel |
| 2026-11-11 | Chrome | Viewport 390 | OK | Pas de débordement |
| 2026-11-11 | Chrome | Viewport 360 | OK | Pas de débordement |
| 2026-11-11 | Chrome | Lighthouse | OK | Accessibilité 100 |
|  |  |  |  |  |
