import { WORLD_SIZE, ARM_T, CORNER, PLATFORM_HEIGHT, BTN_COLOR, JUMP_BTN_WIDTH, DASH_BTN_WIDTH, CONTROL_STRIP_HEIGHT } from './constants.js';

/**
 * GraphicsManager — handles all rendering: cross room, platforms, and UI controls.
 */
export class GraphicsManager {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Set up background color and render the cross room.
   */
  setupBackground() {
    this.scene.cameras.main.setBackgroundColor('#1a1a2e');
  }

  /**
   * Draw the cross-shaped room interior and outline.
   */
  drawCrossRoom() {
    const graphics = this.scene.add.graphics();

    // Fill cross interior with a slightly lighter dark-blue tint
    graphics.fillStyle(0x0d2137, 1);
    graphics.fillRect(CORNER, 0, ARM_T, WORLD_SIZE); // vertical arm
    graphics.fillRect(0, CORNER, WORLD_SIZE, ARM_T); // horizontal arm

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

    return graphics;
  }

  /**
   * Draw all platforms in the level.
   */
  drawPlatforms(platformDefs) {
    const graphics = this.scene.add.graphics();

    platformDefs.forEach(({ x, y, w }) => {
      graphics.fillStyle(0x44aaff, 0.25);
      graphics.fillRect(x, y, w, PLATFORM_HEIGHT);
      graphics.lineStyle(2, 0x44aaff, 1);
      graphics.strokeRect(x, y, w, PLATFORM_HEIGHT);
    });

    return graphics;
  }

  /**
   * Create the control strip UI (jump, left, right buttons).
   * Returns { uiGraphics, labels, zones } for the caller to track.
   */
  createControlStrip() {
    const { width: sw, height: sh } = this.scene.scale;
    const controlStripY = sh - CONTROL_STRIP_HEIGHT;
    const fixedBtnsWidth = JUMP_BTN_WIDTH + DASH_BTN_WIDTH;
    const dirBtnWidth = (sw - fixedBtnsWidth) / 2;

    const uiGraphics = this.scene.add.graphics().setScrollFactor(0);

    // Jump button background and border
    uiGraphics.fillStyle(0x1a3a4e, 0.9);
    uiGraphics.fillRect(0, controlStripY, JUMP_BTN_WIDTH, CONTROL_STRIP_HEIGHT);
    uiGraphics.lineStyle(2, BTN_COLOR, 1);
    uiGraphics.strokeRect(0, controlStripY, JUMP_BTN_WIDTH, CONTROL_STRIP_HEIGHT);

    const jumpLabel = this.scene.add.text(
      JUMP_BTN_WIDTH / 2,
      controlStripY + CONTROL_STRIP_HEIGHT / 2,
      '▲',
      { fontSize: '24px', color: `#${BTN_COLOR.toString(16).padStart(6, '0')}` },
    ).setOrigin(0.5).setScrollFactor(0);

    // Dash button background and border
    const dashBtnX = JUMP_BTN_WIDTH;
    uiGraphics.fillStyle(0x1a4e3a, 0.9);
    uiGraphics.fillRect(dashBtnX, controlStripY, DASH_BTN_WIDTH, CONTROL_STRIP_HEIGHT);
    uiGraphics.lineStyle(2, BTN_COLOR, 1);
    uiGraphics.strokeRect(dashBtnX, controlStripY, DASH_BTN_WIDTH, CONTROL_STRIP_HEIGHT);

    const dashLabel = this.scene.add.text(
      dashBtnX + DASH_BTN_WIDTH / 2,
      controlStripY + CONTROL_STRIP_HEIGHT / 2,
      '»',
      { fontSize: '24px', color: `#${BTN_COLOR.toString(16).padStart(6, '0')}` },
    ).setOrigin(0.5).setScrollFactor(0);

    // Left button background and border
    const leftBtnX = fixedBtnsWidth;
    uiGraphics.fillStyle(0x2a1a4e, 0.9);
    uiGraphics.fillRect(leftBtnX, controlStripY, dirBtnWidth, CONTROL_STRIP_HEIGHT);
    uiGraphics.lineStyle(2, BTN_COLOR, 1);
    uiGraphics.strokeRect(leftBtnX, controlStripY, dirBtnWidth, CONTROL_STRIP_HEIGHT);

    const leftLabel = this.scene.add.text(
      leftBtnX + dirBtnWidth / 2,
      controlStripY + CONTROL_STRIP_HEIGHT / 2,
      '◀',
      { fontSize: '24px', color: `#${BTN_COLOR.toString(16).padStart(6, '0')}` },
    ).setOrigin(0.5).setScrollFactor(0);

    // Right button background and border
    const rightBtnX = leftBtnX + dirBtnWidth;
    uiGraphics.fillStyle(0x2a1a4e, 0.9);
    uiGraphics.fillRect(rightBtnX, controlStripY, dirBtnWidth, CONTROL_STRIP_HEIGHT);
    uiGraphics.lineStyle(2, BTN_COLOR, 1);
    uiGraphics.strokeRect(rightBtnX, controlStripY, dirBtnWidth, CONTROL_STRIP_HEIGHT);

    const rightLabel = this.scene.add.text(
      rightBtnX + dirBtnWidth / 2,
      controlStripY + CONTROL_STRIP_HEIGHT / 2,
      '▶',
      { fontSize: '24px', color: `#${BTN_COLOR.toString(16).padStart(6, '0')}` },
    ).setOrigin(0.5).setScrollFactor(0);

    return {
      uiGraphics,
      labels: [jumpLabel, dashLabel, leftLabel, rightLabel],
      zones: [
        { x: JUMP_BTN_WIDTH / 2, y: controlStripY + CONTROL_STRIP_HEIGHT / 2, w: JUMP_BTN_WIDTH, h: CONTROL_STRIP_HEIGHT },
        { x: dashBtnX + DASH_BTN_WIDTH / 2, y: controlStripY + CONTROL_STRIP_HEIGHT / 2, w: DASH_BTN_WIDTH, h: CONTROL_STRIP_HEIGHT },
        { x: leftBtnX + dirBtnWidth / 2, y: controlStripY + CONTROL_STRIP_HEIGHT / 2, w: dirBtnWidth, h: CONTROL_STRIP_HEIGHT },
        { x: rightBtnX + dirBtnWidth / 2, y: controlStripY + CONTROL_STRIP_HEIGHT / 2, w: dirBtnWidth, h: CONTROL_STRIP_HEIGHT },
      ],
    };
  }
}
