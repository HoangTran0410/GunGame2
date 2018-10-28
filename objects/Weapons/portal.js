function Portal(inOrOut, x, y, connectWith, radius, life, owner) {
    this.o = owner;
    this.type = inOrOut;
    this.pos = v(x, y);
    this.radius = radius || 100;
    this.connectWith = connectWith;

    this.life = life || 10;
    this.born = mil;
    this.times = 0; // so lan dich chuyen

    this.grow = [];
    this.grow[0] = this.radius;
    this.grow[1] = this.radius / 2;
}

Portal.prototype.update = function() {
    if (this.type == 'in' && this.connectWith) {
        var objInside = effects.force('in', ['player', 'item', 'bullet'], this.pos, this.radius, []);

        if (this.connectWith) {
            for (var obj of objInside.all) {
                if (p5.Vector.dist(this.pos, obj.pos) < (obj.radius || obj.info.radius)) {
                    obj.pos = this.connectWith.pos.copy();
                    if(!obj.info) { // is player
                        this.times++;
                    }
                    if(obj == p) addSound('audio/punch_swing_01.mp3');
                }
            }
        }
    }
};

Portal.prototype.run = function() {
    this.update();
    if (insideViewport(this)) this.show();
    return this.end();
};

Portal.prototype.end = function() {
    if ((mil - this.born) / 1000 > this.life || this.times > 5) {
        for (var i = 0; i < pArr.length; i++) {
            var pi = pArr[i];
            if (this == pi.inGate || this == pi.outGate) {
                pArr.splice(i, 1);
                return true;
            }
        }
    }
    return false;
};

Portal.prototype.show = function() {
    noStroke();
    if (this.type == 'in') fill(64, 121, 196, 50);
    else if (this.type == 'out') fill(232, 165, 71, 50);

    ellipse(this.pos.x, this.pos.y, this.radius * 1.5, this.radius * 2);

    // update grows
    for (var i = 0; i < this.grow.length; i++) {
        if (this.type == 'in' && this.connectWith) {
            this.grow[i] -= (60 / (fr + 1)) + random(-1, 1);
            if (this.grow[i] < 0) this.grow[i] = this.radius;

        } else if (this.type == 'out') {
            this.grow[i] += (60 / (fr + 1)) + random(-1, 1);
            if (this.grow[i] > this.radius) this.grow[i] = 0;
        }
    }

    // stroke(255, 50);
    for (var i = 0; i < this.grow.length; i++)
        ellipse(this.pos.x, this.pos.y, this.grow[i] * 1.5, this.grow[i] * 2);
};