import { POWERUP_RADIUS, POWERUP_COLOR, POWERUP_POSITIONS } from './constants.js';

/**
 * PowerupManager — manages powerup items, collision detection, and collection.
 */
export class PowerupManager {
  constructor(scene) {
    this.scene = scene;
    this.powerups = [];
    this.onPowerupCollected = null;
  }

  /**
   * Create powerup items at predefined positions.
   */
  createPowerups() {
    POWERUP_POSITIONS.forEach((pos) => {
      const powerup = this.scene.add.circle(pos.x, pos.y, POWERUP_RADIUS, POWERUP_COLOR);
      this.scene.physics.add.existing(powerup, true);
      powerup.body.setCircle(POWERUP_RADIUS);
      this.powerups.push(powerup);
    });
  }

  /**
   * Set up collision detection between powerups and the player.
   */
  setupCollision(player, onCollect) {
    this.onPowerupCollected = onCollect;
    this.powerups.forEach((powerup) => {
      // store the overlap collider so we can destroy it on collection
      const collider = this.scene.physics.add.overlap(player, powerup, () => {
        this.collectPowerup(powerup, collider);
      });
    });
  }

  /**
   * Handle powerup collection: remove powerup and call callback.
   */
  collectPowerup(powerup, collider) {
    const index = this.powerups.indexOf(powerup);
    if (index > -1) {
      console.debug('Double jump powerup collected!');
      this.powerups.splice(index, 1);
      // destroy the overlap first so the callback never fires again
      collider.destroy();
      powerup.destroy();
      if (this.onPowerupCollected) {
        this.onPowerupCollected();
      }
    }
  }

  /**
   * Get remaining powerups count.
   */
  getRemainingCount() {
    return this.powerups.length;
  }
}
