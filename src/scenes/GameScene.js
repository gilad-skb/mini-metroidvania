import Phaser from 'phaser';

/**
 * GameScene — the main gameplay scene.
 * Skeleton: sets up the camera, input, and physics world boundaries.
 * All gameplay logic will be added here as the game develops.
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Placeholder background colour
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Placeholder text
    this.add
      .text(width / 2, height / 2, 'Game Scene — coming soon', {
        fontSize: '22px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Set world bounds (will grow when the map is added)
    this.physics.world.setBounds(0, 0, width, height);

    // Camera follows the world bounds by default
    this.cameras.main.setBounds(0, 0, width, height);

    // TODO: add player, map, enemies, collectibles, etc.

    // Cursor keys skeleton (to be wired to the player later)
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // TODO: implement per-frame game logic
  }
}
