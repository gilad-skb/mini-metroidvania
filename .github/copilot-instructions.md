# Copilot Instructions — Mini Metroidvania

## Project overview

A browser-based 2D platformer built with **Phaser 3** (v3.90) and bundled with **Vite** (v8). It is written in plain **ES2020 JavaScript** (no TypeScript) and deployed automatically to GitHub Pages on every push to `main`.

Live URL: <https://gilad-skb.github.io/mini-metroidvania/>

---

## Directory structure

```
.github/
  workflows/
    deploy.yml          # CI: npm ci → vite build → deploy to GitHub Pages
src/
  main.js               # Phaser game config + entry point
  scenes/
    BootScene.js        # First scene; sets global config then starts PreloadScene
    PreloadScene.js     # Loading screen with progress bar; starts MainMenuScene
    MainMenuScene.js    # Title screen; ENTER or tap starts GameScene
    GameScene.js        # Main gameplay: room, player, physics, controls
index.html              # Minimal HTML shell; disables default touch actions on canvas
vite.config.js          # Sets base path to /mini-metroidvania/ when GITHUB_PAGES=true
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

## Scene descriptions

### BootScene
Runs first. Currently performs no setup and immediately calls `this.scene.start('PreloadScene')`.

### PreloadScene
Shows a progress bar (dark-gray background, blue fill) while loading assets. No real assets exist yet — there are TODO comments showing where `this.load.image()` / `this.load.tilemapTiledJSON()` calls should go. Calls `this.scene.start('MainMenuScene')` when done.

### MainMenuScene
Displays the game title and a blinking "Press ENTER or Tap to Start" prompt. Starts `GameScene` on ENTER keypress or any pointer-down event.

### GameScene
The sole gameplay scene. Key responsibilities:

1. **World** — A 2000 × 2000 pixel cross/plus-sign shaped room, larger than the 800 × 600 viewport.
2. **Drawing** — Renders the cross outline and fill (world space), several mid-air platforms, and three control buttons (screen space) using Phaser graphics.
3. **Physics** — Four large static corner bodies block the cut-out regions of the cross; `setCollideWorldBounds(true)` handles the outer arm ends; static platforms and a dynamic circular player body; registers all colliders.
4. **Camera** — Main camera follows the player with smooth lerp (0.1) and is clamped to the world bounds.
5. **Input** — Handles both keyboard arrows and on-screen touch buttons (pinned to the viewport via `setScrollFactor(0)`).
6. **Update loop** — Applies horizontal velocity and handles jump each frame.

---

## GameScene constants

| Constant | Value | Meaning |
|---|---|---|
| `PLAYER_SPEED` | `200` | Horizontal speed (px/s) |
| `JUMP_VELOCITY` | `-380` | Upward velocity applied on jump |
| `JUMP_BTN_WIDTH` | `60` | Width of the jump button (px) |
| `BTN_COLOR` | `0xaa88ff` | Purple colour for button borders and labels |
| `WORLD_SIZE` | `2000` | Side length (px) of the square bounding box of the cross world |
| `ARM_T` | `600` | Pixel thickness of each arm of the cross |
| `CORNER` | `700` | Size of each square corner cut-out: `(WORLD_SIZE − ARM_T) / 2` |

Layout variables (defined inside `create()`):

| Variable | Value | Meaning |
|---|---|---|
| `controlStripHeight` | `80` | Height of the on-screen button strip (px) |
| `controlStripY` | `sh − 80` | Top Y of the button strip in screen space |
| `platformHeight` | `16` | Height of each mid-air platform |
| `playerRadius` | `18` | Radius of the player circle |

---

## Controls

### Keyboard
- **Left / Right arrow keys** — horizontal movement
- **Up arrow key** — jump (only when grounded)

### On-screen touch buttons (control strip — screen-space, pinned to viewport)
The strip is drawn with `setScrollFactor(0)` and spans the full viewport width at the bottom of the screen:

```
[ ▲ Jump (60px) ][ ◀ Left (dynamic) ][ ▶ Right (dynamic) ]
```

The interactive zones also use `setScrollFactor(0)` so pointer hit-testing works in screen coordinates regardless of camera scroll.

Each button uses `pointerdown` / `pointerup` / `pointerout` to set a boolean state on the scene:
- `this.jumpPressed`
- `this.leftPressed`
- `this.rightPressed`

### Movement logic (`update()`)
```javascript
// Keyboard
if (cursors.left.isDown)  vx = -PLAYER_SPEED;
if (cursors.right.isDown) vx =  PLAYER_SPEED;

// Touch buttons (override keyboard when active; left-priority if both held)
if (this.leftPressed)       vx = -PLAYER_SPEED;
else if (this.rightPressed) vx =  PLAYER_SPEED;

player.body.setVelocityX(vx);

// Jump — only when standing on a surface
if ((cursors.up.isDown || this.jumpPressed) && player.body.blocked.down) {
  player.body.setVelocityY(JUMP_VELOCITY);
}
```

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
- **Updating these instructions** — after finishing any set of changes, review this file and update it if the changes introduce, remove, or alter anything documented here (new constants, new scenes, changed controls, new conventions, etc.). Only update what is actually affected; do not rewrite unrelated sections.
