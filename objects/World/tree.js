function Tree(x, y, r) {
    this.pos = v(x, y);
    this.radius = r;
    this.col = [random(20), random(50, 100), random(20)];
}

Tree.prototype.run = function() {
    if (insideViewport(this)) this.show();
    this.update();
};

Tree.prototype.update = function() {
    var ps = getPlayers(this.pos, this.radius + maxSizeNow, []);
    if (ps.length) {
        for (var pi of ps) {
            if (p5.Vector.dist(this.pos, pi.pos) < this.radius - pi.radius / 2) {
                pi.vel.mult(0.6);
                pi.hide = true;
            }
        }
    }

    var bs = getBullets(this.pos, this.radius + maxSizeNow, []);
    if (bs.length) {
        for (var bi of bs) {
            if (p5.Vector.dist(this.pos, bi.pos) < this.radius + bi.info.radius) {

                // active bullets
                bi.end();

                //hight light this tree
                noStroke();
                fill(this.col[0], this.col[1], this.col[2], 60);
                ellipse(this.pos.x, this.pos.y, this.radius * 2);

                // decrease radius
                if (bi.o) this.radius -= bi.info.radius / 2;
                if(random() > 0.8){
                    var pos = this.pos.copy().add(v(random(-1, 1), random(-1, 1)).setMag(this.radius+2));
                    var item = new Item(pos.x, pos.y);
                    item.vel = p5.Vector.sub(item.pos, this.pos).setMag(15-item.radius);
                    iArr.push(item);
                }

                // delete if radius too small
                if (this.radius < 20) {
                    this.end();
                    break;
                }
            }
        }
    }
};

Tree.prototype.end = function() {
    if (insideViewport(this)) addSound('audio/tree_break_01.mp3');

    // gun
    if (random(1) > 0.6) {
        var index = floor(random(getObjectLength(weapons) / 2 - 1));
        iArr.push(new Item(this.pos.x, this.pos.y, null, this.col, index));
    }
    // items
    for (var i = 0; i < random(1, 5); i++)
        iArr.push(new Item(this.pos.x + random(-30, 30), this.pos.y + random(-30, 30)));

    // delete this
    tArr.splice(tArr.indexOf(this), 1);
};

Tree.prototype.show = function() {
    fill(this.col[0], this.col[1], this.col[2], 252);
    // strokeWeight(4);
    // stroke(0, 160, 0);
    noStroke();

    ellipse(this.pos.x, this.pos.y, this.radius * 2 + ampLevel * 100);
};