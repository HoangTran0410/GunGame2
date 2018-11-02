function Water(x, y, r) {
    this.pos = v(x, y);
    this.radius = r || random(50, 400);
    this.col = [21, 53, 117];

    this.delay = 1000;
    this.ps = [];
}

Water.prototype.run = function() {
    // this.show();
    this.trackPlayer();

    if(this.ps.length) {
        for(var pi of this.ps)
            this.showRipple(pi);
    }
};

Water.prototype.show = function() {
    noStroke();
    fill(this.col[0], this.col[1], this.col[2], 70);

    ellipse(this.pos.x, this.pos.y, this.radius * 2);
};

Water.prototype.trackPlayer = function() {
    this.ps = getPlayers(this.pos, this.radius, []);
    if (this.ps.length) {
        for (var pi of this.ps) {
            if (p5.Vector.dist(this.pos, pi.pos) < this.radius - pi.radius / 2) {

                // add ripple
                if(!pi.preRipple) pi.preRipple = mil;
                if(!pi.ripples) pi.ripples = [];

                if (pi.vel.mag() > pi.maxSpeed / 2 && mil - pi.preRipple > this.delay) {
                    pi.ripples.push({
                        x: pi.pos.x,
                        y: pi.pos.y,
                        r: 1
                    });
                    pi.preRipple = mil;
                    if (pi == p) {
                        addSound('audio/footstep_water_02.mp3');
                    }
                }

                this.showRipple(pi);

                // slow down players
                // pi.setFric(0.75, 100);
                pi.setMaxspeed(2.5, 100);
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

Water.prototype.showRipple = function(pi) {
    if(pi.ripples)
    for (var i = pi.ripples.length - 1; i >= 0; i--) {
        var ripples = pi.ripples[i];
        fill(150, 10);
        stroke(150, 150 - ripples.r * 2);
        strokeWeight(2);
        ellipse(ripples.x, ripples.y, ripples.r * 2);

        ripples.r += 1 * (60 / (fr + 1));

        if (ripples.r * 2 > 255) {
            pi.ripples.splice(i, 1);
        }

    }
};