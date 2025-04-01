export default class MobileStartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MobileStartScene' });
    }

    preload() {
        // Load essential assets
        this.load.image('logo', 'assets/images/cq_logo.png');
        this.load.image('background', 'assets/images/bg.jpg');
        this.load.image('platform', 'assets/images/bloodmoon_plat.png');
        this.load.image('book', 'assets/images/bloodmoon_faction.png');
        this.load.image('circle_low', 'assets/images/circle_low.png');
        this.load.image('circle_high', 'assets/images/circle_high.png');
        
        // Load Collasus spritesheet with optimized settings for mobile
        this.load.spritesheet('collasus', 'assets/images/collasus.png', {
            frameWidth: 1123,
            frameHeight: 1123
        });
        
        // Load explosion spritesheet with reduced size for mobile
        this.load.spritesheet('explosion_sprite', 'assets/images/explosion_sprite.png', {
            frameWidth: 2132,
            frameHeight: 1200,
            startFrame: 0,
            endFrame: 37
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
        
        // Add circle layers (from original)
        const circleLow = this.add.image(width/2, height/2, 'circle_low');
        circleLow.setOrigin(0.5, 0.5);
        circleLow.setScale(scale);
        circleLow.setDepth(1);

        const circleHigh = this.add.image(width/2, height/2, 'circle_high');
        circleHigh.setOrigin(0.5, 0.5);
        circleHigh.setScale(scale);
        circleHigh.setAlpha(0); // Start invisible
        circleHigh.setDepth(2);

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
        
        // Create container for book and its glow effect
        const bookContainer = this.add.container(width/2, height/2 + 10);
        bookContainer.setDepth(5);
        
        // Add glow effect (a larger, semi-transparent version of the book behind it)
        const bookGlow = this.add.image(0, 0, 'book');
        bookGlow.setScale(0.37);
        bookGlow.setTint(0x840909);
        bookGlow.setAlpha(0);
        
        // Add the main book
        const book = this.add.image(0, 0, 'book');
        book.setScale(0.35);
        
        // Add both to container
        bookContainer.add(bookGlow);
        bookContainer.add(book);
        
        // Make book interactive
        book.setInteractive({ 
            useHandCursor: true,
            pixelPerfect: false // Disable pixel perfect for better mobile performance
        });
        
        // Create explosion container
        const containerWidth = 700;
        const containerHeight = Math.round(containerWidth * (1200/2132));
        const explosionContainer = this.add.container(width/2, height * 0.3 - 25);
        explosionContainer.setDepth(999);
        
        // Add explosion sprite animation
        const explosion = this.add.sprite(0, 0, 'explosion_sprite');
        explosion.setOrigin(0.5, 0.5);
        const explosionScale = containerWidth / 2132;
        explosion.setScale(explosionScale);
        explosionContainer.add(explosion);
        
        // Create explosion animation
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion_sprite', { 
                start: 0,
                end: 37
            }),
            frameRate: 24,
            repeat: 0
        });
        
        // Initially hide the explosion
        explosion.setVisible(false);

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
        this.instructionText = this.add.text(width/2, height * 0.85, 'tap on darth plat', {
            fontFamily: '"Comic Sans MS", cursive, sans-serif',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        });
        this.instructionText.setOrigin(0.5, 0.5);
        this.instructionText.setDepth(10);
        
        // Function to update instruction text based on game state
        const updateInstructionText = () => {
            if (!character.visible) {
                this.instructionText.setText('tap on darth plat');
            } else {
                this.instructionText.setText('tap anywhere to move collasus');
            }
        };
        
        // Function to play explosion animation
        const playExplosion = () => {
            // Disable the input temporarily to prevent multiple clicks
            platform.disableInteractive();
            book.disableInteractive();
            
            // Show and play explosion
            explosion.setVisible(true);
            explosion.play('explode');
            
            // Add a camera flash effect
            this.cameras.main.flash(300, 255, 255, 255, true);
            
            // Fade out background elements
            this.tweens.add({
                targets: [logo, platform, book, bookGlow, bookContainer, bg],
                alpha: 0.5,
                duration: 300,
                ease: 'Power2'
            });
            
            // Fade out text
            this.tweens.add({
                targets: this.instructionText,
                alpha: 0,
                duration: 300,
                ease: 'Power2'
            });
            
            // Show character with delay
            this.time.delayedCall(800, () => {
                // Make character visible with animation
                character.setVisible(true);
                character.setAlpha(0);
                
                // Fade in character
                this.tweens.add({
                    targets: character,
                    alpha: 1,
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => {
                        // Fade background elements back in
                        this.tweens.add({
                            targets: [logo, platform, book, bookGlow, bookContainer, bg],
                            alpha: 1,
                            duration: 500,
                            ease: 'Power2'
                        });
                        
                        // Update and fade in text
                        updateInstructionText();
                        this.tweens.add({
                            targets: this.instructionText,
                            alpha: 1,
                            duration: 500,
                            ease: 'Power2'
                        });
                        
                        // Enable click-to-move functionality
                        this.input.on('pointerdown', (pointer) => {
                            if (!character.visible) return;
                            
                            const targetX = pointer.x;
                            const targetY = Math.max(pointer.y, platform.y - 50);
                            const distance = Phaser.Math.Distance.Between(character.x, character.y, targetX, targetY);
                            const duration = distance * 2;

                            // Calculate scale based on Y position
                            const baseScale = 0.225; // His initial size
                            const maxY = platform.y + platform.displayHeight/2; // Bottom boundary
                            const minY = platform.y - 100; // Top boundary
                            const spawnY = height/2 - 20; // Where he first appears
                            
                            let targetScale;
                            if (targetY > spawnY) {
                                // Below spawn point - grow up to 20%
                                const growthFactor = (targetY - spawnY) / (maxY - spawnY);
                                targetScale = baseScale * (1 + (0.2 * growthFactor)); // 20% larger at max
                            } else {
                                // Above spawn point - shrink up to 25%
                                const shrinkFactor = (spawnY - targetY) / (spawnY - minY);
                                targetScale = baseScale * (1 - (0.25 * shrinkFactor)); // 25% smaller at max
                            }
                            
                            // Set direction
                            character.setFlipX(targetX < character.x);
                            
                            // Play walking animation
                            character.play('walk');
                            
                            // Move to target
                            this.tweens.add({
                                targets: character,
                                x: targetX,
                                y: targetY,
                                scale: targetScale,
                                duration: duration,
                                ease: 'Linear',
                                onComplete: () => {
                                    character.play('idle');
                                }
                            });
                        });
                        
                        // Re-enable platform and book interaction
                        platform.setInteractive({ useHandCursor: true, pixelPerfect: false });
                        book.setInteractive({ useHandCursor: true, pixelPerfect: false });
                    }
                });
            });
        };
        
        // Reset function when explosion animation completes
        explosion.on('animationcomplete', () => {
            explosion.setVisible(false);
        });
        
        // Add click handlers for both platform and book
        platform.on('pointerdown', playExplosion);
        book.on('pointerdown', playExplosion);
        
        // Add subtle hover effects for interactive elements
        platform.on('pointerover', function() {
            if (this.input.enabled) {
                this.setScale(platformScale * 1.05);
            }
        });
        
        platform.on('pointerout', function() {
            if (this.input.enabled) {
                this.setScale(platformScale);
            }
        });
        
        book.on('pointerover', function() {
            if (this.input.enabled) {
                this.setScale(0.35 * 1.05);
                bookGlow.setAlpha(0.3);
            }
        });
        
        book.on('pointerout', function() {
            if (this.input.enabled) {
                this.setScale(0.35);
                bookGlow.setAlpha(0);
            }
        });
        
        // Add pulsing animation to instruction text
        this.tweens.add({
            targets: this.instructionText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    update() {
        // Update logic if needed
    }
}
