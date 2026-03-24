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

1. **Layout** — Calculates a responsive square room that fits the screen with configurable padding and a control strip below it.
2. **Drawing** — Renders the room outline, a mid-air platform, the player circle, and three control buttons using Phaser graphics.
3. **Physics** — Creates four invisible static walls (floor, ceiling, left, right), a static platform, and a dynamic circular player body; registers colliders.
4. **Input** — Handles both keyboard arrows and on-screen touch buttons.
5. **Update loop** — Applies horizontal velocity and handles jump each frame.

---

## GameScene constants

| Constant | Value | Meaning |
|---|---|---|
| `PLAYER_SPEED` | `200` | Horizontal speed (px/s) |
| `JUMP_VELOCITY` | `-380` | Upward velocity applied on jump |
| `JUMP_BTN_WIDTH` | `60` | Width of the jump button (px) |
| `BTN_COLOR` | `0xaa88ff` | Purple colour for button borders and labels |

Layout variables (defined inside `create()`):

| Variable | Value | Meaning |
|---|---|---|
| `topPadding` | `20` | Space above room |
| `sidePadding` | `40` | Space on each side of room |
| `controlStripHeight` | `80` | Height of button strip below room |
| `controlStripGap` | `15` | Gap between room bottom and button strip |
| `bottomPadding` | `20` | Space below button strip |
| `wallThickness` | `20` | Thickness of invisible physics walls |
| `playerRadius` | `18` | Radius of player circle |
| `platformHeight` | `16` | Height of the mid-air platform |
| `platformWidth` | `roomSize * 0.4` | Width of the mid-air platform (40% of room) |
| `platformX` | `roomX + (roomSize - platformWidth) / 2` | Left edge of platform (centred horizontally) |
| `platformY` | `roomY + roomSize * 0.55` | Top edge of platform (55% down from room top) |

---

## Controls

### Keyboard
- **Left / Right arrow keys** — horizontal movement
- **Up arrow key** — jump (only when grounded)

### On-screen touch buttons (control strip below room)
The strip is divided into three buttons:

```
[ ▲ Jump (60px) ][ ◀ Left (dynamic) ][ ▶ Right (dynamic) ]
```

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
| Floor | Static | Centred at bottom of room, wider than room |
| Ceiling | Static | Centred at top of room, wider than room |
| Left wall | Static | Left edge of room |
| Right wall | Static | Right edge of room |
| Platform | Static | Horizontally centred, 55% down from room top; reachable by jumping |
| Player | Dynamic, circular | 18 px radius; collides with all four walls and the platform |

`player.body.blocked.down` is `true` when the player is resting on the floor — used to gate jumping.

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
