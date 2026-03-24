import Phaser from 'phaser';

/**
 * MainMenuScene — displays the main menu.
 * Skeleton: shows a title and a "Start Game" button placeholder.
 */
export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Title
    this.add
      .text(width / 2, height / 3, 'Mini Metroidvania', {
        fontSize: '40px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Start button placeholder
    const startText = this.add
      .text(width / 2, height / 2, 'Press ENTER or Tap to Start', {
        fontSize: '24px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);

    // Blink animation for the prompt
    this.tweens.add({
      targets: startText,
      alpha: 0,
      duration: 700,
      ease: 'Linear',
      yoyo: true,
      repeat: -1,
    });

    // Listen for ENTER key to start the game
    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('GameScene');
    });

    // Tap / touch to start (mobile support)
    this.input.once('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}
