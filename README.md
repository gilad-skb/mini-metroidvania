# mini-metroidvania

A mini Metroidvania game built with [Phaser 3](https://phaser.io/).

## Development

```bash
npm install      # install dependencies
npm run dev      # start local dev server (http://localhost:5173)
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

## Project Structure

```
src/
  main.js               # Game bootstrap & Phaser config
  scenes/
    BootScene.js        # First scene — global setup
    PreloadScene.js     # Asset loading with progress bar
    MainMenuScene.js    # Main menu
    GameScene.js        # Main gameplay scene
```

## Deployment

The game is automatically deployed to GitHub Pages on every push to `main` via the [Deploy workflow](.github/workflows/deploy.yml).

**Live URL:** https://gilad-skb.github.io/mini-metroidvania/

To enable GitHub Pages in your fork:
1. Go to **Settings → Pages**
2. Set **Source** to **GitHub Actions**
