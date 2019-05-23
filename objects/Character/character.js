function Character(name, x, y, col, health, idTeam) {
    this.radius = 30;
    this.name = name || RandomName[floor(random(RandomName.length))];
    this.pos = v(x, y);
    this.vel = v(0, 0);
    this.col = col || [random(255), random(255), random(255)];
    this.idTeam = idTeam;

    this.health = health || random(100, 300);
    this.score = 10;
    this.killed = 0;
    this.maxSpeed = 4;
    this.healthShield = 50;
    this.weaponBox = [];
    this.friction = 0.95;

    this.updateSize();
}

Character.prototype.run = function() {
    // collisionEdge(this, 0.6);
    if(!this.died) {
        this.weapon.gun.update();
        this.update();
        this.eat();
        collisionBullets(this);
    }
    if (insideViewport(this)) {
        this.show(this == p ? fakeToReal(mouseX, mouseY) : this.target);
    }
};

Character.prototype.update = function() {
    this.pos.add(this.vel.copy().mult(60 / (fr + 1)));
    this.vel.mult(this.friction);
    this.vel.limit(this.maxSpeed);
    this.collidePlayer();
    this.updateFric();
    this.updateSpeed();

    if (this.shield) this.makeShield();
    if (this.healthShield < 50) this.healthShield += 0.1 * (30 / (fr + 1));
};

Character.prototype.show = function(lookDir) {

    if(this.died) {

        fill(150, 50);
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.radius * 2);

        stroke("#555b");
        strokeWeight(10);
        var x = this.pos.x;
        var y = this.pos.y;
        var r = this.radius * .7;
        // vẽ chữ x xám
        line(x - r, y - r, x + r, y + r);
        line(x + r, y - r, x - r, y + r);
        
    } else {
        noStroke();
        fill(this.col[0], this.col[1], this.col[2]);

        if (lookDir) {
            drawPlayerWithShape(this, (this.shield ? 'Circle' : 'Pentagon'), p5.Vector.sub(lookDir, this.pos).heading());

        } else {
            drawPlayerWithShape(this, (this.shield ? 'Circle' : 'Pentagon'), this.vel.heading()); // nhìn theo hướng di chuyển
        }

        // show health
        if (!this.hide) fill(200);
        else fill(70);
        textAlign(CENTER);
        text(floor(this.health) + (this.shield ? (' +' + floor(this.healthShield)) : ''), this.pos.x, this.pos.y - this.radius - 10);
    }

    noStroke();
    fill(90);
    text(this.name, this.pos.x, this.pos.y - this.radius - 30);
};

Character.prototype.setMaxspeed = function(value, time) {
    this.maxSpeed = value;
    this.changeSpeedTime = mil + time;
};

Character.prototype.updateSpeed = function() {
    if(this.changeSpeedTime) {
        if(this.changeSpeedTime < mil){
            this.maxSpeed = 4; // back to normal
            this.changeSpeedTime = 0;
        }
    }
};

Character.prototype.setFric = function(fric, time) {
    if(fric <= this.friction || fric > 0.95) {
        this.friction = fric;
        this.fricTime = mil + time;
    }
};

Character.prototype.updateFric = function() {
    if(this.fricTime) {
        if(this.fricTime < mil){
            this.friction = 0.95; // back to normal
            this.fricTime = 0;
        }
    }
};

Character.prototype.collidePlayer = function() {
    var players = getPlayers(this.pos, this.radius + maxSizeNow, [this]);
    if(players.length) {
        for(var pl of players){
            effects.collision(this, pl);
        }
    }
};

Character.prototype.eat = function() {
    var range = new Circle(this.pos.x, this.pos.y, this.radius + 100);
    var itemsInRange = quadItems.query(range);

    for (var i of itemsInRange) {
        i.eatBy(this);
    }
};

Character.prototype.makeShield = function() {
    var radius = 30 + this.healthShield / 2;
    var thisShield = {pos: this.pos, radius: radius};

    var bs = getBullets(this.pos, radius);

    if (bs.length)
        for (var b of bs) {
            if (this.healthShield >= b.info.damage) {

                this.healthShield -= b.info.damage;
                effects.collision(thisShield, b, false, true);

            } else this.healthShield = 0;
            
            if(b.collapseTimes) b.collapseTimes++; // rocket collision
            // b.end();
        }

    strokeWeight(1);
    stroke(70);
    fill(this.col[0], this.col[1], this.col[2], random(30, 50));
    ellipse(this.pos.x, this.pos.y, radius * 2, radius * 2);
};

Character.prototype.updateSize = function() {
    var s = 30 / 100 * this.health;
    if (s > 20 && s < 300) this.radius = s;
    else if(s <= 20) this.radius = 20;
    else if(s >= 300) this.radius = 300;
};

Character.prototype.changeWeapon = function(nextOrPre) {
    var weaponNow = this.weaponBox.indexOf(this.weapon);
    var nextGun = weaponNow + nextOrPre;

    if (nextGun < 0) nextGun = this.weaponBox.length - 1;
    else nextGun = nextGun % this.weaponBox.length;

    this.changeWeaponTo(nextGun);
};

Character.prototype.changeWeaponTo = function(index) {
    index %= this.weaponBox.length;
    this.weapon = this.weaponBox[index];
};

Character.prototype.addWeapon = function(nameWeapon) {
    var had = false;
    if(this.weaponBox.length) {
        for (var i of this.weaponBox) {
            if (nameWeapon == i.name) {
                had = true;
                break;
            }
        }
    }

    if (!had) {
        var newWeapon = clone(weapons[nameWeapon]);
        // newWeapon.gun = new Gun(this, newWeapon.gun);
        newWeapon.gun = new Gun(this, newWeapon.gunInfo);

        if(this.weaponBox.length < 4) {
            this.weaponBox.push(newWeapon);
            this.changeWeaponTo(this.weaponBox.length - 1);
        
        } else {
            var nameGun = this.weaponBox[this.weaponBox.indexOf(this.weapon)].name;
            
            // get gun
            var index = this.weaponBox.indexOf(this.weapon);
            this.weaponBox[index] = newWeapon;
            this.weapon = this.weaponBox[index];

            // drop old gun
            var gunDrop = new Item(this.pos.x, this.pos.y, null, this.col, nameGun);
                gunDrop.vel = v(random(-1, 1), random(-1, 1)).setMag(5);
            iArr.push(gunDrop);
        }
    } else {
        for(var i of this.weaponBox) {
            if(i.name == nameWeapon) {
                i.gun.bullsLeft = i.gun.info.maxBulls;
                break;
            }
        }
    }
};

// ========== Shape Database =============
function drawPlayerWithShape(t, shape, angle) {
    switch (shape) {
        case 'Circle':
            push();
            translate(t.pos.x, t.pos.y);
            rotate(angle);

            fill(t.col);
            ellipse(0, 0, t.radius * 2, t.radius * 2);
            fill(0);
            ellipse(t.radius / 2, 0, t.radius, t.radius / 1.5 * 2);

            pop();
            break;

        case 'Pentagon':
            push();
            translate(t.pos.x, t.pos.y);

            var heading = t.vel.heading();

            // body
            strokeWeight(1);
            rotate(heading);
            stroke(255, 180);
            fill(t.col);
            polygon(0, 0, t.radius, 5);

            // head
            stroke(30);
            strokeWeight(t.radius / 2);
            point(t.radius / 3 * 2, 0);

            // gun			
            fill(0, 200);
            stroke(150);
            strokeWeight(2);

            rotate(angle - heading);
            rect(t.radius / 2, 0, t.radius / 1.5 * 2, t.radius * 0.4);

            fill(0);
            ellipse(0, 0, t.radius / 3 * 2, t.radius / 3 * 2);

            pop();
            break;
    }
}

