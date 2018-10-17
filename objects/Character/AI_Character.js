function AICharacter(name, x, y, col, health, idTeam) {
    Character.call(this, name, x, y, col, health, idTeam);

    this.weaponBox = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    this.changeWeaponTo(floor(random(this.weaponBox.length)));
}

AICharacter.prototype = Object.create(Character.prototype);
AICharacter.prototype.constructor = AICharacter;

AICharacter.prototype.update = function() {
    collisionEdge(this, 0.6);
    Character.prototype.update.call(this);

    if(this != viewport.target && this.idTeam == viewport.target.idTeam) {
        stroke(0, 255, 0);
        strokeWeight(3);
        noFill();
        ellipse(this.pos.x, this.pos.y, this.radius * 2 + 30);
    }

    // if(this == getLeader(this.idTeam)){
    //     stroke(255, 255, 0);
    //     strokeWeight(3);
    //     noFill();
    //     ellipse(this.pos.x, this.pos.y, this.radius * 2 + 30);
    // }
};

AICharacter.prototype.eat = function(first_argument) {
    var range = new Circle(this.pos.x, this.pos.y, this.radius + 100);
    var itemsInRange = quadItems.query(range);

    for (var i of itemsInRange) {
        i.autoEat = true;
        i.eatBy(this);
    }
};

AICharacter.prototype.move = function() {
    var t = this;
    this.followLeader();

    if (!t.nextPoint || p5.Vector.dist(t.pos, t.nextPoint) < t.radius 
        || !isInside(t.nextPoint, v(gmap.size.x/2, gmap.size.y/2), v(gmap.size.x, gmap.size.y))) {
        
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
                if(this.idTeam && pl.idTeam != this.idTeam) {
                    var distance = p5.Vector.dist(this.pos, pl.pos);
                    if (distance < r + pl.radius) {
                        if (!target) target = pl;
                    }
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

    // alert
    if(p && this.team == p.team) {
        addAlertBox('"' + this.name + '"' + " in your Team died.");
    }

    // change leader
    if(this == teams[this.idTeam].leader) {
        changeLeader(this.idTeam);
    }

    eArr.splice(eArr.indexOf(this), 1);

    // add drop weapon
    for (var i = 0; i < Math.min(2, this.weaponBox.length); i++) {
        var index = getValueAtIndex(weapons, this.weaponBox[floor(random(this.weaponBox.length))]);
        iArr.push(new Item(this.pos.x, this.pos.y, null, this.col, index));
    }

    // add items
    for (var i = 0; i < random(this.score / 2, this.score); i++) {
        var len = v(random(-1, 1), random(-1, 1)).setMag(random(this.score * 1.5));
        var pos = p5.Vector.add(this.pos, len);
        iArr.push(new Item(pos.x, pos.y, null, this.col));
    }

    // check win
    if(p) {
        if(!eArr.length){
            addAlertBox("Congratulations .You Won this match", '#5f5', '#000');
            addMessage(pname + ' Win', 'Server', true, color(pcol[0], pcol[1], pcol[2]));
            menuWhenDie("open");
        }

    } else if(eArr.length == 1) {
        var c = eArr[0].col;
        addAlertBox(eArr[0].name+ " Won this match", '#5f5', '#000');
        addMessage(eArr[0].name + ' Win', 'Server', true, color(c[0], c[1], c[2]));
    }
};

AICharacter.prototype.followLeader = function() {
    // follow team
    var leaderID = teams[this.idTeam].leader;
    var leader = teams[this.idTeam].teamate[ leaderID ];
    if(p5.Vector.dist(this.pos, leader.pos) > 1000) 
        this.nextPoint = leader.pos.copy();
};