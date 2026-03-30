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
      // bottom arm — zigzag staircase up from the floor
      { x: CORNER + 50,          y: WORLD_SIZE - 200,     w: 200 }, // left, near bottom
      { x: CORNER + ARM_T - 280, y: WORLD_SIZE - 400,     w: 160 }, // right, step up
      { x: CORNER + 80,          y: CORNER + ARM_T + 100, w: 240 }, // left, bridging
      // centre/junction — offset to opposite sides
      { x: CORNER + 40,          y: CORNER + ARM_T - 70,  w: 180 }, // left, lower
      { x: CORNER + ARM_T - 260, y: CORNER + ARM_T - 310, w: 200 }, // right, upper
      // left arm — two platforms at different depths
      { x: 30,                   y: CORNER + ARM_T - 150, w: 180 }, // inner, low
      { x: 270,                  y: CORNER + 120,         w: 160 }, // outer, high
      // right arm — two platforms at different depths
      { x: CORNER + ARM_T + 60,  y: CORNER + ARM_T - 130, w: 190 }, // inner, mid
      { x: CORNER + ARM_T + 370, y: CORNER + 90,          w: 160 }, // outer, high
      // top arm — staggered steps to the ceiling
      { x: CORNER + ARM_T - 290, y: CORNER - 185,         w: 180 }, // right, lower
      { x: CORNER + 60,          y: CORNER - 415,         w: 200 }, // left, upper
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
      { x: CORNER + 50,          y: WORLD_SIZE - 200,     w: 200 },
      { x: CORNER + ARM_T - 280, y: WORLD_SIZE - 400,     w: 160 },
      { x: CORNER + 80,          y: CORNER + ARM_T + 100, w: 240 },
      { x: CORNER + 40,          y: CORNER + ARM_T - 70,  w: 180 },
      { x: CORNER + ARM_T - 260, y: CORNER + ARM_T - 310, w: 200 },
      { x: 30,                   y: CORNER + ARM_T - 150, w: 180 },
      { x: 270,                  y: CORNER + 120,         w: 160 },
      { x: CORNER + ARM_T + 60,  y: CORNER + ARM_T - 130, w: 190 },
      { x: CORNER + ARM_T + 370, y: CORNER + 90,          w: 160 },
      { x: CORNER + ARM_T - 290, y: CORNER - 185,         w: 180 },
      { x: CORNER + 60,          y: CORNER - 415,         w: 200 },
    ];
  }
}
