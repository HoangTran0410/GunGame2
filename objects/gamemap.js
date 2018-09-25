function GameMap(w, h, gridsize) {
	this.size = v(w, h);
	this.gridSize = gridsize || 200;
	this.hiddenMinimap = false;
}

GameMap.prototype.run = function() {
	this.drawGrid();
	this.drawEdge();
};

GameMap.prototype.createMinimap = function() {
	this.minimapSize = 250;
	this.offSetX = width - this.minimapSize - 10;
	this.minimap = createGraphics(this.minimapSize, this.minimapSize);
	this.minimap.fill(5, 70);
	this.minimap.noStroke();
	this.minimap.rect(0, 0, this.minimapSize, this.minimapSize);

	for(var r of rArr){
		this.minimap.fill(r.col[0], r.col[1], r.col[2], 150);
		this.circleToMinimap(r.pos, r.radius, true);
	}
};

GameMap.prototype.convert = function(x) {
	return map(x, 0, this.size.x, 0, this.minimapSize);
};

GameMap.prototype.convertXY = function(pos) {
	return v(this.convert(pos.x), this.convert(pos.y));
};

GameMap.prototype.circleToMinimap = function(pos, radius, save) {
	var newpos = this.convertXY(pos);
	var newradius = this.convert(radius);

	if(save){
		this.minimap.ellipse(newpos.x, newpos.y, newradius * 2, newradius * 2);
	} else {
		ellipse(newpos.x + this.offSetX, newpos.y + height - (this.minimapSize + 10), newradius * 2, newradius * 2);
	}
};

GameMap.prototype.rectToMinimap = function(pos, size, save) {
	var newpos = this.convertXY(pos);
	var newsize = this.convertXY(size);

	if(save){
		this.minimap.rect(newpos.x, newpos.y, newsize.x, newsize.y);
	} else {
		rect(newpos.x + this.offSetX, newpos.y + height - (this.minimapSize + 10), newsize.x, newsize.y);
	}
};

GameMap.prototype.showMinimap = function() {
	if(this.hiddenMinimap){
		if(this.offSetX < width - 10) this.offSetX += 20*(60/(fr+1));

	} else {
		if(this.offSetX > width - this.minimapSize - 10) this.offSetX -= 20*(60/(fr+1));
	}

	if(this.offSetX < width - 10){
		image(this.minimap, this.offSetX, height - (this.minimapSize + 10));

		stroke(255);
		noFill();
		this.circleToMinimap(p.pos, 100, false);
		this.rectToMinimap(viewport.pos, v(width, height), false);

		//show portals in minimap
		for(var pi of pArr){
			fill(pi.type=='out'?'orange':'blue');
			noStroke();
			this.circleToMinimap(pi.pos, (mil/4)%150, false);
			if(pi.connectWith) {
				var from = this.convertXY(pi.pos).add(width - (this.minimapSize + 10), height - (this.minimapSize + 10));
				var to = this.convertXY(pi.connectWith.pos).add(width - (this.minimapSize + 10), height - (this.minimapSize + 10));
				stroke(200, 50);
				line(from.x, from.y, to.x, to.y);
			}
		}

		// show redzones in minimap
		for(var rz of redArr){
			stroke(rz.redValue, 0, 0);
			fill(rz.redValue, 10, 10, 50);
			this.circleToMinimap(rz.pos, rz.radius, false);
		}

		//show more info
		if(mouseX > this.offSetX && mouseY > height - this.minimapSize - 10){
			textAlign(RIGHT);
			noStroke();
			fill(255);
			text('press M to open/close minimap ', mouseX, mouseY);
		}
	}
};

GameMap.prototype.drawEdge = function() { // Vẽ biên
	// dùng 4 đỉnh đê vẽ hình chữ nhât
	var topleft = realToFake(0, 0); // đỉnh trên trái
	var topright = realToFake(this.size.x, 0); // đỉnh trên phải
	var botleft = realToFake(0, this.size.y); // đỉnh dưới trái
	var botright = realToFake(this.size.x, this.size.y); // đỉnh dưới phải

	stroke(255);
	strokeWeight(2);

	// Ve duong thang qua cac dinh
	line(topleft.x, topleft.y, topright.x, topright.y);
	line(topright.x, topright.y, botright.x, botright.y);
	line(botright.x, botright.y, botleft.x, botright.y);
	line(botleft.x, botleft.y, topleft.x, topleft.y);
};

GameMap.prototype.drawGrid = function() {
	stroke(70, 150);
	strokeWeight(1);
	var delta = 1;

	for (var x = viewport.pos.x - width / 2; x < viewport.pos.x + width / 2; x += delta) {
		if (floor(x) % this.gridSize == 0) {
			/* while you find 1 x%this.gridSize==0 
			=> delta will equal this.gridSize => shorter loop */
			delta = this.gridSize;
			var newX = realToFake(x, viewport.pos.y);
			line(newX.x, 0, newX.x, height);
		}
	}

	// do the same thing to y axis
	delta = 1;
	for (var y = viewport.pos.y - height / 2; y < viewport.pos.y + height / 2; y += delta) {
		if (floor(y) % this.gridSize == 0) {
			delta = this.gridSize;
			var newY = realToFake(viewport.pos.x, y);
			line(0, newY.y, width, newY.y);
		}
	}
};