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
export const MAP_TILE_SIZE = 32;
export const WORLD_SIZE = 1600;

// Powerup locations
// powerup x = platform center column × tile size; powerup y = platform row × tile size - radius
export const POWERUP_RADIUS = 12;
export const POWERUP_POSITIONS = [
  { x: 35 * MAP_TILE_SIZE, y: 23 * MAP_TILE_SIZE - POWERUP_RADIUS },
  { x: 13 * MAP_TILE_SIZE, y: 24 * MAP_TILE_SIZE - POWERUP_RADIUS },
];

// Graphics constants
export const PLAYER_RADIUS = 18;
export const POWERUP_COLOR = 0xffaa00;
