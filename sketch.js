var socket;

var viewport;
var gmap; // game map

var p;
var eArr = []; // enemys
var bArr = []; // bullets
var iArr = []; // items
var rArr = []; // rocks
var pArr = []; // portals
var redArr = []; // redzones
var epArr = []; // explore points
var quadPlayers;
var quadItems;
var quadBulls;
var boundMap;

var fr; // frameRate
var mil; // milliseconds from begin of game
var gameTime = 0;
var maxItem = 500;
var weaponInfo;
var maxSizeNow = 100;

function setup() {
	createCanvas(windowWidth, windowHeight).position(0, 0);
	rectMode(CENTER);
	textAlign(LEFT);
	textFont('Consolas');

	// khoi tao socket.io (multiplayers)
	// socket = io.connect("http://localhost:3000");

	// khoi tao moi truong ban do
	gmap = new GameMap(7000, 7000);
	setInterval(function(){gmap.createMinimap();}, 10000);

	// khoi tao nhan vat
	p = new Character('HoangTran', random(gmap.size.x), random(gmap.size.y));

	// khung nhin
	viewport = new Viewport(p);

	// // them player may
	for (var i = 0; i < 15; i++)
		eArr.push(new Character('enemy' + (i + 1), random(gmap.size.x), random(gmap.size.y)));

	// them rocks
	for (var i = 0; i < 40; i++)
		rArr.push(new Rock(random(gmap.size.x), random(gmap.size.y), random(50, 200)));

	// dung cho quadtree
	boundMap = new Rectangle(gmap.size.x / 2, gmap.size.y / 2, gmap.size.x, gmap.size.y);
	quadItems = new QuadTree(boundMap, 5);
	quadBulls = new QuadTree(boundMap, 5);
	quadPlayers = new QuadTree(boundMap, 1);

	gmap.createMinimap();
	weaponInfo = new InfoWeapon();

	autoAddPlayers(5);
	autoAddItems(5);
	autoAddRedzones(30);
	getMaxSizeNow(2);
	autoAddPortals(2, 15, 14);
}

function draw() {
	background(30);
	fr = frameRate();
	mil = millis();

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

	// items
	for (var i of iArr)
		i.run();

	// bullets
	for (var i = bArr.length - 1 ; i >= 0; i--)
		bArr[i].run();

	// rocks
	for (var r of rArr)
		r.run();

	// portals
	for (var i = pArr.length - 1; i >= 0; i--){
		if(!pArr[i].inGate.run() && pArr[i].outGate)
			pArr[i].outGate.run();
	}

	// characters
	p.move();
	p.run();
	for (var ei of eArr) {
		ei.run();
		ei.autoMove();
		ei.autoFire();
	}

	// fire
	if (mouseIsPressed) p.fire(fakeToReal(mouseX, mouseY));
	if(keyIsDown(32)) viewport.pos = viewport.target.pos.copy();

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

function keyPressed() {
	if (keyCode == 86) { // V
		viewport.follow = !viewport.follow;
	
	} else if(keyCode == 77){ // M
		gmap.hiddenMinimap = !gmap.hiddenMinimap;
	
	} else if(keyCode == 70) { // F
		p.shield = !p.shield;

	}
}

function mousePressed() {
	// var m = fakeToReal(mouseX, mouseY);
	// e.push(new Character('e'+e.length, m.x, m.y));
}

function mouseWheel(event) {
	if(!p.shield) p.changeWeapon(event.delta>0?1:-1);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight, true);
	// gmap.createMinimap();
	gmap.offSetX = width - gmap.minimapSize -10;
	weaponInfo = new InfoWeapon();
}