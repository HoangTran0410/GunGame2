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
    var er = getObjQuad(['bullet', 'player'], this.pos, this.radius, []);

    if (er.players.length) {
        for (var erp of er.players) {
            if (p5.Vector.dist(this.pos, erp.pos) < this.radius - erp.radius / 2) {
                erp.vel.mult(0.6);
                erp.hide = true;
            }
        }
    }

    if (er.bulls.length) {
        for (var eri of er.bulls) {
            if (p5.Vector.dist(this.pos, eri.pos) < this.radius + eri.info.radius) {

                // active bullets
                eri.end();

                //hight light this tree
                noStroke();
                fill(this.col[0], this.col[1], this.col[2], 60);
                ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);

                // decrease radius
                if (eri.o) this.radius -= eri.info.radius / 2;

                // delete if radius too small
                if (this.radius < 20) {
                    // gun
                    if(random(1) > 0.6){
                        var index = floor(random(getObjectLength(weapons) / 2 - 1));
                        iArr.push(new Item(this.pos.x, this.pos.y, null, this.col, index));
                    }
                    // items
                    for (var i = 0; i < random(5, 10); i++)
                        iArr.push(new Item(this.pos.x + random(-30, 30), this.pos.y + random(-30, 30)));
                    // delete this
                    tArr.splice(tArr.indexOf(this), 1);
                    break;
                }
            }
        }
    }
};

Tree.prototype.show = function() {
    fill(this.col[0], this.col[1], this.col[2], 252);
    // strokeWeight(4);
    // stroke(0, 160, 0);
    noStroke();
    
    ellipse(this.pos.x, this.pos.y, this.radius * 2 + ampLevel * 100, this.radius * 2 + ampLevel * 100);
};