import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://utopia-pos.dz',
  integrations: [
    react()
  ],
  devToolbar: {
    enabled: false
  },
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en', 'pt', 'es', 'it', 'de', 'tr', 'ar', 'ur', 'hi', 'bn', 'fil'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  build: {
    format: 'directory'
  }
});
