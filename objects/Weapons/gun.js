function Gun(owner, type) {
    this.info = type;
    this.o = owner;
    this.preShoot = 0;

    this.bullsLeft = this.info.maxBulls;
}

Gun.prototype.fire = function(target) {
    if (this.bullsLeft > 0) {
        if (!this.reloading && (mil - this.preShoot) >= this.info.delay * 1000) {
            var h = 100 - this.info.hitRatio * 100;
            var dir, vel, bpos;
            for (var i = 0; i < this.info.bullsPerTimes; i++) {
                dir = v(target.x - this.o.pos.x, target.y - this.o.pos.y).add(random(-h, h), random(-h, h));
                vel = dir.copy().setMag(this.o.weapon.bulletInfo.speed + ((this.o.weapon.gunInfo.bullsPerTimes > 1) ? random(-2, 2) : 0))
                bpos = this.o.pos.copy().add(dir.copy().setMag(this.o.radius + this.o.weapon.bulletInfo.radius + 5));

                bArr.push(new Bullet(bpos, vel, this.o.weapon.bulletInfo, this.o));
            }
            this.preShoot = mil;
            this.bullsLeft--;
        }

    } else {
        this.reload();
        if(this.o == viewport.target) addSound('audio/empty_fire_01.mp3', false, 0.7);
    }
};

Gun.prototype.reload = function() {
    this.preShoot = mil + (this.info.reloadTime * 1000);
    this.bullsLeft = this.info.maxBulls;
    this.reloading = true;
}

Gun.prototype.update = function() {
    if (this.reloading && mil > this.preShoot) {
        this.reloading = false;

        this.preShoot = mil - (this.info.delay * 1000); // reset pre time
    }
};