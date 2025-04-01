// Debug.js - A troubleshooting tool for Critters Quest that allows switching between debug and full game

// Debug information display
const debugInfo = document.getElementById('debug-info');
const logInfo = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    debugInfo.innerHTML += `<div>[${timestamp}] ${message}</div>`;
    // Keep only last 10 log entries
    const entries = debugInfo.querySelectorAll('div');
    if (entries.length > 10) {
        for (let i = 0; i < entries.length - 10; i++) {
            debugInfo.removeChild(entries[i]);
        }
    }
    
    // Auto-scroll to bottom
    debugInfo.scrollTop = debugInfo.scrollHeight;
};

// Mobile detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
logInfo(`Device detected: ${isMobile ? 'Mobile' : 'Desktop'}`);
logInfo(`Screen: ${window.innerWidth}x${window.innerHeight}, Pixel Ratio: ${window.devicePixelRatio}`);

// Log touch/pointer events support
logInfo(`Touch events: ${('ontouchstart' in window) ? 'Supported' : 'Not supported'}`);
logInfo(`Pointer events: ${(window.PointerEvent) ? 'Supported' : 'Not supported'}`);

// Button event listeners
document.getElementById('test-basic').addEventListener('click', startBasicTest);
document.getElementById('test-platform').addEventListener('click', startPlatformTest);
document.getElementById('test-character').addEventListener('click', startCharacterTest);
document.getElementById('toggle-debug').addEventListener('click', () => {
    debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
});
document.getElementById('toggle-full-game').addEventListener('click', toggleFullGame);

// Store the current game instance
let currentGame = null;
let inFullGameMode = false;

// Function to toggle between debug mode and full game
function toggleFullGame() {
    if (inFullGameMode) {
        // Switch back to debug mode
        inFullGameMode = false;
        document.getElementById('toggle-full-game').textContent = 'Switch to Full Game';
        startBasicTest(); // Start with basic test when returning to debug mode
        logInfo('Switched to debug mode');
    } else {
        // Switch to full game mode
        inFullGameMode = true;
        document.getElementById('toggle-full-game').textContent = 'Switch to Debug Mode';
        startFullGame();
        logInfo('Switched to full game mode');
    }
}

// Basic test - minimal Phaser instance
function startBasicTest() {
    logInfo('Starting basic Phaser test');
    if (currentGame) currentGame.destroy(true);
    
    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800,
            height: 400
        },
        backgroundColor: '#000000',
        scene: {
            preload: basicPreload,
            create: basicCreate
        },
        // Explicitly enable touch input
        input: {
            touch: true
        }
    };
    
    currentGame = new Phaser.Game(config);
}

function basicPreload() {
    // Basic preload with minimal assets
    this.load.image('background', 'assets/images/bg.jpg');
    logInfo('Basic assets loaded');
}

function basicCreate() {
    logInfo('Basic scene created');
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Add background
    const bg = this.add.sprite(width/2, height/2, 'background');
    bg.setOrigin(0.5, 0.5);
    
    // Scale background to fit
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);
    
    // Add text
    const text = this.add.text(width/2, height/2, 'Basic Test - Tap anywhere', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff'
    });
    text.setOrigin(0.5, 0.5);
    
    // Add input handling
    this.input.on('pointerdown', function(pointer) {
        logInfo(`Pointer down at ${pointer.x}, ${pointer.y}`);
        text.setText(`Tap detected at ${Math.floor(pointer.x)}, ${Math.floor(pointer.y)}`);
    });
    
    // Report input manager status safely
    try {
        if (this.input.plugins && this.input.plugins.list) {
            logInfo(`Input plugins active: ${Object.keys(this.input.plugins.list).join(', ')}`);
        } else {
            logInfo('Input plugins structure not available on this device');
        }
        
        // Log more details about available input managers
        logInfo(`Input manager: keyboard=${!!this.input.keyboard}, touch=${!!this.input.touch}, pointer=${!!this.input.pointer}`);
    } catch (e) {
        logInfo(`Could not access input plugins: ${e.message}`);
    }
}

// Platform test with interactive element
function startPlatformTest() {
    logInfo('Starting platform test');
    if (currentGame) currentGame.destroy(true);
    
    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800,
            height: 400
        },
        backgroundColor: '#000000',
        scene: {
            preload: platformPreload,
            create: platformCreate
        },
        // Explicitly enable touch input
        input: {
            touch: true
        }
    };
    
    currentGame = new Phaser.Game(config);
}

function platformPreload() {
    this.load.image('background', 'assets/images/bg.jpg');
    this.load.image('platform', 'assets/images/bloodmoon_plat.png');
    logInfo('Platform assets loaded');
}

function platformCreate() {
    logInfo('Platform scene created');
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Add background
    const bg = this.add.sprite(width/2, height/2, 'background');
    bg.setOrigin(0.5, 0.5);
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);
    
    // Add platform in the center
    const platform = this.add.image(width/2, height/2, 'platform');
    platform.setOrigin(0.5, 0.5);
    platform.setScale(0.3);
    
    // Make the platform interactive with additional options for mobile
    platform.setInteractive({ 
        useHandCursor: true,
        pixelPerfect: false, // Disable pixel perfect for better mobile performance
        draggable: false 
    });
    
    // Log when platform interaction events happen
    platform.on('pointerover', function() {
        logInfo('Platform pointer over');
        this.setTint(0xff0000);
    });
    
    platform.on('pointerout', function() {
        logInfo('Platform pointer out');
        this.clearTint();
    });
    
    platform.on('pointerdown', function() {
        logInfo('Platform clicked/tapped');
        this.setTint(0x00ff00);
    });
    
    platform.on('pointerup', function() {
        logInfo('Platform released');
        this.setTint(0xff0000);
    });
    
    // Add text
    const text = this.add.text(width/2, height - 50, 'Tap on the platform', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff'
    });
    text.setOrigin(0.5, 0.5);
}

// Character test with sprite animation
function startCharacterTest() {
    logInfo('Starting character test');
    if (currentGame) currentGame.destroy(true);
    
    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800,
            height: 400
        },
        backgroundColor: '#000000',
        scene: {
            preload: characterPreload,
            create: characterCreate
        },
        // Explicitly enable touch input
        input: {
            touch: true
        }
    };
    
    currentGame = new Phaser.Game(config);
}

function characterPreload() {
    this.load.image('background', 'assets/images/bg.jpg');
    
    // Load Collasus spritesheet
    this.load.spritesheet('collasus', 'assets/images/collasus.png', {
        frameWidth: 1123,
        frameHeight: 1123,
        spacing: 0,
        margin: 0
    });
    
    logInfo('Character assets loaded');
}

function characterCreate() {
    logInfo('Character scene created');
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Add background
    const bg = this.add.sprite(width/2, height/2, 'background');
    bg.setOrigin(0.5, 0.5);
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);
    
    // Add character
    const character = this.add.sprite(width/2, height/2, 'collasus');
    character.setScale(0.2);
    
    // Create animations
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('collasus', { 
            start: 0,
            end: 4
        }),
        frameRate: 12,
        repeat: -1
    });
    
    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('collasus', { 
            start: 5,
            end: 5
        }),
        frameRate: 1,
        repeat: 0
    });
    
    // Start with idle animation
    character.play('idle');
    
    // Enable click-to-move
    this.input.on('pointerdown', (pointer) => {
        logInfo(`Moving character to ${pointer.x}, ${pointer.y}`);
        
        const targetX = pointer.x;
        const targetY = pointer.y;
        const distance = Phaser.Math.Distance.Between(character.x, character.y, targetX, targetY);
        const duration = distance * 2;
        
        // Set direction
        character.setFlipX(targetX < character.x);
        
        // Play walking animation
        character.play('walk');
        
        // Move to target
        this.tweens.add({
            targets: character,
            x: targetX,
            y: targetY,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                character.play('idle');
            }
        });
    });
    
    // Add text
    const text = this.add.text(width/2, height - 50, 'Tap anywhere to move character', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff'
    });
    text.setOrigin(0.5, 0.5);
}

// Start the full game experience (based on the original game.js and StartScene.js)
function startFullGame() {
    logInfo('Starting full game experience');
    if (currentGame) currentGame.destroy(true);
    
    // Import the original StartScene to use in our game
    import('./scenes/StartScene.js')
        .then((module) => {
            const StartScene = module.default;
            
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
                backgroundColor: '#000000',
                // Explicitly enable touch input for mobile
                input: {
                    touch: true,
                    activePointers: 1 // Set to 1 for better mobile performance
                }
            };
            
            currentGame = new Phaser.Game(config);
            
            // Handle responsive font sizing (from original game.js)
            const baseFontSize = 18;
            const baseWidth = 1920;
            
            currentGame.events.on('resize', (gameSize) => {
                logInfo(`Game resized to ${gameSize.width}x${gameSize.height}`);
                // Calculate new font size based on screen width
                const scaleFactor = Math.min(1, gameSize.width / baseWidth);
                const newFontSize = Math.max(14, Math.floor(baseFontSize * scaleFactor));
                
                // Update font size in the current scene
                const currentScene = currentGame.scene.getScenes(true)[0];
                if (currentScene && currentScene.instructionText) {
                    currentScene.instructionText.setFontSize(newFontSize + 'px');
                }
            });
            
            logInfo('Full game loaded successfully');
        })
        .catch(error => {
            logInfo(`ERROR loading full game: ${error.message}`);
            // Fall back to character test if full game fails to load
            inFullGameMode = false;
            document.getElementById('toggle-full-game').textContent = 'Switch to Full Game';
            startCharacterTest();
        });
}

// Register for window resize events
window.addEventListener('resize', () => {
    logInfo(`Window resized: ${window.innerWidth}x${window.innerHeight}`);
});

// Register for visibility change
document.addEventListener('visibilitychange', () => {
    logInfo(`Visibility changed: ${document.visibilityState}`);
});

// Log any unhandled errors
window.addEventListener('error', (event) => {
    logInfo(`ERROR: ${event.message} at ${event.filename}:${event.lineno}`);
});

// Start with the basic test as default
startBasicTest();
