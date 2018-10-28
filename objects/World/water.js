function Water(x, y, r) {
    this.pos = v(x, y);
    this.radius = r || random(50, 400);
    this.col = [21, 53, 117];

    this.preRipple = mil;
    this.delay = 800;

    this.ripple = [];
}

Water.prototype.run = function() {
    this.show();
};

Water.prototype.show = function() {
    noStroke();
    fill(this.col[0], this.col[1], this.col[2], 150);

    ellipse(this.pos.x, this.pos.y, this.radius * 2);

    this.trackPlayer();
    this.showRipple();
};

Water.prototype.trackPlayer = function() {
    var ps = getPlayers(this.pos, this.radius, []);
    if (ps.length) {
        for (var pi of ps) {
            if (p5.Vector.dist(this.pos, pi.pos) < this.radius - pi.radius / 2) {

                // add ripple
                if (pi.vel.mag() > pi.maxSpeed / 2 && mil - this.preRipple > this.delay) {
                    this.ripple.push({
                        x: pi.pos.x,
                        y: pi.pos.y,
                        r: 10
                    });
                    this.preRipple = mil;
                    if (pi == p) {
                        addSound('audio/footstep_water_02.mp3');
                    }
                }

                // slow down players
                pi.setFric(0.75, 100);
            }
        }
    }

    var bs = getBullets(this.pos, this.radius, []);
    if (bs.length) {
        for (var bi of bs) {
            if (p5.Vector.dist(this.pos, bi.pos) < this.radius - bi.info.radius / 2) {
                // slow down bullet
                bi.vel.mult(0.95);
            }
        }
    }
};

Water.prototype.showRipple = function() {
    for (var i = this.ripple.length - 1; i >= 0; i--) {
        var ripple = this.ripple[i];
        fill(150, 10);
        stroke(150, 200 - ripple.r * 2);
        strokeWeight(2);
        ellipse(ripple.x, ripple.y, ripple.r * 2);

        ripple.r += 1 * (60 / (fr + 1));

        if (ripple.r * 2 > 255) {
            this.ripple.splice(i, 1);
        }

    }
};