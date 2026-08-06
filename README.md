# INOCEL — maquette nouvelle page d'accueil

Maquette HTML statique, à valider **avant** intégration Elementor.

```bash
cd refonte && python3 -m http.server 8099   # → http://localhost:8099
```

> **Passer par cette adresse, pas par un double-clic sur `index.html`.** Ouverte en
> `file://`, la page n'a pas d'origine : YouTube refuse de lire la vidéo du bandeau
> (« Error 153 »). Le script détecte ce cas et laisse l'image de fond à la place, mais
> la vidéo ne s'affiche que sur une page servie en http/https.

| | |
|---|---|
| Version actuelle | `index.html` — langage visuel inspiré de [forfuture.webflow.io](https://forfuture.webflow.io/homepage/home-b) |
| Version précédente | `v1/index.html` — conservée pour comparaison |

Les deux partagent `assets/`.

---

## Design system

Repris de ForFuture, avec les couleurs INOCEL.

| | ForFuture | Ici |
|---|---|---|
| Fond principal | `#fffdfa` | `#fcfbf9` (crème, plus de blanc pur) |
| Fond secondaire | `#f5f2ef` | `#f4f2ee` |
| Fond sombre | `#08100d` | `#04201d` (charte INOCEL) |
| Accent | `#a6e00a` lime | `#4ac7b3` teal (charte INOCEL) |
| Texte courant | `#3a413e` | `#4d5a63` (bleu-gris adouci, pas du noir) |
| Titres | Instrument Sans **400** | Inter Tight **400** (charte) |
| Boutons | pill, `r=64px` | pill, `r=999px` |

**Le changement de fond** : le blanc pur est remplacé par un crème. C'est discret mais
c'est ce qui fait la différence entre « site corporate » et « site soigné ».

**Le changement de graisse** : les titres passent de 500 à **400**, plus grands
(jusqu'à 92 px) et plus serrés (`-0.035em`). Les gros titres légers, c'est la signature
de ForFuture — la v1 était plus lourde et plus banale.

**Les pastilles contournées** (`INTRODUCTION`, `SERVICE`…) remplacent les petits
sur-titres teal de la v1. Elles structurent la page sans crier.

---

## Structure

| # | Section | Origine du texte |
|---|---|---|
| 1 | Barre utilitaire (événement + contacts) | home actuelle |
| 2 | Header collant, méga-menus Solutions & Sectors | nouveau |
| 3 | **Hero**, crème, centré, plafonné à 50 vh | home actuelle |
| 4 | **Bandeau vidéo** pleine largeur, sans surimpression | nouveau |
| 5 | **Chiffres clés**, 4 compteurs à rouleau | à fournir |
| 6 | **Introduction**, paragraphe qui s'allume au scroll | home actuelle |
| 7 | **Gamme produits** (sombre), lignes éditoriales | à fournir |
| 8 | **Calculateur d'émissions** | nouveau |
| 9 | **Secteurs**, 6 tuiles bento | home actuelle |
| 10 | **Bénéfices 01/02/03** sur photo pleine largeur | home actuelle |
| 11 | **Value chain solution** | home actuelle |
| 12 | **GEN-Z features**, rendu 3D + attributs | home actuelle |
| 13 | **Études de cas**, 3 tuiles portrait | à fournir |
| 14 | Bandeau de confiance (défilement infini) | à fournir |
| 15 | Actualités | à fournir |
| 16 | **Formulaire de contact** sur photo | home actuelle |
| 17 | Footer | home actuelle |

« home actuelle » = texte repris tel quel de inocel.com. « à fournir » = contenu de
remplissage écrit par mes soins, à remplacer avant mise en ligne (voir plus bas).

### Ce que la home actuelle contient et que la nouvelle garde

Hero, « INOCEL decarbonizes your operations », les trois bénéfices 01/02/03,
GEN-Z features et ses attributs, Value chain solution, « Power generation for every
industry », « Ready to power your growth? ». Rien n'a été perdu.

### Ce que la nouvelle ajoute

Barre de contacts permanente, méga-menus avec entrée Sectors, bandeau vidéo, chiffres
clés, gamme produits explicite, calculateur d'émissions, études de cas chiffrées,
preuves partenaires, actualités, formulaire complet sur la page.

---

## Animations

`[data-reveal]` sur un élément, `[data-stagger]` sur un conteneur dont les enfants
apparaissent en cascade, `[data-delay]` pour retarder. Un `IntersectionObserver`
ajoute `.is-in` — chaque élément n'est animé qu'une fois.

Trois effets repris de ForFuture :

- **Le paragraphe qui s'allume** (`[data-highlight]`) — les mots passent du gris clair au
  navy au fil du scroll. C'est l'effet le plus identifiable du site de référence.
- **Les compteurs à rouleau** (`[data-odo]`) — chaque chiffre est une colonne 0→9 qui
  défile, avec un décalage par colonne.
- **Les lignes produits** — la vignette est désaturée puis se colorise, la flèche pivote
  et passe en teal au survol.

Plus : titre du hero mot à mot, dézoom lent de la photo, marquee partenaires en pause au
survol, rendu 3D en lévitation, résultats du calculateur interpolés.

Deux garde-fous : `prefers-reduced-motion: reduce` désactive tout, et les états de départ
sont conditionnés à la classe `.js` — **sans JavaScript la page reste entièrement
lisible**, ce qui compte pour le SEO et pour l'intégration Elementor.

---

## Choix de conversion (inchangés depuis la v1)

Repris de GeoPura, le concurrent :

1. **E-mail et téléphone visibles en permanence** — une partie des prospects B2B appelle.
2. **Entrée « Sectors » dans le menu** — un DSI cherche « data center », pas
   « zero-emission generator ». Gain SEO et gain de conversion.
3. **Deux CTA dans le hero** — « Let's talk » seul écarte ceux qui ne veulent pas encore
   parler à un commercial.
4. **Chiffres avant l'argumentaire** — 300 kVA / 0 g CO₂ / 25 ans CEA / 100 % européen.
5. **Gamme produits explicite** — le site actuel ne dit jamais ce qui est achetable.
6. **Calculateur d'émissions** ⭐ — la meilleure idée de GeoPura. Le visiteur repart avec
   un chiffre, et une raison de laisser son e-mail.
7. **Formulaire complet sur la home** — aujourd'hui elle renvoie vers `/contact`, et
   chaque clic intermédiaire coûte des leads. Le formulaire demande secteur et puissance :
   le commercial est briefé avant le premier appel.
8. **Études de cas chiffrées** — « 412 t CO₂ évitées », « –68 dB ».

---

## À trancher avant l'intégration

- **Contenus fictifs à remplacer** : chiffres de l'introduction (40+ générateurs,
  12 pays, 8 400 t), logos partenaires, specs GEN-Z 100, métriques des études de cas,
  dates d'actualités, téléphone.
- **GEN-Z 100** : le produit existe-t-il, ou faut-il ne présenter que la GEN-Z 300 et le
  sur-mesure ?
- **Hypothèses du calculateur** (0,25 L/kWh, 2,68 kg CO₂/L, 70 % de charge,
  2 t CO₂/voiture/an) — validation technique nécessaire, c'est le chiffre que les
  prospects retiendront.
- **Consentement cookies** : le bandeau charge un iframe YouTube au chargement de la
  page. Même en `youtube-nocookie.com`, il faut le conditionner à l'acceptation des
  cookies côté WordPress (le site a déjà une Cookie Policy et un bandeau de consentement).
  L'injection se fait dans `script.js` §7 — c'est le seul endroit à modifier.
- **Fichier local devenu inutile** : `assets/video/gen-z.mp4` (40 Mo) n'est plus utilisé
  que par `v1/`. À supprimer quand la v1 ne servira plus.
- **Encart vidéo et modale supprimés** — ils faisaient doublon avec la vidéo de fond et
  se superposaient à elle. Le code est récupérable dans `v1/` si besoin.
- **Responsive non traité** : desktop uniquement pour l'instant. Les media queries de
  `style.css` datent d'une version antérieure et ne couvrent plus le bandeau vidéo.
- **6 pages sectorielles à créer** — elles n'existent pas encore.
- **Menu mobile** : le bouton burger est présent mais non câblé (à faire en Elementor).
- **Formulaire** : à brancher sur HubSpot (`inc/hubspot.php` existe déjà dans le thème).
