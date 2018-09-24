function Gun(owner, type) {
	this.info = type;
	this.o = owner;
	this.preShoot = 0;
}

Gun.prototype.fire = function(target) {
	if ((mil - this.preShoot) / 1000 >= this.info.delay) {
		var m = fakeToReal(target.x, target.y);
		var h = 100 - this.info.hitRatio * 100;
		var dir, vel, bpos;
		for (var i = 0; i < this.info.bullsPerTimes; i++) {
			dir = v(m.x - this.o.pos.x, m.y - this.o.pos.y).add(random(-h, h), random(-h, h))
					.setMag(this.o.weapon.bullet.speed);
			vel = dir.copy().add((this.info.bullsPerTimes > 1) ? random(-2, 2) : 0);
			bpos = this.o.pos.copy().add(dir.copy().setMag(this.o.radius + this.o.weapon.bullet.radius));

			bArr.push(new Bullet(bpos, vel, this.o.weapon.bullet, this.o));
		}
		this.preShoot = mil;
	}
};

var gunTypes = {
	AK: {
		maxBulls: 30,
		delay: 0.3, // seconds
		reload: 1,
		bullsPerTimes: 1,
		hitRatio: 0.9
	},
	Bazoka: {
		maxBulls: 2,
		delay: 1,
		reload: 2,
		bullsPerTimes: 1,
		hitRatio: 1
	},
	Shotgun: {
		maxBulls: 5,
		delay: 0.7,
		reload: 1.25,
		bullsPerTimes: 3,
		hitRatio: 0.7
	}
}