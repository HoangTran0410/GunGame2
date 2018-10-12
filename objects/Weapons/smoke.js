function Smoke(x, y, life, r) {
	this.pos = v(x, y);
	this.vel = v(0, 0);
	this.radius = r || floor(random(10, 50));
	this.born = mil;
	this.life = life;
}

Smoke.prototype.show = function() {
	if (insideViewport(this)) {
		this.vel.add(random(-1, 1), random(-1, 1));
		this.pos.add(this.vel);
		this.vel.mult(0.9);

		// show 
		if (this.radius < 100)
			this.radius += random(7) * (30 / (fr + 1));
		var c = map(this.life - (mil - this.born), 0, this.life, 30, 255);
		fill(c, c * 2);
		noStroke();

		ellipse(this.pos.x, this.pos.y, this.radius * 2);
	}

	// check end
	if (mil - this.born > this.life) {
		sArr.splice(sArr.indexOf(this), 1);
	}
};