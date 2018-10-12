function Item(x, y, radius, col, dropGun) {
    this.pos = v(x, y);
    this.vel = v(0, 0);
    this.radius = radius || random(5, 15);
    this.col = col || [random(255), random(255), random(255)];
    this.born = mil;
    this.life = random(6E4, 3E5);

    this.dropGun = dropGun;
    if (!isNaN(this.dropGun)) this.nameGun = getValueAtIndex(weapons, dropGun);
    this.autoEat = (this.nameGun?false:true);
}

Item.prototype.run = function() {
    if (insideViewport(this)) {
        this.update();
        this.show();
    }

    if (isNaN(this.dropGun) && (mil - this.born > this.life)) {
        iArr.splice(iArr.indexOf(this), 1);
    }
};

Item.prototype.eatBy = function(t) {
    if(this.autoEat){
        var d = p5.Vector.dist(this.pos, t.pos);

        if (d < t.radius) {
            iArr.splice(iArr.indexOf(this), 1);

            t.health += this.radius / 5;
            t.score += this.radius / 10;
            if (this.dropGun) t.addWeapon(this.dropGun);
            t.updateSize();

        } else {
            this.vel = v(t.pos.x - this.pos.x, t.pos.y - this.pos.y).setMag(250 / (d - t.radius)).limit(15);
        }
    }
};

Item.prototype.update = function() {
    this.pos.add(random(-2, 2), random(-2, 2));
    this.pos.add(this.vel.copy().mult(60 / (fr + 1)));
    this.vel.mult(0.8);
    collisionEdge(this, 1);
};

Item.prototype.show = function() {
    if (this.nameGun) {
        fill(10);
        stroke(255, 150);
        strokeWeight(1);
        ellipse(this.pos.x, this.pos.y, 30);

        noStroke();
        fill(255);
        text(this.nameGun, this.pos.x, this.pos.y);

    } else {
        noStroke();

        fill(this.col[0], this.col[1], this.col[2], 50);
        ellipse(this.pos.x, this.pos.y, this.radius * 2);

        fill(this.col[0], this.col[1], this.col[2], 150);
        ellipse(this.pos.x, this.pos.y, this.radius * 1.5);

        fill(this.col[0], this.col[1], this.col[2], 255);
        ellipse(this.pos.x, this.pos.y, this.radius);
    }
};