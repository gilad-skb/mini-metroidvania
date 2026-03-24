import Phaser from 'phaser';

/** Horizontal movement speed in pixels per second. */
const PLAYER_SPEED = 200;

/** Initial vertical velocity applied when jumping (negative = upward). */
const JUMP_VELOCITY = -380;

/** Minimum horizontal pointer travel (px) before a swipe is recognised. */
const SWIPE_THRESHOLD = 15;

/**
 * GameScene — the main gameplay scene.
 * Renders a square room with a circle player that can be moved
 * using arrow keys (left / right / up to jump) or touch swipe gestures.
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Square room — centered, leaving equal padding on all sides
    const padding = 40;
    const roomSize = Math.min(width, height) - padding * 2;
    const roomX = (width - roomSize) / 2;
    const roomY = (height - roomSize) / 2;

    // Draw visible room outline
    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0x44aaff, 1);
    graphics.strokeRect(roomX, roomY, roomSize, roomSize);

    // Invisible static physics walls that align with the room border
    const wallThickness = 20;
    this.walls = [];
    [
      // floor
      { x: roomX + roomSize / 2, y: roomY + roomSize + wallThickness / 2, w: roomSize + wallThickness * 2, h: wallThickness },
      // ceiling
      { x: roomX + roomSize / 2, y: roomY - wallThickness / 2,            w: roomSize + wallThickness * 2, h: wallThickness },
      // left wall
      { x: roomX - wallThickness / 2,            y: roomY + roomSize / 2, w: wallThickness, h: roomSize },
      // right wall
      { x: roomX + roomSize + wallThickness / 2, y: roomY + roomSize / 2, w: wallThickness, h: roomSize },
    ].forEach(({ x, y, w, h }) => {
      const wall = this.add.rectangle(x, y, w, h);
      this.physics.add.existing(wall, true);
      this.walls.push(wall);
    });

    // Player — white circle, spawns at the bottom-centre of the room
    const playerRadius = 18;
    this.player = this.add.circle(
      roomX + roomSize / 2,
      roomY + roomSize - playerRadius - 1,
      playerRadius,
      0xffffff,
    );
    this.physics.add.existing(this.player);
    // Make the physics body circular to match the visual
    this.player.body.setCircle(playerRadius);

    // Colliders between the player and every wall
    this.walls.forEach((wall) => {
      this.physics.add.collider(this.player, wall);
    });

    // Keyboard cursor keys
    this.cursors = this.input.keyboard.createCursorKeys();

    // Touch / swipe state
    this.touchStartX = null;
    this.touchDeltaX = 0;

    this.input.on('pointerdown', (pointer) => {
      this.touchStartX = pointer.x;
      this.touchDeltaX = 0;
    });

    this.input.on('pointermove', (pointer) => {
      if (!pointer.isDown || this.touchStartX === null) return;
      this.touchDeltaX = pointer.x - this.touchStartX;
    });

    this.input.on('pointerup', () => {
      this.touchStartX = null;
      this.touchDeltaX = 0;
    });
  }

  update() {
    if (!this.player || !this.player.body) return;

    let vx = 0;

    // Arrow-key horizontal movement
    if (this.cursors.left.isDown) {
      vx = -PLAYER_SPEED;
    } else if (this.cursors.right.isDown) {
      vx = PLAYER_SPEED;
    }

    // Swipe/touch horizontal movement (overrides keyboard while gesture is active)
    if (this.touchStartX !== null) {
      if (this.touchDeltaX < -SWIPE_THRESHOLD) {
        vx = -PLAYER_SPEED;
      } else if (this.touchDeltaX > SWIPE_THRESHOLD) {
        vx = PLAYER_SPEED;
      }
    }

    this.player.body.setVelocityX(vx);

    // Up-arrow jump (only when standing on a surface)
    if (this.cursors.up.isDown && this.player.body.blocked.down) {
      this.player.body.setVelocityY(JUMP_VELOCITY);
    }
  }
}
