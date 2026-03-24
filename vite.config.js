import { defineConfig } from 'vite';

// GitHub Pages deploys to https://<user>.github.io/<repo>/
// Set the base path to match the repository name.
const base = process.env.GITHUB_PAGES ? '/mini-metroidvania/' : '/';

export default defineConfig({
  base,
  build: {
    outDir: 'dist',
  },
});
