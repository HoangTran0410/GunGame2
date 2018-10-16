function Character(name, x, y, col, health, idteam) {
    this.radius = 30;
    this.name = name || RandomName[floor(random(RandomName.length))];
    this.pos = v(x, y);
    this.vel = v(0, 0);
    this.col = col || [random(255), random(255), random(255)];

    this.team = idteam;

    this.health = health || random(100, 300);
    this.score = 10;
    this.killed = 0;
    this.maxSpeed = 4;
    this.healthShield = 120;

    this.weaponBox = [];

    this.updateSize();
}

Character.prototype.run = function() {
    // collisionEdge(this, 0.6);
    this.weapon.gun.update();
    this.update();
    this.eat();
    if (insideViewport(this)) this.show(this == p ? fakeToReal(mouseX, mouseY) : this.target);
    collisionBullets(this);
};

Character.prototype.update = function() {
    this.pos.add(this.vel.copy().mult(60 / (fr + 1)));
    this.vel.mult(this.slowDown?0.75:0.95);
    this.vel.limit(this.maxSpeed);
    this.slowDown = false; // reset slowdown

    if (this.shield) this.makeShield();
    if (this.healthShield < 120) this.healthShield += 0.1 * (30 / (fr + 1));
};

Character.prototype.show = function(lookDir) {
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
    fill(90);
    text(this.name, this.pos.x, this.pos.y - this.radius - 30);
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
    var bs = getBullets(this.pos, radius);

    if (bs.length)
        for (var b of bs) {
            var d = p5.Vector.dist(this.pos, b.pos);
            if (d < 30 + this.healthShield / 2 + b.info.radius) {
                if (this.healthShield >= b.info.damage) {
                    this.healthShield -= b.info.damage;
                    effects.collision({
                        pos: this.pos,
                        radius: radius
                    }, b, d, true);
                } else this.shield = false;
                // b.end();
            }
        }

    // noStroke();
    strokeWeight(1);
    stroke(70);
    fill(this.col[0], this.col[1], this.col[2], random(30, 50));
    ellipse(this.pos.x, this.pos.y, radius * 2, radius * 2);
};

Character.prototype.fireTo = function(target) {
    if (!this.shield) {
        if (this.weapon.gun.bullsLeft == 0 && this != p)
            this.changeWeapon(1);
        this.weapon.gun.fire(target);
    }
};

Character.prototype.updateSize = function() {
    var s = 30 / 100 * this.health;
    if (s > 20 && s < 600) this.radius = s;
};

Character.prototype.changeWeapon = function(nextOrPre) {
    var weaponNow = this.weaponBox.indexOf(getObjectIndex(weapons, this.weapon.name));
    var nextGun = weaponNow + nextOrPre;

    if (nextGun < 0) nextGun = this.weaponBox.length - 1;
    else nextGun = nextGun % this.weaponBox.length;

    this.changeWeaponTo(nextGun);
};

Character.prototype.changeWeaponTo = function(index) {
    index %= this.weaponBox.length;
    this.weapon = clone(weapons[getValueAtIndex(weapons, this.weaponBox[index])]);
    this.weapon.gun = new Gun(this, this.weapon.gun);
};

Character.prototype.addWeapon = function(nameWeapon) {
    var had = false;
    var indexOfWeapon = getObjectIndex(weapons, nameWeapon);
    if(this.weaponBox.length) {
        for (var i of this.weaponBox) {
            if (indexOfWeapon == i) {
                had = true;
                break;
            }
        }
    }

    if (!had) {
        this.weaponBox.push(indexOfWeapon);
        this.changeWeaponTo(this.weaponBox.length - 1);
    }
};

Character.prototype.pickWeapon = function() {
    var items = getItems(this.pos, this.radius + 100);
    if (items.length) {
        var index = 0;
        var nearest = p5.Vector.dist(items[0].pos, this.pos);
        for (var i = 1; i < items.length; i++) {
            var d = p5.Vector.dist(items[i].pos, this.pos);
            if (d < nearest) {
                nearest = d;
                index = i;
            }
        }
        items[index].autoEat = true;
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

