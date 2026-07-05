import path from 'path';
import { defineConfig } from 'vite';

// Les variables Firebase sont lues directement via import.meta.env.VITE_*
// (convention Vite standard) dans services/firebaseService.ts.
// Aucun "define" custom n'est nécessaire : toute variable préfixée VITE_
// dans .env / .env.local est automatiquement exposée au code client.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
