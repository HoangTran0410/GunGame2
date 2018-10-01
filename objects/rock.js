function Rock(x, y, r) {
	this.pos = v(x, y);
	this.radius = r;
	this.col = [random(255), random(255), random(255)];
}

Rock.prototype.run = function() {
	this.fakepos = realToFake(this.pos.x, this.pos.y);
	if(insideViewport(this)) this.show();
	this.update();
};

Rock.prototype.update = function() {
	var er = effects.force('out', ['bullet', 'player', 'item'], this.pos, this.radius, []);
		
	if(er.bulls.length){
		for(var eri of er.bulls){
			if(p5.Vector.dist(this.pos, eri.pos) < this.radius + eri.info.radius){
				// if(['Bazoka', 'PortalIn', 'PortalOut'].indexOf(eri.info.name) != -1)
				// 	eri.end();
				noStroke();
				fill(this.col[0], this.col[1], this.col[2], 60);
				ellipse(this.fakepos.x, this.fakepos.y, this.radius * 2, this.radius * 2);

				if(eri.o) this.radius -= eri.info.radius / 10;

				if(this.radius < 20){
					for(var i = 0; i < 20; i++)
						iArr.push(new Item(this.pos.x + random(-30, 30), this.pos.y + random(-30, 30)));
					rArr.splice(rArr.indexOf(this), 1);
					break;
				} 
			}
		}
	}
};

Rock.prototype.show = function() {
	fill(this.col[0], this.col[1], this.col[2], 100);
	stroke(150);
	strokeWeight(2);

	ellipse(this.fakepos.x, this.fakepos.y, this.radius * 2 + ampLevel*100, this.radius * 2 + ampLevel*100);
};