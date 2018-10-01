// var socket;

var myAudio;
var songNow;
var ampData;
var ampLevel;

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
var notifi = []; // notification

var quadPlayers;
var quadItems;
var quadBulls;
var boundMap;

var fr; // frameRate
var mil = 0; // milliseconds from begin of game
var gameTime = 0; // time from begin of game to now
var maxItem = 500;
var maxSizeNow = 100;
var weaponInfo;

function setup() {
    createCanvas(windowWidth, windowHeight).position(0, 0);
    rectMode(CENTER);
    textAlign(LEFT);
    textFont('Consolas');

    ampData = new p5.Amplitude();
    songNow = floor(random(musics.SongList.length));

    reset();

    gmap.createMinimap();
    weaponInfo = new InfoWeapon();
    setInterval(function() {
        gmap.createMinimap();
    }, 10000);

    // dung cho quadtree
    boundMap = new Rectangle(gmap.size.x / 2, gmap.size.y / 2, gmap.size.x, gmap.size.y);
    quadItems = new QuadTree(boundMap, 5);
    quadBulls = new QuadTree(boundMap, 5);
    quadPlayers = new QuadTree(boundMap, 1);

    autoAddPlayers(5);
    autoAddItems(5);
    autoAddRedzones(30);
    getMaxSizeNow(2);
    autoAddPortals(2, 15, 14);

    help(10);
}

function reset() {
    // khoi tao socket.io (multiplayers)
    // socket = io.connect("http://localhost:3000");

	eArr = []; // enemys
	bArr = []; // bullets
	iArr = []; // items
	rArr = []; // rocks
	tArr = []; // trees
	pArr = []; // portals
	redArr = []; // redzones
	epArr = []; // explore points
	notifi = []; // notification

    // khoi tao moi truong ban do
    gmap = new GameMap(7000, 7000, 300);

    // khoi tao nhan vat
    p = new Character('HoangTran', random(gmap.size.x), random(gmap.size.y));

    // khung nhin
    viewport = new Viewport(p);

    // // them player may
    for (var i = 0; i < 5; i++)
        eArr.push(new Character('enemy' + (i + 1), random(gmap.size.x), random(gmap.size.y)));

    // them rocks
    for (var i = 0; i < 50; i++)
        rArr.push(new Rock(random(gmap.size.x), random(gmap.size.y), random(50, 300)));

    // them trees
    for (var i = 0; i < 100; i++)
        tArr.push(new Tree(random(gmap.size.x), random(gmap.size.y), random(50, 150)));

    changeSong(1);
}

function draw() {
    if (focused) {

        background(20);
        fr = frameRate();
        mil = millis();
        ampLevel = ampData.getLevel();

        gmap.run();
        viewport.run();

        // update quadtrees
        quadItems.clear();
        for (var i of iArr) quadItems.insert(i);

        quadBulls.clear();
        for (var b of bArr) quadBulls.insert(b);

        quadPlayers.clear();
        quadPlayers.insert(p);
        for (var ei of eArr) quadPlayers.insert(ei);

        // // items
        for (var i = iArr.length - 1; i >= 0; i--)
            iArr[i].run();

        // bullets
        for (var i = bArr.length - 1; i >= 0; i--)
            bArr[i].run();

        // // rocks
        for (var i = rArr.length - 1; i >= 0; i--)
            rArr[i].run();

        // characters
        p.move();
        p.run();
        for (var ei of eArr) {
            ei.autoMove();
            ei.autoFire();
            ei.run();
        }

        // reset hide value
        p.hide = false;
        for (var ei of eArr) ei.hide = false;

        // fire
        if (mouseIsPressed) p.fire(fakeToReal(mouseX, mouseY));
        if (keyIsDown(32)) viewport.pos = viewport.target.pos.copy();

        // portals
        for (var i = pArr.length - 1; i >= 0; i--) {
            if (!pArr[i].inGate.run() && pArr[i].outGate)
                pArr[i].outGate.run();
        }

        // trees
        for (var i = tArr.length - 1; i >= 0; i--)
            tArr[i].run();

        gmap.showMinimap();
        weaponInfo.show();

        // red zone
        for (var i = redArr.length - 1; i >= 0; i--)
            redArr[i].show();

        // explore points
        for (var i = epArr.length - 1; i >= 0; i--) {
            epArr[i].show();
            epArr[i].checkExplore(epArr);
        }

        // notifications
        for (var n of notifi) {
            n.run();
        }

        // fps
        textSize(20);
        textAlign(LEFT);
        noStroke();
        fill(255, 150);
        text('Fps: ' + floor(frameRate()), 5, 20);
        text('Time: ' + gameTime, 5, 45);
        text('Players: ' + (1 + eArr.length), 5, 70);
        text('Killed: ' + viewport.target.killed, 5, 95);

        textAlign(CENTER);
        text(floor(viewport.pos.x) + " " + floor(viewport.pos.y), width / 2, height - 25);
    }
}

function keyPressed() {
    if (keyCode == 86) { // V
        viewport.follow = !viewport.follow;

    } else if (keyCode == 77) { // M
        gmap.hiddenMinimap = !gmap.hiddenMinimap;

    } else if (keyCode == 70) { // F
        p.shield = !p.shield;

    } else if (keyCode == 78) { // N
        changeSong(1);

    } else if (keyCode == 72) { // H
        help(5);
    }
}

function mousePressed() {
    // var m = fakeToReal(mouseX, mouseY);
    // e.push(new Character('e'+e.length, m.x, m.y));
}

function mouseWheel(event) {
    if (!p.shield) p.changeWeapon(event.delta > 0 ? 1 : -1);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight, true);
    // gmap.createMinimap();
    gmap.offSetX = width - gmap.minimapSize - 10;
    weaponInfo = new InfoWeapon();
}
