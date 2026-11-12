# Checklist de publication — AVANT LE SILENCE

**Version : 0.8.0 — candidate**  
**Date : 11 novembre 2026**

> La version 1.0.0 ne doit être publiée qu'après validation des points historiques et des droits. Cette checklist distingue ce qui est techniquement prêt de ce qui reste à valider.

## 1. Technique

- [x] `index.html` est à la racine.
- [x] Tous les chemins de ressources sont relatifs.
- [x] Aucun backend n'est requis.
- [x] Aucune compilation n'est nécessaire.
- [x] Aucun workflow GitHub Actions personnalisé n'est requis.
- [x] `.nojekyll` est présent.
- [x] `404.html` est présent.
- [x] Les modules JavaScript natifs se chargent.
- [x] Les fichiers JSON se chargent.
- [x] Les illustrations SVG s'affichent.
- [x] Les polices système sont utilisées sans ressource externe.
- [x] L'audio est synthétisé localement.
- [x] La sauvegarde locale fonctionne.
- [x] Le repli en mémoire est prévu si `localStorage` est indisponible.
- [x] Les sauvegardes sont validées et normalisées.
- [x] Les données inconnues sont retirées sans plantage.
- [x] Une page d'erreur explicite est prévue si le contenu ne se charge pas.
- [x] Les liens externes utilisent `rel="noopener noreferrer"`.
- [x] Aucun secret n'est présent dans le dépôt.

## 2. Gameplay

- [x] L'accueil fonctionne.
- [x] Le bouton « Commencer le parcours » mène à l'avertissement.
- [x] L'avertissement mène au prologue.
- [x] Le prologue mène à la sélection des chapitres.
- [x] Les chapitres se débloquent dans l'ordre.
- [x] Les 18 scènes sont accessibles.
- [x] Les points d'intérêt ouvrent les fiches.
- [x] Les fiches documentaires s'ouvrent et se ferment.
- [x] Les fiches personnes s'ouvrent et se ferment.
- [x] Le carnet ajoute et retire des éléments.
- [x] La recherche et les filtres du carnet fonctionnent.
- [x] La chronologie s'affiche et se filtre.
- [x] Les trois ateliers fonctionnent.
- [x] Les bilans de chapitre s'affichent.
- [x] La conclusion personnalisée s'affiche.
- [x] L'écran final s'affiche.
- [x] La suppression des données locales fonctionne.
- [x] Les paramètres s'appliquent immédiatement.
- [x] Les préférences sont conservées.

## 3. Contenu historique

- [x] Les faits principaux sont référencés.
- [x] Les parcours de déportation sont distingués.
- [x] Les personnages principaux sont présentés avec prudence.
- [x] Les informations inconnues sont signalées.
- [x] Aucune lettre inventée.
- [x] Aucun témoignage inventé.
- [x] Aucune citation inventée.
- [x] Aucun faux document historique.
- [x] Aucun portrait généré présenté comme authentique.
- [x] Les textes de médiation sont distingués des faits.
- [ ] Relecture indépendante par un spécialiste de l'histoire de la Shoah.
- [ ] Vérification des références judiciaires du procès Barbie.
- [ ] Vérification de la date exacte des exécutions à Reval.
- [ ] Vérification de la composition exacte des convois.
- [ ] Vérification de la liste nominative des enfants.
- [ ] Vérification des biographies individuelles.

## 4. Droits et ressources

- [x] Aucune image d'archive n'est incluse sans autorisation.
- [x] Aucune capture d'écran de site tiers n'est utilisée.
- [x] Les illustrations sont originales.
- [x] Les crédits sont présents.
- [x] Le registre `ASSET_RIGHTS.md` est présent.
- [x] Le double régime de licence est documenté.
- [ ] Autorisations de reproduction obtenues pour les documents futurs.
- [ ] Crédits exacts des documents futurs validés.
- [ ] Vérification juridique finale.

## 5. Accessibilité

- [x] Navigation clavier.
- [x] Focus visible.
- [x] Piège de focus dans les modales.
- [x] Alternatives textuelles.
- [x] Taille du texte ajustable.
- [x] Contraste élevé.
- [x] Réduction des mouvements.
- [x] Zones tactiles principales de 44 px.
- [x] Aucune information uniquement par la couleur.
- [x] Audit Lighthouse : accessibilité 100 sur les écrans testés.
- [ ] Test avec NVDA.
- [ ] Test avec VoiceOver.
- [ ] Test avec un lecteur d'écran mobile.
- [ ] Test avec des personnes en situation de handicap.

## 6. Responsive et navigateurs

- [x] Viewport 360 × 800 testé.
- [x] Viewport 390 × 844 testé.
- [x] Viewport 768 × 1024 testé.
- [x] Viewport 1280 × 720 testé.
- [x] Aucun débordement horizontal constaté.
- [x] Les documents restent lisibles sur mobile.
- [x] Les boutons tactiles principaux sont suffisamment grands.
- [ ] Test sur Chrome Android réel.
- [ ] Test sur Safari iOS réel.
- [ ] Test sur Firefox.
- [ ] Test sur Safari macOS.
- [ ] Test sur Edge.
- [ ] Test sur Linux.

## 7. GitHub Pages

- [ ] Créer le dépôt public `avant-le-silence`.
- [ ] Vérifier que `index.html` est à la racine.
- [ ] Vérifier `.nojekyll`.
- [ ] Activer Pages sur `main` et `/ (root)`.
- [ ] Vérifier l'URL publique.
- [ ] Vérifier les chemins des ressources depuis l'URL publique.
- [ ] Vérifier les accents et les caractères spéciaux.
- [ ] Vérifier le chargement des modules ES.
- [ ] Vérifier le chargement des JSON.
- [ ] Vérifier la sauvegarde sur l'URL publique.
- [ ] Vérifier la page 404.
- [ ] Vérifier le comportement mobile depuis l'URL publique.

## 8. Documentation

- [x] README complet.
- [x] LICENSE.
- [x] COPYRIGHT.
- [x] ASSET_RIGHTS.
- [x] SOURCES.
- [x] PRIVACY.
- [x] CHANGELOG.
- [x] CONTRIBUTING.
- [x] GAME_DESIGN.
- [x] HISTORICAL_REVIEW.
- [x] RELEASE_CHECKLIST.
- [x] Tests manuels.
- [x] Validation du contenu.
- [ ] Traduction anglaise.
- [ ] Validation pédagogique du public cible.

## 9. Décision de publication

### Version 0.8.0 — candidate

**Publiable techniquement** pour une démonstration ou une relecture, avec les mentions explicites :

- œuvre de médiation indépendante ;
- aucune image d'archive reproduite ;
- relecture historique en cours ;
- aucune approbation institutionnelle.

### Version 1.0.0 — publication publique

Ne pas publier comme version finale tant que :

- [ ] la relecture historique n'est pas terminée ;
- [ ] les points `review_required` ne sont pas traités ;
- [ ] les autorisations de reproduction ne sont pas obtenues ;
- [ ] les tests multi-navigateurs et lecteurs d'écran ne sont pas réalisés ;
- [ ] le CHANGELOG et la version ne sont pas mis à jour.

## 10. Après publication

- [ ] Vérifier l'URL publique.
- [ ] Vérifier les journaux d'erreur du navigateur.
- [ ] Vérifier les liens externes.
- [ ] Vérifier la sauvegarde.
- [ ] Vérifier l'affichage mobile.
- [ ] Mettre à jour le README avec le lien public.
- [ ] Créer une version `1.0.0` uniquement après validation.
