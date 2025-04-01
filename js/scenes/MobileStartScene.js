export default class MobileStartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MobileStartScene' });
    }

    preload() {
        // Load essential assets only
        this.load.image('logo', 'assets/images/cq_logo.png');
        this.load.image('background', 'assets/images/bg.jpg');
        this.load.image('platform', 'assets/images/bloodmoon_plat.png');
        this.load.image('book', 'assets/images/bloodmoon_faction.png');
        
        // Load Collasus spritesheet with optimized settings for mobile
        this.load.spritesheet('collasus', 'assets/images/collasus.png', {
            frameWidth: 1123,
            frameHeight: 1123
        });
    }

    create() {
        console.log('MobileStartScene created');
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add background image
        const bg = this.add.sprite(width/2, height/2, 'background');
        bg.setOrigin(0.5, 0.5);
        bg.setDepth(0);
        
        // Scale background to fit container width while maintaining aspect ratio
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);

        // Add logo image
        const logo = this.add.image(width/2, height * 0.1, 'logo');
        logo.setOrigin(0.5, 0);
        logo.setDepth(3);
        
        // Calculate logo scale based on viewport width
        const viewportWidth = window.innerWidth;
        const targetWidth = viewportWidth * 0.8; // 80vw
        const baseScale = 0.53 * 0.67; // Original scale reduced by 33%
        const logoScale = Math.min(targetWidth / logo.width, baseScale);
        logo.setScale(logoScale);

        // Add bloodmoon platform in the center
        const platform = this.add.image(width/2, height/2 - 10, 'platform');
        platform.setOrigin(0.5, 0.5);
        platform.setDepth(4);
        
        // Make platform interactive
        platform.setInteractive({ 
            useHandCursor: true,
            pixelPerfect: false // Disable pixel perfect for better mobile performance
        });
        
        // Scale platform appropriately
        const platformScale = 0.3825;
        platform.setScale(platformScale);

        // Add the book
        const book = this.add.image(width/2, height/2 + 10, 'book');
        book.setScale(0.35);
        book.setDepth(5);
        
        // Make book interactive
        book.setInteractive({ 
            useHandCursor: true,
            pixelPerfect: false // Disable pixel perfect for better mobile performance
        });

        // Add character (initially hidden)
        const character = this.add.sprite(width/2, height/2 - 20, 'collasus');
        character.setDepth(1000);
        character.setScale(0.225);
        character.setVisible(false);

        // Create walking animation
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('collasus', { 
                start: 0,
                end: 4
            }),
            frameRate: 12,
            repeat: -1
        });

        // Create idle animation
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

        // Add instruction text
        this.instructionText = this.add.text(width/2, height * 0.85, 'tap on platform', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        });
        this.instructionText.setOrigin(0.5, 0.5);
        this.instructionText.setDepth(10);

        // Handle platform/book click
        const showCharacter = () => {
            console.log('Platform/book clicked');
            // Make character visible
            character.setVisible(true);
            character.setAlpha(1);
            
            // Update instruction text
            this.instructionText.setText('tap anywhere to move character');
            
            // Enable click-to-move functionality
            this.input.on('pointerdown', (pointer) => {
                if (!character.visible) return;
                
                const targetX = pointer.x;
                const targetY = Math.max(pointer.y, platform.y - 50);
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
        };

        // Add click handlers for both platform and book
        platform.on('pointerdown', showCharacter);
        book.on('pointerdown', showCharacter);
    }

    update() {
        // Update logic if needed
    }
}
