(function () {
    'use strict';

    var score = 0;
    const width = 900;
    const height = 1600;
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
    function isPC() {
        var userAgentInfo = navigator.userAgent;
        var Agents = ['Android', 'iPhone', 'SymbianOS', 'Window Phone', 'iPad', 'iPod'];
        var flag = true;
        for (let i = 0; i < Agents.length; i++) {
            if (userAgentInfo.indexOf(Agents[i]) != -1) {
                flag = false;
                break;
            }
        }
        return flag;
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
    function randomNumber(count = 1, min = 1, max = 10, scope = 2) {
        var numArray = new Array();
        var temp = 0;
        var rightp = true;
        var isrepeat = true;
        for (let i = 0; i < count; i++) {
            do {
                temp = Math.floor(Math.random() * (max - min + 1) + min);
                isrepeat = numArray.includes(temp);
                if (isrepeat) {
                    rightp = true;
                }
                else {
                    if (scope <= 0) {
                        rightp = false;
                    }
                    else {
                        var iscan = false;
                        for (let j = 0; j < numArray.length; j++) {
                            if (Math.abs(numArray.at(j) - temp) < scope) {
                                iscan = true;
                                break;
                            }
                        }
                        rightp = iscan;
                    }
                }
            } while (rightp);
            numArray.push(temp);
        }
        return numArray;
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
        init() {
        }
        preload() {
            this.load.image('start', 'assets/start.png');
            this.load.image('sky', 'assets/sky.png');
        }
        create() {
            this.add.image(width / 2, height / 4, 'sky').setScale(2);
            this.add.image(width / 2, height * 3 / 4, 'sky').setScale(2);
            this.add.text(width / 2 - 50, height / 4, "Up", {
                fontSize: '100px',
                color: '#ff0000',
                align: 'center'
            });
            let start = this.add.image(width / 2, height / 2, 'start');
            start.setInteractive();
            start.on('pointerdown', (pointer) => {
                this.scene.stop('StartScene');
                this.scene.start('HomeScene');
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
            this.load.image('sky', 'assets/sky.png');
        }
        create() {
            this.add.image(width / 2, height / 4, 'sky').setScale(2);
            this.add.image(width / 2, height * 3 / 4, 'sky').setScale(2);
            this.add.text(width / 2 - 50 * 3 - 50, height / 4, "Wasted!\n" + "You score: " + score, {
                fontSize: "50px",
                color: "#ff0000",
                align: "center"
            });
            let restart = this.add.image(width / 2, height / 2, 'restart');
            restart.setInteractive();
            restart.setScale(2);
            restart.on('pointerup', (pointer) => {
                this.scene.stop('FinishScene');
                this.scene.start('HomeScene');
            });
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
            this.generateHeight = 10;
            this.generateTime = 0;
            this.groundDownSpeed = 0.5;
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
            this.add.image(width / 2, height / 4, 'sky').setScale(2);
            this.add.image(width / 2, height * 3 / 4, 'sky').setScale(2);
            this.showScore = this.add.text(0, 0, "score: " + score).setScale(3);
            this.platforms = this.physics.add.staticGroup();
            this.platforms.create(width / 2, height - 32, 'stonep').setName("groundStone-2");
            this.platforms.create(width / 4 + 90, height - 180, 'stonep').setName("groundStone-1");
            this.platforms.create(width * 3 / 4 - 90, height - 180, 'stonep').setName("groundStone0");
            for (let i = 40; i < height - 200; i = i + 80) {
                this.autoGenerateGround(i, 0);
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
            if (!isPC()) {
                let left = this.add.image(width / 4, height - 100, 'left').setScale(3).setAlpha(0.3);
                left.setInteractive();
                left.on('pointerdown', (pointer) => {
                    this.swipeDirection = 'left';
                });
                left.on('pointerup', (pointer) => {
                    this.swipeDirection = 'turn';
                });
                let right = this.add.image(width * 3 / 4, height - 100, 'right').setScale(3).setAlpha(0.3);
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
                this.groundDownSpeed += 0.01;
            }
            this.platforms.incY(this.groundDownSpeed);
            this.platforms.refresh();
            this.generateTime += Math.ceil(this.groundDownSpeed - 0.5);
            if (this.generateTime >= ((80 + 30) / this.groundDownSpeed)) {
                this.autoGenerateGround(-10, 0);
                this.generateTime = 0;
            }
            if (this.player.y > height + 5) {
                this.isDead = true;
            }
            if (this.isDead) {
                this.scene.stop('HomeScene');
                this.scene.start('FinishScene');
            }
            this.platforms.children.each((ground) => {
                if (ground.body.position.y > height + 5) {
                    this.platforms.kill(ground);
                    this.platforms.remove(ground);
                    this.platforms.refresh();
                }
            });
            this.showScore.text = "score: " + score;
        }
        randomX(min = -44, max = 44) {
            return Math.random() * (max - min + 1) + min;
        }
        autoGenerateGround(y, count = 1) {
            const lineNum = Math.floor(width / 90);
            if (count == 0) {
                count = Math.floor(Math.random() * 3 + 1);
            }
            if ((Math.floor(Math.random() * 50 + 25)) == 27) {
                count = 0;
            }
            if (count != 0) {
                let numArray = randomNumber(count, 1, lineNum, 3);
                for (let i = 0; i < count; i++) {
                    this.platforms.create(numArray.at(i) * 90 - 45 + this.randomX(), y, 'stonep').setName("stoneGround" + this.groundIndex);
                    this.groundIndex++;
                }
            }
        }
        collectGround(object1, object2) {
        }
    }
    new Main();

}());
//# sourceMappingURL=bundle.js.map
