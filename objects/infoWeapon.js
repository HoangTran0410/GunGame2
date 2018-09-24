function InfoWeapon(x, y, w, h) {
	this.pos = createVector(x || width - 60, y || height - 290);
	this.size = createVector(w || 100, h || 50);

	this.show = function() {
		noStroke();

		fill(120, 50);
		rect(this.pos.x, this.pos.y - this.size.y * 0.25, this.size.x, this.size.y * 0.5);
		fill(0, 50);
		rect(this.pos.x, this.pos.y + this.size.y * 0.25, this.size.x, this.size.y * 0.5);

		noStroke();
		fill(255);
		text(viewport.target.weapon.name, this.pos.x, this.pos.y - this.size.y * 0.15);

		if (viewport.target.weapon.gun.reloading) {
			fill(255, 150, 20);
			text("..Reloading..", this.pos.x, this.pos.y + this.size.y / 3);
		} else text(viewport.target.weapon.gun.bullsLeft, this.pos.x, this.pos.y + this.size.y * 0.3);
	}
}