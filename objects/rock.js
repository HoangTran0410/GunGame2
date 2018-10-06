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
    var er = getObjQuad(['bullet', 'player', 'item'], this.pos, this.radius, []);

    if (er.bulls.length) {
        for (var eri of er.bulls) {
            var d = p5.Vector.dist(this.pos, eri.pos);
            if (d < this.radius + eri.info.radius) {
                    
                this.collisionEffect(eri, d, true);

                noStroke();
                fill(this.col[0], this.col[1], this.col[2], 60);
                ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);

                if (eri.o) this.radius -= eri.info.radius / 10;

                if (this.radius < 20) {
                    this.end();
                    break;
                }
            }
        }
    }

    if(er.players.length){
        for (var pl of er.players) {
            var d = p5.Vector.dist(this.pos, pl.pos);
            if (d < this.radius + pl.radius) {
                this.collisionEffect(pl, d);
                if(pl.nextPoint) pl.nextPoint = v(pl.pos.x + random(-300, 300), pl.pos.y + random(-300, 300));
            }
        }
    }

    if(er.items.length){
        for (var i of er.items) {
            var d = p5.Vector.dist(this.pos, i.pos);
            if (d < this.radius + i.radius) {
                this.collisionEffect(i, d);
            }
        } 
    }
};

Rock.prototype.collisionEffect = function(obj, distance, calVel) {
    var d = distance || p5.Vector.dist(this.pos, obj.pos);
    var overlap = 0.5 * (d - this.radius - (obj.radius || obj.info.radius));

    obj.pos.x += overlap * (this.pos.x - obj.pos.x) / d;
    obj.pos.y += overlap * (this.pos.y - obj.pos.y) / d;

    if(calVel && obj.info){
        // normal
        var nx = (obj.pos.x - this.pos.x) / d;
        var ny = (obj.pos.y - this.pos.y) / d;

        // tangent
        var tx = -ny;
        var ty = nx;

        // dot product
        var dpTan2 = obj.vel.x * tx + obj.vel.y * ty;

        // new vel
        obj.vel.x = tx * dpTan2 + nx * obj.info.speed * 0.7;
        obj.vel.y = ty * dpTan2 + ny * obj.info.speed * 0.7;

        // obj.vel.setMag(obj.maxSpeed || obj.info.speed);
    }
};

Rock.prototype.end = function() {
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

    ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);
};