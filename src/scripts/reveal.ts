/**
 * Animation de révélation au défilement (IntersectionObserver)
 * - Révélations progressives, échelonnées et directionnelles (.reveal, .reveal-left, .reveal-right, .reveal-scale)
 * - Pause automatique hors écran pour préserver le GPU et la batterie
 * - Respect strict de prefers-reduced-motion
 */

export function initRevealObserver(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const selector = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  // Fallback si IntersectionObserver n'est pas supporté
  if (typeof IntersectionObserver === 'undefined') {
    elements.forEach((el) => {
      el.classList.add('is-revealed');
    });
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.06,
    rootMargin: '0px 0px -20px 0px'
  });

  elements.forEach((el) => {
    // Si déjà dans le viewport initial, révéler immédiatement sans attendre le scroll
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('is-revealed');
    } else {
      observer.observe(el);
    }
  });
}
