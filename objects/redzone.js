function RedZone(x, y, r, time) {
	this.pos = createVector(x, y);
	this.fakepos = createVector(0, 0);
	this.size = r;
	this.ep = [];

	this.time = time;
	this.startTime = milli;
	this.preDrop = milli;

	this.redRange = [120, 255];
	this.redValue = random(120, 255);
	this.grow = (this.redRange[1] - this.redRange[0]) / 50;

	this.dropBoom = function() {
		if (milli - this.preDrop > 1000 / (this.size / 200)) {
			this.preDrop = milli;
			var len = createVector(random(-1, 1), random(-1, 1)).setMag(random(this.size / 2));
			var pos = p5.Vector.add(this.pos, len);
			this.ep.push(new ExplorePoint(pos.x, pos.y, random(10, 20), null, random(500, 2000)));
			if (random(1) > 0.5)
				item.push(new Item(pos.x, pos.y));
			else if(random(1) > 0.9)
				b.push(new Bullet('Mine', pos, {x:0,y:0}, 10, 20, null, 120000, null));
		}
	}

	this.show = function() {
		this.redValue += this.grow;
		if (this.redValue <= this.redRange[0] || this.redValue >= this.redRange[1])
			this.grow *= -1;

		if (isInside(this.pos.x, this.pos.y, viewport.pos, {
				x: width + this.size,
				y: height + this.size
			})) {

			this.fakepos = realToFake(this.pos.x, this.pos.y);

			noStroke();
			fill(this.redValue, 10, 10, 35);
			ellipse(this.fakepos.x, this.fakepos.y, this.size, this.size);

			for (var i = this.ep.length - 1; i >= 0; i--) {
				this.ep[i].show();
			}
		};

		for (var i = this.ep.length - 1; i >= 0; i--) {
			this.ep[i].checkExplore(this.ep);
		}

		if (milli - this.startTime > this.time) {
			redzones.splice(redzones.indexOf(this), 1);

		} else {
			this.dropBoom();
		}
	}
}