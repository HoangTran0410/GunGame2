function Bullet(pos, dir, type, owner) {
	this.info = type;
	this.pos = pos.copy(); // pos is a vector
	this.vel = dir;
	this.o = owner;
	this.born = mil;

	this.col = this.info.color || [random(255), random(255), random(255)];
	if(this.info.whenfire) this.info.whenfire(this);
}

Bullet.prototype.run = function() {
	this.update();
	if(this.info.working) this.info.working(this);
	if (insideViewport(this)) this.show();
	if ((mil - this.born) / 1000 > this.info.life) {
		this.end();
	}
};

Bullet.prototype.end = function() {
	if (this.info.finished) this.info.finished(this);
	bArr.splice(bArr.indexOf(this), 1);
};

Bullet.prototype.update = function() {
	this.fakepos = realToFake(this.pos.x, this.pos.y);
	this.show();
	this.pos.add(this.vel.copy().mult(60 / (fr + 1)));
	collisionEdge(this, 0.99);
};

Bullet.prototype.show = function(alpha) {
	noStroke();
	fill(this.col[0], this.col[1], this.col[2], alpha || 100);
	ellipse(this.fakepos.x, this.fakepos.y, this.info.radius * 2, this.info.radius * 2);
};

// =========== bullet types database ==============
var bulletTypes = {
	Mine : {
		name: "Mini",
		damage: 5,
		radius: 10,
		speed: 0.1,
		life: 120, // seconds
		color: null,
		finished: function(bull) {
			effects.explore(bull.pos, 30, [255, 0, 0], bull.o);
			effects.force('out', ['player', 'item'], bull.pos, 400, 20);
		}
	},
	Minigun:{
		name: "Mini",
		damage: 1,
		radius: 3,
		speed: 22,
		life: 1, // seconds
		color: [255, 255, 0]
	},
	AK: {
		name: "AK",
		damage: 3,
		radius: 4,
		speed: 20,
		life: 1.5, // seconds
		color: [255, 255, 0]
	},
	Bazoka: {
		name: "Bazoka",
		damage: 1,
		radius: 15,
		speed: 14,
		life: 15, // seconds
		color: [200, 10, 10],
		finished: function(bull) {
			effects.explore(bull.pos, 15, [255, 255, 0], bull.o);
			effects.force('out', ['player', 'item'], bull.pos, 400, 20);
		}
	},
	Shotgun: {
		name: "Shotgun",
		damage: 7,
		radius: 5,
		speed: 20,
		life: 1.5, // seconds
		color: [200, 255, 10]
	},
	PortalIn: {
		name: "PortalIn",
		damage: 3,
		radius: 10,
		speed: 12,
		life: 1.5, // seconds
		color: [64, 121, 196],
		working: function(bull) {
			effects.force('in', ['player', 'item', 'bullet'], bull.pos, 100, null, bull);
		},
		whenfire: function(bull){
			bull.o.weapon.bullet = bulletTypes.PortalOut;
		},
		finished: function(bull){
			pArr.push(new Portal('in', bull.pos.x, bull.pos.y, null, null, 10));
		}
	},
	PortalOut: {
		name: "PortalOut",
		damage: 3,
		radius: 10,
		speed: 12,
		life: 3, // seconds
		color: [232, 165, 71],
		whenfire: function(bull){
			bull.o.weapon.bullet = bulletTypes.PortalIn;
		},
		finished: function(bull){	
			var newPotal = new Portal('out', bull.pos.x, bull.pos.y, null, null, 10)
			if(pArr.length > 0 && pArr[pArr.length - 1].type == 'in')
				pArr[pArr.length - 1].connectWith = newPotal;
			pArr.push(newPotal);
		}
	}
}