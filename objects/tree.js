function Tree(x, y, r) {
	this.pos = v(x, y);
	this.radius = r;
	this.col = [random(20), random(50, 100), random(20)];
}

Tree.prototype.run = function() {
	this.fakepos = realToFake(this.pos.x, this.pos.y);
	if(insideViewport(this)) this.show();
	this.update();
};

Tree.prototype.update = function() {
	var er = getObjQuad(['bullet', 'player'], this.pos, this.radius, []);
	
	if(er.players.length){
		for(var erp of er.players){
			if(p5.Vector.dist(this.pos, erp.pos) < this.radius - erp.radius / 2){
				erp.vel.mult(0.6);
				erp.hide = true;
			}
		}
	}
		
	if(er.bulls.length){
		for(var eri of er.bulls){
			if(p5.Vector.dist(this.pos, eri.pos) < this.radius + eri.info.radius){

				// active bullets
				eri.end();	

				//hight light this tree
				noStroke();
				fill(this.col[0], this.col[1], this.col[2], 60);
				ellipse(this.fakepos.x, this.fakepos.y, this.radius * 2, this.radius * 2);

				// decrease radius
				if(eri.o) this.radius -= eri.info.radius / 2;

				// delete if radius too small
				if(this.radius < 20){
					for(var i = 0; i < 10; i++)
						iArr.push(new Item(this.pos.x + random(-30, 30), this.pos.y + random(-30, 30)));
					tArr.splice(tArr.indexOf(this), 1);	
					break;
				} 
			}
		}
	}
};

Tree.prototype.show = function() {
	fill(this.col[0], this.col[1], this.col[2], 252);
	strokeWeight(4);
	stroke(0, 160, 0);

	ellipse(this.fakepos.x, this.fakepos.y, this.radius * 2 + ampLevel*100, this.radius * 2 + ampLevel*100);
};