/**
 * Configuration unique du site Utopia (StellarSoft)
 * Source de vérité unique pour la landing page.
 * Les valeurs non encore confirmées par le client utilisent le préfixe TODO_
 */

export interface Testimonial {
  id: string;
  authorName: string;
  storeName: string;
  city: string;
  quoteFr: string;
  quoteAr: string;
  photoUrl?: string;
  consentToPublish: boolean;
}

import type { SupportedLocale } from '../i18n';

export interface LocaleInfo {
  code: SupportedLocale;
  label: string;
  nativeLabel: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const supportedLocales: LocaleInfo[] = [
  { code: 'fr', label: 'Français', nativeLabel: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'pt', label: 'Português', nativeLabel: 'Português', flag: '🇵🇹', dir: 'ltr' },
  { code: 'es', label: 'Español', nativeLabel: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'it', label: 'Italiano', nativeLabel: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', nativeLabel: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'tr', label: 'Türkçe', nativeLabel: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'ar', label: 'العربية', nativeLabel: 'العربية', flag: 'ar', dir: 'rtl' },
  { code: 'ur', label: 'اردو', nativeLabel: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'hi', label: 'हिन्दी', nativeLabel: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'bn', label: 'বাংলা', nativeLabel: 'বাংলা', flag: '🇧🇩', dir: 'ltr' },
  { code: 'fil', label: 'Filipino', nativeLabel: 'Filipino', flag: '🇵🇭', dir: 'ltr' },
];

export interface SiteConfig {
  brand: {
    name: string;
    editor: string;
    baselineFr: string;
    baselineAr: string;
    version: string;
  };
  slogans: {
    fr: string[];
    ar: string[];
    selectedFr: string;
    selectedAr: string;
  };
  heroPromise: {
    fr: string;
    ar: string;
    targetAudienceFr: string;
    targetAudienceAr: string;
  };
  cta: {
    downloadButtonFr: string;
    downloadButtonAr: string;
    downloadUrl: string;
    installerSha256?: string;
    installerSizeMb: number;
    systemRequirementsFr: string;
    systemRequirementsAr: string;
  };
  trial: {
    // Vérifié dans le code : aucun compteur de jours d'essai trouvé. La durée est null.
    durationDays: null;
    isDurationVerified: false;
  };
  pricing: {
    enabled: boolean; // Masqué tant que non configuré de manière certaine
    currencySymbolFr: string;
    currencySymbolAr: string;
    amountDa?: number;
    offerTypeFr?: string;
    offerTypeAr?: string;
    endsAt?: string | null; // Minuteur uniquement si date réelle renseignée
  };
  contact: {
    whatsappNumber: string; // Ex: +213XXXXXXXXX
    whatsappDefaultMessageFr: string;
    whatsappDefaultMessageAr: string;
    email: string;
    facebookUrl?: string;
    instagramUrl?: string;
    youtubeUrl?: string;
  };
  video: {
    enabled: boolean;
    durationSeconds: number;
    posterUrl: string;
    localMp4Url?: string;
    youtubeId?: string;
  };
  beforeAfterMeasurements: {
    enabled: boolean; // Masqué tant qu'aucune mesure chronométrée n'est validée
    caisseClosingManualMinutes?: number;
    caisseClosingUtopiaMinutes?: number;
    clientCreditSearchManualMinutes?: number;
    clientCreditSearchUtopiaMinutes?: number;
  };
  storeTypes: {
    id: string;
    labelFr: string;
    labelAr: string;
  }[];
  testimonials: Testimonial[];
  leadCapture: {
    endpoint: string | null; // null = WhatsApp direct (Option A par défaut)
    privacyPolicyUrlFr: string;
    privacyPolicyUrlAr: string;
    legalNoticeUrlFr: string;
    legalNoticeUrlAr: string;
  };
}

export const siteConfig: SiteConfig = {
  brand: {
    name: "Utopia",
    editor: "StellarSoft",
    baselineFr: "Logiciel de caisse & gestion commerciale pour commerçants",
    baselineAr: "برنامج نقاط البيع والتسيير التجاري للمحلات",
    version: "1.0.0"
  },
  slogans: {
    fr: [
      "Votre commerce sous contrôle, chaque jour.",
      "Gérez simple, vendez plus.",
      "L'utopie de la gestion, enfin réelle."
    ],
    ar: [
      "تجارتك تحت السيطرة كل يوم.",
      "سيّر ببساطة، وبيع أكثر.",
      "إدارة متجرك، حقيقة بين يديك."
    ],
    selectedFr: "Votre commerce sous contrôle, chaque jour.",
    selectedAr: "تجارتك تحت السيطرة كل يوم."
  },
  heroPromise: {
    fr: "Utopia aide les commerçants à suivre leur stock, leurs ventes et leurs créances clients chaque soir, sans Excel ni cahier.",
    ar: "يساعد يوتوبيا أصحاب المحلات على متابعة المخزون، المبيعات وديون الزبائن كل مساء، دون الحاجة إلى دفاتر أو إكسيل.",
    targetAudienceFr: "Pour les commerces de détail, superettes, quincailleries, cosmétiques et boutiques indépendantes",
    targetAudienceAr: "لمحلات التجزئة، السوبرماركت، العقاقير، ومحلات الملابس والأنشطة التجارية"
  },
  cta: {
    downloadButtonFr: "Obtenir une démonstration",
    downloadButtonAr: "طلب عرض توضيحي مجاناً",
    downloadUrl: "/downloads/Utopia_POS_Setup_1.0.0.exe",
    installerSizeMb: 173,
    systemRequirementsFr: "Windows 10 ou 11 (64-bit) • 4 Go RAM • Sans connexion internet obligatoire",
    systemRequirementsAr: "ويندوز 10 أو 11 (64 بت) • 4 جيغابايت رام • يعمل بدون الحاجة إلى إنترنت"
  },
  trial: {
    durationDays: null,
    isDurationVerified: false
  },
  pricing: {
    enabled: true, // Visible avec offre claire et demande de devis
    currencySymbolFr: "€",
    currencySymbolAr: "€",
    offerTypeFr: "Licence permanente + Accompagnement inclus",
    offerTypeAr: "ترخيص دائم مدى الحياة + مرافقة كاملة"
  },
  contact: {
    whatsappNumber: "+213857111543", // Numéro officiel WhatsApp
    whatsappDefaultMessageFr: "Bonjour StellarSoft, je souhaite découvrir le logiciel de caisse Utopia pour mon commerce.",
    whatsappDefaultMessageAr: "السلام عليكم، أريد التعرف على برنامج يوتوبيا لنقاط البيع الخاص بمحلي.",
    email: "contact@stellarsoft.com"
  },
  video: {
    enabled: false, // Façade masquée tant que la vidéo 90s n'est pas fournie
    durationSeconds: 90,
    posterUrl: "/screens/video-poster.webp"
  },
  beforeAfterMeasurements: {
    enabled: false // Masqué tant que les chronométrages réels ne sont pas fournis
  },
  storeTypes: [
    { id: "superette", labelFr: "Alimentation générale / Supérette", labelAr: "تغذية عامة / ميني ماركت" },
    { id: "quincaillerie", labelFr: "Quincaillerie & Outillage", labelAr: "خردوات وعقاقير" },
    { id: "pret_a_porter", labelFr: "Vêtements & Prêt-à-porter", labelAr: "ملابس وأحذية" },
    { id: "cosmetique", labelFr: "Cosmétique & Parfumerie", labelAr: "مواد التجميل والعطور" },
    { id: "informatique_tel", labelFr: "Téléphonie & Informatique", labelAr: "هواتف وإعلام آلي" },
    { id: "autre", labelFr: "Autre commerce de détail", labelAr: "نشاط تجاري آخر" }
  ],
  testimonials: [], // Strictement vide pour le moment : aucun faux témoignage
  leadCapture: {
    endpoint: null, // null = adaptateur WhatsApp / mailto natif (Option A)
    privacyPolicyUrlFr: "/fr/confidentialite",
    privacyPolicyUrlAr: "/ar/confidentialite",
    legalNoticeUrlFr: "/fr/mentions-legales",
    legalNoticeUrlAr: "/ar/mentions-legales"
  }
};
