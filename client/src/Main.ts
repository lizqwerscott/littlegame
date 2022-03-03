import { fork } from "child_process";

var score = 0;
const width = 900;
const height = 1600;

function ismobile() {
    var browser = {
        versions: function() {
            var u = navigator.userAgent, app = navigator.appVersion;
            return {     //移动终端浏览器版本信息
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
                iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, //是否iPad
                webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
            };
        }(),
    };
    return browser.versions.mobile
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
    } else {
        canvas.style.width = (windowHeight * gameRatio) + 'px';
        canvas.style.height = windowHeight + 'px';
    }

}

function randomNumber(count: number = 1, min: number = 1, max: number = 10, scope: number = 2) {
    var numArray: number[] = new Array<number>();
    var temp: number = 0;
    var rightp: boolean = true;
    var isrepeat: boolean = true;

    for (let i = 0; i < count; i++) {
        do {
            temp = Math.floor(Math.random() * (max - min + 1) + min);
            isrepeat = numArray.includes(temp);
            if (isrepeat) {
                rightp = true;
            } else {
                if (scope <= 0) {
                    rightp = false;
                } else {
                    var iscan: boolean = false;
                    for (let j = 0; j < numArray.length; j++) {
                        if (Math.abs(numArray.at(j) - temp) < scope) {
                            iscan = true;
                            break;
                        }
                    }
                    rightp = iscan;
                }

            }
        } while (rightp)
        numArray.push(temp);
    }
    return numArray;

}

class Main {


    constructor() {

        // 这里是游戏具体代码
        this._startGame()
    }
    private _startGame() {
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
        }

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
        })
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
        })
    }
    parent: Phaser.Structs.Size;
    sizer: Phaser.Structs.Size;

    init() {

    }

    preload() {
        this.load.image("restart", 'assets/restart.png');
        this.load.image('sky', 'assets/sky.png');
    }

    create() {
        //console.log("width: " + width);
        //console.log("height: " + height);

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
        })

    }
}

class HomeScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'HomeScene'
        })
    }

    platforms: Phaser.Physics.Arcade.StaticGroup;
    //player = Phaser.Physics.Arcade.Sprite;
    isDead: Boolean;
    player: Phaser.Physics.Arcade.Sprite; showScore: Phaser.GameObjects.Text;
    width: number;
    height: number;

    groundIndex: number;

    swipeDirection: string;

    generateHeight: number;
    generateTime: number;

    groundDownSpeed: number;

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
        //this.load.setBaseURL('http://labs.phaser.io');

        //this.load.image('sky', 'assets/skies/space3.png');
        //this.load.image('logo', 'assets/sprites/phaser3-logo.png');
        //this.load.image('red', 'assets/particles/red.png');
        this.load.image('sky', 'assets/sky.png');
        //this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('stonep', 'assets/stonePlatform.png');
        this.load.spritesheet('dude',
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 });

        this.load.image('left', 'assets/left.png');
        this.load.image('right', 'assets/right.png');
    }
    create() {
        this.add.image(width / 2, height / 4, 'sky').setScale(2);
        this.add.image(width / 2, height * 3 / 4, 'sky').setScale(2);
        this.showScore = this.add.text(0, 0, "score: " + score).setScale(3);
        //this.add.image(400, 400, 'star');

        this.platforms = this.physics.add.staticGroup();

        this.platforms.create(width / 2, height - 32, 'stonep').setName("groundStone-2");
        this.platforms.create(width / 4 + 90, height - 180, 'stonep').setName("groundStone-1");
        this.platforms.create(width * 3 / 4 - 90, height - 180, 'stonep').setName("groundStone0");

        for (let i = 40; i < height - 200; i = i + 80) {
            this.autoGenerateGround(i, 0);
        }

        //var groundMain = this.platforms.create(400, 568, 'ground').setName("ground1");
        //groundMain.setScale(2).refreshBody();
        //this.platforms.create(600, 400, 'ground').setName("ground2");
        //this.platforms.create(50, 250, 'ground').setName("ground3");
        //this.platforms.create(750, 220, 'ground').setName("ground4");

        this.player = this.physics.add.sprite(width / 2, height - 100, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(false);
        this.player.setName("player")

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
        //this.physics.add.overlap(this.player, this.platforms, this.collectGround, null, this);
        //
        //this.input.on('pointerdown', this.handleTouch);
        if (!isPC()) {
            let left = this.add.image(width / 4, height - 100, 'left').setScale(3).setAlpha(0.3);
            left.setInteractive();
            left.on('pointerdown', (pointer) => {
                this.swipeDirection = 'left';
            })
            left.on('pointerup', (pointer) => {
                this.swipeDirection = 'turn';
            })
            let right = this.add.image(width * 3 / 4, height - 100, 'right').setScale(3).setAlpha(0.3);
            right.setInteractive();
            right.on('pointerdown', (pointer) => {
                this.swipeDirection = 'right';
            })
            right.on('pointerup', (pointer) => {
                this.swipeDirection = 'turn';
            })
        }

    }

    update(time, delta) {
        var cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown || this.swipeDirection == "left") {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (cursors.right.isDown || this.swipeDirection == "right") {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        /*
        if (cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
        */
        if (this.player.body.touching.down) {
            this.player.setVelocityY(-330);
            score += 80;
            this.groundDownSpeed += 0.01;
        }

        //console.log("time: " + time);
        //console.log("delta: " + delta);

        this.platforms.incY(this.groundDownSpeed);
        this.platforms.refresh();

        this.generateTime += Math.ceil(this.groundDownSpeed - 0.5);

        //console.log("generateTime: " + this.generateTime)

        if (this.generateTime >= ((80 + 30) / this.groundDownSpeed)) {
            //this.autoGenerateGround(-this.generateHeight, 0);
            //this.generateHeight += 80;
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

        this.platforms.children.each((ground: Phaser.GameObjects.GameObject) => {
            if (ground.body.position.y > height + 5) {
                //console.log("deleteGround: ", ground.name);
                this.platforms.kill(ground);
                this.platforms.remove(ground);
                this.platforms.refresh();
            }
        });


        this.showScore.text = "score: " + score;
    }

    randomX(min: number = -44, max: number = 44) {
        return Math.random() * (max - min + 1) + min;
    }

    autoGenerateGround(y: number, count: number = 1) {
        //stone width 90, stone height 30
        const lineNum: number = Math.floor(width / 90);

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

    collectGround(object1: Phaser.GameObjects.GameObject, object2: Phaser.GameObjects.GameObject) {
        //console.log("platform:" + object1.name)
        //console.log("platform:" + object2.name)
    }

    handleTouch = (e) => {

        let swipeTime = e.upTime - e.downTime;
        let swipe = new Phaser.Geom.Point(e.upX - e.downX, e.upY - e.downY);
        let swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
        let swipeNormal = new Phaser.Geom.Point(swipe.x / swipeMagnitude, swipe.y / swipeMagnitude);

        if (swipeMagnitude > 20 && swipeTime < 1000 && (Math.abs(swipeNormal.y) > .8 || Math.abs(swipeNormal.x) > .8)) {
            if (swipeNormal.x > .8) {
                console.log('向右')
                this.swipeDirection = 'right';
            }
            if (swipeNormal.x < -.8) {
                console.log('向左')
                this.swipeDirection = 'left';
            }
            if (swipeNormal.y > .8) {
                console.log('向下')
                this.swipeDirection = 'down';
            }
            if (swipeNormal.y < -.8) {
                console.log('向上')
                this.swipeDirection = 'up';
            }
        }
    }
}

//激活启动类
new Main();
