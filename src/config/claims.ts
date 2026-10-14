/**
 * Registre formel des affirmations de vente (Claims Registry)
 * 
 * RÈGLE D'OR :
 * Chaque promesse affichée sur la landing page DOIT avoir une entrée ici avec un fichier
 * de preuve vérifiable dans le code source d'Utopia.
 * Le script check:release vérifie automatiquement que tout claim actif possède une preuve réelle.
 */

export interface Claim {
  id: string;
  claimFr: string;
  claimAr: string;
  evidence: string; // Chemin relatif vers le fichier de preuve dans le projet
  enabled: boolean;
  notes?: string;
}

export const claims: Record<string, Claim> = {
  // 1. Encaissement et rapidité de vente
  "claim_fast_checkout": {
    id: "claim_fast_checkout",
    claimFr: "Encaissez rapidement vos clients par code-barres ou écran tactile, avec calcul instantané du rendu de monnaie.",
    claimAr: "سجّل مبيعاتك بسرعة عبر الباركود أو الشاشة اللمسية مع حساب تلقائي للمبلغ المتبقي.",
    evidence: "backend/src/modules/pos/pos.service.js",
    enabled: true,
    notes: "Prouvé dans PosService.checkoutSale et insertion de lignes de ventes."
  },

  // 2. Gestion des crédits clients (Carnet de dettes / الكريدي)
  "claim_client_credit_tracking": {
    id: "claim_client_credit_tracking",
    claimFr: "Consultez le solde de crédit de chaque client en temps réel, fixez un plafond et enregistrez les paiements au fur et à mesure.",
    claimAr: "تابع ديون كل زبون في الوقت الفعلي، حدد سقف الائتمان وسجّل دفعات التسديد بدقة.",
    evidence: "backend/src/routes/clients.js",
    enabled: true,
    notes: "Prouvé dans la table Clients (colonnes Solde, EncoursMaxi, Reglement) et les routes de mise à jour."
  },

  // 3. Clôtures X et Z journalières
  "claim_cash_closures_numbered": {
    id: "claim_cash_closures_numbered",
    claimFr: "Clôtures X en cours de journée et Clôtures Z journalières numérotées, pour vérifier le tiroir-caisse et sceller chaque journée.",
    claimAr: "كشوفات X اليومية المؤقتة وإغلاق Z النهائي المرقم للتحقق من الصندوق وإقفال حسابات اليوم.",
    evidence: "backend/src/modules/closure/closure.repository.js",
    enabled: true,
    notes: "Prouvé dans ClosureRepository (tables closures_x_log, closures_z, séquences sans trou). Termes NF525 et inaltérable certifié exclus."
  },

  // 4. Suivi des stocks et alertes
  "claim_stock_movements_alerts": {
    id: "claim_stock_movements_alerts",
    claimFr: "Suivez vos entrées et sorties d'articles au fil des ventes et identifiez les produits proches de la rupture.",
    claimAr: "تابع حركة دخول وخروج السلع مع كل عملية بيع واعرف المنتجات القريبة من النفاد.",
    evidence: "backend/src/modules/pos/pos.service.js",
    enabled: true,
    notes: "Prouvé par le décompte des stocks à chaque vente et la table movessotres. Terme 'stock toujours exact à 100%' exclu."
  },

  // 5. Plusieurs comptes vendeurs avec sessions séparées
  "claim_multi_cashiers_pin": {
    id: "claim_multi_cashiers_pin",
    claimFr: "Attribuez un compte à chaque vendeur pour suivre qui encaisse quoi, sans accès aux données confidentielles du magasin.",
    claimAr: "أنشئ حساباً لكل بائع لتتبع مبيعاته دون السماح له بالوصول إلى أرباح أو إعدادات المحل الحساسة.",
    evidence: "backend/src/middleware/auth.js",
    enabled: true,
    notes: "Prouvé par requireRole et le filtrage des ventes par User_id pour les vendeurs dans sales.js."
  },

  // 6. Fonctionnement 100% local hors connexion
  "claim_works_offline_local": {
    id: "claim_works_offline_local",
    claimFr: "Fonctionne sans connexion internet : toutes vos données restent stockées sur votre propre ordinateur.",
    claimAr: "يعمل دون الحاجة إلى اتصال بالإنترنت: جميع بياناتك محفوظة محلياً داخل جهاز الكمبيوتر الخاص بك.",
    evidence: "backend/src/server.js",
    enabled: true,
    notes: "Prouvé par le serveur local Node.js et la base MariaDB locale packagée sans dépendance externe."
  },

  // 7. Impression tickets et factures
  "claim_receipt_invoice_print": {
    id: "claim_receipt_invoice_print",
    claimFr: "Imprimez des tickets de caisse thermiques clairs et des factures A4 avec le logo et les coordonnées de votre commerce.",
    claimAr: "اطبع وصولات الدفع الحرارية وفواتير A4 واضحة تحمل اسم متجرك وشعاره ومعلومات الاتصال.",
    evidence: "frontend/src/components/ThermalTicketModal.jsx",
    enabled: true,
    notes: "Prouvé par les modules d'impression thermique 80mm et A4."
  },

  // ==========================================
  // AFFIRMATIONS BLOQUÉES (DÉSACTIVÉES STRICTEMENT)
  // ==========================================

  // BLOQUÉ : Marge et bénéfice du jour
  "claim_profit_margin_calculation": {
    id: "claim_profit_margin_calculation",
    claimFr: "Calcul automatique de votre bénéfice et de votre marge nette quotidienne.",
    claimAr: "حساب تلقائي للأرباح الصافية وهوامش الربح اليومية.",
    evidence: "backend/src/modules/pos/pos.service.js",
    enabled: false,
    notes: "DÉSACTIVÉ : Dans pos.service.js:L82, prixA est enregistré à 0. L'affirmation sur le bénéfice net est interdite tant que non corrigé."
  },

  // BLOQUÉ : Réseau multi-caisses illimité
  "claim_multi_registers_lan": {
    id: "claim_multi_registers_lan",
    claimFr: "Interconnexion automatique et illimitée de plusieurs caisses en réseau local sans configuration.",
    claimAr: "ربط تلقائي لعدة صناديق بيع عبر الشبكة المحلية.",
    evidence: "backend/src/server.js",
    enabled: false,
    notes: "DÉSACTIVÉ : Le middleware CORS bloque par défaut les origines LAN non configurées."
  },

  // BLOQUÉ : Certification NF525
  "claim_certified_nf525": {
    id: "claim_certified_nf525",
    claimFr: "Logiciel homologué et certifié NF525 inaltérable par l'État.",
    claimAr: "برنامج معتمد بشهادة الجودة الضريبية الرسمية.",
    evidence: "backend/src/modules/closure/closure.repository.js",
    enabled: false,
    notes: "DÉSACTIVÉ : Aucune certification officielle d'organisme d'État n'est détenue. Interdit."
  }
};

/**
 * Utilitaire pour vérifier si un claim est activé
 */
export function isClaimEnabled(claimId: string): boolean {
  return claims[claimId]?.enabled === true;
}
