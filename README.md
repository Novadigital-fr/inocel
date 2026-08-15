# INOCEL — maquette de refonte

Maquette HTML statique, à valider **avant** intégration WordPress / Elementor.

```bash
cd refonte && python3 -m http.server 8099   # → http://localhost:8099
```

> **Passer par cette adresse, pas par un double-clic sur `index.html`.** Ouverte en
> `file://`, la page n'a pas d'origine : YouTube refuse de lire la vidéo du hero
> (« Error 153 »). Le script détecte ce cas et laisse l'image de fond à la place.

## Pages

| Fichier | Rôle |
|---|---|
| `index.html` | Page d'accueil |
| `calculator.html` | Calculateur d'émissions |
| `sector-data-centers.html` | Page secteur, sert de gabarit aux cinq autres |

`style.css` et `script.js` sont partagés par les trois pages. Les visuels sont dans
`assets/img/`, dont `_source/` qui conserve les fichiers d'origine des logos partenaires
avant recadrage.

Les variantes intermédiaires (v1, v2) ont été supprimées : seule cette version est
maintenue.

---

## Design system

Charte INOCEL conservée, mise en page inspirée de
[serverobotics.com](https://www.serverobotics.com/).

| | Valeur |
|---|---|
| Titres | Inter Tight 400 |
| Textes | Inter 400/500 |
| Accent | `#4ac7b3` (survol `#009184`) |
| Texte foncé | `#071a35` |
| Fond sombre | `#04201d`, cartes en `#0e3a31` |
| Fond clair | blanc, cartes en `#f5f4f0` et `#eae9e3` |
| Vert clair | `#d9ece6` |
| Jaune (CTA) | `#f5c95c` |
| Rayon | 8 px |
| Gouttière | 15 px |

**Le principe structurant** : chaque section est une carte encartée, jamais collée aux
bords, avec alternance des fonds. Les sections secondaires (chiffres, value chain, CTA,
carte, image pleine) sont limitées à 1360 px, les autres vont à 1410 px.

---

## Structure de la page d'accueil

| # | Section | Origine du texte |
|---|---|---|
| 1 | Header deux lignes, méga-menu pleine largeur | nouveau |
| 2 | Hero vidéo | home actuelle |
| 3 | Déclaration qui s'allume au scroll | home actuelle |
| 4 | Partenaires | logos réels + 2 à confirmer |
| 5 | Secteurs en onglets | home actuelle |
| 6 | Bandeau CTA jaune → calculateur | nouveau |
| 7 | Produit épinglé | home actuelle |
| 8 | Diesel vs GEN-Z | à valider |
| 9 | Piste de progression (bénéfices 01/02/03) | home actuelle |
| 10 | Value chain solution | home actuelle |
| 11 | Études de cas | à fournir |
| 12 | Zones desservies | à confirmer |
| 13 | Location ou achat | à valider |
| 14 | Visuel pleine largeur | — |
| 15 | Contact | home actuelle |

---

## Animations

`[data-reveal]` sur un élément, `[data-stagger]` sur un conteneur dont les enfants
apparaissent en cascade, `[data-delay]` pour retarder. Un `IntersectionObserver` ajoute
`.is-in` — chaque élément n'est animé qu'une fois.

Aucune librairie : tout est en JS/CSS natif, comme sur le site de référence.

| Effet | Où |
|---|---|
| Titre découpé mot à mot | hero de chaque page |
| Texte qui s'allume au scroll | déclaration de la home |
| Image produit épinglée | section « Zero-emission power » |
| Piste de progression verticale à marqueur mobile | section bénéfices |
| Onglets sectoriels | section secteurs |
| Header dont la ligne de contact se replie | toutes les pages |
| Vidéo YouTube en fond avec bouton pause | hero de la home |

Deux garde-fous : `prefers-reduced-motion: reduce` désactive tout, et les états de départ
sont conditionnés à la classe `.js` — **sans JavaScript la page reste entièrement
lisible**, ce qui compte pour le SEO et pour l'intégration Elementor.

---

## Choix de conversion

Repris de GeoPura, le concurrent :

1. **E-mail et téléphone visibles en permanence** — une partie des prospects B2B appelle.
2. **Entrée « Sectors » dans le menu** — un DSI cherche « data center », pas
   « zero-emission generator ». Gain SEO et gain de conversion.
3. **Secteurs placés haut dans la page** — le visiteur se reconnaît avant qu'on lui parle
   de la machine.
4. **Comparaison chiffrée avec le diesel** — tout le discours dit « remplacez votre groupe
   diesel », le face-à-face rend l'argument vérifiable.
5. **Calculateur d'émissions** — le visiteur repart avec un chiffre, et une raison de
   laisser son e-mail.
6. **Location ou achat** — deuxième question après « est-ce que ça marche », sur du
   matériel à ce prix.
7. **Études de cas chiffrées** — « 412 t CO₂ évitées », « –68 dB ».

---

## À trancher avant l'intégration

### Contenus inventés, à remplacer en priorité

- **Autonomie et ravitaillement** (24 h par plein, moins de 2 h de ravitaillement) — mon
  estimation, pas une donnée INOCEL. C'est l'information la plus décisive de la page et
  celle que j'ai le moins de légitimité à produire.
- **Colonne diesel du tableau comparatif** (≈ 160 t CO₂/an, 85–95 dB(A)) — calculée à
  partir de la méthode indiquée sous le tableau, donc traçable, mais à valider.
- **Chiffres des études de cas** (412 t, 68 000 L, –68 dB, 99,9 %) et **configuration type
  de la page secteur** (2 à 4 unités, 12 à 24 mois) — exemples plausibles mais fictifs.
  Comme la page secteur sert de gabarit aux cinq autres, une erreur s'y répliquerait.
- **Liste de pays de la carte** et positions des pastilles — approximatives, calées à l'œil
  sur `world-map.png` sans savoir ce que ses zones surlignées représentent.
- **Téléphone** `+33 (0)4 00 00 00 00` — factice.

### À confirmer

- **Siège social** : j'ai mis Grenoble, déduit du logo Région Auvergne-Rhône-Alpes et de
  la présence de `Grenoble.jpg` dans la médiathèque. L'usine reste à Belfort.
- **France 2030 et Bpifrance** : ces deux partenariats sont une hypothèse de ma part. Les
  logos sont en place mais à retirer si les relations n'existent pas. CEA et
  Région / Union européenne viennent de votre médiathèque, donc sûrs.
- **`PARTNERSHIP.jpg`** de la médiathèque n'a pas été ouvert — il contient peut-être la
  liste officielle des partenaires.

### Travaux restants

- **Consentement cookies** : le hero charge un iframe YouTube au chargement. Même en
  `youtube-nocookie.com`, il faut le conditionner à l'acceptation des cookies.
  L'injection se fait dans `script.js` — c'est le seul endroit à modifier.
- **Responsive non traité** : desktop uniquement, à la demande. Les media queries de
  `style.css` datent d'une version antérieure et ne couvrent pas la structure actuelle.
- **5 pages sectorielles à décliner** depuis `sector-data-centers.html`.
- **Menu mobile** : le méga-menu n'a pas de version mobile.
- **Formulaire de contact** : à brancher sur HubSpot (`inc/hubspot.php` existe déjà dans
  le thème).
- **En-tête et pied dupliqués** dans les trois fichiers : toute modification du méga-menu
  est à reporter à la main. Limite d'une maquette statique, réglée par un template unique
  sous WordPress.
