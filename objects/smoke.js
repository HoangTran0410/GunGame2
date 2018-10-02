function Smoke(x, y, r, life){
	this.pos = v(x, y);
	this.vel = v(0, 0);
	this.radius = r || floor(random(70, 100));
	this.born = mil;
	this.life = life;

	this.show = function() {
		this.fakepos = realToFake(this.pos.x, this.pos.y);

		if(insideViewport(this)){
			this.vel.add(random(-1, 1), random(-1, 1));
			this.pos.add(this.vel);
			this.vel.mult(0.8)

			// show 
			var c = map(this.life - (mil - this.born), 0, this.life, 30, 255);
			fill(c, c * 2);
			noStroke();

			ellipse(this.fakepos.x, this.fakepos.y, this.radius * 2, this.radius * 2);

			// check end
			if(mil - this.born > this.life){
				sArr.splice(sArr.indexOf(this), 1);
			}

		}

	}
}