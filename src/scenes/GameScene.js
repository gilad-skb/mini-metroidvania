import Phaser from 'phaser';

/** Horizontal movement speed in pixels per second. */
const PLAYER_SPEED = 200;

/** Initial vertical velocity applied when jumping (negative = upward). */
const JUMP_VELOCITY = -380;

/** Minimum horizontal pointer travel (px) before a swipe is recognised. */
const SWIPE_THRESHOLD = 15;

/** Width of the jump button that sits on the left edge of the swipe zone. */
const JUMP_BTN_WIDTH = 60;

/** Colour used for the swipe-zone border and label (purple). */
const SWIPE_ZONE_COLOR = 0xaa88ff;

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

    // Square room — top-aligned, leaving space below for the swipe zone
    const topPadding = 20;
    const sidePadding = 40;
    const swipeZoneHeight = 80;
    const swipeZoneGap = 15;
    const bottomPadding = 20;

    const maxRoomWidth = width - sidePadding * 2;
    const maxRoomHeight = height - topPadding - swipeZoneGap - swipeZoneHeight - bottomPadding;
    const roomSize = Math.min(maxRoomWidth, maxRoomHeight);
    const roomX = (width - roomSize) / 2;
    const roomY = topPadding;

    // Draw visible room outline
    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0x44aaff, 1);
    graphics.strokeRect(roomX, roomY, roomSize, roomSize);

    // Swipe zone — coloured rectangle below the room, shifted right to make
    // space for the jump button on the left
    const swipeZoneY = roomY + roomSize + swipeZoneGap;
    const swipeWidth = roomSize - JUMP_BTN_WIDTH;
    const swipeStartX = roomX + JUMP_BTN_WIDTH;

    // Jump button — small rectangle on the left edge of the swipe area
    graphics.fillStyle(0x1a3a4e, 0.9);
    graphics.fillRect(roomX, swipeZoneY, JUMP_BTN_WIDTH, swipeZoneHeight);
    graphics.lineStyle(2, SWIPE_ZONE_COLOR, 1);
    graphics.strokeRect(roomX, swipeZoneY, JUMP_BTN_WIDTH, swipeZoneHeight);

    this.add.text(
      roomX + JUMP_BTN_WIDTH / 2,
      swipeZoneY + swipeZoneHeight / 2,
      '▲',
      { fontSize: '24px', color: `#${SWIPE_ZONE_COLOR.toString(16).padStart(6, '0')}` },
    ).setOrigin(0.5);

    // Swipe zone — narrowed to sit beside the jump button
    graphics.fillStyle(0x2a1a4e, 0.9);
    graphics.fillRect(swipeStartX, swipeZoneY, swipeWidth, swipeZoneHeight);
    graphics.lineStyle(2, SWIPE_ZONE_COLOR, 1);
    graphics.strokeRect(swipeStartX, swipeZoneY, swipeWidth, swipeZoneHeight);

    this.add.text(
      swipeStartX + swipeWidth / 2,
      swipeZoneY + swipeZoneHeight / 2,
      '↔  SWIPE HERE',
      { fontSize: '16px', color: `#${SWIPE_ZONE_COLOR.toString(16).padStart(6, '0')}` },
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

    // Touch / swipe state — only initiated from within the room or swipe zone
    this.touchStartX = null;
    this.touchDeltaX = 0;
    // Whether the on-screen jump button is currently held down
    this.jumpPressed = false;

    // Interactive zones that accept pointer-down to start a swipe
    const roomZone = this.add.zone(roomX + roomSize / 2, roomY + roomSize / 2, roomSize, roomSize).setInteractive();
    const swipeInputZone = this.add.zone(swipeStartX + swipeWidth / 2, swipeZoneY + swipeZoneHeight / 2, swipeWidth, swipeZoneHeight).setInteractive();

    // Jump button interactive zone
    const jumpBtnZone = this.add.zone(roomX + JUMP_BTN_WIDTH / 2, swipeZoneY + swipeZoneHeight / 2, JUMP_BTN_WIDTH, swipeZoneHeight).setInteractive();
    jumpBtnZone.on('pointerdown', () => { this.jumpPressed = true; });
    jumpBtnZone.on('pointerup', () => { this.jumpPressed = false; });
    jumpBtnZone.on('pointerout', () => { this.jumpPressed = false; });

    const onPointerDown = (pointer) => {
      this.touchStartX = pointer.x;
      this.touchDeltaX = 0;
    };

    roomZone.on('pointerdown', onPointerDown);
    swipeInputZone.on('pointerdown', onPointerDown);

    // Track the ongoing drag and release globally so the gesture is not
    // interrupted if the pointer moves outside the originating zone.
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

    // Up-arrow jump or jump button (only when standing on a surface)
    if ((this.cursors.up.isDown || this.jumpPressed) && this.player.body.blocked.down) {
      this.player.body.setVelocityY(JUMP_VELOCITY);
    }
  }
}
