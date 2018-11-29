// var socket;

var myAudio;
var songNow;
var ampData;
var ampLevel;
var dataSound = {};

var viewport;
var gmap; // game map

var p;
var eArr = []; // enemys
var bArr = []; // bullets
var iArr = []; // items
var rArr = []; // rocks
var tArr = []; // trees
var pArr = []; // portals
var redArr = []; // redzones
var epArr = []; // explore points
var sArr = []; // smokes
var wArr = []; //waters
var iceArr = []; // ices
var notifi = []; // notification

var pname;
var team = 1;
var maxE = 15;
var world;

var quadPlayers;
var quadItems;
var quadBulls;
var boundMap;

var fr; // frameRate
var mil = 0; // milliseconds from begin of game
var _gameTime = 0; // time from begin of game to now
var gameTime = ""; // string time
var maxSizeNow = 100;
var weaponInfo;
var runGame = false;
var listMes = ['chào', 'hello', 'funny', 'best game', 'haha', 'my gun', 'awsome', 'nice', 'come on', 'beauty', 'sexy', 'cute',
'like', 'love', 'hit', 'giết tao nè', 'thích gì', 'biến', 'lêu lêu', 'good dog', 'huhu', 'đừng giết tao', 'vãi'];

function preload() {
    dataSound['audio/ambient_stream_01.mp3'] = loadSound('audio/ambient_stream_01.mp3');
}

function setup() {
    createCanvas(windowWidth, windowHeight).position(0, 0);
    noSmooth();
    rectMode(CENTER);
    textAlign(LEFT);
    textFont('Consolas');
    cursor(CROSS);

    ampData = new p5.Amplitude();
    songNow = floor(random(musics.SongList.length));

    setInterval(function() {
        if (runGame) {
            _gameTime++;
            gameTime = prettyTime(_gameTime);
        }
    }, 1000);

    setInterval(function() {
        if (runGame && gmap) {
            gmap.createMinimap();
        }
    }, 10000);

    // auto chat
    autoChat(random(listMes), null, true);

    // autoAddPlayers(5);
    autoAddItems(5);
    autoAddRedzones(30);
    getMaxSizeNow(2);
    autoAddPortals(3, 15, 14);
}

function start() {
    // khoi tao moi truong ban do
    gmap = new GameMap(10000, 10000, 300);
    var w = document.getElementById('worlds-select').value;
    world = worlds[w || getValueAtIndex(worlds, floor(random(getObjectLength(worlds))))];

    // time
    _gameTime = 0;

    // get player name
    pname = document.getElementById('ip-name').value || RandomName[floor(random(RandomName.length))];

    reset();
    weaponInfo = new InfoWeapon();

    // dung cho quadtree
    boundMap = new Rectangle(gmap.size.x / 2, gmap.size.y / 2, gmap.size.x, gmap.size.y);
    quadItems = new QuadTree(boundMap, 5);
    quadBulls = new QuadTree(boundMap, 5);
    quadPlayers = new QuadTree(boundMap, 1);

    help(10);

    runGame = true;
    document.getElementById('chatBox').style.display = "block";

    if(!myAudio) changeSong(1);
    // addSound('audio/ambient_stream_01.mp3', true);
    addAlertBox('Please read the Rules in chat box.', '#f55', '#fff');
}

function draw() {
    if (runGame) {

        background(world.bg);

        //star effects
        if(world.bg[3])
        for (var i = 0; i < 2; i++) {
            stroke(random(200, 255), 100);
            strokeWeight(random(7, 20));
            point(random(width), random(height));
        }

        // get value
        fr = frameRate();
        mil = millis();
        ampLevel = ampData.getLevel();

        viewport.run();

        push();
        translate(-viewport.pos.x + width / 2, -viewport.pos.y + height / 2);

        // fill(world.bg);
        // noStroke();
        // rect(gmap.size.x / 2, gmap.size.y / 2, gmap.safezone.x, gmap.safezone.y);
        // gmap.safezone.x--; 
        // gmap.safezone.y--;

        gmap.run();

        // update quadtrees
        quadItems.clear();
        for (var i of iArr) quadItems.insert(i);

        quadBulls.clear();
        for (var b of bArr) quadBulls.insert(b);

        quadPlayers.clear();
        if (p) quadPlayers.insert(p);
        for (var ei of eArr) quadPlayers.insert(ei);

        // ices
        for(var i of iceArr)
            i.run();

        // waters
        for (var w of wArr)
            w.run();

        // bullets
        for (var i = bArr.length - 1; i >= 0; i--)
            bArr[i].run();

        // // rocks
        for (var i = rArr.length - 1; i >= 0; i--)
            rArr[i].run();

        // // items
        for (var i = iArr.length - 1; i >= 0; i--)
            iArr[i].run();

        // characters
        if (p) {
            p.move();
            p.run();
        }
        for (var ei of eArr) {
            if (!ei) console.log(ei);

            else {
                ei.fire();
                ei.move();
                ei.run();
            }
        }

        // reset hide value
        if (p) p.hide = false;
        for (var ei of eArr) ei.hide = false;

        // fire
        if (p && mouseIsPressed && mouseButton == 'left') p.fireTo(fakeToReal(mouseX, mouseY));
        if (keyIsDown(32)) viewport.pos = viewport.target.pos.copy();

        // portals
        for (var i = pArr.length - 1; i >= 0; i--) {
            if (!pArr[i].inGate.run() && pArr[i].outGate)
                pArr[i].outGate.run();
        }

        // trees
        for (var i = tArr.length - 1; i >= 0; i--)
            tArr[i].run();

        // smokes
        for (var i = sArr.length - 1; i >= 0; i--)
            sArr[i].show();

        // red zone
        for (var i = redArr.length - 1; i >= 0; i--)
            redArr[i].show();

        // explore points
        for (var i = epArr.length - 1; i >= 0; i--) {
            epArr[i].show();
            epArr[i].checkExplore(epArr);
        }

        // waters
        for (var w of wArr)
            w.show();

        pop();

        // notifications
        for (var n of notifi) {
            n.run();
        }

        gmap.showMinimap();
        weaponInfo.show();

        // fps
        textSize(20);
        textAlign(LEFT);
        noStroke();
        fill(255, 150);
        text('Fps: ' + floor(frameRate()), 5, 20);
        text('Time: ' + gameTime, 5, 45);
        text('Players: ' + ((p ? 1 : 0) + eArr.length), 5, 70);
        text('Killed: ' + viewport.target.killed, 5, 95);

        textAlign(CENTER);
        text(floor(viewport.pos.x) + " " + floor(viewport.pos.y), width / 2, height - 25);
    }
}

function keyPressed() {
    if(keyCode == 27) { // ESC
        var n = document.getElementById("menuWhenDie").style.display;
        if(n == "block") {
            runGame = true;
            menuWhenDie("close");
        } else {
            if(p) runGame = false;
            menuWhenDie("open");
        }
    }

    if (runGame && !isTyping()) {
        if (keyCode == 86) { // V
            viewport.follow = !viewport.follow;

        } else if (keyCode == 77) { // M
            gmap.hiddenMinimap = !gmap.hiddenMinimap;

        } else if (keyCode == 69) { // E
            if (p) p.shield = !p.shield;

        } else if (keyCode == 70) { // F
            if (p) p.pickWeapon();

        } else if (keyCode == 66) { // B
            if (p) collisionEdge(p, 0.6);

        } else if (keyCode >= 49 && keyCode <= 57) { // number
            if (p && keyCode - 49 < p.weaponBox.length) {
                var weaponNow = p.weaponBox.indexOf(p.weapon);
                p.changeWeapon(keyCode - 49 - weaponNow);
            }

        } else if (keyCode == 82) { // R
            if (p) p.weapon.gun.reload();

        } else if (keyCode == 67) { // C
            var value = document.getElementById('showHideChat').value;
            if (value == 'Show') showChat(true);
            else showChat(false);

        } else if (keyCode == 78) { // N
            changeSong(1);

        } else if (keyCode == 72) { // H
            // help(5);

        } else if (keyCode == 13) {
            showChat(true);
            document.getElementById('inputMes').focus();
        }

    } else if (keyCode == 13) {
        var ele = document.getElementById('inputMes');
        switch (ele.value) {
            case '':
                break;

            case '/help':
                addMessage('/howtoplay, /showplayers, /clear, /more, /contact', 'Server');
                break;

            case '/howtoplay':
                help();
                break;

            case '/showplayers':
                var names = "";
                for (var e of eArr) {
                    names += (e.name + ", ");
                }
                addMessage(names, 'Server', false, color(0));
                break;

            case '/clear':
                clearChat();
                break;

            case '/more':
                addMessage('click here \u2665', 'Visualize music', false, color(255, 0, 0),
                    function() {
                        window.open('https://github.com/HoangTran0410/Visualyze-design-your-own-')
                    });
                addMessage('click here \u2665', 'Giphy Api', false, color(255, 100, 0),
                    function() {
                        window.open('https://hoangtran0410.github.io/giphyApi/')
                    });
                addMessage('click here \u2665', 'Sort Simulate', false, color(255, 255, 0),
                    function() {
                        window.open('https://hoangtran0410.github.io/Sort-Simulate/')
                    });
                addMessage('click here \u2665', 'Write Point', false, color(0, 255, 0),
                    function() {
                        window.open('https://hoangtran0410.github.io/Write-Points/')
                    });
                addMessage('click here \u2665', 'Maze Pacman', false, color(0, 0, 255),
                    function() {
                        window.open('https://hoangtran0410.github.io/Maze-generate/')
                    });
                addMessage('click here \u2665', 'Simple Paint', false, color(70, 60, 90),
                    function() {
                        window.open('https://hoangtran0410.github.io/Paint-P5/')
                    });
                addMessage('click here \u2665', 'Box2D Testing', false, color(255, 0, 255),
                    function() {
                        window.open('https://hoangtran0410.github.io/box2D-2/')
                    });
                addMessage('click here \u2665', 'Lsystem Simulate', false, color(255, 0, 0),
                    function() {
                        window.open('https://hoangtran0410.github.io/L-system-dat.gui/')
                    });
                addMessage('click here \u2665', 'Simple Firework', false, color(255, 100, 0),
                    function() {
                        window.open('https://hoangtran0410.github.io/Fire-work/')
                    });
                break;

            case '/contact':
                addMessage('click here \u2665', 'My Github', false, color(100),
                    function() {
                        window.open('https://github.com/HoangTran0410')
                    });
                addMessage('click here \u2665', 'My Facebook', false, color(0, 0, 255),
                    function() {
                        window.open('https://www.facebook.com/people/Hoang-Tran/100004848287494')
                    });
                break;

            default:
                var pcol = hexToRgb(document.getElementById('pickColor').value);
                addMessage(event.target.value, pname, true, color(pcol.r, pcol.g, pcol.b));
                for(var i = 0; i < random(3); i++)
                    autoChat(event.target.value);
                break;
        }

        ele.blur();
        ele.value = '';
    }
}

function mousePressed(e) {
    if (!p && eArr.length) {
        if (e.target.matches('canvas')) {
            var newTarget = eArr[(eArr.indexOf(viewport.target) + 1) % eArr.length]
            viewport.target = newTarget;
        }
    }
}

function mouseWheel(e) {
    if (runGame && p) {
        if ((e.target.matches('canvas')) || document.getElementById('showHideChat').value == 'Show') {
            if (!p.shield) {
                p.changeWeapon(e.delta > 0 ? 1 : -1);
            }
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight, true);
    if (runGame) {
        gmap.offSetX = width - gmap.minimapSize - 10;
        weaponInfo = new InfoWeapon();
    }
}