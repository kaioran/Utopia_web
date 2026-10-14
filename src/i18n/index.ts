import fr from './fr.json';
import ar from './ar.json';
import en from './en.json';
import tr from './tr.json';
import de from './de.json';
import es from './es.json';
import it from './it.json';
import pt from './pt.json';
import bn from './bn.json';
import ur from './ur.json';
import hi from './hi.json';
import fil from './fil.json';

export const translations = {
  fr,
  en,
  tr,
  de,
  es,
  it,
  ar,
  pt,
  bn,
  ur,
  hi,
  fil,
} as const;

export type SupportedLocale = keyof typeof translations;

export const defaultLocale: SupportedLocale = 'fr';

export function getTranslations(locale: string) {
  return (translations as Record<string, any>)[locale] || translations.fr;
}
