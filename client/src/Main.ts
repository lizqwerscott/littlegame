import {fork} from "child_process";

var score = 0;

class Main {


	constructor() {
		
		// 这里是游戏具体代码
		this._startGame()
	}
	private _startGame() {
		let config = {
			type: Phaser.AUTO,
			width: 800,
			height: 600,
			physics: {
				default: 'arcade',
				arcade: {
					gravity: { y: 300 },
                    debug: false
				}
			},
			scene: [HomeScene, FinishScene]
		}

		var game = new Phaser.Game(config);
		
	}


}

class FinishScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'FinishScene'
        })
    }

    init() {

    }

    preload() {

    }

    create() {
        this.add.text(285, 300, "You are Wasted!", {
            fontSize: "30px",
            color: "#ff0000"
        });
        this.add.text(285, 340, "You score: " + score, {
            fontSize: "30px",
            color: "#ff0000"
        });
    }

    update() {

    }
}

class HomeScene extends Phaser.Scene{
	constructor(){
		super({
			key:'HomeScene'
		})
	}

    platforms: Phaser.Physics.Arcade.StaticGroup;
    //player = Phaser.Physics.Arcade.Sprite;
    isDead: Boolean;
    player: Phaser.Physics.Arcade.Sprite;
    showScore: Phaser.GameObjects.Text;

    groundIndex: number;

	init(){
        this.groundIndex = 0;
        this.isDead = false;
	}
	preload(){
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
                             {frameWidth: 32, frameHeight: 48});
	}
	create ()
    {
        this.add.image(400, 300, 'sky');
        this.showScore = this.add.text(0, 0, "score: " + score);
        //this.add.image(400, 400, 'star');

        this.platforms = this.physics.add.staticGroup();

        this.platforms.create(400, 568, 'stonep').setName("groundStone0");

        for (let i = 40; i < 548; i = i + 80) {
            this.autoGenerateGround(i);
        }

        //var groundMain = this.platforms.create(400, 568, 'ground').setName("ground1");
        //groundMain.setScale(2).refreshBody();
        //this.platforms.create(600, 400, 'ground').setName("ground2");
        //this.platforms.create(50, 250, 'ground').setName("ground3");
        //this.platforms.create(750, 220, 'ground').setName("ground4");

        this.player = this.physics.add.sprite(400, 500, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(false);
        this.player.setName("player")

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', {
                start: 0,
                end : 3
            }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4}],
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
    }

    update(time, delta) {
        var cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (cursors.right.isDown) {
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
            this.platforms.incY(80);
            this.autoGenerateGround(25);
            this.platforms.refresh();
        }

        //console.log("time: " + time);
        //console.log("delta: " + delta);

        if (this.player.y > 610) {
            this.isDead = true;
        }

        if (this.isDead) {
            this.scene.stop();
            this.scene.run("FinishScene");
        }

        this.platforms.children.each((ground : Phaser.GameObjects.GameObject) => {
            if (ground.body.position.y > 610) {
                console.log("deleteGround: ", ground.name);
                this.platforms.remove(ground);
            }
        });


        this.showScore.text = "score: " + score;
    }

    randomX() {
        return Math.random() * 700 + 30
    }

    autoGenerateGround(y: number) {
        this.platforms.create(this.randomX(), y, 'stonep').setName("stoneGround" + this.groundIndex);
        this.groundIndex++;
    }

    collectGround(object1: Phaser.GameObjects.GameObject, object2: Phaser.GameObjects.GameObject) {
        //console.log("platform:" + object1.name)
        //console.log("platform:" + object2.name)
    }

}

//激活启动类
new Main();
