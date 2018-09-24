function ExplorePoint(x, y, numOfBulls, colo, timeCount, owner) {
	this.o = owner;
	this.pos = createVector(x, y);
	this.fakepos = createVector(0, 0);
	this.num = numOfBulls;
	this.col = colo;

	this.timeCount = timeCount;
	this.startTime = milli;

	this.size = this.timeCount / 10;

	this.checkExplore = function(contain) {
		if (milli - this.startTime >= this.timeCount) {
			explore(this.pos, this.num, this.col, this.o);
			contain.splice(contain.indexOf(this), 1);
		}
	}

	this.show = function() {
		if (isInside(this.pos.x, this.pos.y, viewport.pos, {
				x: width + this.size,
				y: height + this.size
			})) {

			this.fakepos = realToFake(this.pos.x, this.pos.y);
			var size = map((milli - this.startTime), 0, this.timeCount, 0, this.size);
			var opacity = map(size, 0, this.size, 0, 255);
			fill(200, 10, 10, opacity);
			ellipse(this.fakepos.x, this.fakepos.y, this.size - size, this.size - size);
		}
	}
}