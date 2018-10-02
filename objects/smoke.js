function Smoke(x, y, r, life){
	this.pos = v(x, y);
	this.vel = v(0, 0);
	this.radius = r || floor(random(50, 200));
	this.born = mil;
	this.life = life;

	this.show = function() {
		this.fakepos = realToFake(this.pos.x, this.pos.y);

		if(insideViewport(this)){
			this.vel.add(random(-1, 1), random(-1, 1));
			this.pos.add(this.vel);
			this.vel.mult(0.8)

			// show 
			var c = map(this.life - (mil - this.born), 0, this.life, 30, 300);
			fill(c, c * 2);
			noStroke();

			ellipse(this.fakepos.x, this.fakepos.y, this.radius * 2, this.radius * 2);

			// hide
			// var er = getObjQuad(['player'], this.pos, this.radius, []);
			// if (er.players.length) {
		 //        for (var erp of er.players) {
		 //            if (p5.Vector.dist(this.pos, erp.pos) < this.radius - erp.radius / 2) {
		 //                erp.vel.mult(0.9);
		 //                erp.hide = true;
		 //            }
		 //        }
		 //    }


			// check end
			if(mil - this.born > this.life){
				sArr.splice(sArr.indexOf(this), 1);
			}

		}

	}
}