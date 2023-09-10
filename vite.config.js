// vite.config.js

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: '[name].js', // JS file name pattern
        chunkFileNames: '[name].js', // JS chunk file name pattern
        assetFileNames: '[name][extname]', // CSS and other asset file name pattern
      },
    },
  },
});
