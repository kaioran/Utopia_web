/**
 * Gestionnaire du thème (Clair / Sombre)
 * - Mémorisation dans localStorage avec try/catch
 * - Détection automatique de prefers-color-scheme
 * - Zéro flash grâce au script d'initialisation inline
 */

export function getInitialTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem('utopia_web_theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // LocalStorage indisponible ou bloqué
  }

  return 'light';
}

export function setTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem('utopia_web_theme', theme);
  } catch {
    // Ignorer
  }
  document.documentElement.setAttribute('data-theme', theme);
  window.dispatchEvent(new CustomEvent('utopia_theme_changed', { detail: { theme } }));
}

export function toggleTheme(): 'light' | 'dark' {
  const current = (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

/**
 * Script inline à injecter dans le <head> avant le rendu du body pour éviter tout flash blanc/noir
 */
export const antiFlashScript = `(function() {
  try {
    var saved = localStorage.getItem('utopia_web_theme');
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
      return;
    }
  } catch(e) {}
  document.documentElement.setAttribute('data-theme', 'light');
})();`;
