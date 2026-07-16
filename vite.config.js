import { defineConfig } from "vite";
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vite.dev/config/
export default defineConfig({
  base: '/Age-Caluclator/',
  publicDir: 'public',
  plugins: [viteSingleFile()],
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    brotliSize: false,
  },
});
