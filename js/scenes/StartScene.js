export default class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
        this.assetsLoaded = false;
    }

    preload() {
        try {
            // Load all images
            this.load.image('logo', 'assets/images/cq_logo.png');
            this.load.image('background', 'assets/images/bg.jpg');
            this.load.image('platform', 'assets/images/bloodmoon_plat.png');
            this.load.image('book', 'assets/images/bloodmoon_faction.png');
            this.load.image('circle_low', 'assets/images/circle_low.png');
            this.load.image('circle_high', 'assets/images/circle_high.png');
            this.load.image('fence', 'assets/images/fence.png');
            
            // Load explosion spritesheet with optimized dimensions
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

            // Handle load complete
            this.load.on('complete', () => {
                this.assetsLoaded = true;
            });
        } catch (error) {
            // Silently handle preload errors
            this.assetsLoaded = false;
        }
    }

    create() {
        if (!this.assetsLoaded) {
            // If assets failed to load, retry once
            this.scene.restart();
            return;
        }

        try {
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

            // Add bloodmoon platform in the center
            const platform = this.add.image(width/2, height/2 - 10, 'platform');
            platform.setOrigin(0.5, 0.5);
            platform.setDepth(4);
            platform.setInteractive({ useHandCursor: true });
            
            // Scale platform appropriately (0.425 - 10% = 0.3825)
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
            book.setInteractive({ useHandCursor: true });

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

            // Function to play explosion animation
            const playExplosion = () => {
                explosion.setVisible(true);
                explosion.play('explode');

                // Immediately fade out text completely
                this.tweens.add({
                    targets: instructionText,
                    alpha: 0,
                    duration: 300,
                    ease: 'Power2'
                });

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
                            
                            // Update text content before fading back in
                            updateInstructionText();
                            // Fade in text
                            this.tweens.add({
                                targets: instructionText,
                                alpha: 1,
                                duration: 500,
                                ease: 'Power2'
                            });
                        });
                    });
                } else {
                    // If Collasus is visible, make him walk to center and disappear
                    const distance = Phaser.Math.Distance.Between(collasus.x, collasus.y, width/2, height/2 - 20);
                    const duration = distance * 2;

                    // Disable click-to-move while returning to center
                    this.input.off('pointerdown');

                    // Walk to center
                    collasus.play('walk');
                    collasus.setFlipX((width/2) > collasus.x);

                    this.tweens.add({
                        targets: collasus,
                        x: width/2,
                        y: height/2 - 20,
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
                                    
                                    // Update text content before fading back in
                                    updateInstructionText();
                                    // Fade in text
                                    this.tweens.add({
                                        targets: instructionText,
                                        alpha: 1,
                                        duration: 500,
                                        ease: 'Power2'
                                    });
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

            // Add click handlers for both platform and book
            platform.on('pointerdown', playExplosion);
            book.on('pointerdown', playExplosion);

            // Add Collasus character (initially hidden)
            const collasus = this.add.sprite(width/2, height/2 - 20, 'collasus');
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

            // Add instruction text with responsive width
            const instructionText = this.add.text(width/2, height * 0.85 - 5, 'tap on darth plat', {
                fontFamily: '"Comic Sans MS", cursive, sans-serif',
                fontSize: '24px',
                color: '#ffffff',
                align: 'left'
            });
            // Calculate offset to visually center the text
            const calculateTextOffset = (text) => {
                return -text.length * 6; // Approximate character width offset
            };
            
            // Function to update instruction text
            const updateInstructionText = () => {
                const baseText = collasus.visible ? 'tap on screen to move' : 'tap on darth plat';
                instructionText.setText(baseText + dots);
                // Recenter based on new text length
                instructionText.x = width/2 + calculateTextOffset(baseText);
            };

            // Initial positioning
            instructionText.x = width/2 + calculateTextOffset('tap on darth plat');
            instructionText.setDepth(1001); // Above Collasus (1000) and everything else

            // Create animated ellipsis
            let dots = '';
            this.time.addEvent({
                delay: 400, // Faster animation
                callback: () => {
                    dots = dots.length >= 3 ? '' : dots + '.';
                    updateInstructionText();
                },
                loop: true
            });

            // Hover effects for book
            book.on('pointerover', () => {
                this.tweens.add({
                    targets: bookContainer,
                    y: bookContainer.y - 15,
                    duration: 500,
                    ease: 'Power2',
                    yoyo: false
                });

                this.tweens.add({
                    targets: bookGlow,
                    alpha: 0.5,
                    duration: 300,
                    ease: 'Power2'
                });

                this.tweens.add({
                    targets: circleHigh,
                    alpha: 1,
                    duration: 500,
                    ease: 'Power2'
                });
            });

            book.on('pointerout', () => {
                this.tweens.add({
                    targets: bookContainer,
                    y: height/2 + 10,
                    duration: 500,
                    ease: 'Power2',
                    yoyo: false
                });

                this.tweens.add({
                    targets: bookGlow,
                    alpha: 0,
                    duration: 300,
                    ease: 'Power2'
                });

                this.tweens.add({
                    targets: circleHigh,
                    alpha: 0,
                    duration: 500,
                    ease: 'Power2'
                });
            });

            // Single resize handler for all elements
            this.scale.on('resize', (gameSize) => {
                const width = gameSize.width;
                const height = gameSize.height;
                
                // Update background
                bg.setPosition(width/2, height/2);
                const scaleX = width / bg.width;
                const scaleY = height / bg.height;
                const scale = Math.max(scaleX, scaleY);
                bg.setScale(scale);

                // Update circles
                circleLow.setPosition(width/2, height/2);
                circleLow.setScale(scale);
                circleHigh.setPosition(width/2, height/2);
                circleHigh.setScale(scale);

                // Update logo
                logo.setPosition(width/2, height * 0.1);
                updateLogoScale();

                // Update explosion container
                explosionContainer.setPosition(width/2, height * 0.3 - 25); // Keep -25px offset in resize handler

                // Update platform
                platform.setPosition(width/2, height/2 - 10);

                // Update book container
                bookContainer.setPosition(width/2, height/2 + 10);

                // Update Collasus character
                collasus.setPosition(width/2, height/2 - 20);

                // Update instruction text position on resize
                instructionText.y = height * 0.85 - 5;
                const currentText = instructionText.text.replace(/\.+$/, ''); // Remove dots for calculation
                instructionText.x = width/2 + calculateTextOffset(currentText);
            });
        } catch (error) {
            // Silently handle create errors
        }
    }
}
