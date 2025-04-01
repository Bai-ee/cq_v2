export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.player = null;
        this.zombies = null;
        this.bullets = null;
        this.score = 0;
        this.scoreText = null;
        this.gameOver = false;
    }

    preload() {
        // Load game assets
        this.load.image('background', 'assets/images/ground.png');
        this.load.spritesheet('player', 'assets/sprites/player.png', { 
            frameWidth: 32, 
            frameHeight: 32 
        });
        this.load.spritesheet('zombie', 'assets/sprites/zombie.png', { 
            frameWidth: 32, 
            frameHeight: 32 
        });
        this.load.image('bullet', 'assets/images/bullet.png');
    }

    create() {
        // Create background
        this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, 'background')
            .setOrigin(0, 0)
            .setScrollFactor(0);

        // Initialize groups
        this.bullets = this.physics.add.group();
        this.zombies = this.physics.add.group();

        // Create player
        this.player = this.physics.add.sprite(
            this.game.config.width / 2,
            this.game.config.height / 2,
            'player'
        );
        this.player.setCollideWorldBounds(true);

        // Setup player animations
        this.createPlayerAnimations();

        // Setup input handlers
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointerdown', (pointer) => this.shoot(pointer), this);

        // Add score text
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        }).setScrollFactor(0);

        // Spawn zombies periodically
        this.time.addEvent({
            delay: 2000,
            callback: this.spawnZombie,
            callbackScope: this,
            loop: true
        });

        // Setup collisions
        this.physics.add.overlap(this.bullets, this.zombies, this.hitZombie, null, this);
        this.physics.add.overlap(this.player, this.zombies, this.gameOverHandler, null, this);
    }

    update() {
        if (this.gameOver) return;

        // Player movement
        this.handlePlayerMovement();

        // Update zombie movement
        this.zombies.getChildren().forEach(zombie => {
            this.physics.moveToObject(zombie, this.player, 100);
            
            // Rotate zombie to face player
            const angle = Phaser.Math.Angle.Between(
                zombie.x, zombie.y,
                this.player.x, this.player.y
            );
            zombie.setRotation(angle + Math.PI/2);
        });

        // Rotate player to face mouse
        const pointer = this.input.activePointer;
        const angle = Phaser.Math.Angle.Between(
            this.player.x, this.player.y,
            pointer.x + this.cameras.main.scrollX,
            pointer.y + this.cameras.main.scrollY
        );
        this.player.setRotation(angle + Math.PI/2);
    }

    createPlayerAnimations() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
    }

    handlePlayerMovement() {
        const speed = 200;
        let moving = false;

        // Reset velocity
        this.player.setVelocity(0);

        if (this.cursors.left.isDown || this.input.keyboard.addKey('A').isDown) {
            this.player.setVelocityX(-speed);
            moving = true;
        }
        if (this.cursors.right.isDown || this.input.keyboard.addKey('D').isDown) {
            this.player.setVelocityX(speed);
            moving = true;
        }
        if (this.cursors.up.isDown || this.input.keyboard.addKey('W').isDown) {
            this.player.setVelocityY(-speed);
            moving = true;
        }
        if (this.cursors.down.isDown || this.input.keyboard.addKey('S').isDown) {
            this.player.setVelocityY(speed);
            moving = true;
        }

        // Play animation based on movement
        if (moving) {
            this.player.anims.play('walk', true);
        } else {
            this.player.anims.stop();
        }
    }

    shoot(pointer) {
        if (this.gameOver) return;

        const bullet = this.bullets.create(this.player.x, this.player.y, 'bullet');
        const angle = Phaser.Math.Angle.Between(
            this.player.x, this.player.y,
            pointer.x + this.cameras.main.scrollX,
            pointer.y + this.cameras.main.scrollY
        );

        bullet.setRotation(angle);
        this.physics.velocityFromRotation(angle, 500, bullet.body.velocity);

        // Destroy bullet after 1 second
        this.time.delayedCall(1000, () => {
            bullet.destroy();
        });
    }

    spawnZombie() {
        if (this.gameOver) return;

        // Spawn zombie at a random edge of the screen
        const side = Phaser.Math.Between(0, 3);
        let x, y;

        switch(side) {
            case 0: // Top
                x = Phaser.Math.Between(0, this.game.config.width);
                y = -50;
                break;
            case 1: // Right
                x = this.game.config.width + 50;
                y = Phaser.Math.Between(0, this.game.config.height);
                break;
            case 2: // Bottom
                x = Phaser.Math.Between(0, this.game.config.width);
                y = this.game.config.height + 50;
                break;
            case 3: // Left
                x = -50;
                y = Phaser.Math.Between(0, this.game.config.height);
                break;
        }

        const zombie = this.zombies.create(x, y, 'zombie');
        zombie.setCollideWorldBounds(true);
    }

    hitZombie(bullet, zombie) {
        bullet.destroy();
        zombie.destroy();
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    }

    gameOverHandler() {
        this.gameOver = true;
        this.physics.pause();
        
        this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 2,
            'GAME OVER\nScore: ' + this.score + '\nClick to restart',
            {
                fontSize: '48px',
                fill: '#fff',
                backgroundColor: '#000',
                padding: { x: 20, y: 10 },
                align: 'center'
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0);

        this.input.on('pointerdown', () => {
            this.scene.restart();
        });
    }
}
