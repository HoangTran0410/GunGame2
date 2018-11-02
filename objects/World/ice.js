function Ice(x, y, r) {
	this.pos = v(x, y);
	this.radius = r || random(100, 500);

	this.col = [180, 207, 250];
}

Ice.prototype.run = function() {
    this.show();
    this.trackPlayer();
};

Ice.prototype.show = function() {
    noStroke();
    fill(this.col[0], this.col[1], this.col[2], 70);

    ellipse(this.pos.x, this.pos.y, this.radius * 2);
};

Ice.prototype.trackPlayer = function() {
    var ps = getPlayers(this.pos, this.radius, []);
    if (ps.length) {
        for (var pi of ps) {
            if (p5.Vector.dist(this.pos, pi.pos) < this.radius - pi.radius / 2) {

            	if(pi.friction > 0.1) { // not have efect of super Snow
	                pi.setFric(.99, 100);
	                pi.setMaxspeed(6, 100);
            	}
            }
        }
    }
};