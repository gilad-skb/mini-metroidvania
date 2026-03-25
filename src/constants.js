// Game constants
export const PLAYER_SPEED = 200;
export const JUMP_VELOCITY = -400;
export const JUMP_HOLD_ACCEL = 1800;
export const JUMP_HOLD_TIME = 200;
export const MAX_JUMPS = 1;

// UI constants
export const JUMP_BTN_WIDTH = 100;
export const DASH_BTN_WIDTH = 100;
export const BTN_COLOR = 0xaa88ff;
export const CONTROL_STRIP_HEIGHT = 80;

// Dash constants
export const DASH_SPEED = 600;
export const DASH_DURATION = 150;

// Glide constants
export const GLIDE_FALL_SPEED = 60;

// World constants
export const WORLD_SIZE = 2000;
export const ARM_T = 600;
export const CORNER = (WORLD_SIZE - ARM_T) / 2; // 700

// Powerup locations
// powerup x = platform left + half-width; powerup y = platform top - POWERUP_RADIUS
export const POWERUP_POSITIONS = [
  { x: CORNER + ARM_T + 450, y: CORNER + 78 },          // right arm outer platform
  { x: 120,                  y: CORNER + ARM_T - 162 }, // left arm inner platform
];

// Graphics constants
export const PLATFORM_HEIGHT = 16;
export const PLAYER_RADIUS = 18;
export const POWERUP_RADIUS = 12;
export const POWERUP_COLOR = 0xffaa00;
