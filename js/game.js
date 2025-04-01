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
            width: 320,
            height: 200
        },
        max: {
            width: 1920,
            height: 800
        }
    },
    scene: StartScene,
    backgroundColor: '#000000',
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: true
    },
    physics: {
        default: false
    }
};

const game = new Phaser.Game(config);

// Handle responsive font sizing
window.addEventListener('load', () => {
    const baseFontSize = 18;
    const baseWidth = 1920;
    
    const updateFontSize = () => {
        const width = game.scale.width;
        const scaleFactor = Math.max(0.5, Math.min(1, width / baseWidth));
        const fontSize = Math.floor(baseFontSize * scaleFactor);
        document.documentElement.style.fontSize = `${fontSize}px`;
    };
    
    updateFontSize();
    game.scale.on('resize', updateFontSize);
});
