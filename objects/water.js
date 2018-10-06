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
	var er = getObjQuad(['bullet', 'player'], this.pos, this.radius, []);

	if (er.players.length) {
        for (var erp of er.players) {
            if (p5.Vector.dist(this.pos, erp.pos) < this.radius - erp.radius / 2) {

            	// add ripple
        		if(erp.vel.mag() > erp.maxSpeed / 2 && mil - this.preRipple > this.delay){
                    this.ripple.push({x: erp.pos.x, y: erp.pos.y, r:10});
                    this.preRipple = mil;
                    if(erp == p){
                        addSound('audio/footstep_water_02.mp3');
                    }
        		}

        		// slow down players
        		erp.vel.mult(0.65);
            }
        }
    }

    if(er.bulls.length){
    	for (var eb of er.bulls) {
            if (p5.Vector.dist(this.pos, eb.pos) < this.radius - eb.info.radius / 2) {
            	// slow down bullet
            	eb.vel.mult(0.9);
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