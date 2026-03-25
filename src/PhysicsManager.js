import { WORLD_SIZE, ARM_T, CORNER, PLATFORM_HEIGHT, PLAYER_RADIUS } from './constants.js';

/**
 * PhysicsManager — sets up physics bodies for walls, platforms, and the player.
 */
export class PhysicsManager {
  constructor(scene) {
    this.scene = scene;
    this.walls = [];
  }

  /**
   * Initialize the physics world and create all static colliders.
   */
  setupPhysicsWorld() {
    this.scene.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.createCornerWalls();
    this.createPlatforms();
  }

  /**
   * Create the four corner bodies that block the cut-out regions of the cross.
   */
  createCornerWalls() {
    [
      { cx: CORNER / 2, cy: CORNER / 2 }, // top-left
      { cx: CORNER + ARM_T + CORNER / 2, cy: CORNER / 2 }, // top-right
      { cx: CORNER / 2, cy: CORNER + ARM_T + CORNER / 2 }, // bottom-left
      { cx: CORNER + ARM_T + CORNER / 2, cy: CORNER + ARM_T + CORNER / 2 }, // bottom-right
    ].forEach(({ cx, cy }) => {
      const body = this.scene.add.rectangle(cx, cy, CORNER, CORNER);
      this.scene.physics.add.existing(body, true);
      this.walls.push(body);
    });
  }

  /**
   * Create all platform colliders.
   * Platform definitions: { x, y, w } — top-left corner and width; height is fixed.
   */
  createPlatforms() {
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
      const plat = this.scene.add.rectangle(x + w / 2, y + PLATFORM_HEIGHT / 2, w, PLATFORM_HEIGHT);
      this.scene.physics.add.existing(plat, true);
      this.walls.push(plat);
    });
  }

  /**
   * Create the player physics body and set up collisions.
   */
  createPlayerBody(x, y) {
    const player = this.scene.add.circle(x, y, PLAYER_RADIUS, 0xffffff);
    this.scene.physics.add.existing(player);
    player.body.setCircle(PLAYER_RADIUS);
    player.body.setCollideWorldBounds(true);

    this.walls.forEach((wall) => {
      this.scene.physics.add.collider(player, wall);
    });

    return player;
  }

  /**
   * Get the platform definitions for rendering.
   */
  getPlatformDefinitions() {
    return [
      { x: CORNER + 60, y: WORLD_SIZE - 220, w: (ARM_T - 120) / 2 },
      { x: CORNER + 60, y: WORLD_SIZE - 440, w: (ARM_T - 120) / 2 },
      { x: CORNER + 60, y: CORNER + ARM_T + 90, w: (ARM_T - 120) / 2 },
      { x: CORNER + 60, y: CORNER + ARM_T - 80, w: (ARM_T - 120) / 2 },
      { x: CORNER + 60, y: CORNER + ARM_T - 300, w: (ARM_T - 120) / 2 },
      { x: 60, y: CORNER + 180, w: (ARM_T - 160) / 2 },
      { x: CORNER + ARM_T + 60, y: CORNER + ARM_T - 200, w: (ARM_T - 160) / 2 },
      { x: CORNER + 60, y: CORNER - 200, w: (ARM_T - 120) / 2 },
      { x: CORNER + 60, y: CORNER - 430, w: (ARM_T - 120) / 2 },
    ];
  }
}
