function Bullet(pos, dir, type, owner) {
	this.info = type;
	this.pos = pos.copy(); // pos is a vector
	this.vel = dir;
	this.o = owner;
	this.born = mil;

	if(this.info.whenfire) this.info.whenfire(this.o, this.pos);
}

Bullet.prototype.run = function() {
	this.update();
	if(this.info.working) this.info.working(this.o, this.pos);
	if (insideViewport(this)) this.show();
	if ((mil - this.born) / 1000 > this.info.life) {
		this.end();
	}
};

Bullet.prototype.end = function() {
	if (this.info.finished) this.info.finished(this.o, this.pos);
	bArr.splice(bArr.indexOf(this), 1);
};

Bullet.prototype.update = function() {
	this.fakepos = realToFake(this.pos.x, this.pos.y);
	this.pos.add(this.vel.copy().mult(60 / (fr + 1)));
	collisionEdge(this, 0.99);
};

Bullet.prototype.show = function() {
	var col = this.info.color;
	noStroke();
	fill(col[0], col[1], col[2]);
	ellipse(this.fakepos.x, this.fakepos.y, this.info.radius * 2, this.info.radius * 2);
};

// =========== bullet types database ==============
var bulletTypes = {
	AK: {
		name: "AK",
		damage: 1,
		radius: 5,
		speed: 15,
		life: 1.5, // seconds
		color: [255, 255, 0]
	},
	Bazoka: {
		name: "Bazoka",
		damage: 1,
		radius: 15,
		speed: 8,
		life: 15, // seconds
		color: [200, 10, 10],
		finished: function(owner, pos) {
			effects.explore(pos, 15, null, owner);
			effects.force('out', ['player', 'item'], pos, 400, 20);
		}
	},
	Shotgun: {
		name: "Shotgun",
		damage: 3,
		radius: 7,
		speed: 12,
		life: 1, // seconds
		color: [200, 255, 10]
	},
	PortalIn: {
		name: "PortalIn",
		damage: 3,
		radius: 10,
		speed: 12,
		life: 1, // seconds
		color: [64, 121, 196],
		whenfire: function(owner, pos){
			owner.weapon.bullet = bulletTypes.PortalOut;
		},
		finished: function(owner, pos){
			pArr.push(new Portal('in', pos.x, pos.y, null, null, 10));
		}
	},
	PortalOut: {
		name: "PortalOut",
		damage: 3,
		radius: 10,
		speed: 12,
		life: 2, // seconds
		color: [232, 165, 71],
		whenfire: function(owner, pos){
			owner.weapon.bullet = bulletTypes.PortalIn;
		},
		finished: function(owner, pos){	
			var newPotal = new Portal('out', pos.x, pos.y, null, null, 10)
			if(pArr.length > 0 && pArr[pArr.length - 1].type == 'in')
				pArr[pArr.length - 1].connectWith = newPotal;
			pArr.push(newPotal);
		}
	}
}