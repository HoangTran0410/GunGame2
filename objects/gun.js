function Gun(owner, type) {
	this.info = type;
	this.o = owner;
	this.preShoot = 0;

	this.bullsLeft = this.info.maxBulls;
}

Gun.prototype.fire = function(target) {
	if(this.bullsLeft > 0){
		if (!this.reloading && (mil - this.preShoot) >= this.info.delay * 1000) {
			var h = 100 - this.info.hitRatio * 100;
			var dir, vel, bpos;
			for (var i = 0; i < this.info.bullsPerTimes; i++) {
				dir = v(target.x - this.o.pos.x, target.y - this.o.pos.y).add(random(-h, h), random(-h, h))
						.setMag(this.o.weapon.bullet.speed);
				vel = dir.copy().add((this.info.bullsPerTimes > 1) ? random(-2, 2) : 0);
				bpos = this.o.pos.copy().add(dir.copy().setMag(this.o.radius + this.o.weapon.bullet.radius));

				bArr.push(new Bullet(bpos, vel, this.o.weapon.bullet, this.o));
			}
			this.preShoot = mil;
			this.bullsLeft--;
		}
	
	} else {
		this.reload();
	}
};

Gun.prototype.reload = function() {
	this.preShoot = mil + (this.info.reloadTime * 1000) * ((this.info.maxBulls - this.bullsLeft) / this.info.maxBulls);
	this.bullsLeft = this.info.maxBulls;
	this.reloading = true;
}

Gun.prototype.update = function() {
	if (this.reloading && mil > this.preShoot) {
		this.reloading = false;

		this.preShoot = mil - (this.info.delay * 1000); // reset pre time
	}
};

var gunTypes = {
	Minigun: {
		maxBulls: 100,
		delay: 0.1, // seconds
		reloadTime: 2,
		bullsPerTimes: 2,
		hitRatio: 0.6
	},
	AK: {
		maxBulls: 30,
		delay: 0.15, // seconds
		reloadTime: 1,
		bullsPerTimes: 1,
		hitRatio: 0.9
	},
	Bazoka: {
		maxBulls: 2,
		delay: 1,
		reloadTime: 2,
		bullsPerTimes: 1,
		hitRatio: 1
	},
	Shotgun: {
		maxBulls: 5,
		delay: 0.7,
		reloadTime: 1.25,
		bullsPerTimes: 5,
		hitRatio: 0.7
	}
}