import Phaser from 'phaser';

/** Horizontal movement speed in pixels per second. */
const PLAYER_SPEED = 200;

/** Initial vertical velocity applied when jumping (negative = upward). */
const JUMP_VELOCITY = -380;

/** Width of the jump button that sits on the left edge of the control strip. */
const JUMP_BTN_WIDTH = 60;

/** Colour used for the control-button borders and labels (purple). */
const BTN_COLOR = 0xaa88ff;

/** Total width and height of the cross-shaped world (it is square). */
const WORLD_SIZE = 2000;

/** Pixel thickness of each arm of the cross. */
const ARM_T = 600;

/**
 * Size of each square corner cut-out: (WORLD_SIZE - ARM_T) / 2.
 * The four corner regions of the WORLD_SIZE×WORLD_SIZE bounding box
 * that lie outside the cross are filled with static physics bodies.
 */
const CORNER = (WORLD_SIZE - ARM_T) / 2; // 700

/**
 * GameScene — the main gameplay scene.
 * Renders a cross/plus-sign shaped room that is larger than the viewport;
 * the camera follows the player as they explore the cross.
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width: sw, height: sh } = this.scale;

    // Dark space outside the cross arms
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // ── Cross room graphics (world space) ────────────────────────────────────
    const graphics = this.add.graphics();

    // Fill cross interior with a slightly lighter dark-blue tint
    graphics.fillStyle(0x0d2137, 1);
    graphics.fillRect(CORNER, 0, ARM_T, WORLD_SIZE);     // vertical arm
    graphics.fillRect(0, CORNER, WORLD_SIZE, ARM_T);     // horizontal arm

    // 12-segment cross outline
    graphics.lineStyle(4, 0x44aaff, 1);
    graphics.beginPath();
    graphics.moveTo(CORNER, 0);
    graphics.lineTo(CORNER + ARM_T, 0);
    graphics.lineTo(CORNER + ARM_T, CORNER);
    graphics.lineTo(WORLD_SIZE, CORNER);
    graphics.lineTo(WORLD_SIZE, CORNER + ARM_T);
    graphics.lineTo(CORNER + ARM_T, CORNER + ARM_T);
    graphics.lineTo(CORNER + ARM_T, WORLD_SIZE);
    graphics.lineTo(CORNER, WORLD_SIZE);
    graphics.lineTo(CORNER, CORNER + ARM_T);
    graphics.lineTo(0, CORNER + ARM_T);
    graphics.lineTo(0, CORNER);
    graphics.lineTo(CORNER, CORNER);
    graphics.closePath();
    graphics.strokePath();

    // ── Platforms (world space) ───────────────────────────────────────────────
    // Each entry: { x, y, w } — top-left corner and width; height is fixed.
    // Platforms are spaced ≤ 200 px apart vertically so the player (max jump
    // height ≈ 240 px) can reach every one from the platform below it.
    const platformHeight = 16;
    const platformDefs = [
      // Bottom arm — three steps up from the world-bounds floor
      { x: CORNER + 60, y: WORLD_SIZE - 220, w: (ARM_T - 120) / 2 },
      { x: CORNER + 60, y: WORLD_SIZE - 440, w: (ARM_T - 120) / 2 },
      // Bridging step — spans the otherwise-unjumpable gap to the junction
      { x: CORNER + 60, y: CORNER + ARM_T + 90, w: (ARM_T - 120) / 2 },
      // Lower vertical arm / centre junction
      { x: CORNER + 60, y: CORNER + ARM_T - 80, w: (ARM_T - 120) / 2 },
      // Centre cross area
      { x: CORNER + 60, y: CORNER + ARM_T - 300, w: (ARM_T - 120) / 2 },
      // Left arm
      { x: 60, y: CORNER + 180, w: (ARM_T - 160) / 2 },
      // Right arm
      { x: CORNER + ARM_T + 60, y: CORNER + ARM_T - 200, w: (ARM_T - 160) / 2 },
      // Top arm — two steps up from the centre
      { x: CORNER + 60, y: CORNER - 200, w: (ARM_T - 120) / 2 },
      { x: CORNER + 60, y: CORNER - 430, w: (ARM_T - 120) / 2 },
    ];

    platformDefs.forEach(({ x, y, w }) => {
      graphics.fillStyle(0x44aaff, 0.25);
      graphics.fillRect(x, y, w, platformHeight);
      graphics.lineStyle(2, 0x44aaff, 1);
      graphics.strokeRect(x, y, w, platformHeight);
    });

    // ── Physics ───────────────────────────────────────────────────────────────
    // The full-square world bounds are intentional: each arm of the cross
    // extends to one edge of the WORLD_SIZE×WORLD_SIZE bounding box, so
    // world-bounds collision naturally seals the open ends of every arm.
    // The four corner bodies below block the cut-out regions.
    this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);

    this.walls = [];

    // Four corner bodies fill the cut-out regions of the cross.
    // Together with world-bounds collision they form the complete boundary.
    [
      { cx: CORNER / 2,                     cy: CORNER / 2 },                     // top-left
      { cx: CORNER + ARM_T + CORNER / 2,    cy: CORNER / 2 },                     // top-right
      { cx: CORNER / 2,                     cy: CORNER + ARM_T + CORNER / 2 },    // bottom-left
      { cx: CORNER + ARM_T + CORNER / 2,    cy: CORNER + ARM_T + CORNER / 2 },    // bottom-right
    ].forEach(({ cx, cy }) => {
      const body = this.add.rectangle(cx, cy, CORNER, CORNER);
      this.physics.add.existing(body, true);
      this.walls.push(body);
    });

    // Static platform colliders aligned with the drawn rectangles
    platformDefs.forEach(({ x, y, w }) => {
      const plat = this.add.rectangle(x + w / 2, y + platformHeight / 2, w, platformHeight);
      this.physics.add.existing(plat, true);
      this.walls.push(plat);
    });

    // ── Player ────────────────────────────────────────────────────────────────
    const playerRadius = 18;
    // Spawn at the bottom of the vertical arm; the -1 keeps the body clear
    // of the world-bounds floor so the first blocked.down check fires cleanly.
    this.player = this.add.circle(
      WORLD_SIZE / 2,
      WORLD_SIZE - playerRadius - 1,
      playerRadius,
      0xffffff,
    );
    this.physics.add.existing(this.player);
    this.player.body.setCircle(playerRadius);
    this.player.body.setCollideWorldBounds(true);

    this.walls.forEach((wall) => {
      this.physics.add.collider(this.player, wall);
    });

    // ── Camera ────────────────────────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // ── Control strip (screen-space UI, pinned to the viewport) ───────────────
    const controlStripHeight = 80;
    const controlStripY = sh - controlStripHeight;
    const dirBtnWidth = (sw - JUMP_BTN_WIDTH) / 2;

    const uiGraphics = this.add.graphics().setScrollFactor(0);

    // Jump button
    uiGraphics.fillStyle(0x1a3a4e, 0.9);
    uiGraphics.fillRect(0, controlStripY, JUMP_BTN_WIDTH, controlStripHeight);
    uiGraphics.lineStyle(2, BTN_COLOR, 1);
    uiGraphics.strokeRect(0, controlStripY, JUMP_BTN_WIDTH, controlStripHeight);

    this.add.text(
      JUMP_BTN_WIDTH / 2,
      controlStripY + controlStripHeight / 2,
      '▲',
      { fontSize: '24px', color: `#${BTN_COLOR.toString(16).padStart(6, '0')}` },
    ).setOrigin(0.5).setScrollFactor(0);

    // Left button
    const leftBtnX = JUMP_BTN_WIDTH;
    uiGraphics.fillStyle(0x2a1a4e, 0.9);
    uiGraphics.fillRect(leftBtnX, controlStripY, dirBtnWidth, controlStripHeight);
    uiGraphics.lineStyle(2, BTN_COLOR, 1);
    uiGraphics.strokeRect(leftBtnX, controlStripY, dirBtnWidth, controlStripHeight);

    this.add.text(
      leftBtnX + dirBtnWidth / 2,
      controlStripY + controlStripHeight / 2,
      '◀',
      { fontSize: '24px', color: `#${BTN_COLOR.toString(16).padStart(6, '0')}` },
    ).setOrigin(0.5).setScrollFactor(0);

    // Right button
    const rightBtnX = leftBtnX + dirBtnWidth;
    uiGraphics.fillStyle(0x2a1a4e, 0.9);
    uiGraphics.fillRect(rightBtnX, controlStripY, dirBtnWidth, controlStripHeight);
    uiGraphics.lineStyle(2, BTN_COLOR, 1);
    uiGraphics.strokeRect(rightBtnX, controlStripY, dirBtnWidth, controlStripHeight);

    this.add.text(
      rightBtnX + dirBtnWidth / 2,
      controlStripY + controlStripHeight / 2,
      '▶',
      { fontSize: '24px', color: `#${BTN_COLOR.toString(16).padStart(6, '0')}` },
    ).setOrigin(0.5).setScrollFactor(0);

    // ── Input ─────────────────────────────────────────────────────────────────
    // Support up to 3 simultaneous touches so directional and jump buttons
    // can be held at the same time.
    this.input.addPointer(2);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.jumpPressed = false;
    this.leftPressed = false;
    this.rightPressed = false;

    // Interactive zones are in screen space (scrollFactor 0) so their x/y
    // are viewport coordinates and pointer hit-testing works correctly.
    const jumpBtnZone = this.add
      .zone(JUMP_BTN_WIDTH / 2, controlStripY + controlStripHeight / 2, JUMP_BTN_WIDTH, controlStripHeight)
      .setScrollFactor(0)
      .setInteractive();
    jumpBtnZone.on('pointerdown', () => { this.jumpPressed = true; });
    jumpBtnZone.on('pointerup',   () => { this.jumpPressed = false; });
    jumpBtnZone.on('pointerout',  () => { this.jumpPressed = false; });

    const leftBtnZone = this.add
      .zone(leftBtnX + dirBtnWidth / 2, controlStripY + controlStripHeight / 2, dirBtnWidth, controlStripHeight)
      .setScrollFactor(0)
      .setInteractive();
    leftBtnZone.on('pointerdown', () => { this.leftPressed = true; });
    leftBtnZone.on('pointerup',   () => { this.leftPressed = false; });
    leftBtnZone.on('pointerout',  () => { this.leftPressed = false; });

    const rightBtnZone = this.add
      .zone(rightBtnX + dirBtnWidth / 2, controlStripY + controlStripHeight / 2, dirBtnWidth, controlStripHeight)
      .setScrollFactor(0)
      .setInteractive();
    rightBtnZone.on('pointerdown', () => { this.rightPressed = true; });
    rightBtnZone.on('pointerup',   () => { this.rightPressed = false; });
    rightBtnZone.on('pointerout',  () => { this.rightPressed = false; });
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

    // On-screen button horizontal movement (overrides keyboard when active)
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
