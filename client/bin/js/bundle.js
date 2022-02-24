(function () {
    'use strict';

    var score = 0;
    const width = 800;
    const height = 1200;
    function ismobile() {
        var browser = {
            versions: function () {
                var u = navigator.userAgent, app = navigator.appVersion;
                return {
                    trident: u.indexOf('Trident') > -1,
                    presto: u.indexOf('Presto') > -1,
                    webKit: u.indexOf('AppleWebKit') > -1,
                    gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,
                    mobile: !!u.match(/AppleWebKit.*Mobile.*/),
                    ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
                    android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
                    iPhone: u.indexOf('iPhone') > -1,
                    iPad: u.indexOf('iPad') > -1,
                    webApp: u.indexOf('Safari') == -1
                };
            }(),
        };
        return browser.versions.mobile;
    }
    function resize() {
        var canvas = document.querySelector('canvas');
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var windowRatio = windowWidth / windowHeight;
        var gameRatio = width / height;
        if (windowRatio < gameRatio) {
            canvas.style.width = windowWidth + 'px';
            canvas.style.height = (windowWidth / gameRatio) + 'px';
        }
        else {
            canvas.style.width = (windowHeight * gameRatio) + 'px';
            canvas.style.height = windowHeight + 'px';
        }
    }
    class Main {
        constructor() {
            this._startGame();
        }
        _startGame() {
            let config = {
                type: Phaser.AUTO,
                width: width,
                height: height,
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { y: 300 },
                        debug: false
                    }
                },
                scene: [StartScene, HomeScene, FinishScene]
            };
            var game = new Phaser.Game(config);
            window.focus();
            resize();
            window.addEventListener('resize', resize, false);
        }
    }
    class StartScene extends Phaser.Scene {
        constructor() {
            super({
                key: "StartScene"
            });
        }
        preload() {
            this.load.image('start', 'assets/start.png');
        }
        create() {
            this.add.text(width / 3, height / 2 - 100, "Go to the Top", {
                fontSize: '30px',
                color: '#ff0000'
            });
            let start = this.add.image(width / 2, height / 2, 'start');
            start.setInteractive();
            start.on('pointerdown', (pointer) => {
                this.scene.stop();
                this.scene.run('HomeScene');
            });
        }
    }
    class FinishScene extends Phaser.Scene {
        constructor() {
            super({
                key: 'FinishScene'
            });
        }
        init() {
        }
        preload() {
            this.load.image("restart", 'assets/restart.png');
        }
        create() {
            console.log("width: " + width);
            console.log("height: " + height);
            this.add.text(width / 3, height / 2, "You are Wasted!", {
                fontSize: "30px",
                color: "#ff0000"
            });
            this.add.text(width / 3, height / 2 + 50, "You score: " + score, {
                fontSize: "30px",
                color: "#ff0000"
            });
            let restart = this.add.image(width / 2, height / 2 + 200, 'restart');
            restart.setInteractive();
            restart.on('pointerdown', (pointer) => {
                this.scene.stop();
                this.scene.run('HomeScene');
            });
        }
        update() {
        }
    }
    class HomeScene extends Phaser.Scene {
        constructor() {
            super({
                key: 'HomeScene'
            });
            this.handleTouch = (e) => {
                let swipeTime = e.upTime - e.downTime;
                let swipe = new Phaser.Geom.Point(e.upX - e.downX, e.upY - e.downY);
                let swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
                let swipeNormal = new Phaser.Geom.Point(swipe.x / swipeMagnitude, swipe.y / swipeMagnitude);
                if (swipeMagnitude > 20 && swipeTime < 1000 && (Math.abs(swipeNormal.y) > .8 || Math.abs(swipeNormal.x) > .8)) {
                    if (swipeNormal.x > .8) {
                        console.log('向右');
                        this.swipeDirection = 'right';
                    }
                    if (swipeNormal.x < -.8) {
                        console.log('向左');
                        this.swipeDirection = 'left';
                    }
                    if (swipeNormal.y > .8) {
                        console.log('向下');
                        this.swipeDirection = 'down';
                    }
                    if (swipeNormal.y < -.8) {
                        console.log('向上');
                        this.swipeDirection = 'up';
                    }
                }
            };
        }
        init() {
            this.groundIndex = 0;
            this.isDead = false;
            this.swipeDirection = 'turn';
            score = 0;
        }
        preload() {
            this.load.image('sky', 'assets/sky.png');
            this.load.image('star', 'assets/star.png');
            this.load.image('bomb', 'assets/bomb.png');
            this.load.image('stonep', 'assets/stonePlatform.png');
            this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
            this.load.image('left', 'assets/left.png');
            this.load.image('right', 'assets/right.png');
        }
        create() {
            this.add.image(width / 2, height / 4, 'sky');
            this.add.image(width / 2, height * 3 / 4, 'sky');
            this.showScore = this.add.text(0, 0, "score: " + score);
            this.platforms = this.physics.add.staticGroup();
            this.platforms.create(width / 2, height - 32, 'stonep').setName("groundStone0");
            for (let i = 40; i < height - 52; i = i + 80) {
                this.autoGenerateGround(i);
            }
            this.player = this.physics.add.sprite(width / 2, height - 100, 'dude');
            this.player.setBounce(0.2);
            this.player.setCollideWorldBounds(false);
            this.player.setName("player");
            this.anims.create({
                key: 'left',
                frames: this.anims.generateFrameNumbers('dude', {
                    start: 0,
                    end: 3
                }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'turn',
                frames: [{ key: 'dude', frame: 4 }],
                frameRate: 20
            });
            this.anims.create({
                key: 'right',
                frames: this.anims.generateFrameNumbers('dude', {
                    start: 5,
                    end: 8
                }),
                frameRate: 10,
                repeat: -1
            });
            var collider = this.physics.add.collider(this.player, this.platforms);
            collider.collideCallback = this.collectGround;
            if (ismobile()) {
                let left = this.add.image(width / 4, height - 100, 'left');
                left.setInteractive();
                left.on('pointerdown', (pointer) => {
                    this.swipeDirection = 'left';
                });
                left.on('pointerup', (pointer) => {
                    this.swipeDirection = 'turn';
                });
                let right = this.add.image(width * 3 / 4, height - 100, 'right');
                right.setInteractive();
                right.on('pointerdown', (pointer) => {
                    this.swipeDirection = 'right';
                });
                right.on('pointerup', (pointer) => {
                    this.swipeDirection = 'turn';
                });
            }
        }
        update(time, delta) {
            var cursors = this.input.keyboard.createCursorKeys();
            if (cursors.left.isDown || this.swipeDirection == "left") {
                this.player.setVelocityX(-160);
                this.player.anims.play('left', true);
            }
            else if (cursors.right.isDown || this.swipeDirection == "right") {
                this.player.setVelocityX(160);
                this.player.anims.play('right', true);
            }
            else {
                this.player.setVelocityX(0);
                this.player.anims.play('turn');
            }
            if (this.player.body.touching.down) {
                this.player.setVelocityY(-330);
                score += 80;
                this.platforms.incY(100);
                this.autoGenerateGround(25);
                this.platforms.refresh();
            }
            if (this.player.y > height + 5) {
                this.isDead = true;
            }
            if (this.isDead) {
                this.scene.stop();
                this.scene.run("FinishScene");
            }
            this.platforms.children.each((ground) => {
                if (ground.body.position.y > height + 5) {
                    console.log("deleteGround: ", ground.name);
                    this.platforms.remove(ground);
                }
            });
            this.showScore.text = "score: " + score;
        }
        randomX() {
            return Math.random() * width - 50 + 20;
        }
        autoGenerateGround(y) {
            this.platforms.create(this.randomX(), y, 'stonep').setName("stoneGround" + this.groundIndex);
            this.groundIndex++;
        }
        collectGround(object1, object2) {
        }
    }
    new Main();

}());
//# sourceMappingURL=bundle.js.map
