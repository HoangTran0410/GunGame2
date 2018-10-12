function Character(name, x, y, col, health) {
    this.radius = 30;
    this.name = name || RandomName[floor(random(RandomName.length))];
    this.pos = v(x, y);
    this.vel = v(0, 0);
    this.col = col || [random(255), random(255), random(255)];

    this.health = health || random(100, 300);
    this.score = 10;
    this.killed = 0;
    this.maxSpeed = 4;
    this.healthShield = 120;

    this.weaponBox = [0, 1];
    this.weapon = clone(weapons[getValueAtIndex(weapons, this.weaponBox[floor(random(this.weaponBox.length))])]);
    this.weapon.gun = new Gun(this, this.weapon.gun);

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
    this.vel.mult(0.95);
    this.vel.limit(this.maxSpeed);

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
    // if(this == p) addSound('audio/gun_switch_01.mp3', false, 0.7);
};

Character.prototype.changeWeaponTo = function(index) {
    index %= this.weaponBox.length;
    this.weapon = clone(weapons[getValueAtIndex(weapons, this.weaponBox[index])]);
    this.weapon.gun = new Gun(this, this.weapon.gun);
};

Character.prototype.addWeapon = function(indexOfWeapon) {
    var had = false;
    for (var i of this.weaponBox) {
        if (indexOfWeapon == i) {
            had = true;
            break;
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


// Character.prototype.die = function(bull) {
//     // move owner of bullet to this die position
//     var manFire = false;
//     if (bull && bull.o) {
//         bull.o.killed++;
//         bull.o.nextPoint = this.pos.copy();
//         manFire = (bull.o == this) ? false : bull.o;
//     }

//     if (this == p) {
//         addAlertBox('You was killed ' + (manFire ? ('by ' + manFire.name) : 'yourself'), '#f55', '#fff');
//         if (manFire) {
//             addMessage(manFire.name + ' has killed ' + this.name + '.', '', true);
//         } else addMessage(this.name + ' was died.', '', true);

//         addMessage('You Died.', '', true, color(255, 255, 0));

//         p = null;
//         setTimeout(function() {
//             if(!p){
//                 viewport.changeTarget(manFire);
//                 document.getElementById('resetBtn').style.display = 'block';
//             }
//         }, 1500);

//     } else {
//         if (manFire) {
//             addMessage(manFire.name + ' has killed ' + this.name + '.', '', true);
//         } else addMessage(this.name + ' was died.', '', true);

//         if (this == viewport.target) {
//             setTimeout(function() {
//                 if(!p){
//                     viewport.changeTarget(manFire);
//                 }
//             }, 1500);
//         }
//         eArr.splice(eArr.indexOf(this), 1);
//     }

//     // add drop weapon
//     for (var i = 0; i < Math.min(2, this.weaponBox.length); i++) {
//         var index = this.weaponBox[floor(random(this.weaponBox.length))];
//         iArr.push(new Item(this.pos.x, this.pos.y, null, this.col, index));
//     }

//     // add items
//     for (var i = 0; i < random(this.score / 2, this.score); i++) {
//         var len = v(random(-1, 1), random(-1, 1)).setMag(random(this.score * 1.5));
//         var pos = p5.Vector.add(this.pos, len);
//         iArr.push(new Item(pos.x, pos.y, null, this.col));
//     }
// };

// Character.prototype.move = function() {
//     if (keyIsDown(87)) this.vel.add(0, -1); // W
//     if (keyIsDown(83)) this.vel.add(0, 1); // S
//     if (keyIsDown(65)) this.vel.add(-1, 0); // A
//     if (keyIsDown(68)) this.vel.add(1, 0); // D

//     if (keyIsDown(38)) this.vel.add(0, -1); // Up
//     if (keyIsDown(40)) this.vel.add(0, 1); // Down
//     if (keyIsDown(37)) this.vel.add(-1, 0); // Left
//     if (keyIsDown(39)) this.vel.add(1, 0); // Right
// };

// Character.prototype.autoMove = function() {
//     var t = this;
//     if (!t.nextPoint || p5.Vector.dist(t.pos, t.nextPoint) < t.radius) {
//         var items = getItems(t.pos, t.radius + width / 2, false, [], true);

//         if (items.length > 0) {
//             t.nextPoint = items[floor(random(items.length))].pos;

//         } else {
//             var newx = t.pos.x + random(-500, 500);
//             var newy = t.pos.y + random(-500, 500);

//             // collide edge
//             if (newx < t.radius) newx = t.radius;
//             else if (newx > gmap.size.x - t.radius) newx = gmap.size.x - t.radius;

//             if (newy < t.radius) newy = t.radius;
//             else if (newy > gmap.size.y - t.radius) newy = gmap.size.y - t.radius;

//             // set nextPoint
//             t.nextPoint = v(newx, newy);
//         }

//     } else {
//         if (t.vel.mag() < t.maxSpeed / 1.2)
//             t.vel.add((t.nextPoint.x - t.pos.x) / 4, (t.nextPoint.y - t.pos.y) / 4).limit(t.maxSpeed);
//     }
// };

// Character.prototype.autoFire = function() {
//     this.target = null;

//     if (this.health < 30) {
//         this.shield = true;

//     } else {
//         this.shield = false;
//         var r = min(this.radius + width / 2, this.radius + height / 2);

//         var players = getPlayers(this.pos, r + maxSizeNow, [this]);

//         var target;
//         for (var pl of players) {
//             if (!pl.hide) {
//                 var distance = p5.Vector.dist(this.pos, pl.pos);
//                 if (distance < r + pl.radius) {
//                     if (!target) target = pl;
//                 }
//             }
//         }

//         // fill(255, 0, 0, 15);
//         // ellipse(this.pos.x, this.pos.y, (r + maxSizeNow) * 2, (r + maxSizeNow) * 2);

//         if (target) {
//             if (this.health > target.health) {
//                 var r = target.radius + this.radius + 150;
//                 var dir = p5.Vector.sub(this.pos, target.pos);
//                 var pos = target.pos.copy().add(dir.setMag(r));
//                 this.nextPoint = pos;

//             } else {
//                 this.vel.add(p5.Vector.sub(this.pos, target.pos)).setMag(this.maxSpeed);
//             }

//             this.fire(target.pos.copy().add(target.vel.x * 10, target.vel.y * 10));
//             this.target = target.pos;
//         }
//     }
// };