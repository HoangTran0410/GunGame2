function Item(x, y, radius, col) {
	this.pos = v(x, y);
	this.vel = v(0, 0);
	this.radius = radius || random(5, 15);
	this.col = col || color(random(255), random(255), random(255));
}

Item.prototype.run = function() {
	if(insideViewport(this)){
		this.update();
		this.show();
	}
};

Item.prototype.eatBy = function(t) {
	var d = p5.Vector.dist(this.pos, t.pos);

	if (d < t.radius) {
		iArr.splice(iArr.indexOf(this), 1);

		t.health += this.radius / 5;
		t.updateSize();
		

	} else {
		this.vel = v(t.pos.x - this.pos.x, t.pos.y - this.pos.y).limit(100 / (d - t.radius));
		this.pos.add(this.vel);
	}
};

Item.prototype.update = function() {
	this.fakepos = realToFake(this.pos.x, this.pos.y);
	this.pos.add(random(-2, 2), random(-2, 2));
	this.pos.add(this.vel);
	this.vel.mult(0.8);
	collisionEdge(this, 1);
};

Item.prototype.show = function() {
	noStroke();

	this.col.setAlpha(50); fill(this.col);
	ellipse(this.fakepos.x, this.fakepos.y, this.radius * 2, this.radius * 2);

	this.col.setAlpha(150); fill(this.col);
	ellipse(this.fakepos.x, this.fakepos.y, this.radius * 1.5, this.radius * 1.5);

	this.col.setAlpha(150); fill(this.col);
	ellipse(this.fakepos.x, this.fakepos.y, this.radius, this.radius);
};