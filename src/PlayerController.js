import { PLAYER_SPEED, JUMP_VELOCITY, JUMP_HOLD_ACCEL, JUMP_HOLD_TIME, MAX_JUMPS, DASH_SPEED, DASH_DURATION, GLIDE_FALL_SPEED } from './constants.js';

/**
 * PlayerController — manages player movement, jumping, and related state.
 */
export class PlayerController {
  constructor(player) {
    this.player = player;
    this.jumpHeldTimer = 0;
    this.wasJumpDown = false;
    this.jumpsUsed = 0;
    this.wasGrounded = false;
    this.maxJumpsAvailable = MAX_JUMPS;
    this.dashTimer = 0;
    this.dashDirection = 0;
    this.glideEnabled = false;
  }

  /**
   * Update player horizontal velocity based on input state.
   */
  updateHorizontalMovement(inputState) {
    // during a dash, velocity is locked — skip normal movement
    if (this.dashTimer > 0) return;

    let vx = 0;
    const { cursorKeys, leftPressed, rightPressed } = inputState;

    // Keyboard movement
    if (cursorKeys.left.isDown) {
      vx = -PLAYER_SPEED;
    } else if (cursorKeys.right.isDown) {
      vx = PLAYER_SPEED;
    }

    // On-screen button movement (overrides keyboard when active)
    if (leftPressed) {
      vx = -PLAYER_SPEED;
    } else if (rightPressed) {
      vx = PLAYER_SPEED;
    }

    this.player.body.setVelocityX(vx);
  }

  /**
   * Handle dash logic: initiate a dash in the held direction and sustain it for DASH_DURATION.
   */
  updateDashLogic(inputState, delta) {
    const { cursorKeys, dashPressed, leftPressed, rightPressed } = inputState;

    const movingLeft = cursorKeys.left.isDown || leftPressed;
    const movingRight = cursorKeys.right.isDown || rightPressed;

    if (this.dashTimer > 0) {
      // sustain dash velocity for the remaining duration
      this.player.body.setVelocityX(this.dashDirection * DASH_SPEED);
      this.dashTimer = Math.max(0, this.dashTimer - delta);
      return;
    }

    // start a new dash when the button is pressed and a direction is held
    if (dashPressed) {
      if (movingLeft) {
        this.dashDirection = -1;
        this.dashTimer = DASH_DURATION;
        this.player.body.setVelocityX(-DASH_SPEED);
        console.debug('Dashed left');
      } else if (movingRight) {
        this.dashDirection = 1;
        this.dashTimer = DASH_DURATION;
        this.player.body.setVelocityX(DASH_SPEED);
        console.debug('Dashed right');
      }
    }
  }

  /**
   * Handle jump logic: jump initialization and air acceleration.
   */
  updateJumpLogic(inputState, delta) {
    const jumpDown = inputState.cursorKeys.up.isDown || inputState.jumpHeld;
    const jumpJustPressed = jumpDown && !this.wasJumpDown;
    const grounded = this.player.body.blocked.down;

    // reset jump counter only on the landing transition (airborne → grounded)
    if (grounded && !this.wasGrounded) {
      console.debug('Landed');
      this.jumpsUsed = 0;
    }

    // reset jump timer when grounded and not holding jump
    if (grounded && !jumpDown) {
      this.jumpHeldTimer = 0;
    }

    // Start a jump on the press edge (holding button doesn't retrigger it).
    // Allow one extra jump while airborne for a double jump.
    if (jumpJustPressed && this.jumpsUsed < this.maxJumpsAvailable) {
      console.debug('Jumped');
      this.player.body.setVelocityY(JUMP_VELOCITY);
      this.jumpHeldTimer = JUMP_HOLD_TIME;
      this.jumpsUsed += 1;
    }

    // Holding jump briefly after takeoff adds lift for a higher arc.
    if (jumpDown && this.jumpHeldTimer > 0 && this.player.body.velocity.y < 0) {
      this.player.body.setAccelerationY(-JUMP_HOLD_ACCEL);
      this.jumpHeldTimer = Math.max(0, this.jumpHeldTimer - delta);
    } else {
      this.player.body.setAccelerationY(0);
      if (!jumpDown) {
        this.jumpHeldTimer = 0;
      }
    }

    this.wasJumpDown = jumpDown;
    this.wasGrounded = grounded;
  }

  /**
   * Main update method combining horizontal and vertical movement logic.
   */
  update(inputState, delta) {
    if (!this.player || !this.player.body) return;

    this.updateDashLogic(inputState, delta);
    this.updateHorizontalMovement(inputState);
    this.updateJumpLogic(inputState, delta);
    this.updateGlideLogic(inputState);
  }

  /**
   * Handle glide logic: when all jumps are spent, holding jump while falling
   * caps the fall speed to GLIDE_FALL_SPEED for a slow descent.
   */
  updateGlideLogic(inputState) {
    if (!this.glideEnabled) return;

    const jumpDown = inputState.cursorKeys.up.isDown || inputState.jumpHeld;
    const falling = this.player.body.velocity.y > 0;
    const allJumpsSpent = this.jumpsUsed >= this.maxJumpsAvailable;

    if (jumpDown && falling && allJumpsSpent) {
      this.player.body.setVelocityY(GLIDE_FALL_SPEED);
    }
  }

  /**
   * Get the current player state (for debugging or other systems).
   */
  getState() {
    return {
      jumpsUsed: this.jumpsUsed,
      jumpHeldTimer: this.jumpHeldTimer,
      isAirborne: !this.player.body.blocked.down,
    };
  }

  /**
   * Enable double jump by increasing the max jumps available.
   */
  enableDoubleJump() {
    this.maxJumpsAvailable = 2;
    console.debug('Double jump enabled!');
  }

  /**
   * Enable glide ability.
   */
  enableGlide() {
    this.glideEnabled = true;
    console.debug('Glide enabled!');
  }
}
