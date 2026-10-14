/**
 * Adaptateur de collecte des contacts (Leads)
 * - Conforme aux exigences : Pas de backend imposé, zéro blocage du téléchargement
 * - Extraction sécurisée des paramètres URL (ref, utm_source, utm_campaign...) dans sessionStorage
 * - Envoi silencieux vers leadEndpoint si configuré, ou génération du lien wa.me prérempli
 */

import { siteConfig } from '../config/site.config';

export interface LeadPayload {
  firstName: string;
  contact: string; // WhatsApp ou E-mail
  storeType: string;
  city?: string;
  consent: boolean;
  consentTextVersion: string;
  timestamp: string;
  locale: 'fr' | 'ar' | 'en' | 'tr' | 'de' | 'es' | 'it' | string;
  partnerRef?: string | null;
  utm?: Record<string, string>;
}

export function sanitizeSafeText(val: string, maxLen = 100): string {
  if (!val) return '';
  return val
    .replace(/[<>'"&;]/g, '')
    .trim()
    .slice(0, maxLen);
}

// Extraction et mémorisation éphémère des paramètres d'attribution
export function getAttributionParams(): { partnerRef: string | null; utm: Record<string, string> } {
  const result = {
    partnerRef: null as string | null,
    utm: {} as Record<string, string>
  };

  if (typeof window === 'undefined') return result;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const rawRef = urlParams.get('ref') || sessionStorage.getItem('utopia_partner_ref');
    if (rawRef) {
      const cleanRef = sanitizeSafeText(rawRef, 30);
      result.partnerRef = cleanRef;
      sessionStorage.setItem('utopia_partner_ref', cleanRef);
    }

    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    utmKeys.forEach((key) => {
      const rawVal = urlParams.get(key) || sessionStorage.getItem(`utopia_${key}`);
      if (rawVal) {
        const cleanVal = sanitizeSafeText(rawVal, 60);
        result.utm[key] = cleanVal;
        sessionStorage.setItem(`utopia_${key}`, cleanVal);
      }
    });
  } catch {
    // sessionStorage indisponible ou mode navigation privée stricte
  }

  return result;
}

/**
 * Envoie le lead ou prépare le lien de suivi WhatsApp sans jamais bloquer le téléchargement
 */
export async function submitLead(payload: LeadPayload): Promise<{ success: boolean; whatsappUrl: string }> {
  const isAr = payload.locale === 'ar';
  const isUr = payload.locale === 'ur';
  const cleanNumber = siteConfig.contact.whatsappNumber.replace(/[^0-9]/g, '');

  const safeFirstName = sanitizeSafeText(payload.firstName, 50);
  const safeStore = sanitizeSafeText(payload.storeType, 50);
  const safeCity = payload.city ? sanitizeSafeText(payload.city, 50) : '';
  const safeRef = payload.partnerRef ? sanitizeSafeText(payload.partnerRef, 30) : '';

  // Construction du message WhatsApp prérempli
  let waMessage = `Bonjour StellarSoft, je suis ${safeFirstName}. Je souhaite découvrir Utopia pour mon commerce (${safeStore})${safeCity ? ` à ${safeCity}` : ''}.${safeRef ? ` [Ref: ${safeRef}]` : ''}`;
  if (isAr) {
    waMessage = `مرحباً، أنا ${safeFirstName}. أريد تجربة يوتوبيا لنشاطي التجاري (${safeStore})${safeCity ? ` في ${safeCity}` : ''}.${safeRef ? ` [كود: ${safeRef}]` : ''}`;
  } else if (isUr) {
    waMessage = `السلام علیکم، میں ${safeFirstName} ہوں۔ میں اپنے کاروبار (${safeStore})${safeCity ? ` بمقام ${safeCity}` : ''} کے لیے یوٹوپیا ٹیسٹ کرنا چاہتا ہوں۔${safeRef ? ` [کوڈ: ${safeRef}]` : ''}`;
  }

  const whatsappUrl = cleanNumber.length >= 8
    ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(waMessage)}`
    : `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent("Demande de démo Utopia POS")}&body=${encodeURIComponent(waMessage)}`;

  // Si un endpoint webhook est configuré, envoyer en arrière-plan sans bloquer
  if (siteConfig.leadCapture.endpoint) {
    try {
      await fetch(siteConfig.leadCapture.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'cors'
      });
    } catch (e) {
      console.warn('[Utopia Lead] Envoi endpoint échoué, poursuite sans blocage:', e);
    }
  }

  return { success: true, whatsappUrl };
}
