import Phaser from 'phaser';

/**
 * BootScene — first scene to run.
 * Responsible for setting up any global game settings before anything is loaded.
 * Transitions immediately to PreloadScene.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
