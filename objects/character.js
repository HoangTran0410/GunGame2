function Character(name, x, y, col) {
	this.radius = 30;
	this.name = name;
	this.pos = v(x, y);
	this.vel = v(0, 0);
	this.col = col || [random(255), random(255), random(255)];

	this.health = 100;
	this.score = 20;
	this.maxSpeed = 4;

	this.weapon = clone(weapons[getValueAtIndex(weapons, floor(random(getObjectLength(weapons))))]);
	this.weapon.gun = new Gun(this, this.weapon.gun);
}

Character.prototype.run = function() {
	this.weapon.gun.update();
	this.update();
	this.eat();
	collisionEdge(this, 0.6);
	if (insideViewport(this)) this.show(this==p?fakeToReal(mouseX, mouseY):this.target);
	collisionBullets(this);
};

Character.prototype.updateSize = function() {
	var s = 30 / 100 * this.health;
	if (s > 20) this.radius = s;
};

Character.prototype.eat = function() {
	var range = new Circle(this.pos.x, this.pos.y, this.radius + 100);
	var itemsInRange = quadItems.query(range);

	for (var i of itemsInRange)
		i.eatBy(this);
};

Character.prototype.move = function() {
	if (keyIsDown(65)) this.vel.add(-1, 0);
	if (keyIsDown(68)) this.vel.add(1, 0);
	if (keyIsDown(87)) this.vel.add(0, -1);
	if (keyIsDown(83)) this.vel.add(0, 1);
};

Character.prototype.autoMove = function() {
	var t = this;
	if (!t.nextPoint || p5.Vector.dist(t.pos, t.nextPoint) < t.radius) {
		var range = new Circle(t.pos.x, t.pos.y, t.radius + width / 2, t.radius + width / 2);
		var items = quadItems.query(range, false, true);

		if (items.length > 0) {
			t.nextPoint = items[0].pos;

		} else {
			var newx = t.pos.x + random(-500, 500);
			var newy = t.pos.y + random(-500, 500);

			// collide edge
			if (newx < t.radius) newx = t.radius;
			else if (newx > gmap.size.x - t.radius) newx = gmap.size.x- t.radius;

			if (newy < t.radius) newy = t.radius;
			else if (newy > gmap.size.y - t.radius) newy = gmap.size.y - t.radius;

			// set nextPoint
			t.nextPoint = v(newx, newy);
		}

	} else {
		if (t.vel.mag() < t.maxSpeed / 1.5)
			t.vel.add((t.nextPoint.x - t.pos.x) / 4, (t.nextPoint.y - t.pos.y) / 4).limit(t.maxSpeed);
	}
};

Character.prototype.autoFire = function() {
	var maxSizeNow = 50; // bien dung tam, se cap nhat sau
	this.target = null;
	
	var r = min(this.radius + width / 2, this.radius + height / 2);
	// var r = this.radius + 200;
	var range = new Circle(this.pos.x, this.pos.y, r + maxSizeNow, r + maxSizeNow);
	var players = quadPlayers.query(range);

	var target;
	var minHealth;
	for (var pl of players) {
		if (pl != this && p5.Vector.dist(this.pos, pl.pos) < r + pl.radius) {
			if(!minHealth) minHealth = pl.health;
			if(!target) target = pl;

			if(pl.health < minHealth) {
				target = pl;
				minHealth = pl.health;
			}
		}
	}

	// fill(255, 0, 0, 15);
	// ellipse(this.fakepos.x, this.fakepos.y, (r + maxSizeNow) * 2, (r + maxSizeNow) * 2);
	if(target){
		this.fire(target.pos);
		this.target = target.pos;
	}
};

Character.prototype.fire = function(target) {
	this.weapon.gun.fire(target);
};

Character.prototype.changeWeapon = function(nextOrPre) {
	var weaponNow = getObjectIndex(weapons, this.weapon.name);
	var nextGun = weaponNow + nextOrPre;

	if (nextGun < 0) nextGun = getObjectLength(weapons) - 1;
	else nextGun = nextGun % getObjectLength(weapons);

	this.weapon = clone(weapons[getValueAtIndex(weapons, nextGun)]);
	this.weapon.gun = new Gun(this, this.weapon.gun);
};

Character.prototype.die = function() {
	if(this === p){

	} else {
		for (var i = 0; i < random(this.score / 2, this.score); i++) {
			var len = v(random(-1, 1), random(-1, 1)).setMag(random(this.score));
			var pos = p5.Vector.add(this.pos, len);
			iArr.push(new Item(pos.x, pos.y, null, this.col));
		}
		eArr.splice(eArr.indexOf(this), 1);
	}
};

Character.prototype.update = function() {
	this.fakepos = realToFake(this.pos.x, this.pos.y);
	this.pos.add(this.vel.copy().mult(60 / (fr + 1)));
	this.vel.mult(0.95);
	this.vel.limit(this.maxSpeed);
};

Character.prototype.show = function(lookDir) {
	noStroke();
	fill(this.col[0], this.col[1], this.col[2]);
	
	if(lookDir){
		drawPlayerWithShape(this, 'Pentagon', p5.Vector.sub(lookDir, this.pos).heading());
	
	} else {
		drawPlayerWithShape(this, 'Pentagon', this.vel.heading()); // nhìn theo hướng di chuyển
	}

	fill(255);
	textAlign(CENTER);
	text(floor(this.health), this.fakepos.x, this.fakepos.y - this.radius - 10);
};

// ========== Shape Database =============
function drawPlayerWithShape(t, shape, angle) {
	switch (shape) {
		case 'Circle':
			push();
			translate(t.fakepos.x, t.fakepos.y);
			rotate(angle);

			fill(t.col);
			ellipse(0, 0, t.radius * 2, t.radius * 2);
			fill(0);
			ellipse(t.radius / 2, 0, t.radius, t.radius / 1.5 * 2);

			pop();
			break;

		case 'Pentagon':
			push();
			translate(t.fakepos.x, t.fakepos.y);

			var heading = t.vel.heading();

			// body
			rotate(heading);
			// stroke(255, 180);
			fill(t.col);
			polygon(0, 0, t.radius, 5);

			// head
			stroke(30);
			strokeWeight(t.radius / 2);
			point(t.radius / 3 * 2, 0);

			// gun			
			fill(0, 200);
			stroke(150);
			strokeWeight(2);

			rotate(angle - heading);
			rect(t.radius / 2, 0, t.radius / 1.5 * 2, t.radius * 0.4);

			fill(0);
			ellipse(0, 0, t.radius / 3 * 2, t.radius / 3 * 2);

			pop();
			break;
	}
}