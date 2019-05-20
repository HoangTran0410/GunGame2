function Barrel(x, y, r) {
    this.pos = v(x, y);
    this.radius = r;

    this.col = [30, 30, 30];
    this.lidpos = this.pos.copy().add(v(random(-1, 1), random(-1, 1)).setMag(this.radius * 0.5));
    this.health = this.radius;
}

Barrel.prototype.run = function() {
    if (insideViewport(this)) this.show();
    this.update();
};

Barrel.prototype.update = function() {
    var bs = getBullets(this.pos, this.radius, []);
    if (bs.length) {
        for (var bi of bs) {
            // hightlight
            fill(100, 20, 20, 100);
            ellipse(this.pos.x, this.pos.y, this.radius*2 + 20);
            // dec health
            this.health -= bi.info.damage;
            // end bullet
            bi.end();

            if (this.health < 0) {
                this.end(bi);
                break;
            }
        }
    }

    var ps = getPlayers(this.pos, this.radius + maxSizeNow, []);
    if (ps.length) {
        for (var pi of ps) {
            var d = p5.Vector.dist(this.pos, pi.pos);
            if(d < this.radius + pi.radius){
                effects.collision(this, pi);
                if (pi.nextPoint) pi.nextPoint = v(pi.pos.x + random(-300, 300), pi.pos.y + random(-300, 300));
            }
        }
    }

    var is = getItems(this.pos, this.radius, []);
    if (is.length) {
        for (var ii of is) {
            effects.collision(this, ii);
        }
    }
};

Barrel.prototype.end = function(bull) {
    effects.smoke(this.pos.x, this.pos.y, 3, 1000, 40, 20);
    effects.explore(this.pos, this.radius * 0.15, [255, 100, 50], bull.o);
    effects.force('out', ['item'], this.pos, this.radius + 400, []);

    // health players
    var players = getPlayers(this.pos, this.radius + 300 + maxSizeNow, []);
    if(players.length) {
        for(var pl of players) {
            var dis = p5.Vector.dist(this.pos, pl.pos);
            if(dis < this.radius + 300 + pl.radius){
                var damage = map(dis - pl.radius - this.radius, 0, 300, this.radius, 0);
                pl.vel.add(p5.Vector.sub(pl.pos, this.pos).setMag(damage/2));
                if(pl.shield) {
                    if(pl.healthShield > damage) pl.healthShield -= damage;
                    else {
                        pl.healthShield = 0;
                        pl.health -= (damage - pl.healthShield);
                    }

                } else { pl.health -= damage;}

                pl.updateSize();
                if(pl.health <= 0) pl.die(bull);
            }
        }
    }

    // gun
    for(var i = 0; i < 1; i++){
        var len = getObjectLength(weapons);
        var nameGun = getValueAtIndex(weapons, floor(random(len / 2, len)));
        iArr.push(new Item(this.pos.x, this.pos.y, null, this.col, nameGun));
    }

    // mine
    for(var i = 0; i < this.radius / 30; i++)  {
        var dir = v(random(-1, 1), random(-1, 1)).setMag(random(.5, 3));
        var bullet = new Bullet(this.pos, dir, weapons.Mine.bulletInfo, bull.o);
        bArr.push(bullet);
    }

    // delete this
    rArr.splice(rArr.indexOf(this), 1);
};

Barrel.prototype.show = function() {
    fill(this.col[0], this.col[1], this.col[2]);
    stroke(80);
    strokeWeight(4);

    ellipse(this.pos.x, this.pos.y, this.radius * 2);

    fill(0); noStroke();
    ellipse(this.lidpos.x, this.lidpos.y, this.radius * 0.25);

    if(this.health < 20 && random(1) > 0.9 * (fr/60))
        effects.smoke(this.lidpos.x, this.lidpos.y, 1, 500, 1, 5);
};
