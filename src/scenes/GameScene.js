import Phaser from 'phaser';
import { WORLD_SIZE, PLAYER_RADIUS, CONTROL_STRIP_HEIGHT } from '../constants.js';
import { PhysicsManager } from '../PhysicsManager.js';
import { GraphicsManager } from '../GraphicsManager.js';
import { InputManager } from '../InputManager.js';
import { PlayerController } from '../PlayerController.js';
import { PowerupManager } from '../PowerupManager.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.physicsManager = null;
    this.graphicsManager = null;
    this.inputManager = null;
    this.playerController = null;
    this.powerupManager = null;
    this.minimapCamera = null;
    this.minimapMarker = null;
  }

  create() {
    // Initialize managers
    this.graphicsManager = new GraphicsManager(this);
    this.physicsManager = new PhysicsManager(this);
    this.inputManager = new InputManager(this);

    // Set up background and render cross room
    this.graphicsManager.setupBackground();
    this.graphicsManager.drawCrossRoom();

    // Draw platforms
    const platformDefs = this.physicsManager.getPlatformDefinitions();
    this.graphicsManager.drawPlatforms(platformDefs);

    // Set up physics ( walls, platforms, player body)
    this.physicsManager.setupPhysicsWorld();
    this.player = this.physicsManager.createPlayerBody(
      WORLD_SIZE / 2,
      WORLD_SIZE - PLAYER_RADIUS - 1,
    );

    // Initialize player controller
    this.playerController = new PlayerController(this.player);

    // Initialize powerup manager and create powerups
    this.powerupManager = new PowerupManager(this);
    this.powerupManager.createPowerups();
    this.powerupManager.setupCollision(this.player, [
      () => {
        this.playerController.enableDoubleJump();
        this.showPickupPrompt('found double jump!');
      },
      () => {
        this.playerController.enableGlide();
        this.showPickupPrompt('found glide!');
      },
      () => {
        this.handleWin();
        this.showPickupPrompt('you win!');
      },
    ]);

    // Set up camera
    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    // this.cameras.main.setZoom(.75);

    // Create control strip UI
    const controlUI = this.graphicsManager.createControlStrip();
    this.inputManager.setControlStripElements([
      controlUI.uiGraphics,
      ...controlUI.labels,
    ]);
    this.inputManager.setupControlStripZones(controlUI.zones);

    // Create minimap
    const { minimapCamera, borderGraphics } = this.graphicsManager.createMinimap();
    this.minimapCamera = minimapCamera;
    this.minimapCamera.startFollow(this.player, true, 0.1, 0.1);

    // player marker: a world-space circle only the minimap sees
    // radius 80 world-px → ~4px on the minimap at 0.05 zoom
    this.minimapMarker = this.add.circle(this.player.x, this.player.y, 60, 0xffffff).setDepth(5);
    this.minimapMarker.setDepth(5);
    this.cameras.main.ignore(this.minimapMarker);

    // hide UI and border frame from the minimap camera
    this.minimapCamera.ignore([controlUI.uiGraphics, ...controlUI.labels, borderGraphics]);

    // Set up input
    this.inputManager.setupInput();
  }

  update(_, delta) {
    if (!this.player || !this.player.body || !this.playerController) return;

    const inputState = this.inputManager.getInputState();
    this.playerController.update(inputState, delta);
    this.inputManager.clearJumpPressed();
    this.inputManager.clearDashPressed();

    // sync minimap player marker to current player position
    if (this.minimapMarker) {
      this.minimapMarker.setPosition(this.player.x, this.player.y);
    }
  }

  /**
   * Show a centered screen-space prompt for 2 seconds, then fade it out.
   */
  showPickupPrompt(message) {
    const { width: sw, height: sh } = this.scale;
    const text = this.add.text(sw / 2, sh / 2, message, {
      fontSize: '28px',
      color: '#ffaa00',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10);

    // pickup prompts are UI-only; hide from minimap
    if (this.minimapCamera) {
      this.minimapCamera.ignore(text);
    }

    this.tweens.add({
      targets: text,
      alpha: 0,
      delay: 1700,
      duration: 300,
      onComplete: () => text.destroy(),
    });
  }
}
