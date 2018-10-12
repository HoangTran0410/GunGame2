function AICharacter(name, x, y, col, health) {
    Character.call(this, name, x, y, col, health);
}

AICharacter.prototype = Object.create(Character.prototype);
AICharacter.prototype.constructor = AICharacter;

AICharacter.prototype.update = function() {
    collisionEdge(this, 0.6);
    Character.prototype.update.call(this);
};

AICharacter.prototype.move = function() {
    var t = this;
    if (!t.nextPoint || p5.Vector.dist(t.pos, t.nextPoint) < t.radius) {
        var items = getItems(t.pos, t.radius + width / 2, false, [], true);

        if (items.length > 0) {
            t.nextPoint = items[floor(random(items.length))].pos;

        } else {
            var newx = t.pos.x + random(-500, 500);
            var newy = t.pos.y + random(-500, 500);

            // collide edge
            if (newx < t.radius) newx = t.radius;
            else if (newx > gmap.size.x - t.radius) newx = gmap.size.x - t.radius;

            if (newy < t.radius) newy = t.radius;
            else if (newy > gmap.size.y - t.radius) newy = gmap.size.y - t.radius;

            // set nextPoint
            t.nextPoint = v(newx, newy);
        }

    } else {
        if (t.vel.mag() < t.maxSpeed / 1.2)
            t.vel.add((t.nextPoint.x - t.pos.x) / 4, (t.nextPoint.y - t.pos.y) / 4).limit(t.maxSpeed);
    }
};

AICharacter.prototype.fire = function() {
    this.target = null;

    if (this.health < 30) {
        this.shield = true;

    } else {
        this.shield = false;
        var r = min(this.radius + width / 2, this.radius + height / 2);

        var players = getPlayers(this.pos, r + maxSizeNow, [this]);

        var target;
        for (var pl of players) {
            if (!pl.hide) {
                var distance = p5.Vector.dist(this.pos, pl.pos);
                if (distance < r + pl.radius) {
                    if (!target) target = pl;
                }
            }
        }

        // fill(255, 0, 0, 15);
        // ellipse(this.pos.x, this.pos.y, (r + maxSizeNow) * 2, (r + maxSizeNow) * 2);

        if (target) {
            if (this.health > target.health) {
                var r = target.radius + this.radius + 150;
                var dir = p5.Vector.sub(this.pos, target.pos);
                var pos = target.pos.copy().add(dir.setMag(r));
                this.nextPoint = pos;

            } else {
                this.vel.add(p5.Vector.sub(this.pos, target.pos)).setMag(this.maxSpeed);
            }

            this.fireTo(target.pos.copy().add(target.vel.x * 10, target.vel.y * 10));
            this.target = target.pos;
        }
    }
};

AICharacter.prototype.die = function(bull) {
    var manFire = false;
    if (bull && bull.o) {
        bull.o.killed++;
        bull.o.nextPoint = this.pos.copy();
        manFire = (bull.o == this) ? false : bull.o;
    }

    if (manFire) {
        addMessage(manFire.name + ' has killed ' + this.name + '.', '', true);
    } else addMessage(this.name + ' was died.', '', true);

    if (this == viewport.target) {
        setTimeout(function() {
            if (!p) {
                viewport.changeTarget(manFire);
            }
        }, 1500);
    }
    eArr.splice(eArr.indexOf(this), 1);

    // add drop weapon
    for (var i = 0; i < Math.min(2, this.weaponBox.length); i++) {
        var index = this.weaponBox[floor(random(this.weaponBox.length))];
        iArr.push(new Item(this.pos.x, this.pos.y, null, this.col, index));
    }

    // add items
    for (var i = 0; i < random(this.score / 2, this.score); i++) {
        var len = v(random(-1, 1), random(-1, 1)).setMag(random(this.score * 1.5));
        var pos = p5.Vector.add(this.pos, len);
        iArr.push(new Item(pos.x, pos.y, null, this.col));
    }
};