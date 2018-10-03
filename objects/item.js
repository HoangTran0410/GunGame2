function Item(x, y, radius, col) {
    this.pos = v(x, y);
    this.vel = v(0, 0);
    this.radius = radius || random(5, 15);
    this.col = col || [random(255), random(255), random(255)];
}

Item.prototype.run = function() {
    if (insideViewport(this)) {
        this.update();
        this.show();
    }
};

Item.prototype.eatBy = function(t) {
    var d = p5.Vector.dist(this.pos, t.pos);

    if (d < t.radius) {
        iArr.splice(iArr.indexOf(this), 1);

        t.health += this.radius / 5;
        t.score += this.radius / 10;
        t.updateSize();

    } else {
        this.vel = v(t.pos.x - this.pos.x, t.pos.y - this.pos.y).setMag(250 / (d - t.radius)).limit(15);
    }
};

Item.prototype.update = function() {
    this.pos.add(random(-2, 2), random(-2, 2));
    this.pos.add(this.vel);
    this.vel.mult(0.8);
    collisionEdge(this, 1);
};

Item.prototype.show = function() {
    noStroke();

    fill(this.col[0], this.col[1], this.col[2], 50);
    ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);

    fill(this.col[0], this.col[1], this.col[2], 150);
    ellipse(this.pos.x, this.pos.y, this.radius * 1.5, this.radius * 1.5);

    fill(this.col[0], this.col[1], this.col[2], 255);
    ellipse(this.pos.x, this.pos.y, this.radius, this.radius);
};