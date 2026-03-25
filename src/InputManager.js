/**
 * InputManager — handles keyboard and touch input, including control strip interaction.
 */
export class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.cursors = null;
    this.jumpPressed = false;
    this.leftPressed = false;
    this.rightPressed = false;
    this.jumpHeld = false;
    this.controlStripVisible = true;
    this.controlStripElements = [];
    this.controlStripZones = [];
  }

  /**
   * Initialize keyboard and pointer input.
   */
  setupInput() {
    // support up to 3 simultaneous touches so directional and jump buttons
    // can be held at the same time.
    this.scene.input.addPointer(2);
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    this.scene.input.keyboard.on('keydown', () => {
      this.setControlStripVisible(false);
    });

    this.scene.input.on('pointerdown', () => {
      this.setControlStripVisible(true);
    });
  }

  /**
   * Set up interactive zones for the control strip buttons.
   * Takes an array of zone definitions from GraphicsManager.
   */
  setupControlStripZones(zoneDefinitions) {
    const labels = ['jump', 'left', 'right'];

    zoneDefinitions.forEach((def, idx) => {
      const zone = this.scene.add
        .zone(def.x, def.y, def.w, def.h)
        .setScrollFactor(0)
        .setInteractive();

      if (idx === 0) {
        // Jump button
        zone.on('pointerdown', () => {
          this.jumpPressed = true;
          this.jumpHeld = true;
        });
        zone.on('pointerup', () => { this.jumpHeld = false; });
        zone.on('pointerout', () => { this.jumpHeld = false; });
      } else if (idx === 1) {
        // Left button
        zone.on('pointerdown', () => { this.leftPressed = true; });
        zone.on('pointerup', () => { this.leftPressed = false; });
        zone.on('pointerout', () => { this.leftPressed = false; });
      } else if (idx === 2) {
        // Right button
        zone.on('pointerdown', () => { this.rightPressed = true; });
        zone.on('pointerup', () => { this.rightPressed = false; });
        zone.on('pointerout', () => { this.rightPressed = false; });
      }

      this.controlStripZones.push(zone);
    });
  }

  /**
   * Set the visibility of the control strip and its zones.
   */
  setControlStripVisible(isVisible) {
    this.controlStripVisible = isVisible;

    if (!isVisible) {
      this.jumpPressed = false;
      this.leftPressed = false;
      this.rightPressed = false;
    }

    this.controlStripElements.forEach((element) => {
      element.setVisible(isVisible);
    });

    this.controlStripZones.forEach((zone) => {
      if (isVisible) {
        zone.setInteractive();
      } else {
        zone.disableInteractive();
      }
    });
  }

  /**
   * Store references to control strip graphics and labels for visibility toggling.
   */
  setControlStripElements(elements) {
    this.controlStripElements = elements;
  }

  /**
   * Get the current input state.
   */
  getInputState() {
    return {
      cursorKeys: this.cursors,
      jumpPressed: this.jumpPressed,
      leftPressed: this.leftPressed,
      rightPressed: this.rightPressed,
      jumpHeld: this.jumpHeld,
    };
  }

  /**
   * Clear the jump pressed flag (called after each update).
   */
  clearJumpPressed() {
    this.jumpPressed = false;
  }
}
