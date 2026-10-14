import React, { useState, useEffect, useRef } from 'react';
import { siteConfig } from '../config/site.config';
import { submitLead, getAttributionParams, sanitizeSafeText } from '../scripts/leadAdapter';

interface DownloadModalProps {
  locale: 'fr' | 'ar' | 'en' | 'tr' | 'de' | 'es' | 'it' | 'pt' | 'ur' | 'hi' | 'bn' | 'fil' | string;
  labels: {
    title: string;
    subtitle: string;
    firstName: string;
    firstNamePlaceholder: string;
    contact: string;
    contactPlaceholder: string;
    storeType: string;
    city: string;
    cityPlaceholder: string;
    consent: string;
    submit: string;
    submitting: string;
    errorContact: string;
    errorName: string;
    successTitle: string;
    successSubtitle: string;
    fallbackLink: string;
    whatsappFollowup: string;
    close: string;
  };
}

export default function DownloadModal({ locale, labels }: DownloadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [contact, setContact] = useState('');
  const [storeType, setStoreType] = useState(siteConfig.storeTypes[0]?.id || 'autre');
  const [city, setCity] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Anti-robot invisible
  const [errorMessage, setErrorMessage] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const openTimeRef = useRef<number>(Date.now());
  const isRtl = locale === 'ar' || locale === 'ur';
  const isAr = locale === 'ar';
  const isUr = locale === 'ur';

  // Intercepter les clics sur tous les boutons/liens vers #telecharger
  useEffect(() => {
    const handleCtaClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href="#telecharger"], button[data-action="download"]');
      if (target) {
        e.preventDefault();
        openTimeRef.current = Date.now();
        setIsOpen(true);
      }
    };

    document.addEventListener('click', handleCtaClick);
    return () => document.removeEventListener('click', handleCtaClick);
  }, []);

  // Fermeture par touche Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Détection anti-robot : honeypot rempli ou soumission instantanée (<600ms)
    if (honeypot.trim() !== '' || Date.now() - openTimeRef.current < 600) {
      return;
    }

    const cleanFirstName = sanitizeSafeText(firstName, 50);
    if (!cleanFirstName) {
      setErrorMessage(labels.errorName);
      return;
    }

    // Validation contact (téléphone algérien / international ou e-mail)
    const cleanContact = sanitizeSafeText(contact, 60);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanContact);
    const isPhone = /^(\+?[0-9\s\-\.\(\)]{8,18})$/.test(cleanContact);

    if (!isEmail && !isPhone) {
      setErrorMessage(labels.errorContact);
      return;
    }

    const cleanCity = sanitizeSafeText(city, 50);
    setLoading(true);

    const attribution = getAttributionParams();
    const selectedStoreType = siteConfig.storeTypes.find(s => s.id === storeType);
    const storeLabel = isRtl ? selectedStoreType?.labelAr : selectedStoreType?.labelFr;

    const payload = {
      firstName: cleanFirstName,
      contact: cleanContact,
      storeType: storeLabel || storeType,
      city: cleanCity || undefined,
      consent,
      consentTextVersion: "1.0-dz-2026",
      timestamp: new Date().toISOString(),
      locale,
      partnerRef: attribution.partnerRef,
      utm: attribution.utm
    };

    try {
      const res = await submitLead(payload);
      setWhatsappUrl(res.whatsappUrl);
    } catch {
      // Jamais bloqué
    } finally {
      setLoading(false);
      setIsSubmitted(true);

      // Déclencher le téléchargement réel de l'installeur
      const dlLink = document.createElement('a');
      dlLink.href = siteConfig.cta.downloadUrl;
      dlLink.setAttribute('download', 'Utopia_POS_Setup_1.0.0.exe');
      document.body.appendChild(dlLink);
      dlLink.click();
      document.body.removeChild(dlLink);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    // Reset après fermeture
    setTimeout(() => {
      setIsSubmitted(false);
      setErrorMessage('');
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={closeModal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div 
        className="modal-card" 
        onClick={e => e.stopPropagation()} 
        ref={modalRef} 
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <button type="button" className="modal-close-btn" onClick={closeModal} aria-label={labels.close}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {!isSubmitted ? (
          <div>
            <div className="modal-header">
              <span className="modal-badge">Utopia POS 2026</span>
              <h2 className="modal-title" id="modal-title">{labels.title}</h2>
              <p className="modal-subtitle">{labels.subtitle}</p>
            </div>

            {errorMessage && (
              <div className="modal-error-banner" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Champ anti-robot invisible */}
              <input 
                type="text" 
                name="b_url_security" 
                value={honeypot} 
                onChange={e => setHoneypot(e.target.value)} 
                tabIndex={-1} 
                autoComplete="off" 
                aria-hidden="true"
                style={{ display: 'none' }} 
              />

              {/* Prénom */}
              <div className="form-group">
                <label htmlFor="lead-name" className="form-label">{labels.firstName} *</label>
                <input 
                  type="text" 
                  id="lead-name" 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)} 
                  placeholder={labels.firstNamePlaceholder} 
                  required 
                  maxLength={50}
                  autoComplete="name"
                  className="form-input" 
                />
              </div>

              {/* WhatsApp ou E-mail */}
              <div className="form-group">
                <label htmlFor="lead-contact" className="form-label">{labels.contact} *</label>
                <input 
                  type="text" 
                  id="lead-contact" 
                  value={contact} 
                  onChange={e => setContact(e.target.value)} 
                  placeholder={labels.contactPlaceholder} 
                  required 
                  maxLength={60}
                  autoComplete="tel"
                  className="form-input" 
                />
              </div>

              {/* Type de commerce */}
              <div className="form-group">
                <label htmlFor="lead-store" className="form-label">{labels.storeType}</label>
                <select 
                  id="lead-store" 
                  value={storeType} 
                  onChange={e => setStoreType(e.target.value)} 
                  className="form-select"
                >
                  {siteConfig.storeTypes.map(st => (
                    <option key={st.id} value={st.id}>
                      {isRtl ? st.labelAr : st.labelFr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ville (optionnel) */}
              <div className="form-group">
                <label htmlFor="lead-city" className="form-label">{labels.city}</label>
                <input 
                  type="text" 
                  id="lead-city" 
                  value={city} 
                  onChange={e => setCity(e.target.value)} 
                  placeholder={labels.cityPlaceholder} 
                  maxLength={50}
                  autoComplete="address-level2"
                  className="form-input" 
                />
              </div>

              {/* Case de consentement NON cochée par défaut */}
              <div className="form-checkbox-group">
                <input 
                  type="checkbox" 
                  id="lead-consent" 
                  checked={consent} 
                  onChange={e => setConsent(e.target.checked)} 
                  className="form-checkbox" 
                />
                <label htmlFor="lead-consent" className="checkbox-label">
                  {labels.consent}
                </label>
              </div>

              <button type="submit" disabled={loading} className="btn-primary modal-submit-btn">
                <span>{loading ? labels.submitting : labels.submit}</span>
              </button>

              <div className="modal-privacy-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>{isAr ? "بياناتك محمية تماماً ولا تتم مشاركتها مع أي جهة خارجية." : (isUr ? "آپ کا ڈیٹا مکمل طور پر محفوظ ہے اور کبھی شیئر نہیں کیا جاتا۔" : (locale === 'en' ? "Your data is strictly confidential and protected." : "Vos données sont strictement confidentielles et protégées."))}</span>
              </div>
            </form>
          </div>
        ) : (
          <div className="modal-success-view">
            <div className="success-icon-wrapper">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 className="success-title">{labels.successTitle}</h2>
            <p className="success-subtitle">{labels.successSubtitle}</p>

            <a href={siteConfig.cta.downloadUrl} className="fallback-dl-link">
              {labels.fallbackLink}
            </a>

            {/* SHA-256 uniquement si configuré */}
            {siteConfig.cta.installerSha256 && (
              <div className="sha-badge">
                SHA-256 : <code>{siteConfig.cta.installerSha256}</code>
              </div>
            )}

            <div className="success-actions">
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-whatsapp-followup"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span>{labels.whatsappFollowup}</span>
              </a>
              <button type="button" onClick={closeModal} className="btn-secondary-close">
                {labels.close}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(10, 14, 30, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .modal-card {
          position: relative;
          width: 100%;
          max-width: 480px;
          background: var(--chrome-surface, #FFFFFF);
          color: var(--chrome-text, #0F172A);
          border: 1px solid var(--chrome-border, #E2E8F0);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.18), 0 0 30px rgba(0, 174, 239, 0.12);
          max-height: 90vh;
          overflow-y: auto;
          font-family: 'Cairo', sans-serif !important;
        }

        .modal-card * {
          font-family: 'Cairo', sans-serif !important;
        }

        .modal-close-btn {
          position: absolute;
          top: 1rem;
          inset-inline-end: 1rem;
          background: var(--chrome-surface-subtle);
          color: var(--chrome-text-muted);
          border: 1px solid var(--chrome-border);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: background 0.2s, color 0.2s;
        }

        .modal-close-btn:hover {
          background: var(--chrome-surface-hover);
          color: var(--chrome-text);
        }

        .modal-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .modal-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          color: #0284C7;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.4rem;
        }

        .modal-title {
          font-size: 1.45rem;
          font-weight: 900;
          line-height: 1.25;
          margin-bottom: 0.4rem;
          color: var(--chrome-text);
        }

        .modal-subtitle {
          font-size: 0.85rem;
          color: var(--chrome-text-muted);
        }

        .modal-error-banner {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid #EF4444;
          color: #DC2626;
          padding: 0.6rem 0.8rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          text-align: start;
        }

        .form-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--chrome-text);
        }

        .form-input, .form-select {
          background: var(--content-bg-alt, #F1F5F9);
          border: 1px solid var(--content-border, #E2E8F0);
          color: var(--content-text, #0F172A);
          padding: 0.65rem 0.85rem;
          border-radius: 10px;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s, background-color 0.2s;
        }

        .form-input:focus, .form-select:focus {
          border-color: #00AEEF;
          background: var(--content-surface, #FFFFFF);
        }

        .form-checkbox-group {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          margin-top: 0.25rem;
        }

        .form-checkbox {
          width: 16px;
          height: 16px;
          margin-top: 2px;
          accent-color: #00AEEF;
          cursor: pointer;
        }

        .checkbox-label {
          font-size: 0.75rem;
          color: #94A3B8;
          line-height: 1.45;
          cursor: pointer;
        }

        .modal-submit-btn {
          width: 100%;
          padding: 0.85rem;
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        .modal-privacy-note {
          text-align: center;
          font-size: 0.72rem;
          color: #64748B;
        }

        /* Vue de succès */
        .modal-success-view {
          text-align: center;
          padding: 1.5rem 0.5rem;
        }

        .success-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.15);
          color: #10B981;
          border: 2px solid #10B981;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 900;
          margin: 0 auto 1.25rem auto;
        }

        .success-title {
          font-size: 1.4rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
        }

        .success-subtitle {
          font-size: 0.88rem;
          color: #94A3B8;
          margin-bottom: 1.5rem;
        }

        .fallback-dl-link {
          display: inline-block;
          color: #00AEEF;
          font-size: 0.85rem;
          font-weight: 700;
          text-decoration: underline;
          margin-bottom: 1.5rem;
        }

        .success-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .btn-whatsapp-followup {
          background: #25D366;
          color: #FFF;
          font-weight: 800;
          padding: 0.85rem;
          border-radius: 30px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4);
        }

        .btn-secondary-close {
          background: transparent;
          color: #94A3B8;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.65rem;
          border-radius: 30px;
          font-weight: 700;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
