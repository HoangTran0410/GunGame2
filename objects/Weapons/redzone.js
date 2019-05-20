function RedZone(x, y, r, life, owner) {
    this.o = owner;
    this.pos = v(x, y);
    this.radius = r;
    this.ep = [];
    this.preDrop = mil;

    this.redRange = [120, 255];
    this.redValue = random(120, 255);
    this.grow = (this.redRange[1] - this.redRange[0]) / 50;

    this.born = mil;
    this.life = life;
}

RedZone.prototype.dropBoom = function() {
    if (mil - this.preDrop > 100000 / this.radius) {
        this.preDrop = mil;

        var len = v(random(-1, 1), random(-1, 1)).setMag(random(this.radius));
        var pos = p5.Vector.add(this.pos, len);
        this.ep.push(new ExplorePoint(pos.x, pos.y, random(10, 20), [255, 255, 0], random(500, 2000), this.o));

        if (random(1) > 0.5) iArr.push(new Item(pos.x, pos.y));
        else if (random(1) > 0.9) bArr.push(new Bullet(pos, v(0, 0), weapons.Mine.bulletInfo));
    }
};

RedZone.prototype.show = function() {
    this.redValue += this.grow;
    if (this.redValue <= this.redRange[0] || this.redValue >= this.redRange[1])
        this.grow *= -1;

    if (insideViewport(this)) {
        noStroke();
        fill(this.redValue, 10, 10, 35);
        ellipse(this.pos.x, this.pos.y, this.radius * 2);

        for (var i = this.ep.length - 1; i >= 0; i--) {
            this.ep[i].show();
        }
    };

    for (var i = this.ep.length - 1; i >= 0; i--) {
        this.ep[i].checkExplore(this.ep);
    }

    if (mil - this.born > this.life) {
        redArr.splice(redArr.indexOf(this), 1);

    } else this.dropBoom();
};