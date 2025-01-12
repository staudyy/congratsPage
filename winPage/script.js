const MAIN_TEXT = "CONGRATULATIONS!!"
const SECONDARY_TEXT = "You did a thing, you won!"
const FLYING_TEXTS = [
    "Wow",
    "Congrats",
    "I love u",
    "How??",
    "Nailed it!",
    "A cool text",
    "ily",
    "Way to go!",
    "You are awesome",
    "You did it!",
    "<3"
]

const PAGE_TITLE = "YIPPEE!!!"

const BUTTON_TXT_1 = "Fun"
const BUTTON_TXT_2 = "Games"

const WELCOME_TEXT = "Are you ready?"
const WELCOME_BUTTON_TEXT = "YES!!!"

const NEW_FLYING_TEXT = "ඞ"


const DPR = window.devicePixelRatio
const WIDTH = window.innerWidth * DPR
const HEIGHT = window.innerHeight * DPR

const BG_COLOR = 0x000000
const BUTTON_COLOR = 0x4f0204
const BUTTON_HOVER_COLOR = 0x8f0104

const SCALE_RATIO = Math.min(WIDTH / 1000, HEIGHT / 1000)

var RESTING = 0.01  //autism jednotka proste cim menej tym presnejsie bounces
var POSITION_ITER = 150  //makes stacking more stable

const FONT = {
    fontSize: 45*SCALE_RATIO,
    fontFamily: 'LocalComicSans, Comic Sans MS, Comic Sans, Verdana, serif',
    color: "white"
}



function randint(start, stop) {
    return Math.floor(Math.random() * (stop - start + 1)) + start;
}

function getRandomColor() {
    var letters = '456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
  function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

class MyScene extends Phaser.Scene {
    constructor(arg) {
        super(arg)
    }

    create_button(x, y, width, height, text, callback, fontSize=null ,color=BUTTON_COLOR, hover_color=BUTTON_HOVER_COLOR) {
        this.add.rectangle(x, y, width, height, color)
        .setInteractive({cursor: "pointer"})
        .on('pointerup', () => callback.call(this))
        .on('pointerover', function() {this.setFillStyle(hover_color)})
        .on('pointerout', function() {this.setFillStyle(color)});
        
        let text_obj = this.add.text(x, y, text, FONT).setOrigin(0.5)
        if (fontSize != null) {
            text_obj.setFontSize(fontSize)
        }
    }
}

class Start extends MyScene {
    constructor() {
        super("Start")
    }

    create() {
        this.add.text(WIDTH/2, HEIGHT/2 - 100*SCALE_RATIO, WELCOME_TEXT, FONT)
        .setOrigin(0.5)
        .setFontSize(65*SCALE_RATIO)
        this.create_button(WIDTH/2, HEIGHT/2 + 60*SCALE_RATIO, 200*SCALE_RATIO, 95*SCALE_RATIO, WELCOME_BUTTON_TEXT, function(){
            this.scene.start("Main")
        })
    }
}

class Main extends MyScene {
    constructor() {
        super("Main");
        this.main_text_obj;
        this.main_text_col = "#ff0000";
        this.secondary_text_obj;
        this.flying_texts_obj = [];

        this.TIMER_OBJ = {
            delay: 100,
            callback: this.change_color_callback,
            loop: true,
            args: this
        }

        this.default_body = {
            label: 'Body',
            shape: {
                type: 'rectangle'
                // radius: 25
                // maxSides: 25
            },
            chamfer: null,

            isStatic: false,
            isSensor: false,
            isSleeping: false,
            ignoreGravity: false,
            ignorePointer: false,

            sleepThreshold: 60,
            density: 0.001,
            restitution: 1,
            friction: 0,
            frictionStatic: 0,
            frictionAir: 0,
        
            inertia: Infinity,
        
            force: { x: 0, y: 0 },
            angle: 0,
            torque: 0,
        
            collisionFilter: {
                group: 0,
                category: 0x0001,
                mask: 0xFFFFFFFF,
            },
        
            // parts: [],
        
            // plugin: {
            //     attractors: [
            //         (function(bodyA, bodyB) { return {x, y}}),
            //     ]
            // },
        
            slop: 0.05,
        
            timeScale: 1
        }
    }

    preload() {
        this.load.audio('showtime', 'assets/showtime.ogg');
    }

    create() {
        // Change title
        document.title = PAGE_TITLE

        // Play music
        this.sound.pauseOnBlur = false;
        let audio = this.sound.add('showtime');
        audio.setLoop(true)
        audio.play();  //ENABLEEE

        // Fix sudden stop of bouncing
        Phaser.Physics.Matter.Matter.Resolver._restingThresh = RESTING; // default is 4

        //Make stacking more stable
        this.matter.world.engine.positionIterations = POSITION_ITER;  // default is 6

        // Set world bounds
        this.matter.world.setBounds(0, 0, WIDTH, HEIGHT, 1500);

        //Add buttons
        this.create_button(80*SCALE_RATIO, 65*SCALE_RATIO, 130*SCALE_RATIO, 80*SCALE_RATIO, BUTTON_TXT_1, function(){
            this.add_bouncy_text(NEW_FLYING_TEXT, 200)
        }, SCALE_RATIO*33)

        this.create_button(230*SCALE_RATIO, 65*SCALE_RATIO, 130*SCALE_RATIO, 80*SCALE_RATIO, BUTTON_TXT_2, function(){
            this.nudge_random(100)
        }, SCALE_RATIO*33)

        for (let text of FLYING_TEXTS) {
            this.add_bouncy_text(text)
        }

        this.main_text_obj = this.add.text(WIDTH/2, HEIGHT/2 - 40*SCALE_RATIO, MAIN_TEXT, FONT)
        .setOrigin(0.5)
        .setFontSize(80 * SCALE_RATIO)
        .setBackgroundColor("#000000")

        // Add timer
        this.time.addEvent(this.TIMER_OBJ);

        this.secondary_text_obj = this.add.text(WIDTH/2, HEIGHT/2 + 40*SCALE_RATIO, SECONDARY_TEXT, FONT)
        .setOrigin(0.5, 0)
        .setFontSize(60 * SCALE_RATIO)
        .setWordWrapWidth(WIDTH - 80*SCALE_RATIO)
        .setAlign("center")

    }

    update() {
        this.updateMainCol()
        this.main_text_obj.setColor(this.main_text_col)

        this.secondary_text_obj.setToTop()
        this.main_text_obj.setToTop()
    }

    add_bouncy_text(text, max_velocity=100) {
        let text_obj = this.add.text(randint(15*SCALE_RATIO, WIDTH - 15*SCALE_RATIO), randint(15*SCALE_RATIO, HEIGHT - 15*SCALE_RATIO), text, FONT)
        text_obj.setColor(getRandomColor())
        .setWordWrapWidth(WIDTH/2)

        let physics_text = this.matter.add.gameObject(text_obj, this.default_body)
        .setMass(1)
        physics_text.setVelocity(randint(-max_velocity, max_velocity) / 10, randint(-max_velocity, max_velocity) / 10)
        this.flying_texts_obj.push(physics_text)
    }

    nudge_random(force) {
        let factor = Math.random()
        let object = this.flying_texts_obj[randint(0, this.flying_texts_obj.length - 1)]
        object.setVelocity(force * factor, force * (1 - factor))
    }

    change_color_callback() {
        this.args.change_secondary_color()
    }

    change_secondary_color() {
        this.secondary_text_obj.setColor(this.getRandomCoolColor())
    }

    getRandomCoolColor() {
        let rgb = {}
        while (rgb.r == rgb.g && rgb.g == rgb.b) {
            rgb.r = Math.random() < 0.5 ? 0 : 255
            rgb.g = Math.random() < 0.5 ? 0 : 255
            rgb.b = Math.random() < 0.5 ? 0 : 255
        }
        return rgbToHex(rgb.r, rgb.g, rgb.b)
    }

    updateMainCol() {
        let rgb = hexToRgb(this.main_text_col)
        const SPEED = 8
        if (rgb.r >= 255 && rgb.g < 255 && rgb.b <= 0) {
            rgb.g += SPEED
        } else if (rgb.r > 0 && rgb.g >= 255 && rgb.b <= 0) {
            rgb.r -= SPEED
        } else if (rgb.r <= 0 && rgb.g >= 255 && rgb.b < 255) {
            rgb.b += SPEED
        } else if (rgb.r <= 0 && rgb.g > 0 && rgb.b >= 255) {
            rgb.g -= SPEED
        } else if (rgb.r < 255 && rgb.g <= 0 && rgb.b >= 255) {
            rgb.r += SPEED
        } else if (rgb.r >= 255 && rgb.g <= 0 && rgb.b > 0) {
            rgb.b -= SPEED
        } else {
            console.log("what")
        }

        if (rgb.r < 0) {
            rgb.r = 0
        } else if (rgb.r > 255) {
            rgb.r = 255
        }
        if (rgb.g < 0) {
            rgb.g = 0
        } else if (rgb.g > 255) {
            rgb.g = 255
        }
        if (rgb.b < 0) {
            rgb.b = 0
        } else if (rgb.b > 255) {
            rgb.b = 255
        }

        this.main_text_col = rgbToHex(rgb.r, rgb.g, rgb.b)

    }
}

let config = {
    type: Phaser.AUTO,
    parent: "game",
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: BG_COLOR,
    scene: [Start, Main],
    physics: {
        default: 'matter',
        matter: {
            enableSleeping: false,
            gravity: {y:0},
            debug: false,
        }
    },
    dom: {
        createContainer: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        width: WIDTH,
        height: HEIGHT,
    }
};

// Phaser stuff
let game = new Phaser.Game(config);