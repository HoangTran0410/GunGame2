function Rock(x, y, r) {
	this.pos = v(x, y);
	this.radius = r;
	this.col = [random(255), random(255), random(255)];
}

Rock.prototype.run = function() {
	this.update();
	if(insideViewport(this)) this.show();
};

Rock.prototype.update = function() {
	this.fakepos = realToFake(this.pos.x, this.pos.y);
	effects.force('out', ['bullet', 'player'], this.pos, this.radius, 200);
};

Rock.prototype.show = function() {
	fill(this.col[0], this.col[1], this.col[2], 100);
	stroke(150);

	ellipse(this.fakepos.x, this.fakepos.y, this.radius * 2, this.radius * 2);
};