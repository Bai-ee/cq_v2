import StartScene from './scenes/StartScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 400,
        min: {
            width: 800,
            height: 200
        },
        max: {
            width: 1920,
            height: 800
        }
    },
    scene: StartScene,
    backgroundColor: '#000000'
};

const game = new Phaser.Game(config);

// Handle responsive font sizing
const baseFontSize = 18;
const baseWidth = 1920;

game.events.on('resize', (gameSize) => {
    // Calculate new font size based on screen width
    const scaleFactor = Math.min(1, gameSize.width / baseWidth);
    const newFontSize = Math.max(14, Math.floor(baseFontSize * scaleFactor));
    
    // Update font size in the current scene
    const currentScene = game.scene.getScenes(true)[0];
    if (currentScene && currentScene.instructionText) {
        currentScene.instructionText.setFontSize(newFontSize + 'px');
    }
});
