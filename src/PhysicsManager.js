import { WORLD_SIZE, PLAYER_RADIUS } from './constants.js';

/**
 * PhysicsManager — sets up physics bodies for the tilemap and the player.
 */
export class PhysicsManager {
  constructor(scene) {
    this.scene = scene;
    this.map = null;
    this.layer = null;
  }

  /**
   * Initialize the physics world and create the tilemap with collision.
   */
  setupPhysicsWorld() {
    this.scene.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.createTilemap();
  }

  /**
   * Create the tilemap from the loaded JSON and set up tile collision.
   */
  createTilemap() {
    this.map = this.scene.make.tilemap({ key: 'scene' });
    const spaceTileset = this.map.addTilesetImage('space', 'space-tiles');
    const templateTileset = this.map.addTilesetImage('template', 'template-tiles');
    this.layer = this.map.createLayer('Tile Layer 1', [spaceTileset, templateTileset], 0, 0);
    // all non-empty tiles are collidable
    this.layer.setCollisionByExclusion([-1, 0]);
  }

  /**
   * Create the player physics body and set up collisions with the tilemap.
   */
  createPlayerBody(x, y) {
    const player = this.scene.add.circle(x, y, PLAYER_RADIUS, 0xffffff);
    this.scene.physics.add.existing(player);
    player.body.setCircle(PLAYER_RADIUS);
    player.body.setCollideWorldBounds(true);
    this.scene.physics.add.collider(player, this.layer);
    return player;
  }

  /**
   * Get the tilemap layer for external use (e.g. additional colliders).
   */
  getLayer() {
    return this.layer;
  }
}
