function Rock(x, y, r) {
    this.pos = v(x, y);
    this.radius = r;
    var c = floor(random(30, 70));
    this.col = [c, c, c];
}

Rock.prototype.run = function() {
    if (insideViewport(this)) this.show();
    this.update();
};

Rock.prototype.update = function() {
    var bs = getBullets(this.pos, this.radius, []);
    if (bs.length) {
        for (var bi of bs) {
            var d = p5.Vector.dist(this.pos, bi.pos);
            if (d < this.radius + bi.info.radius) {

                effects.collision(this, bi, d, true);

                noStroke();
                fill(this.col[0], this.col[1], this.col[2], 60);
                ellipse(this.pos.x, this.pos.y, this.radius * 2);

                if (bi.o) this.radius -= bi.info.radius / 4;

                if (this.radius < 20) {
                    this.end();
                    break;
                }
            }
        }
    }

    var ps = getPlayers(this.pos, this.radius + maxSizeNow, []);
    if (ps.length) {
        for (var pi of ps) {
            var d = p5.Vector.dist(this.pos, pi.pos);
            if (d < this.radius + pi.radius) {
                effects.collision(this, pi, d);
                if (pi.nextPoint) pi.nextPoint = v(pi.pos.x + random(-300, 300), pi.pos.y + random(-300, 300));
            }
        }
    }

    var is = getItems(this.pos, this.radius, []);
    if (is.length) {
        for (var ii of is) {
            var d = p5.Vector.dist(this.pos, ii.pos);
            if (d < this.radius + ii.radius) {
                effects.collision(this, ii, d);
            }
        }
    }
};

Rock.prototype.end = function() {
    if(insideViewport(this)) addSound('audio/stone_break_01.mp3');
    // gun
    var len = getObjectLength(weapons);
    var index = floor(random(len / 2 - 1, len));
    // items
    iArr.push(new Item(this.pos.x, this.pos.y, null, this.col, index));
    for (var i = 0; i < random(10, 20); i++)
        iArr.push(new Item(this.pos.x + random(-30, 30), this.pos.y + random(-30, 30)));
    // delete this
    rArr.splice(rArr.indexOf(this), 1);
};

Rock.prototype.show = function() {
    fill(this.col[0], this.col[1], this.col[2]);
    stroke(70);
    strokeWeight(1);
    // noStroke();

    ellipse(this.pos.x, this.pos.y, this.radius * 2);
};