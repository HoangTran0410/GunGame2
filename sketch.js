var socket;

var viewport;
var gmap; // game map

var p;
var eArr = []; // enemys
var bArr = []; // bullets
var iArr = []; // items
var rArr = []; // rocks
var pArr = []; // portals
var quadPlayers;
var quadItems;
var quadBulls;
var boundMap;

var fr; // frameRate
var mil; // milliseconds from begin of game
var gameTime = 0;
var maxItem = 500;
var weaponInfo;

function setup() {
	createCanvas(windowWidth, windowHeight).position(0, 0);
	rectMode(CENTER);
	textAlign(LEFT);
	textFont('Consolas');

	// khoi tao socket.io (multiplayers)
	// socket = io.connect("http://localhost:3000");

	// khoi tao nhan vat
	p = new Character('Player', 100, 200);
	weaponInfo = new InfoWeapon();

	// khoi tao moi truong ban do
	viewport = new Viewport(p);
	gmap = new GameMap(10000, 10000);

	// them player may
	for (var i = 0; i < 30; i++)
		eArr.push(new Character('enemy' + (i + 1), random(gmap.size.x), random(gmap.size.y)));

	// them items
	for (var i = 0; i < 500; i++)
		iArr.push(new Item(random(gmap.size.x), random(gmap.size.y)));

	// them rocks
	for (var i = 0; i < 50; i++)
		rArr.push(new Rock(random(gmap.size.x), random(gmap.size.y), random(50, 200)));

	// tu dong them item
	setInterval(function() {
		if (iArr.length > maxItem * 1.5) {
			for (var i = 0; i < iArr.length - maxItem; i++)
				iArr.shift();
		} else if (iArr.length < maxItem / 2) {
			for (var i = iArr.length; i < maxItem / 2; i++)
				iArr.push(new Item(random(gmap.size.x), random(gmap.size.y)));
		}
		for (var i = 0; i < 5; i++)
			iArr.push(new Item(random(gmap.size.x), random(gmap.size.y)));
	}, 500);

	// auto make portal
	setInterval(function() {
		if (pArr.length < 1)
			for (var i = 0; i < 3; i++) {
				var portalOut = new Portal('out', random(gmap.size.x), random(gmap.size.y), null, null, 20);
				var portalIn = new Portal('in', random(gmap.size.x), random(gmap.size.y), portalOut, null, 20);
				pArr.push(portalOut, portalIn);
			}
	}, 1000);

	// get time
	setInterval(function() {
		gameTime = prettyTime(mil / 1000);
	}, 1000);

	// dung cho quadtree
	boundMap = new Rectangle(gmap.size.x / 2, gmap.size.y / 2, gmap.size.x, gmap.size.y);

	gmap.createMinimap();

	// p.weapon = clone(weapons.portalGun);
	// p.weapon.gun = new Gun(p, p.weapon.gun);
}

function draw() {
	background(30);
	fr = frameRate();
	mil = millis();

	gmap.run();
	viewport.run();

	// update quadtrees
	quadItems = new QuadTree(boundMap, 5);
	for (var i of iArr) quadItems.insert(i);

	quadBulls = new QuadTree(boundMap, 5);
	for (var b of bArr) quadBulls.insert(b);

	quadPlayers = new QuadTree(boundMap, 5);
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
	for (var pi of pArr)
		pi.run();

	// characters
	p.move();
	p.run();
	for (var ei of eArr) {
		ei.run();
		ei.autoMove();
		ei.autoFire();
	}

	// ban sung
	if (mouseIsPressed) p.fire(fakeToReal(mouseX, mouseY));

	// make gravity
	if (keyIsDown(32)) {
		var radius = 130;
		var realpos = fakeToReal(mouseX, mouseY);
		effects.force('out', ['bullet', 'player', 'item'], realpos, radius, 30, p);

		noStroke();
		fill(0, 50, 255, 50);
		ellipse(mouseX, mouseY, radius * 2, radius * 2);
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
	text('Players: ' + (1 + eArr.length), 5, 70);

	textAlign(CENTER);
	text(floor(viewport.pos.x) + " " + floor(viewport.pos.y), width / 2, height - 25);
}

function keyPressed() {
	if (keyCode == 86) { // V
		viewport.follow = !viewport.follow;
	}
}

function mousePressed() {
	// var m = fakeToReal(mouseX, mouseY);
	// e.push(new Character('e'+e.length, m.x, m.y));
}

function mouseWheel(event) {
	p.changeWeapon(event.delta>0?1:-1);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight, true);
	gmap.createMinimap();
}