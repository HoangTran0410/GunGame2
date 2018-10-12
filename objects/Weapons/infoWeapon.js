function InfoWeapon() {
    this.pos = v(0, height - 10 - 50 / 2);
    this.size = v(100, 50);

    this.show = function() {
        noStroke();

        this.pos.x = (gmap.offSetX || width) - this.size.x / 2 - 20;

        fill(120, 50);
        rect(this.pos.x, this.pos.y - this.size.y * 0.25, this.size.x, this.size.y * 0.5);
        fill(0, 50);
        rect(this.pos.x, this.pos.y + this.size.y * 0.25, this.size.x, this.size.y * 0.5);

        noStroke();
        fill(255);
        textAlign(CENTER);
        if (!viewport.target.shield) {
            var c = viewport.target.weapon.color;
            fill(c[0], c[1], c[2]);
            text(viewport.target.weapon.name, this.pos.x, this.pos.y - this.size.y * 0.15);
            fill(255);
            if (viewport.target.weapon.gun.reloading) {
                fill(255, 150, 20);
                text("..Reloading..", this.pos.x, this.pos.y + this.size.y / 3);
            } else text(viewport.target.weapon.gun.bullsLeft, this.pos.x, this.pos.y + this.size.y * 0.3);

        } else {
            if (mouseIsPressed) fill(255, 0, 0);
            text('Shield On', this.pos.x, this.pos.y - this.size.y * 0.15);
        }
    }
}