function Portal(inOrOut, x, y, connectWith, radius, life) {
	this.type = inOrOut;
	this.pos = v(x, y);
	this.radius = radius || 100;
	this.connectWith = connectWith;

	this.born = mil;
	this.life = life || 5;

	this.grow = [];

	this.grow[0] = this.radius;
	this.grow[1] = this.radius / 2;
}

Portal.prototype.update = function() {
	this.fakepos = realToFake(this.pos.x, this.pos.y);
	this.objInside = effects.force((this.type=='in'?'in':'out'), ['player', 'item', 'bullet'], this.pos, this.radius);

	if(this.type == 'in' && this.connectWith)
	for(var obj of this.objInside.all){
		if(p5.Vector.dist(this.pos, obj.pos) < (obj.radius || obj.info.radius)){
			obj.pos = this.connectWith.pos.copy();
		}
	}

	if((mil - this.born) / 1000 > this.life)
		pArr.splice(pArr.indexOf(this), 1);
};

Portal.prototype.run = function() {
	this.update();
	if(insideViewport(this)) this.show();
};

Portal.prototype.show = function() {
	if (this.type == 'in') fill(64, 121, 196, 50);
	else if (this.type == 'out') fill(232, 165, 71, 50);

	ellipse(this.fakepos.x, this.fakepos.y, this.radius * 1.75, this.radius * 2);

	// update grows
	for(var i = 0; i < this.grow.length; i++){
		if (this.type == 'in') {
			this.grow[i] -= (60 / (fr + 1)) + random(-1, 1);
			if (this.grow[i] < 0) this.grow[i] = this.radius;

		} else if (this.type == 'out') {
			this.grow[i] += (60 / (fr + 1)) + random(-1, 1);
			if (this.grow[i] > this.radius) this.grow[i] = 0;
		}
	}

	stroke(255, 50);
	for(var i = 0; i < this.grow.length; i++)
		ellipse(this.fakepos.x, this.fakepos.y, this.grow[i] * 1.75, this.grow[i] * 2);
};