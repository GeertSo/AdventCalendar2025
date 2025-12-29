import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // ---- IMPORTANT FOR PRODUCTION ----
  // If your site will be served from a sub‑folder (e.g. https://example.com/app/),
  // set the `base` option accordingly.
  // For root domain use '/' (default).
  //base: '/advent2025/',   // <-- change to '/your-subfolder/' if needed
  base: '/gesotest42/',   // <-- change to '/your-subfolder/' if needed

  // Build options (defaults are fine for most cases) - no console output
  build: {
    outDir: 'dist',          // folder that will contain the final assets
    assetsDir: 'assets',     // where js/css/img will be placed inside `outDir`
  sourcemap: false,        // set true only for debugging a prod build
    rollupOptions: {
      // you can add manual chunking, external libs, etc. here
    },
  },

  // Will enable console output
  // build: {
  //   outDir: 'dist',          // folder that will contain the final assets
  //   assetsDir: 'assets',     // where js/css/img will be placed inside `outDir`
  //   minify: false,          // <-- no minifier
  //   esbuild: {
  //     pure: [],            // <-- LEERE LISTE = nichts wird als pure behandelt => console output funktioniert
  //   },
  //   sourcemap: true,        // optional – helps you debug the original source
  //   rollupOptions: {
  //        treeshake: false,
  //     // you can add manual chunking, external libs, etc. here
  //   },
  //  },
})
