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

## Scene descriptions

### BootScene
Runs first. Currently performs no setup and immediately calls `this.scene.start('PreloadScene')`.

### PreloadScene
Shows a progress bar (dark-gray background, blue fill) while loading assets. No real assets exist yet — there are TODO comments showing where `this.load.image()` / `this.load.tilemapTiledJSON()` calls should go. Calls `this.scene.start('MainMenuScene')` when done.

### MainMenuScene
Displays the game title and a blinking "Press ENTER or Tap to Start" prompt. Starts `GameScene` on ENTER keypress or any pointer-down event.

### GameScene
The sole gameplay scene. Orchestrates several manager modules to keep concerns separated:

1. **PhysicsManager** — Creates and manages all physics bodies (corner walls, platforms, player body) and colliders.
2. **GraphicsManager** — Handles all rendering: cross room interior/outline, platforms, and the control strip UI.
3. **InputManager** — Manages keyboard and pointer input; maintains control strip state and visibility.
4. **PlayerController** — Handles player movement logic (horizontal velocity, jumping, jump hold timer, double-jump).

GameScene delegates to these modules in its `create()` and `update()` methods, keeping the scene class lean and focused on orchestration.

---

## Module architecture

### `constants.js`
Exports all game constants used across GameScene and manager modules. Includes:
- Player movement: `PLAYER_SPEED`, `JUMP_VELOCITY`, `JUMP_HOLD_ACCEL`, `JUMP_HOLD_TIME`, `MAX_JUMPS`
- Dash: `DASH_SPEED`, `DASH_DURATION`
- UI: `JUMP_BTN_WIDTH`, `DASH_BTN_WIDTH`, `BTN_COLOR`, `CONTROL_STRIP_HEIGHT`
- World geometry: `WORLD_SIZE`, `ARM_T`, `CORNER`
- Graphics: `PLATFORM_HEIGHT`, `PLAYER_RADIUS`

### `PhysicsManager.js`
Encapsulates all physics setup and collider creation:
- **`setupPhysicsWorld()`** — Initializes world bounds and creates both corner walls and platforms.
- **`createCornerWalls()`** — Creates the four static corner bodies that block cut-out regions.
- **`createPlatforms()`** — Creates static colliders for all mid-air platforms.
- **`createPlayerBody(x, y)`** — Creates the player physics body and registers all collisions.
- **`getPlatformDefinitions()`** — Returns platform data for rendering.

### `GraphicsManager.js`
Handles all visual rendering:
- **`setupBackground()`** — Sets the camera background color.
- **`drawCrossRoom()`** — Draws the cross-shaped room fill and outline (world space).
- **`drawPlatforms(platformDefs)`** — Draws all platform rectangles (world space).
- **`createControlStrip()`** — Creates the control strip UI (jump, left, right buttons) with graphics and labels; returns UI elements and zone definitions for input binding.

### `InputManager.js`
Manages keyboard and touch input:
- **`setupInput()`** — Initializes cursor keys and sets up keyboard/pointer event handlers.
- **`setupControlStripZones(zoneDefinitions)`** — Creates interactive zones for the three control buttons.
- **`setControlStripVisible(isVisible)`** — Toggles control strip visibility and enables/disables zone interactivity.
- **`setControlStripElements(elements)`** — Stores references to UI graphics and labels for visibility toggling.
- **`getInputState()`** — Returns the current input state (cursor keys, button flags, jump held).
- **`clearJumpPressed()`** — Resets the jump pressed flag after each update.

### `PlayerController.js`
Manages player movement, jumping, dash, and state:
- **`updateHorizontalMovement(inputState)`** — Applies horizontal velocity based on keyboard and on-screen button input; skipped while dashing.
- **`updateJumpLogic(inputState, delta)`** — Handles jump initiation, double-jump, and jump-hold acceleration logic.
- **`updateDashLogic(inputState, delta)`** — Initiates a dash in the held direction when `dashPressed` and a direction key is held; sustains dash velocity for `DASH_DURATION` ms.
- **`update(inputState, delta)`** — Main update method: dash → horizontal movement → jump logic.
- **`getState()`** — Returns the player's current state (jumps used, jump timer, airborne status).

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
[ ▲ Jump (100px) ][ » Dash (100px) ][ ◀ Left (dynamic) ][ ▶ Right (dynamic) ]
```

The interactive zones also use `setScrollFactor(0)` so pointer hit-testing works in screen coordinates regardless of camera scroll.

Button state is managed by InputManager:
- When a button is pressed, InputManager sets `this.jumpHeld`, `this.dashPressed`, `this.leftPressed`, or `this.rightPressed` to `true`.
- When a button is released or pointer leaves the zone, these flags are set to `false` (dash resets each update via `clearDashPressed`).
- Any pointer-down event shows the control strip again after it has been hidden by keyboard input.

### Update-loop flow

The `GameScene.update()` method now delegates to the manager modules:

```javascript
update(_, delta) {
  const inputState = this.inputManager.getInputState();
  this.playerController.update(inputState, delta);
  this.inputManager.clearJumpPressed();
}
```

The player movement and jumping logic is now handled entirely by `PlayerController`:
1. **Horizontal movement** — Checks keyboard and button states from `InputManager`, applies velocity.
2. **Jump logic** — Detects jump press edges, manages jump hold timer, applies acceleration for higher arcs, and handles double-jump counts.

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
