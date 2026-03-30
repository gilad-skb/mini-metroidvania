# Copilot Instructions — Mini Metroidvania

## Project overview

A browser-based 2D platformer built with **Phaser 3** (v3.90) and bundled with **Vite** (v8). It is written in plain **ES2020 JavaScript** (no TypeScript) and deployed automatically to GitHub Pages on every push to `main`.

Live URL: <https://gilad-skb.github.io/mini-metroidvania/>

---

## Directory structure

```
.github/
  workflows/
    deploy.yml              # CI: npm ci → vite build → deploy to GitHub Pages
src/
  main.js                   # Phaser game config + entry point
  constants.js              # Game, world, physics, and UI constants
  PhysicsManager.js         # Physics bodies, colliders, platforms
  GraphicsManager.js        # Rendering: cross room, platforms, UI
  InputManager.js           # Keyboard and touch input handling
  PlayerController.js       # Player movement and jumping logic
  scenes/
    BootScene.js            # First scene; sets global config then starts PreloadScene
    PreloadScene.js         # Loading screen with progress bar; starts MainMenuScene
    MainMenuScene.js        # Title screen; ENTER or tap starts GameScene
    GameScene.js            # Main gameplay scene; orchestrates managers and controllers
index.html                  # Minimal HTML shell; disables default touch actions on canvas
vite.config.js              # Sets base path to /mini-metroidvania/ when GITHUB_PAGES=true
package.json
```

No assets directory exists yet. All visuals are drawn with Phaser's Graphics API and Text objects.

---

## Tech stack

| Concern | Choice |
|---|---|
| Game engine | Phaser 3 (`phaser` npm package) |
| Build tool | Vite |
| Language | JavaScript (ES modules, `"type": "module"`) |
| Physics | Phaser Arcade Physics, gravity `{ y: 300 }` |
| Deployment | GitHub Pages via `.github/workflows/deploy.yml` |
| Tests | None |
| Linter | None (an `eslint-disable` comment exists in `main.js` but ESLint is not installed) |

---

## NPM scripts

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # Production build → dist/
npm run preview  # Serve dist/ locally
```

For the GitHub Pages build, set `GITHUB_PAGES=true` so Vite uses `/mini-metroidvania/` as the base path.

---

## Phaser game configuration (`src/main.js`)

- Canvas size: **800 × 600** (scales to fit the viewport, centered)
- Scale mode: `Phaser.Scale.FIT` with `CENTER_BOTH`
- Physics: Arcade, gravity `y = 300`, debug `false`
- Scene order (startup sequence): `BootScene → PreloadScene → MainMenuScene → GameScene`

---

## Controls

### Keyboard
- **Left / Right arrow keys** — horizontal movement
- **Up arrow key** — jump; hold briefly after takeoff to jump higher
- **Space** — dash in the currently held direction; does nothing if no direction key is held
- **Any keypress** — hides the on-screen control strip until the next pointer-down event

### On-screen touch buttons (control strip — screen-space, pinned to viewport)
The strip is drawn with `setScrollFactor(0)` and spans the full viewport width at the bottom of the screen:

```
[ ▲ Jump (100px) ][ ◀ Left (dynamic) ][ ▶ Right (dynamic) ]
```

The dash button (`»`) is currently commented out in `GraphicsManager.createControlStrip()`.

The interactive zones also use `setScrollFactor(0)` so pointer hit-testing works in screen coordinates regardless of camera scroll. Any pointer-down event shows the control strip again after it has been hidden by keyboard input.

---

## Physics layout

All physics bodies in GameScene:

| Body | Type | Notes |
|---|---|---|
| Top-left corner | Static | Fills the `CORNER × CORNER` cut-out at world (0, 0) |
| Top-right corner | Static | Fills the cut-out at world (`CORNER + ARM_T`, 0) |
| Bottom-left corner | Static | Fills the cut-out at world (0, `CORNER + ARM_T`) |
| Bottom-right corner | Static | Fills the cut-out at world (`CORNER + ARM_T`, `CORNER + ARM_T`) |
| Platforms (×8) | Static | Distributed across all four arms and centre; each 16 px tall |
| Player | Dynamic, circular | 18 px radius; `setCollideWorldBounds(true)` handles outer arm ends; collides with corner bodies and platforms |

`player.body.blocked.down` is `true` when the player is resting on a surface — used to gate jumping.

---

## CI / deployment

`.github/workflows/deploy.yml`:
1. Triggers on push to `main` or manual dispatch.
2. **Build job**: `npm ci` → `npm run build` (with `GITHUB_PAGES=true`) → uploads `dist/` artifact.
3. **Deploy job**: Deploys the artifact to GitHub Pages.

---

## Conventions and style

- **ES modules** — every file uses `import`/`export`; no CommonJS.
- **Phaser scene class** — each scene is a class that `extends Phaser.Scene` with `create()` and (where needed) `update()`.
- **Scene keys** — string keys match class names exactly (`'BootScene'`, `'PreloadScene'`, `'MainMenuScene'`, `'GameScene'`).
- **Graphics drawn in code** — no image assets; everything is `this.add.graphics()`, `this.add.text()`, `this.add.circle()`, or `this.add.rectangle()`.
- **No test runner** — do not add tests without discussing first.
- **No linter** — code style is kept consistent manually; follow the style of the surrounding file.
- **Adding new scenes** — import the class in `src/main.js` and append it to the `scene` array in the Phaser config.
- **Adding assets** — place files in `/public/assets/` and load them in `PreloadScene.preload()` using `this.load.*` calls.
- **Updating these instructions** — after finishing any set of changes, consider whether the changes are major and require to be documented in this instructions file. If so, update the relevant sections to keep them accurate and helpful for future reference.