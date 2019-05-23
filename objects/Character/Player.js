function Player(name, x, y, col, health, idTeam) {
    Character.call(this, name, x, y, col, health, idTeam);

    this.weaponBox = [];
    for(var i = 0; i < 2; i++) {
        this.addWeapon(getValueAtIndex(weapons, i), true);
    }
    this.changeWeaponTo(0);
}

Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function() {
    Character.prototype.update.call(this);

    if ((this.sLen || 151) > 150) {
        this.sLen = 1;
        addSound('audio/footstep_sand_01.mp3');
    }
    this.sLen += this.vel.copy().mult(60 / (fr + 1)).mag();
};

Player.prototype.show = function(lookDir) {
    Character.prototype.show.call(this, lookDir);

    if(this.died) return;

    // speed up when out of map
    if(this.killed >= 1){
        if (this.pos.x < this.radius / 2 || this.pos.y < this.radius / 2 ||
            this.pos.x > gmap.size.x - this.radius / 2 || this.pos.y > gmap.size.y - this.radius / 2) {

            this.maxSpeed = 25;
            hiding_info();
            noStroke();

            var mvel = this.vel.mag();
            if (mvel > this.maxSpeed * 0.75) {
                if (random() > 0.7) {
                    effects.smoke(this.pos.x, this.pos.y, 2, 500, this.radius / 3, random(-this.radius, this.radius));

                    if (this.shield && this.healthShield > 2)
                        this.healthShield -= 2;

                    else {
                        this.health -= 0.5;
                        if (this.health <= 0) {
                            collisionEdge(this, 0);
                            this.die();
                        }
                        this.updateSize();
                    }
                }
                fill(255, 50, 0, 150);
                text("Warning !! Too fast. Losing health.", this.pos.x, this.pos.y + this.radius + 50);

            } else {
                fill(255, 255, 0, 150);
                text("This's not a Bug, This is the Future.", this.pos.x, this.pos.y + this.radius + 50);

                fill(255, 200, 0, 70);
                text("There is something out here, Find it.", this.pos.x, this.pos.y + this.radius + 75);
                text("Press B to come back.", this.pos.x, this.pos.y + this.radius + 100);
            }

            fill(150, 10, 10, map(mvel, 0, this.maxSpeed, 0, 150));
            ellipse(this.pos.x, this.pos.y, this.radius * 2 + random(10, 30), this.radius * 2 + random(10, 30));

            // loop map
            if (this.pos.x > gmap.size.x * 1.5) {
                createWorld();
                addAICharacter();
                this.pos.x = -gmap.size.x * 0.5;
            } else if (this.pos.x < -gmap.size.x * 0.5) {
                createWorld();
                addAICharacter();
                this.pos.x = gmap.size.x * 1.5;
            }

            if (this.pos.y > gmap.size.y * 1.5) {
                createWorld();
                addAICharacter();
                this.pos.y = -gmap.size.y * 0.5;
            } else if (this.pos.y < -gmap.size.y * 0.5) {
                createWorld();
                addAICharacter();
                this.pos.y = gmap.size.y * 1.5;
            }

            if (viewport.follow && viewport.target == this)
                viewport.pos = this.pos.copy();

        } else {
            this.maxSpeed = 5;
        }
    
    } else collisionEdge(this, 0.6);
};

Player.prototype.move = function() {
    if (keyIsDown(87)) this.vel.add(0, -1); // W
    if (keyIsDown(83)) this.vel.add(0, 1); // S
    if (keyIsDown(65)) this.vel.add(-1, 0); // A
    if (keyIsDown(68)) this.vel.add(1, 0); // D

    if (keyIsDown(38)) this.vel.add(0, -1); // Up
    if (keyIsDown(40)) this.vel.add(0, 1); // Down
    if (keyIsDown(37)) this.vel.add(-1, 0); // Left
    if (keyIsDown(39)) this.vel.add(1, 0); // Right
};

Player.prototype.eat = function() {
    var range = new Circle(this.pos.x, this.pos.y, this.radius + 100);
    var itemsInRange = quadItems.query(range);

    this.nearGun = null;
    var showF = false, 
        mindis = this.radius + 50;

    for (var i of itemsInRange) {
        i.eatBy(this);
        if(i.nameGun && p5.Vector.dist(this.pos, i.pos) < mindis) {
            mindis = p5.Vector.dist(this.pos, i.pos);
            this.nearGun = i;
            showF = true;
        }
    }

    if(showF) {
        noStroke();
        fill(150);
        text("F : " + this.nearGun.nameGun, this.pos.x, this.pos.y + this.radius + 30);

        fill(150, 30);
        stroke(this.nearGun.col[0], this.nearGun.col[1], this.nearGun.col[2]);
        ellipse(this.nearGun.pos.x, this.nearGun.pos.y, 40);
    }
};

Player.prototype.fireTo = function(target) {
    if (!this.shield) {
        this.weapon.gun.fire(target);
    }
};

Player.prototype.pickWeapon = function() {
    if(this.nearGun) {
        iArr.splice(iArr.indexOf(this.nearGun), 1);
        this.addWeapon(this.nearGun.nameGun);
    } 
};

Player.prototype.changeWeapon = function(nextOrPre) {
    Character.prototype.changeWeapon.call(this, nextOrPre);
    addSound('audio/gun_switch_01.mp3', false, 0.7);
};

Player.prototype.addWeapon = function(nameWeapon, withoutSound) {
    Character.prototype.addWeapon.call(this, nameWeapon)

    if (!withoutSound) addSound('audio/chest_pickup_01.mp3');
}

Player.prototype.die = function(bull) {
    var manFire = false;
    if (bull && bull.o) {
        if(bull.o.idTeam != this.idTeam) bull.o.killed++;
        bull.o.nextPoint = this.pos.copy();
        manFire = (bull.o == this) ? false : bull.o;
    }

    addAlertBox('You was killed ' + (manFire ? ('by ' + manFire.name) : 'yourself'), '#f55', '#fff');
    if (manFire) {
        addMessage(manFire.name + ' has killed ' + this.name + '.', '', true);
    } else addMessage(this.name + ' was died.', '', true);

    addMessage('You was killed ' + (manFire ? ('by ' + manFire.name) : 'yourself'), '', true, color(255, 255, 0));

    this.died = true;
    setTimeout(function() {
        if (p.died) {
            viewport.changeTarget(manFire);
            menuWhenDie("open", true);
        }
    }, 1500);

    // change leader
    if(team > 1)
    if(this == getLeader(this.idTeam)) {
        teams[this.idTeam].teamate.splice(teams[this.idTeam].leader, 1);
        changeLeader(this.idTeam);
    }

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
};