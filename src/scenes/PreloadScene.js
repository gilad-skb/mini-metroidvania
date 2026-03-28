import Phaser from "phaser";

/**
 * PreloadScene — loads all game assets before any other scene runs.
 * Shows a simple loading progress bar while assets are being loaded.
 * Transitions to MainMenuScene once loading is complete.
 */
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    this.#createLoadingBar();

    this.load.tilemapTiledJSON("scene", "assets/tiles/scene.json");
    this.load.image("space-tiles", "assets/tiles/space.png");
    this.load.image("template-tiles", "assets/tiles/template.png");
  }

  create() {
    this.scene.start("MainMenuScene");
  }

  #createLoadingBar() {
    const { width, height } = this.scale;

    const barWidth = width * 0.6;
    const barHeight = 20;
    const barX = (width - barWidth) / 2;
    const barY = height / 2 - barHeight / 2;

    // Background bar
    const bgBar = this.add.rectangle(barX, barY, barWidth, barHeight, 0x222222);
    bgBar.setOrigin(0, 0);

    // Progress fill
    const fillBar = this.add.rectangle(barX, barY, 0, barHeight, 0x44aaff);
    fillBar.setOrigin(0, 0);

    // Label
    this.add
      .text(width / 2, barY - 24, "Loading...", {
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0);

    // Update fill as assets load
    this.load.on("progress", (value) => {
      fillBar.width = barWidth * value;
    });
  }
}
