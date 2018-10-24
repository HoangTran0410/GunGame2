function Barrel(x, y, r) {
    return new Rock(x, y, r, true);
}

function Rock(x, y, r, isBarrel) {
    this.pos = v(x, y);
    this.radius = r;
    
    var c = floor(random(30, 70));
    this.col = [c, c, c];

    if(isBarrel) {
        this.isBarrel = true;
        this.radius = random(40, 70);
        this.col = [30, 30, 30];
        this.lidpos = this.pos.copy().add(v(random(-1, 1), random(-1, 1)).setMag(this.radius * 0.5));
        this.health = this.radius;
    }
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

                if(this.isBarrel) {
                    // hightlight
                    fill(100, 20, 20, 100);
                    ellipse(this.pos.x, this.pos.y, this.radius*2 + 20);
                    // dec health
                    this.health -= bi.info.damage;
                    // end bullet
                    bi.end();

                } else {
                    effects.collision(this, bi, d, true);
                    if (bi.o) this.radius -= bi.info.radius / 4;
                }

                if (this.radius < 20 || this.health < 0) {
                    this.end(bi);
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

Rock.prototype.end = function(bull) {

    if(this.isBarrel) {
        effects.smoke(this.pos.x, this.pos.y, 3, 1000, 40, 20);
        effects.explore(this.pos, 25, [255, 100, 50], bull.o);

    } else {
        if(insideViewport(this)) addSound('audio/stone_break_01.mp3');

        // gun
        var len = getObjectLength(weapons);
        var nameGun = getValueAtIndex(weapons, floor(random(len / 2, len)));
        iArr.push(new Item(this.pos.x, this.pos.y, null, this.col, nameGun));

        // items
        for (var i = 0; i < random(10, 20); i++)
            iArr.push(new Item(this.pos.x + random(-30, 30), this.pos.y + random(-30, 30)));
    }


    // delete this
    rArr.splice(rArr.indexOf(this), 1);
};

Rock.prototype.show = function() {
    if(this.isBarrel) {
        fill(this.col[0], this.col[1], this.col[2]);
        stroke(80);
        strokeWeight(4);

        ellipse(this.pos.x, this.pos.y, this.radius * 2);

        fill(0); noStroke();
        ellipse(this.lidpos.x, this.lidpos.y, 20);

        if(this.isBarrel && this.health < 20 && random(1) > 0.9) 
            effects.smoke(this.lidpos.x, this.lidpos.y, 1, 500, 1, 5);

    } else {
        fill(this.col[0], this.col[1], this.col[2]);
        stroke(70);
        strokeWeight(2);

        ellipse(this.pos.x, this.pos.y, this.radius * 2);
    }
};
