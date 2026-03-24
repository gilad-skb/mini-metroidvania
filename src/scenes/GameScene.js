import Phaser from 'phaser';

/** Horizontal movement speed in pixels per second. */
const PLAYER_SPEED = 200;

/** Initial vertical velocity applied when jumping (negative = upward). */
const JUMP_VELOCITY = -380;

/** Width of the jump button that sits on the left edge of the control strip. */
const JUMP_BTN_WIDTH = 60;

/** Colour used for the control-button borders and labels (purple). */
const BTN_COLOR = 0xaa88ff;

/**
 * GameScene — the main gameplay scene.
 * Renders a square room with a circle player that can be moved
 * using arrow keys (left / right / up to jump) or on-screen buttons.
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Square room — top-aligned, leaving space below for the control buttons
    const topPadding = 20;
    const sidePadding = 40;
    const controlStripHeight = 80;
    const controlStripGap = 15;
    const bottomPadding = 20;

    const maxRoomWidth = width - sidePadding * 2;
    const maxRoomHeight = height - topPadding - controlStripGap - controlStripHeight - bottomPadding;
    const roomSize = Math.min(maxRoomWidth, maxRoomHeight);
    const roomX = (width - roomSize) / 2;
    const roomY = topPadding;

    // Draw visible room outline
    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0x44aaff, 1);
    graphics.strokeRect(roomX, roomY, roomSize, roomSize);

    // Control strip below the room: [Jump ▲] [◀ Left] [▶ Right]
    const controlStripY = roomY + roomSize + controlStripGap;
    const dirBtnWidth = (roomSize - JUMP_BTN_WIDTH) / 2;

    // Jump button — left-most button in the strip
    graphics.fillStyle(0x1a3a4e, 0.9);
    graphics.fillRect(roomX, controlStripY, JUMP_BTN_WIDTH, controlStripHeight);
    graphics.lineStyle(2, BTN_COLOR, 1);
    graphics.strokeRect(roomX, controlStripY, JUMP_BTN_WIDTH, controlStripHeight);

    this.add.text(
      roomX + JUMP_BTN_WIDTH / 2,
      controlStripY + controlStripHeight / 2,
      '▲',
      { fontSize: '24px', color: `#${BTN_COLOR.toString(16).padStart(6, '0')}` },
    ).setOrigin(0.5);

    // Left button
    const leftBtnX = roomX + JUMP_BTN_WIDTH;
    graphics.fillStyle(0x2a1a4e, 0.9);
    graphics.fillRect(leftBtnX, controlStripY, dirBtnWidth, controlStripHeight);
    graphics.lineStyle(2, BTN_COLOR, 1);
    graphics.strokeRect(leftBtnX, controlStripY, dirBtnWidth, controlStripHeight);

    this.add.text(
      leftBtnX + dirBtnWidth / 2,
      controlStripY + controlStripHeight / 2,
      '◀',
      { fontSize: '24px', color: `#${BTN_COLOR.toString(16).padStart(6, '0')}` },
    ).setOrigin(0.5);

    // Right button
    const rightBtnX = leftBtnX + dirBtnWidth;
    graphics.fillStyle(0x2a1a4e, 0.9);
    graphics.fillRect(rightBtnX, controlStripY, dirBtnWidth, controlStripHeight);
    graphics.lineStyle(2, BTN_COLOR, 1);
    graphics.strokeRect(rightBtnX, controlStripY, dirBtnWidth, controlStripHeight);

    this.add.text(
      rightBtnX + dirBtnWidth / 2,
      controlStripY + controlStripHeight / 2,
      '▶',
      { fontSize: '24px', color: `#${BTN_COLOR.toString(16).padStart(6, '0')}` },
    ).setOrigin(0.5);

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

    // On-screen button states
    this.jumpPressed = false;
    this.leftPressed = false;
    this.rightPressed = false;

    // Jump button interactive zone
    const jumpBtnZone = this.add.zone(roomX + JUMP_BTN_WIDTH / 2, controlStripY + controlStripHeight / 2, JUMP_BTN_WIDTH, controlStripHeight).setInteractive();
    jumpBtnZone.on('pointerdown', () => { this.jumpPressed = true; });
    jumpBtnZone.on('pointerup', () => { this.jumpPressed = false; });
    jumpBtnZone.on('pointerout', () => { this.jumpPressed = false; });

    // Left button interactive zone
    const leftBtnZone = this.add.zone(leftBtnX + dirBtnWidth / 2, controlStripY + controlStripHeight / 2, dirBtnWidth, controlStripHeight).setInteractive();
    leftBtnZone.on('pointerdown', () => { this.leftPressed = true; });
    leftBtnZone.on('pointerup', () => { this.leftPressed = false; });
    leftBtnZone.on('pointerout', () => { this.leftPressed = false; });

    // Right button interactive zone
    const rightBtnZone = this.add.zone(rightBtnX + dirBtnWidth / 2, controlStripY + controlStripHeight / 2, dirBtnWidth, controlStripHeight).setInteractive();
    rightBtnZone.on('pointerdown', () => { this.rightPressed = true; });
    rightBtnZone.on('pointerup', () => { this.rightPressed = false; });
    rightBtnZone.on('pointerout', () => { this.rightPressed = false; });
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

    // On-screen button horizontal movement
    if (this.leftPressed) {
      vx = -PLAYER_SPEED;
    } else if (this.rightPressed) {
      vx = PLAYER_SPEED;
    }

    this.player.body.setVelocityX(vx);

    // Up-arrow jump or jump button (only when standing on a surface)
    if ((this.cursors.up.isDown || this.jumpPressed) && this.player.body.blocked.down) {
      this.player.body.setVelocityY(JUMP_VELOCITY);
    }
  }
}
