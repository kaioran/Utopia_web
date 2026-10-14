# Utopia POS — Landing Page Officielle (StellarSoft)

Bienvenue sur le projet web indépendant de la landing page officielle d'**Utopia POS**, solution de caisse tactile et de gestion commerciale sur PC (Windows 10/11) éditée par **StellarSoft** pour les commerces indépendants et points de vente.

---

## 🌟 Principes et Architecture du Projet

1. **Isolation totale (`Utopia_web/`)** : Le projet vit intégralement dans ce sous-dossier avec son propre `package.json`, ses scripts et son configuration Astro. Il n'interfère aucunement avec le code de l'application de caisse Electron (`frontend/` et `backend/`).
2. **Exclusion stricte de l'installeur** : Le fichier racine `electron-builder.json` n'inclut que les répertoires `frontend/dist`, `backend`, `electron` et `assets`. `Utopia_web/` n'est jamais embarqué dans le fichier setup `.exe`.
3. **Génération Statique (SSG) Ultra-Rapide** : Génération en HTML pur sous Astro 4.16. Le contenu est directement indexable sans dépendance à JavaScript pour le rendu.
4. **Bilingue & RTL Natif** : Versions française (`/fr/`) et arabe (`/ar/`) complètes avec inversion directionnelle (`dir="rtl"`), typographie adaptée (*Cairo*), et structure universelle.
5. **Cadre Sombre Unifié & Thèmes Fidèles** : L'en-tête, le Hero, l'appel final et le footer partagent le fond sombre `#161D26` commun aux deux modes. Le corps de page bascule fluidement entre le thème sombre et le thème clair grâce à un script anti-flash sans scintillement.
6. **Règle Stricte des Preuves (`claims.ts`)** : Aucune promesse marketing n'est affichée sans qu'un fichier de preuve n'existe dans le code actif d'Utopia.

---

## 🚀 Démarrage Rapide

Depuis la racine du projet ou depuis `Utopia_web/` :

```bash
cd Utopia_web

# 1. Lancer le serveur de développement local (port 4321)
npm run dev

# 2. Compiler le site statique pour la production
npm run build

# 3. Prévisualiser le build de production localement
npm run preview

# 4. Lancer le contrôle de conformité et des affirmations (Claims & Traductions)
npm run check:release
```

---

## 🛠️ Guide de Configuration & Maintenance

Toutes les données métier et textes du site sont centralisés dans **deux emplacements uniques** :

### 1. Modifier les coordonnées et réglages généraux (`src/config/site.config.ts`)

- **Numéro WhatsApp de contact** :
  Remplacer `TODO_WHATSAPP_NUMBER` dans `siteConfig.contact.whatsappNumber` par votre numéro international au format `+213XXXXXXXXX`.
- **Adresse e-mail** :
  Modifier `siteConfig.contact.email` (par défaut `contact@stellarsoft.dz`).
- **Lien ou fichier du Setup téléchargeable** :
  Modifier `siteConfig.cta.downloadUrl` (actuellement `/downloads/Utopia_POS_Setup_1.0.0.exe`).
- **Activer l'affichage du tarif en DA** :
  Passer `siteConfig.pricing.enabled` à `true` et renseigner `amountDa` (ex: `35000`) et `offerTypeFr` / `offerTypeAr` (ex: `"Licence à vie + mises à jour incluses"`).
- **Activer une vidéo de démonstration (90 secondes)** :
  Passer `siteConfig.video.enabled` à `true` et renseigner l'identifiant YouTube (`youtubeId`) ou le fichier MP4 local (`localMp4Url`).

### 2. Ajouter un vrai témoignage client vérifié

Pour garantir une intégrité absolue, **aucun faux témoignage n'est affiché**. Pour publier un témoignage :

1. Ouvrir [`src/config/site.config.ts`](src/config/site.config.ts).
2. Dans le tableau `testimonials`, ajouter un objet en s'assurant que `consentToPublish` est strictement à `true` :
```typescript
{
  id: "temoignage-superette-oran",
  authorName: "Mohamed B.",
  storeName: "Supérette El-Amel",
  city: "Oran",
  quoteFr: "La clôture de caisse me prenait 45 minutes chaque soir sur cahier. Avec Utopia, c'est réglé en 3 minutes avec le ticket Z.",
  quoteAr: "كنت نقضي 45 دقيقة كل مساء مع الكراس. مع يوتوبيا، كلش يخرج مضبوط في 3 دقائق بتقرير نهاية اليوم.",
  consentToPublish: true // OBLIGATOIRE
}
```
3. Si `testimonials` est vide ou si `consentToPublish: false`, la section reste automatiquement invisible sur la page.

### 3. Modifier ou ajuster les textes bilingues

- **Textes français** : [`src/i18n/fr.json`](src/i18n/fr.json)
- **Textes arabes** : [`src/i18n/ar.json`](src/i18n/ar.json)
- **Suivi de la relecture linguistique** : [`src/i18n/review-status.json`](src/i18n/review-status.json)

---

## 🔒 Vérification Automatisée de Pré-Release (`check:release`)

Le script [`scripts/check-release.mjs`](scripts/check-release.mjs) inspecte avant chaque mise en ligne :
1. Que **100% des claims activés** pointent vers un fichier source existant dans `backend/` ou `frontend/`.
2. Que **100% des clés de traduction** sont parfaitement symétriques entre `fr.json` et `ar.json`.
3. Que tous les témoignages configurés possèdent un consentement explicite.
4. Qu'aucune variable client bloquante n'a été oubliée.

Pour exécuter la vérification :
```bash
npm run check:release
```

---

## 📦 Structure des Dossiers

```
Utopia_web/
├── public/
│   ├── logo/                 # Logos transparents Utopia
│   ├── robots.txt            # Règles d'indexation SEO
│   └── sitemap.xml           # Sitemap bilingue avec balises hreflang
├── src/
│   ├── components/           # Composants Astro & React
│   │   ├── Header.astro      # Navigation, sélecteur de langue, bascule de thème
│   │   ├── Hero.astro        # Promesse, cible, CTA principal
│   │   ├── VideoFacade.astro # Façade vidéo & maquette logicielle DZD
│   │   ├── Problems.astro    # 3 cartes problèmes commerçants
│   │   ├── Features.astro    # 5 sections bénéfices alternées
│   │   ├── ScreenMockup.astro# Maquettes interactives des écrans POS
│   │   ├── BeforeAfter.astro # Tableau comparatif manuel vs Utopia
│   │   ├── QuickStart.astro  # Démarrage en 15 minutes chrono
│   │   ├── Testimonials.astro# Témoignages réels (masqué si vide)
│   │   ├── Pricing.astro     # Tarifs en Dinars Algériens (conditionnel)
│   │   ├── Faq.astro         # Foire aux questions (<details> accessibles)
│   │   ├── FinalCta.astro    # Rappel final de l'offre
│   │   ├── Footer.astro      # Pied de page avec mentions légales & liens
│   │   ├── DownloadModal.tsx # Modale de téléchargement et collecte éthique
│   │   └── WhatsAppFloatingBtn.astro # Bouton flottant WhatsApp
│   ├── config/
│   │   ├── claims.ts         # Registre des affirmations & preuves de code
│   │   └── site.config.ts    # Source de vérité unique de la landing page
│   ├── i18n/
│   │   ├── fr.json           # Dictionnaire complet Français
│   │   ├── ar.json           # Dictionnaire complet Arabe
│   │   └── review-status.json# Suivi de la relecture par locuteur natif
│   ├── layouts/
│   │   └── BaseLayout.astro  # Layout HTML, SEO, Open Graph, Schema.org, Fonts
│   ├── pages/
│   │   ├── fr/               # /fr/, /fr/confidentialite, /fr/mentions-legales
│   │   ├── ar/               # /ar/, /ar/confidentialite, /ar/mentions-legales
│   │   └── index.astro       # Redirection racine automatique
│   ├── scripts/
│   │   ├── theme.ts          # Script anti-flash inline & bascule dark/light
│   │   ├── reveal.ts         # Animations discrètes au scroll
│   │   └── leadAdapter.ts    # Collecte éthique et routage WhatsApp
│   └── styles/
│       ├── tokens.css        # Variables CSS du design system Utopia
│       └── global.css        # Styles globaux, reset et typographies
├── astro.config.mjs          # Configuration SSG Astro avec intégration React
└── package.json              # Dépendances et scripts de build
```
