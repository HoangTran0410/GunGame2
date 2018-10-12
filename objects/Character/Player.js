function Player(name, x, y, col, health) {
    Character.call(this, name, x, y, col, health);
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

    // speed up when out of map
    if (this.pos.x < this.radius / 2 || this.pos.y < this.radius / 2 ||
        this.pos.x > gmap.size.x - this.radius / 2 || this.pos.y > gmap.size.y - this.radius / 2) {
        noStroke();
        this.maxSpeed = 25;

        hiding_info();

        var mvel = this.vel.mag();

        if (mvel > this.maxSpeed * 0.75) {
            if(random() > 0.7){
                effects.smoke(this.pos.x, this.pos.y, 2, 500, this.radius / 3, random(-this.radius, this.radius));
                
                if(this.shield && this.healthShield > 0)
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

        fill(255, 10, 10, mvel * 4);
        ellipse(this.pos.x, this.pos.y, this.radius * 2 + random(10, 30), this.radius * 2 + random(10, 30));


    } else this.maxSpeed = 5;
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

Player.prototype.changeWeapon = function(nextOrPre) {
    Character.prototype.changeWeapon.call(this, nextOrPre);
    addSound('audio/gun_switch_01.mp3', false, 0.7);
};

Player.prototype.addWeapon = function(indexOfWeapon) {
    Character.prototype.addWeapon.call(this, indexOfWeapon);
    addSound('audio/chest_pickup_01.mp3');
}

Player.prototype.die = function(bull) {
    var manFire = false;
    if (bull && bull.o) {
        bull.o.killed++;
        bull.o.nextPoint = this.pos.copy();
        manFire = (bull.o == this) ? false : bull.o;
    }

    addAlertBox('You was killed ' + (manFire ? ('by ' + manFire.name) : 'yourself'), '#f55', '#fff');
    if (manFire) {
        addMessage(manFire.name + ' has killed ' + this.name + '.', '', true);
    } else addMessage(this.name + ' was died.', '', true);

    addMessage('You was killed ' + (manFire ? ('by ' + manFire.name) : 'yourself'), '', true, color(255, 255, 0));

    p = null;
    setTimeout(function() {
        if (!p) {
            viewport.changeTarget(manFire);
            document.getElementById('resetBtn').style.display = 'block';
        }
    }, 1500);

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