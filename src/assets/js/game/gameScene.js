var game, sound;

var winW = document.getElementById('intro').offsetWidth;
var winH = document.getElementById('intro').offsetHeight;

console.log(character, save);

const config = {
    type: Phaser.AUTO,
    width: winW,
    height: winH,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: "game-container",
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },

};

function game_start() {
    sound = new Howl({
        src: ['/mp3/littleroot.mp3'],
        loop: true,
    });

    game = new Phaser.Game(config);
    sound.play();
}

function preload() {
    this.load.image("tiles", "/tilesets/tuxmon-sample-32px-extruded.png");
    this.load.tilemapTiledJSON("map", "/tilemaps/tuxemon-town.json");
    this.load.atlas("brendan", "/sprites/brendan/brendan.png", "/sprites/brendan/brendan.json");
    this.load.atlas("may", "/sprites/may/may.png", "/sprites/may/may.json");
}

function create() {
    var self = this;

    this.socket = io();
    this.otherPlayers = this.physics.add.group();

    setup(self);

    this.socket.on('main', function(playerInfo) {
        addPlayer(self, playerInfo, true);
    });

    this.socket.on('player-connected', function(playerInfo) {
        // console.log('player-connected', JSON.stringify(playerInfo));
        // if (playerInfo.id == self.player.id) return;
        addPlayer(self, playerInfo, false);
    });

    this.socket.on('player-moved', function(data) {
        // console.log('player-moved', JSON.stringify(data));
        self.otherPlayers.getChildren().forEach(function(player) {
            if (data.id === player.id) {
                move(self, player, data.cursors, false);
            }
        });
    });

    this.socket.on('player-disconnected', function(id) {
        // console.log('player-disconnected', id);
        self.otherPlayers.getChildren().forEach(function(player) {
            if (id === player.id) {
                player.destroy();
            }
        });
    });
}

function update() {
    var self = this;
    move(self, this.player, this.cursors, true);
}

function move(self, player, cursors, emit = false) {
    if (player) {
        let char = player.char;
        console.log('moving', char);
        const speed = 175;
        const prevVelocity = player.body.velocity.clone();

        // Stop any previous movement from the last frame
        player.body.setVelocity(0);

        // Horizontal movement
        if (cursors.left.isDown) {
            player.body.setVelocityX(-speed);
        } else if (cursors.right.isDown) {
            player.body.setVelocityX(speed);
        }

        // Vertical movement
        if (cursors.up.isDown) {
            player.body.setVelocityY(-speed);
        } else if (cursors.down.isDown) {
            player.body.setVelocityY(speed);
        }

        // Normalize and scale the velocity so that player can't move faster along a diagonal
        player.body.velocity.normalize().scale(speed);

        let texture = "";

        // Update the animation last and give left/right animations precedence over up/down animations
        if (cursors.left.isDown) {
            player.anims.play(`${char}-left-walk`, true);
        } else if (cursors.right.isDown) {
            player.anims.play(`${char}-right-walk`, true);
        } else if (cursors.up.isDown) {
            player.anims.play(`${char}-back-walk`, true);
        } else if (cursors.down.isDown) {
            player.anims.play(`${char}-front-walk`, true);
        } else {
            player.anims.stop();

            // If we were moving, pick and idle frame to use
            if (prevVelocity.x < 0) {
                player.setTexture(char, `${char}-left-walk.000`);
                texture = `${char}-left-walk.000`;
            } else if (prevVelocity.x > 0) {
                player.setTexture(char, `${char}-right-walk.000`);
                texture = `${char}-right-walk.000`;
            } else if (prevVelocity.y < 0) {
                player.setTexture(char, `${char}-back-walk.000`);
                texture = `${char}-back-walk.000`
            } else if (prevVelocity.y > 0) {
                player.setTexture(char, `${char}-front-walk.000`);
                texture = `${char}-front-walk.000`;
            }
        }

        if (emit) {
            self.socket.emit('player-moved', { cursors: cursors, x: player.x, y: player.y, texture: texture });
        }

    }
}

function setup(self) {
    const map = self.make.tilemap({ key: "map" });

    const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

    const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
    const worldLayer = map.createStaticLayer("World", tileset, 0, 0);
    const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);

    worldLayer.setCollisionByProperty({ collides: true });
    self.worldLayer = worldLayer;

    aboveLayer.setDepth(10);

    self.spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point")

    const anims = self.anims;

    var chars = [`brendan`, `may`];
    for (let i = 0; i < chars.length; i++) {
        let name = chars[i];
        console.log(name);
        anims.create({
            key: `${name}-left-walk`,
            frames: anims.generateFrameNames(name, { prefix: `${name}-left-walk.`, start: 0, end: 3, zeroPad: 3 }),
            frameRate: 10,
            repeat: -1
        });

        anims.create({
            key: `${name}-right-walk`,
            frames: anims.generateFrameNames(name, { prefix: `${name}-right-walk.`, start: 0, end: 3, zeroPad: 3 }),
            frameRate: 10,
            repeat: -1
        });

        anims.create({
            key: `${name}-front-walk`,
            frames: anims.generateFrameNames(name, { prefix: `${name}-front-walk.`, start: 0, end: 3, zeroPad: 3 }),
            frameRate: 10,
            repeat: -1
        });

        anims.create({
            key: `${name}-back-walk`,
            frames: anims.generateFrameNames(name, { prefix: `${name}-back-walk.`, start: 0, end: 3, zeroPad: 3 }),
            frameRate: 10,
            repeat: -1
        });

    }

    var text = self.add
        .text(winW - 500, 550, 'Arrow keys to move\nPress "S" to save game', {
            font: "18px monospace",
            fill: "#000000",
            padding: { x: 20, y: 10 },
            backgroundColor: "#ffffff"
        })
        .setScrollFactor(0)
        .setDepth(30);

    setTimeout(async() => {
        text.setVisible(false);
    }, 3000);


    let d = { character: character, save: save }
    if (prevX != 0 && prevY != 0) {
        d.x = prevX;
        d.y = prevY;
    }

    self.socket.emit('data', d);

    const camera = self.cameras.main;
    camera.zoom = 1.5;
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    self.camera = camera;
}

function addPlayer(self, playerInfo, follow = false) {

    var player = self.physics.add
        .sprite(playerInfo.x ? playerInfo.x : self.spawnPoint.x, playerInfo.y ? playerInfo.y : self.spawnPoint.y, playerInfo.char,
            playerInfo.texture ? playerInfo.texture : `${playerInfo.char}-front-walk.000`)
        .setSize(40, 50)
        .setOffset(10, 10);

    // self.physics.world.enable([player]);
    // player.setBounce(1, 1).setCollideWorldBounds(true);

    player.char = playerInfo.char;
    player.id = playerInfo.id;

    self.physics.add.collider(player, self.worldLayer);

    $('#save').click(async function(e) {
        sound.stop();
        var result = await axios({
            method: 'post',
            url: `/game/save-game`,
            data: {
                save: save,
                x: self.player.x,
                y: self.player.y,
            }
        });

        setTimeout(() => {
            $('#select').removeClass('shown');
            sound.play();

        }, 400)

        await $('.character-selection').fadeOut(530).promise();
        await $('.game').fadeIn(200).promise();

    });


    if (follow) {
        self.player = player;
        self.camera.startFollow(player);
        self.cursors = self.input.keyboard.createCursorKeys();

        self.input.keyboard.on("keydown_ENTER", event => {
            console.log($(`#select`).hasClass(`shown`));
            if ($(`#select`).hasClass(`shown`)) {
                console.log(`hide`);
                $(`#select`).removeClass(`shown`);
            } else {
                console.log(`show`);
                $(`#select`).addClass(`shown`);
            }

        });
    } else {
        self.otherPlayers.add(player);
    }
}