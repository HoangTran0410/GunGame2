function AICharacter(name, x, y, col, health, idTeam) {
    Character.call(this, name, x, y, col, health, idTeam);

    this.weaponBox = [];

    for(var i = 0; i < 4; i++) {
        var len = getObjectLength(weapons);
        this.addWeapon(getValueAtIndex(weapons, floor(random(len))));
    }
    this.changeWeaponTo(floor(random(this.weaponBox.length)));
}

AICharacter.prototype = Object.create(Character.prototype);
AICharacter.prototype.constructor = AICharacter;

AICharacter.prototype.update = function() {
    Character.prototype.update.call(this);
    collisionEdge(this, 0.6);
    if(team > 1){
        // hightlight player same team with this
        if(this.idTeam == viewport.target.idTeam) {
            if(this != viewport.target) {
                stroke(0, 255, 0);
                strokeWeight(3);
                noFill();
                ellipse(this.pos.x, this.pos.y, this.radius * 2 + 30);
            }

            stroke(150, 30);
            strokeWeight(2);
            line(this.pos.x, this.pos.y, viewport.target.pos.x, viewport.target.pos.y);
        }
    }
};

AICharacter.prototype.eat = function(first_argument) {
    var range = new Circle(this.pos.x, this.pos.y, this.radius + 100);
    var itemsInRange = quadItems.query(range);

    for (var i of itemsInRange) {
        i.eatBy(this);
        if(i.namGun && p5.Vector.dist(this.pos, i.pos) < 60) {
            iArr.splice(iArr.indexOf(i), 1);
            this.addWeapon(i.nameGun);
        }
    }
};

AICharacter.prototype.move = function() {
    if(team > 1) this.followLeader();

    if (!this.nextPoint || p5.Vector.dist(this.pos, this.nextPoint) < this.radius 
        || !isInside(this.nextPoint, v(gmap.size.x/2, gmap.size.y/2), 
            v(gmap.size.x - this.radius*3, gmap.size.y - this.radius*3))) {
        
        var items = getItems(this.pos, this.radius + height / 2, false, [], true);

        if (items.length > 0) {
            this.nextPoint = items[floor(random(items.length))].pos;

        } else {
            var newx = this.pos.x + random(-500, 500);
            var newy = this.pos.y + random(-500, 500);

            // set nextPoint
            this.nextPoint = v(newx, newy);
        }

    } else {
        if (this.vel.mag() < this.maxSpeed / 1.2)
            this.vel.add((this.nextPoint.x - this.pos.x) / 4, (this.nextPoint.y - this.pos.y) / 4).limit(this.maxSpeed);
        this.vel.mult(this.friction);
    }
};

AICharacter.prototype.fireTo = function(target) {
    if (!this.shield) {
        if (this.weapon.gun.bullsLeft == 0)
            if(random(1) > 0.3)
                this.changeWeapon(1);
        this.weapon.gun.fire(target);
    }
};

AICharacter.prototype.fire = function() {
    this.target = null;

    if(this.hide) {}
    else {
        var r = min(this.radius + width / 2, this.radius + height / 2);

        var players = getPlayers(this.pos, r + maxSizeNow, [this]);

        var target;
        var mindis;
        for (var pl of players) {
            if (!pl.hide) {
                if(this.idTeam && pl.idTeam != this.idTeam) {
                    var distance = p5.Vector.dist(this.pos, pl.pos);
                    if (distance < r + pl.radius) {
                        if(!mindis || distance < mindis){
                            mindis = distance;
                            target = pl;
                        }
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
                this.shield = false;

            } else {
                if(this.health < 25) this.shield = true;
                if(!this.nextPoint) 
                    this.nextPoint = target.pos.copy().add(random(-500, 500), random(-500, 500));
            }

            this.target = target.pos;
            this.fireTo(target.pos.copy());
        
        } else if(this.health < 25) {
            this.shield = true;
        
        } else this.shield = false;
    }
};

AICharacter.prototype.die = function(bull) {
    var manFire = false;
    if (bull && bull.o) {
        if(bull.o.idTeam != this.idTeam) bull.o.killed++;
        bull.o.nextPoint = this.pos.copy();
        bull.o.setMaxspeed(7, 2000);
        manFire = (bull.o == this) ? false : bull.o;
    }

    if (manFire) {
        addMessage(manFire.name + ' has killed ' + this.name + '.', '', true);
        notifi.push(new Notification(manFire.name + ' has killed ' + this.name + '.', 20, [255, 200, 0], 5000));
    } else {
        addMessage(this.name + ' was died.', '', true);
        notifi.push(new Notification(this.name + ' was died.', 20, null, 5000));
    }

    if (this == viewport.target) {
        setTimeout(function() {
            if (!p) {
                viewport.changeTarget(manFire);
            }
        }, 1500);
    }

    // alert if this in p team
    if(!p.died && this.idTeam == p.idTeam) {
        addAlertBox('"' + this.name + '"' + " in your Team was died.", '#f55', '#fff');
    }

    // change leader
    if(team > 1)
    if(this == getLeader(this.idTeam)) {
        teams[this.idTeam].teamate.splice(teams[this.idTeam].leader, 1);
        changeLeader(this.idTeam);
    }

    // delete this
    // autoChat(random(['fuck', 'no', 'please', 'wow', 'haha', 'lol', 'why', 'died', 'hate you', 'go away']), this);
    // eArr.splice(eArr.indexOf(this), 1);
    this.died = true;

    // add drop weapon
    for (var i = 0; i < 2; i++) {
        var randomIndex = floor(random(this.weaponBox.length));
        var nameWeapon = this.weaponBox[randomIndex].name;
        iArr.push(new Item(this.pos.x, this.pos.y, null, this.col, nameWeapon));
    }

    // add items
    for (var i = 0; i < random(this.score / 2, this.score); i++) {
        var len = v(random(-1, 1), random(-1, 1)).setMag(random(this.score * 1.5));
        var pos = p5.Vector.add(this.pos, len);
        iArr.push(new Item(pos.x, pos.y, null, this.col));
    }

    // check win
    if(getPlayerLife() == 1){
        if(!p.died) {
            addAlertBox("Congratulations .You Won this match", '#5f5', '#000');
            var pcol = hexToRgb(document.getElementById('pickColor').value)
            addMessage(pname + ' Win', 'Server', true, color(pcol.r, pcol.g, pcol.b));
            menuWhenDie("open");
            
        } else if(eArr.length == 1) {
            var c = eArr[0].col;
            addAlertBox(eArr[0].name+ " Won this match", '#5f5', '#000');
            addMessage(eArr[0].name + ' Win', 'Server', true, color(c[0], c[1], c[2]));
        }
    }
};

AICharacter.prototype.followLeader = function() {
    var leader = getLeader(this.idTeam);
    if(leader && p5.Vector.dist(this.pos, leader.pos) > 2000) 
        this.nextPoint = leader.pos.copy().add(random(-500, 500), random(-500, 500));
};
