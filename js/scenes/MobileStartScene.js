// MobileStartScene.js - A mobile-optimized version of StartScene
// Based on the original but with fixes for mobile compatibility

export default class MobileStartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MobileStartScene' });
    }

    preload() {
        console.log("MobileStartScene: preload started");
        
        // Load all images
        this.load.image('logo', 'assets/images/cq_logo.png');
        this.load.image('background', 'assets/images/bg.jpg');
        this.load.image('platform', 'assets/images/bloodmoon_plat.png');
        this.load.image('book', 'assets/images/bloodmoon_faction.png');
        this.load.image('circle_low', 'assets/images/circle_low.png');
        this.load.image('circle_high', 'assets/images/circle_high.png');
        
        // Load explosion spritesheet (38 frames in 14924x7200 sheet, each frame 2132x1200)
        this.load.spritesheet('explosion_sprite', 'assets/images/explosion_sprite.png', {
            frameWidth: 2132,
            frameHeight: 1200,
            startFrame: 0,
            endFrame: 37
        });

        // Load Collasus spritesheet
        this.load.spritesheet('collasus', 'assets/images/collasus.png', {
            frameWidth: 1123,
            frameHeight: 1123
        });
        
        console.log("MobileStartScene: preload completed");
    }

    create() {
        console.log("MobileStartScene: create started");
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Store initial dimensions for reference
        this.initialWidth = width;
        this.initialHeight = height;
        
        // Add background image
        const bg = this.add.sprite(width/2, height/2, 'background');
        bg.setOrigin(0.5, 0.5);
        bg.setDepth(0);
        
        // Scale background to fit container width while maintaining aspect ratio
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);

        // Center the background
        bg.setScrollFactor(0);

        // Add circle layers
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
        const updateLogoScale = () => {
            const viewportWidth = window.innerWidth;
            const targetWidth = viewportWidth * 0.8; // 80vw
            const baseScale = 0.53 * 0.67; // Original scale reduced by 33%
            const scale = Math.min(targetWidth / logo.width, baseScale);
            logo.setScale(scale);
        };

        // Initial scale
        updateLogoScale();

        // Define the fixed position for the platform (center of the screen)
        const platformX = width/2;
        const platformY = height/2 - 10;
        
        // Add bloodmoon platform in the center with fixed position
        const platform = this.add.image(platformX, platformY, 'platform');
        platform.setOrigin(0.5, 0.5);
        platform.setDepth(4);
        
        // Scale platform appropriately (0.3825)
        const platformScale = 0.3825;
        platform.setScale(platformScale);
        
        // Store the original platform position
        this.platformOriginalX = platformX;
        this.platformOriginalY = platformY;

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

        // Create explosion container (highest z-index)
        const containerWidth = 700;
        const containerHeight = Math.round(containerWidth * (1200/2132));  // Scale height proportionally
        const explosionContainer = this.add.container(width/2, height * 0.3 - 25);
        explosionContainer.setDepth(999);
        
        // Add explosion sprite animation
        const explosion = this.add.sprite(0, 0, 'explosion_sprite');
        explosion.setOrigin(0.5, 0.5);
        const explosionScale = containerWidth / 2132;
        explosion.setScale(explosionScale);
        explosionContainer.add(explosion);

        // Create explosion animation but don't play it yet
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion_sprite', { 
                start: 0,
                end: 37
            }),
            frameRate: 24,
            repeat: 0, // Play only once when triggered
            repeatDelay: 0
        });

        // Initially hide the explosion
        explosion.setVisible(false);

        // Define the fixed position for Collasus
        const collasusStartX = width/2;
        const collasusStartY = height/2 - 20;

        // Add instruction text with responsive width - FIXED TEXT, NO ANIMATION
        const instructionText = this.add.text(width/2, height * 0.85 - 5, 'tap on darth plat', {
            fontFamily: '"Comic Sans MS", cursive, sans-serif',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        });
        instructionText.setOrigin(0.5, 0.5);
        instructionText.setDepth(10);
        
        // Store reference for font resizing
        this.instructionText = instructionText;

        // Function to update instruction text based on game state - NO ANIMATION
        const updateInstructionText = () => {
            if (!collasus.visible) {
                instructionText.setText('tap on darth plat');
            } else {
                instructionText.setText('tap anywhere to move');
            }
        };

        // Create dramatic appearance effect
        const dramaticAppearance = () => {
            // Start with a quick flash
            this.cameras.main.flash(300, 255, 255, 255, true);
            
            // Make Collasus visible but transparent
            collasus.setVisible(true);
            collasus.setAlpha(0);
            updateInstructionText(); // Update text when Collasus appears

            // Create flickering effect
            const flickerCount = 6;
            const flickerDuration = 100;
            const finalAlpha = 1;
            
            for (let i = 0; i < flickerCount; i++) {
                // Show
                this.tweens.add({
                    targets: collasus,
                    alpha: finalAlpha - (i * 0.1), // Gradually increase final alpha
                    duration: flickerDuration,
                    ease: 'Power2',
                    delay: i * flickerDuration * 2
                });
                
                // Hide
                this.tweens.add({
                    targets: collasus,
                    alpha: 0,
                    duration: flickerDuration,
                    ease: 'Power2',
                    delay: i * flickerDuration * 2 + flickerDuration
                });
            }

            // Final appearance with scale effect
            this.tweens.add({
                targets: collasus,
                alpha: 1,
                scaleX: 0.225,
                scaleY: 0.225,
                duration: 500,
                ease: 'Power2',
                delay: flickerCount * flickerDuration * 2,
                onStart: () => {
                    // Add a dramatic camera shake
                    this.cameras.main.shake(500, 0.005);
                },
                onComplete: () => {
                    // Enable click-to-move functionality only after appearance is complete
                    this.input.on('pointerdown', (pointer) => {
                        const targetX = pointer.x;
                        const targetY = Math.max(pointer.y, platform.y + platform.displayHeight/2 - 100);
                        const distance = Phaser.Math.Distance.Between(collasus.x, collasus.y, targetX, targetY);
                        const duration = distance * 2;

                        // Calculate scale based on Y position
                        const baseScale = 0.225; // His initial size
                        const maxY = platform.y + platform.displayHeight/2; // Bottom boundary
                        const minY = platform.y + platform.displayHeight/2 - 100; // Top boundary
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

                        collasus.play('walk');
                        collasus.setFlipX(targetX > collasus.x);

                        this.tweens.add({
                            targets: collasus,
                            x: targetX,
                            y: targetY,
                            scale: targetScale,
                            duration: duration,
                            ease: 'Linear',
                            onComplete: () => {
                                collasus.play('idle');
                            }
                        });
                    });
                }
            });
        };

        // Function to play explosion animation and handle Collasus behavior
        const playExplosion = () => {
            console.log("MobileStartScene: playExplosion triggered");
            
            // Always show explosion
            explosion.setVisible(true);
            explosion.play('explode');

            // Immediately set text without animation
            instructionText.alpha = 1;
            
            // Create a group of background items to fade (excluding text)
            const fadeItems = [logo, platform, book, bookGlow, bookContainer, bg];
            
            // Fade out background items
            fadeItems.forEach(item => {
                if (item) {
                    this.tweens.add({
                        targets: item,
                        alpha: 0.5,
                        duration: 300,
                        ease: 'Power2'
                    });
                }
            });
            
            if (!collasus.visible) {
                // Start the dramatic appearance near the end of explosion animation
                this.time.delayedCall(800, () => {
                    dramaticAppearance();
                    
                    // Calculate total animation time for Collasus
                    const flickerCount = 6;
                    const flickerDuration = 100;
                    const finalAnimationDelay = flickerCount * flickerDuration * 2;
                    const shakeTime = 500;
                    const totalAnimTime = finalAnimationDelay + shakeTime + 200; // Added buffer

                    // Fade items back in after Collasus is fully animated
                    this.time.delayedCall(totalAnimTime, () => {
                        fadeItems.forEach(item => {
                            if (item) {
                                this.tweens.add({
                                    targets: item,
                                    alpha: 1,
                                    duration: 500,
                                    ease: 'Power2'
                                });
                            }
                        });
                        
                        // Update text content without animation
                        updateInstructionText();
                    });
                });
            } else {
                // If Collasus is visible, make him walk back to starting point and disappear
                const distance = Phaser.Math.Distance.Between(collasus.x, collasus.y, collasusStartX, collasusStartY);
                const duration = distance * 2;

                // Disable click-to-move while returning to center
                this.input.off('pointerdown');

                // Walk to center
                collasus.play('walk');
                collasus.setFlipX((collasusStartX) > collasus.x);

                this.tweens.add({
                    targets: collasus,
                    x: collasusStartX,
                    y: collasusStartY,
                    scale: 0.225, // Reset to original scale
                    duration: duration,
                    ease: 'Linear',
                    onComplete: () => {
                        collasus.play('idle');
                        
                        // Fade out effect
                        this.tweens.add({
                            targets: collasus,
                            alpha: 0,
                            duration: 300,
                            ease: 'Power2',
                            onComplete: () => {
                                collasus.setVisible(false);
                                // Add a flash effect as character disappears
                                this.cameras.main.flash(300, 255, 255, 255, true);
                                
                                // Update and fade in text with background items
                                fadeItems.forEach(item => {
                                    if (item) {
                                        this.tweens.add({
                                            targets: item,
                                            alpha: 1,
                                            duration: 500,
                                            ease: 'Power2'
                                        });
                                    }
                                });
                                
                                // Update text content without animation
                                updateInstructionText();
                            }
                        });
                    }
                });
            }
        };

        // Reset function when animation completes
        explosion.on('animationcomplete', () => {
            explosion.setVisible(false);
        });

        // MOBILE OPTIMIZATION: Make platform and book interactive with improved mobile settings
        platform.setInteractive({ 
            useHandCursor: true,
            pixelPerfect: false, // Disable pixel perfect for better mobile performance
            draggable: false 
        });
        
        book.setInteractive({ 
            useHandCursor: true,
            pixelPerfect: false,
            draggable: false 
        });

        // Add click handlers for both platform and book
        platform.on('pointerdown', () => {
            console.log("MobileStartScene: platform pointerdown");
            playExplosion();
        });
        
        book.on('pointerdown', () => {
            console.log("MobileStartScene: book pointerdown");
            playExplosion();
        });

        // Add Collasus character (initially hidden)
        const collasus = this.add.sprite(collasusStartX, collasusStartY, 'collasus');
        collasus.setDepth(1000);
        collasus.setScale(0.225);
        collasus.setAlpha(0); // Start invisible
        collasus.setVisible(false);

        // Create walking animation
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('collasus', { 
                start: 0,
                end: 4
            }),
            frameRate: 12, // Slightly faster animation
            repeat: -1
        });

        // Create idle animation (single frame)
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
        collasus.play('idle');
        
        // Store references to key objects for resize handling
        this.platform = platform;
        this.collasus = collasus;
        this.collasusStartX = collasusStartX;
        this.collasusStartY = collasusStartY;
        
        // Handle resize events to keep platform in original position
        this.scale.on('resize', this.handleResize, this);
        
        console.log("MobileStartScene: create completed");
    }
    
    // Handle resize while maintaining platform position
    handleResize(gameSize) {
        // Keep platform at its original position
        if (this.platform && this.platformOriginalX && this.platformOriginalY) {
            this.platform.setPosition(this.platformOriginalX, this.platformOriginalY);
        }
        
        // If Collasus is not visible, make sure he's at the start position
        if (this.collasus && !this.collasus.visible && this.collasusStartX && this.collasusStartY) {
            this.collasus.setPosition(this.collasusStartX, this.collasusStartY);
        }
    }
}
