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
	var er = effects.force('out', ['bullet', 'player', 'item'], this.pos, this.radius, []);
		
	if(er.bulls.length){
		for(var eri of er.bulls){
			if(p5.Vector.dist(this.pos, eri.pos) < this.radius + eri.info.radius){
				// if(['Bazoka', 'PortalIn', 'PortalOut'].indexOf(eri.info.name) != -1)
				// 	eri.end();	
				noStroke();
				fill(this.col[0], this.col[1], this.col[2], 60);
				ellipse(this.fakepos.x, this.fakepos.y, this.radius * 2, this.radius * 2);
				this.radius -= eri.info.radius / 10;
				if(this.radius < 20)
					rArr.splice(rArr.indexOf(this), 1);
			}
		}
	}
};

Rock.prototype.show = function() {
	fill(this.col[0], this.col[1], this.col[2], 100);
	stroke(150);

	ellipse(this.fakepos.x, this.fakepos.y, this.radius * 2, this.radius * 2);
};