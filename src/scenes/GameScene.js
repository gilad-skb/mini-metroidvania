import Phaser from 'phaser';
import { WORLD_SIZE, PLAYER_RADIUS, CONTROL_STRIP_HEIGHT } from '../constants.js';
import { PhysicsManager } from '../PhysicsManager.js';
import { GraphicsManager } from '../GraphicsManager.js';
import { InputManager } from '../InputManager.js';
import { PlayerController } from '../PlayerController.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.physicsManager = null;
    this.graphicsManager = null;
    this.inputManager = null;
    this.playerController = null;
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

    // Set up camera
    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Create control strip UI
    const controlUI = this.graphicsManager.createControlStrip();
    this.inputManager.setControlStripElements([
      controlUI.uiGraphics,
      ...controlUI.labels,
    ]);
    this.inputManager.setupControlStripZones(controlUI.zones);

    // Set up input
    this.inputManager.setupInput();
  }

  update(_, delta) {
    if (!this.player || !this.player.body || !this.playerController) return;

    const inputState = this.inputManager.getInputState();
    this.playerController.update(inputState, delta);
    this.inputManager.clearJumpPressed();
  }
}
