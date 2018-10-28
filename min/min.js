function Point(x, y) {
    this.x = x;
    this.y = y;
    this.col = color(random(255), random(255), random(255));

    this.update = function() {
        this.x = this.x + random(-1, 1);
        this.y = this.y + random(-1, 1);
        if (this.x > width) this.x = 1;
        else if (this.x < 0) this.x = width - 1;
        if (this.y > height) this.y = 1;
        else if (this.y < 0) this.y = height - 1;
    }

    this.show = function() {
        point(this.x, this.y);
    }
}

function Rectangle(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    // Return true if this rectangle contains point
    this.contains = function(point) {
        return (point.pos.x >= this.x - this.w / 2 &&
            point.pos.x <= this.x + this.w / 2 &&
            point.pos.y > this.y - this.h / 2 &&
            point.pos.y < this.y + this.h / 2);
    }

    // Return true if this rectangle overlap range
    this.intersects = function(range) {
        return !(range.x + range.w / 2 < this.x - this.w / 2 ||
            range.y + range.h / 2 < this.y - this.h / 2 ||
            range.x - range.w / 2 > this.x + this.w / 2 ||
            range.y - range.h / 2 > this.y + this.h / 2);
    }
}

function Circle(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;

    this.contains = function(point) {
        return (dist(point.pos.x, point.pos.y, this.x, this.y) < this.r);
    }

    this.intersects = function(range) {
        var xDist = Math.abs(range.x - this.x);
        var yDist = Math.abs(range.y - this.y);

        // radius of the circle
        var r = this.r;
        var w = range.w;
        var h = range.h;

        var edges = dist(xDist, yDist, w, h);

        // no intersection
        if (xDist > (r + w) || yDist > (r + h))
            return false;

        // intersection within the circle
        if (xDist <= w || yDist <= h)
            return true;

        // intersection on the edge of the circle
        return edges <= this.rSquared;
    }
}

function QuadTree(boundary, capacity) {
    /*Axis-aligned bounding box stored as a center with half-dimensions
  	 to represent the boundaries of this quad tree*/
    this.boundary = boundary;
    // Arbitrary constant to indicate how many elements can be stored in this quad tree
    this.capacity = capacity;
    // Points in this quad tree
    this.points = [];
    // This Quad tree is already have children ?
    this.divided = false;
}

// Create children for this Quad tree
QuadTree.prototype.subdivice = function() {
    var x = this.boundary.x;
    var y = this.boundary.y;
    var w = this.boundary.w / 2;
    var h = this.boundary.h / 2;
    // Create boundary for all four children
    var tl = new Rectangle(x - w / 2, y - h / 2, w, h);
    var tr = new Rectangle(x + w / 2, y - h / 2, w, h);
    var bl = new Rectangle(x - w / 2, y + h / 2, w, h);
    var br = new Rectangle(x + w / 2, y + h / 2, w, h);
    // Children
    this.topLeft = new QuadTree(tl, this.capacity);
    this.topRight = new QuadTree(tr, this.capacity);
    this.botLeft = new QuadTree(bl, this.capacity);
    this.botRight = new QuadTree(br, this.capacity);

    this.divided = true;
};

// Insert a point into the QuadTree
QuadTree.prototype.insert = function(newPoint) {
    // Ignore objects that do not belong in this quad tree
    if (!this.boundary.contains(newPoint)) {
        return false;
    }
    // If there is space in this quad tree, add the object here
    if (this.points.length < this.capacity) {
        this.points.push(newPoint);
        return true;
    }
    /* Otherwise, subdivide and then add the point 
    to whichever node will accept it*/
    if (!this.divided) {
        this.subdivice();
    }

    if (this.topLeft.insert(newPoint) || this.topRight.insert(newPoint) ||
        this.botLeft.insert(newPoint) || this.botRight.insert(newPoint)) {
        return true;
    }

    /* Otherwise, the point cannot be inserted for some 
    	unknown reason (this should never happen)*/
    return false;
};

// Find all points that inside range
QuadTree.prototype.query = function(range, pointInRange, returnOneValue) {
    // Prepare an array of results
    if (!pointInRange) {
        pointInRange = [];
    }
    // Automatically abort if the range does not intersect this quad
    if (!range.intersects(this.boundary)) {
        return pointInRange;
    }
    // Check objects at this quad level
    for (var i = 0; i < this.points.length; i++) {
        if (range.contains(this.points[i])) {
            pointInRange.push(this.points[i]);
            if (returnOneValue) {
                return pointInRange;
            }
        }
    }
    // Add the points from the children if there are already have children
    if (this.divided) {
        this.topLeft.query(range, pointInRange);
        this.topRight.query(range, pointInRange);
        this.botLeft.query(range, pointInRange);
        this.botRight.query(range, pointInRange);
    }

    return pointInRange;
};

QuadTree.prototype.clear = function() {
    this.points = [];

    if (this.divided) {
        this.topLeft.clear();
        this.topRight.clear();
        this.botLeft.clear();
        this.topRight.clear();
    }

    this.divided = false;
};

QuadTree.prototype.show = function(showWhat) {
    if (showWhat != 'points at mouse') {
        stroke(100);
        if (showWhat == 'points' || showWhat == 'grid+points') {
            strokeWeight(4);
            for (var i = 0; i < this.points.length; i++) {
                this.points[i].show();
            }
        }

        if (showWhat == 'grid' || showWhat == 'grid+points') {
            noFill();
            if (this.points.length > 0) {
                stroke(255);
                strokeWeight(2);
            } else strokeWeight(1);
            var newPos = realToFake(this.boundary.x, this.boundary.y);
            rect(newPos.x, newPos.y, this.boundary.w, this.boundary.h);
            //rect(this.boundary.x, this.boundary.y, this.boundary.w, this.boundary.h);
        }

        if (this.divided) {
            this.topLeft.show(showWhat);
            this.topRight.show(showWhat);
            this.botLeft.show(showWhat);
            this.botRight.show(showWhat);
        }
    }
};
var worlds = {
    normal: {
        SizeTree: [50, 150],
        SizeRock: [50, 300],
        SizeWater: [400, 1000],
        SizeBarrel: [50, 120],
        maxBarrel: 35,
        maxRock: 30,
        maxTree: 100,
        maxWater: 4,
        maxItem: 300,
        bg: [20, 20, 20]
    },
    flat: {
        SizeTree: [0, 0],
        SizeRock: [0, 0],
        SizeWater: [0, 0],
        SizeBarrel: [0],
        maxBarrel: 0,
        maxRock: 0,
        maxTree: 0,
        maxWater: 0,
        maxItem: 400,
        bg: [20, 20, 20]
    },
    winter: {
        SizeTree: [100, 180],
        SizeRock: [100, 300],
        SizeWater: [300, 700],
        SizeBarrel: [70, 150],
        maxBarrel: 35,
        maxRock: 20,
        maxTree: 15,
        maxWater: 5,
        maxItem: 400,
        bg: [73, 78, 86, 220]
    },
    jungle: {
        SizeTree: [50, 400],
        SizeRock: [100, 400],
        SizeWater: [100, 400],
        SizeBarrel: [50, 70],
        maxBarrel: 5,
        maxRock: 10,
        maxTree: 150,
        maxWater: 2,
        maxItem: 450,
        bg: [3, 20, 9]
    },
    mountain: {
        SizeTree: [50, 150],
        SizeRock: [200, 600],
        SizeWater: [70, 200],
        SizeBarrel: [50, 100],
        maxBarrel: 35,
        maxRock: 50,
        maxTree: 50,
        maxWater: 1,
        maxItem: 100,
        bg: [15, 4, 40, 220]
    },
    beach: {
        SizeTree: [50, 200],
        SizeRock: [150, 300],
        SizeWater: [1700, 3500],
        SizeBarrel: [50, 70],
        maxBarrel: 30,
        maxRock: 10,
        maxTree: 100,
        maxWater: 7,
        maxItem: 100,
        bg: [124, 108, 58]
    }, 
    barrel: {
        SizeTree: [0],
        SizeRock: [0],
        SizeWater: [0],
        SizeBarrel: [100, 150],
        maxBarrel: 70,
        maxRock: 0,
        maxTree: 0,
        maxWater: 0,
        maxItem: 200,
        bg: [54, 80, 80]
    }
};
function GameMap(w, h, gridsize) {
    this.size = v(w, h);
    this.safezone = v(w, h);
    this.gridSize = gridsize || 200;
    this.hiddenMinimap = false;
}

GameMap.prototype.run = function() {
    this.drawGrid();
    this.drawEdge();
};

GameMap.prototype.createMinimap = function() {
    this.minimapSize = 270;
    this.offSetX = width - this.minimapSize - 10;
    if (!this.minimap)
        this.minimap = createGraphics(this.minimapSize, this.minimapSize);
    else this.minimap.clear();
    this.minimap.fill(world.bg[0], world.bg[1], world.bg[2], 150);
    this.minimap.stroke(100, 150);
    this.minimap.strokeWeight(1);
    this.minimap.rect(0, 0, this.minimapSize-2, this.minimapSize-2);

    this.minimap.noStroke();

    for (var w of wArr) {
        this.minimap.fill(w.col[0], w.col[1], w.col[2], 100);
        this.circleToMinimap(w.pos, w.radius, true);
    }

    for (var r of rArr) {
        this.minimap.fill(r.col[0], r.col[1], r.col[2], 200);
        this.circleToMinimap(r.pos, r.radius, true);
    }

    for (var t of tArr) {
        this.minimap.fill(t.col[0], t.col[1], t.col[2], 200);
        this.circleToMinimap(t.pos, t.radius, true);
    }
};

GameMap.prototype.convert = function(x, toReal) {
    if (toReal) return map(x, 0, this.minimapSize, 0, this.size.x);
    return map(x, 0, this.size.x, 0, this.minimapSize);
};

GameMap.prototype.convertXY = function(pos, toReal) {
    if (toReal) return v(this.convert(pos.x, true), this.convert(pos.y, true));
    return v(this.convert(pos.x), this.convert(pos.y));
};

GameMap.prototype.circleToMinimap = function(pos, radius, save) {
    var newpos = this.convertXY(pos);
    var newradius = this.convert(radius);

    if (save) {
        this.minimap.ellipse(newpos.x, newpos.y, newradius * 2, newradius * 2);
    } else {
        ellipse(newpos.x + this.offSetX, newpos.y + height - (this.minimapSize + 10), newradius * 2, newradius * 2);
    }
};

GameMap.prototype.rectToMinimap = function(pos, size, save) {
    var newpos = this.convertXY(pos);
    var newsize = this.convertXY(size);

    if (save) {
        this.minimap.rect(newpos.x, newpos.y, newsize.x, newsize.y);
    } else {
        rect(newpos.x + this.offSetX, newpos.y + height - (this.minimapSize + 10), newsize.x, newsize.y);
    }
};

GameMap.prototype.showMinimap = function() {
    if (this.hiddenMinimap) {
        this.offSetX = lerp(this.offSetX, width + 10, 0.2);

    } else {
        this.offSetX = lerp(this.offSetX, width - this.minimapSize - 10, 0.2);
    }

    if (this.offSetX < width) {
        image(this.minimap, this.offSetX, height - (this.minimapSize + 10));

        strokeWeight(1);
        //show portals in minimap
        for (var pi of pArr) {
            this.showPortals(pi.inGate);
            if (pi.outGate) this.showPortals(pi.outGate);
        }

        // show redzones in minimap
        for (var rz of redArr) {
            stroke(rz.redValue, 0, 0);
            fill(rz.redValue, 10, 10, 50);
            this.circleToMinimap(rz.pos, rz.radius, false);
        }

        // show position
        noFill();
        for(var e of eArr) {
            if(e != viewport.target && !e.hide) {
                if(e.idTeam == viewport.target.idTeam) {
                    stroke(0, 255, 0);
                    strokeWeight(2);
                } else {
                    stroke(150);
                    strokeWeight(1);
                }
                this.circleToMinimap(e.pos, 100, false);
            }
        }
        stroke(255);
        var pos = viewport.target.pos;
        if(pos.x > 0 && pos.x < gmap.size.x && pos.y > 0 && pos.y < gmap.size.y) {
            this.rectToMinimap(viewport.pos, v(width, height), false);
            if(!viewport.target.hide){
                fill(170);
                this.circleToMinimap(viewport.target.pos, 100, false);
            }
        }
        

        //show more info
        if (mouseX > this.offSetX && mouseY > height - this.minimapSize - 10) {
            if (keyIsDown(81)) { // Q
                var pos = this.convertXY(v(mouseX, mouseY).sub(v(this.offSetX, height - this.minimapSize - 10)), true);
                viewport.pos = pos;

            } else {
                textAlign(RIGHT);
                noStroke();
                fill(150);
                text('hold "Q" to see', width - 10, height - this.minimapSize - 20);
            }
        }
    }
};

GameMap.prototype.showPortals = function(pi) {
    fill(pi.type == 'out' ? 'orange' : 'blue');
    noStroke();
    this.circleToMinimap(pi.pos, (mil / 4) % 150, false);
    if (pi.connectWith) {
        var from = this.convertXY(pi.pos).add(this.offSetX, height - (this.minimapSize + 10));
        var to = this.convertXY(pi.connectWith.pos).add(this.offSetX, height - (this.minimapSize + 10));
        stroke(200, 50);
        line(from.x, from.y, to.x, to.y);
    }
};

GameMap.prototype.drawEdge = function() { // Vẽ biên
    // dùng 4 đỉnh đê vẽ hình chữ nhât
    var topleft = v(0, 0); // đỉnh trên trái
    var topright = v(this.size.x, 0); // đỉnh trên phải
    var botleft = v(0, this.size.y); // đỉnh dưới trái
    var botright = v(this.size.x, this.size.y); // đỉnh dưới phải

    stroke(255);
    strokeWeight(3);

    // Ve duong thang qua cac dinh
    line(topleft.x, topleft.y, topright.x, topright.y);
    line(topright.x, topright.y, botright.x, botright.y);
    line(botright.x, botright.y, botleft.x, botright.y);
    line(botleft.x, botleft.y, topleft.x, topleft.y);
};

GameMap.prototype.drawGrid = function() {
    stroke(50, 70);
    strokeWeight(3);
    var delta = 1;

    for (var x = viewport.pos.x - width / 2; x < viewport.pos.x + width / 2; x += delta) {
        if (floor(x) % this.gridSize == 0) {
            /* while you find 1 x%this.gridSize==0 
            => delta will equal this.gridSize => shorter loop */
            delta = this.gridSize;
            line(x, viewport.pos.y - height / 2, x, viewport.pos.y + height / 2);
        }
    }

    // do the same thing to y axis
    delta = 1;
    for (var y = viewport.pos.y - height / 2; y < viewport.pos.y + height / 2; y += delta) {
        if (floor(y) % this.gridSize == 0) {
            delta = this.gridSize;
            line(viewport.pos.x - width / 2, y, viewport.pos.x + width / 2, y);
        }
    }
};
function Viewport(target) {
    this.target = target || v(100, 100);
    this.pos = target.pos.copy() || v(100, 100);
    this.follow = true;

    this.borderSize = 25;
}

Viewport.prototype.changeTarget = function(newTarget) {
    if(newTarget){
        this.target = newTarget;
    } else if(eArr.length) {
        var d = gmap.size.x;
        var t = eArr[0];
        for(var e of eArr) {
            var distance = p5.Vector.dist(e.pos, this.target.pos);
            if(distance < d){
                d = distance;
                t = e;
            }
        }
        this.target = t;
    }
    
};

Viewport.prototype.run = function() {
    if (this.follow && !keyIsDown(81)) this.pos = p5.Vector.lerp(this.pos, this.target.pos, 0.1 * (60/(fr+1)));

    else if (mouseX > width - this.borderSize || mouseX < this.borderSize ||
        mouseY > height - this.borderSize || mouseY < this.borderSize) {

        var vec = v(mouseX - width / 2, mouseY - height / 2).setMag(30);
        viewport.pos.add(vec);

        noStroke();
        fill(200, 20);

        if (mouseY < 25) rect(width / 2, 12.5, width, 25); // top
        if (mouseY > height - 25) rect(width / 2, height - 12.5, width, 25); // down
        if (mouseX < 25) rect(12.5, height / 2, 25, height); // left
        if (mouseX > width - 25) rect(width - 12.5, height / 2, 25, height); // right
    }
};
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
    var ps = getPlayers(this.pos, this.radius + maxSizeNow, []);
    if (ps.length) {
        for (var pi of ps) {
            if (p5.Vector.dist(this.pos, pi.pos) < this.radius - pi.radius / 2) {
                // pi.vel.mult(0.6);
                pi.setFric(0.75, 100);
                pi.hide = true;
            }
        }
    }

    var bs = getBullets(this.pos, this.radius + maxSizeNow, []);
    if (bs.length) {
        for (var bi of bs) {
            if (p5.Vector.dist(this.pos, bi.pos) < this.radius + bi.info.radius) {

                // destroy bullets
                bi.end();

                // decrease radius
                this.radius -= bi.info.radius / 2;
                if(random() > 0.8){
                    var pos = this.pos.copy().add(v(random(-1, 1), random(-1, 1)).setMag(this.radius));
                    var item = new Item(pos.x, pos.y);
                    item.vel = p5.Vector.sub(item.pos, this.pos).setMag(15-item.radius);
                    iArr.push(item);
                }

                // delete if radius too small
                if (this.radius < 20) {
                    this.end();
                    break;
                }
            }
        }
    }
};

Tree.prototype.end = function() {
    if (insideViewport(this)) addSound('audio/tree_break_01.mp3');

    // gun
    if (random(1) > 0.6) {
        var nameGun = getValueAtIndex(weapons, floor(random(getObjectLength(weapons) / 2 - 1)));
        iArr.push(new Item(this.pos.x, this.pos.y, null, this.col, nameGun));
    }
    // items
    for (var i = 0; i < random(1, 5); i++)
        iArr.push(new Item(this.pos.x + random(-30, 30), this.pos.y + random(-30, 30)));

    // delete this
    tArr.splice(tArr.indexOf(this), 1);
};

Tree.prototype.show = function() {
    fill(this.col[0], this.col[1], this.col[2], 240);
    noStroke();

    ellipse(this.pos.x, this.pos.y, this.radius * 2 + ampLevel * 100);
};
function Rock(x, y, r) {
    this.pos = v(x, y);
    this.radius = r;
    
    var c = floor(random(30, 70));
    this.col = [c, c, c];
}

Rock.prototype.run = function() {
    if (insideViewport(this)) this.show();
    this.update();
};

Rock.prototype.update = function() {
    var bs = getBullets(this.pos, this.radius, []);
    if (bs.length) {
        for (var bi of bs) {
            effects.collision(this, bi, false, true);
            this.radius -= bi.info.radius / 4;

            if (this.radius < 20) {
                this.end(bi);
                break;
            }
        }
    }

    var ps = getPlayers(this.pos, this.radius + maxSizeNow, []);
    if (ps.length) {
        for (var pi of ps) {
            var d = p5.Vector.dist(this.pos, pi.pos);
            if(d < this.radius + pi.radius) {                
                effects.collision(this, pi, d);
                if (pi.nextPoint) pi.nextPoint = v(pi.pos.x + random(-300, 300), pi.pos.y + random(-300, 300));
            }
        }
    }

    var is = getItems(this.pos, this.radius, []);
    if (is.length) {
        for (var ii of is) {
            effects.collision(this, ii);
        }
    }
};

Rock.prototype.end = function(bull) {
    if(insideViewport(this)) addSound('audio/stone_break_01.mp3');

    // gun
    var len = getObjectLength(weapons);
    var nameGun = getValueAtIndex(weapons, floor(random(len / 2, len)));
    iArr.push(new Item(this.pos.x, this.pos.y, null, this.col, nameGun));

    // items
    for (var i = 0; i < random(10, 20); i++)
        iArr.push(new Item(this.pos.x + random(-30, 30), this.pos.y + random(-30, 30)));

    // delete this
    rArr.splice(rArr.indexOf(this), 1);
};

Rock.prototype.show = function() {
    fill(this.col[0], this.col[1], this.col[2]);
    stroke(70);
    strokeWeight(2);

    ellipse(this.pos.x, this.pos.y, this.radius * 2);
};
function Barrel(x, y, r) {
    this.pos = v(x, y);
    this.radius = r;

    this.col = [30, 30, 30];
    this.lidpos = this.pos.copy().add(v(random(-1, 1), random(-1, 1)).setMag(this.radius * 0.5));
    this.health = this.radius;
}

Barrel.prototype.run = function() {
    if (insideViewport(this)) this.show();
    this.update();
};

Barrel.prototype.update = function() {
    var bs = getBullets(this.pos, this.radius, []);
    if (bs.length) {
        for (var bi of bs) {
            // hightlight
            fill(100, 20, 20, 100);
            ellipse(this.pos.x, this.pos.y, this.radius*2 + 20);
            // dec health
            this.health -= bi.info.damage;
            // end bullet
            bi.end();

            if (this.health < 0) {
                this.end(bi);
                break;
            }
        }
    }

    var ps = getPlayers(this.pos, this.radius + maxSizeNow, []);
    if (ps.length) {
        for (var pi of ps) {
            var d = p5.Vector.dist(this.pos, pi.pos);
            if(d < this.radius + pi.radius){
                effects.collision(this, pi);
                if (pi.nextPoint) pi.nextPoint = v(pi.pos.x + random(-300, 300), pi.pos.y + random(-300, 300));
            }
        }
    }

    var is = getItems(this.pos, this.radius, []);
    if (is.length) {
        for (var ii of is) {
            effects.collision(this, ii);
        }
    }
};

Barrel.prototype.end = function(bull) {
    effects.smoke(this.pos.x, this.pos.y, 3, 1000, 40, 20);
    effects.explore(this.pos, this.radius * 0.15, [255, 100, 50], bull.o);
    effects.force('out', ['item'], this.pos, this.radius + 400, []);

    // health players
    var players = getPlayers(this.pos, this.radius + 300 + maxSizeNow, []);
    if(players.length) {
        for(var pl of players) {
            var dis = p5.Vector.dist(this.pos, pl.pos);
            if(dis < this.radius + 300 + pl.radius){
                var damage = map(dis - pl.radius - this.radius, 0, 300, this.radius, 0);
                pl.vel.add(p5.Vector.sub(pl.pos, this.pos).setMag(damage/5));
                if(pl.shield) {
                    if(pl.healthShield > damage) pl.healthShield -= damage;
                    else {
                        pl.healthShield = 0;
                        pl.health -= (damage - pl.healthShield);
                    }

                } else { pl.health -= damage;}

                pl.updateSize();
                if(pl.health <= 0) pl.die(bull);
            }
        }
    }

    // gun
    for(var i = 0; i < 2; i++){
        var len = getObjectLength(weapons);
        var nameGun = getValueAtIndex(weapons, floor(random(len / 2, len)));
        iArr.push(new Item(this.pos.x, this.pos.y, null, this.col, nameGun));
    }

    // mine
    for(var i = 0; i < this.radius / 30; i++)  {
        var dir = v(random(-1, 1), random(-1, 1)).setMag(random(.5, 3));
        var bullet = new Bullet(this.pos, dir, bulletTypes['Mine'], bull.o);
        bArr.push(bullet);
    }

    // delete this
    rArr.splice(rArr.indexOf(this), 1);
};

Barrel.prototype.show = function() {
    fill(this.col[0], this.col[1], this.col[2]);
    stroke(80);
    strokeWeight(4);

    ellipse(this.pos.x, this.pos.y, this.radius * 2);

    fill(0); noStroke();
    ellipse(this.lidpos.x, this.lidpos.y, this.radius * 0.25);

    if(this.health < 20 && random(1) > 0.9 * (fr/60))
        effects.smoke(this.lidpos.x, this.lidpos.y, 1, 500, 1, 5);
};
function Water(x, y, r) {
    this.pos = v(x, y);
    this.radius = r || random(50, 400);
    this.col = [21, 53, 117];

    this.preRipple = mil;
    this.delay = 800;

    this.ripple = [];
}

Water.prototype.run = function() {
    this.show();
};

Water.prototype.show = function() {
    noStroke();
    fill(this.col[0], this.col[1], this.col[2], 150);

    ellipse(this.pos.x, this.pos.y, this.radius * 2);

    this.trackPlayer();
    this.showRipple();
};

Water.prototype.trackPlayer = function() {
    var ps = getPlayers(this.pos, this.radius, []);
    if (ps.length) {
        for (var pi of ps) {
            if (p5.Vector.dist(this.pos, pi.pos) < this.radius - pi.radius / 2) {

                // add ripple
                if (pi.vel.mag() > pi.maxSpeed / 2 && mil - this.preRipple > this.delay) {
                    this.ripple.push({
                        x: pi.pos.x,
                        y: pi.pos.y,
                        r: 10
                    });
                    this.preRipple = mil;
                    if (pi == p) {
                        addSound('audio/footstep_water_02.mp3');
                    }
                }

                // slow down players
                pi.setFric(0.75, 100);
            }
        }
    }

    var bs = getBullets(this.pos, this.radius, []);
    if (bs.length) {
        for (var bi of bs) {
            if (p5.Vector.dist(this.pos, bi.pos) < this.radius - bi.info.radius / 2) {
                // slow down bullet
                bi.vel.mult(0.95);
            }
        }
    }
};

Water.prototype.showRipple = function() {
    for (var i = this.ripple.length - 1; i >= 0; i--) {
        var ripple = this.ripple[i];
        fill(150, 10);
        stroke(150, 200 - ripple.r * 2);
        strokeWeight(2);
        ellipse(ripple.x, ripple.y, ripple.r * 2);

        ripple.r += 1 * (60 / (fr + 1));

        if (ripple.r * 2 > 255) {
            this.ripple.splice(i, 1);
        }

    }
};
function Item(x, y, radius, col, nameGun) {
    this.pos = v(x, y);
    this.vel = v(0, 0);
    this.radius = radius || random(5, 15);
    this.born = mil;
    this.life = random(6E4, 3E5);

    this.nameGun = nameGun;
    if(this.nameGun) this.col = weapons[this.nameGun].color;
    else this.col = col || [random(255), random(255), random(255)];
}

Item.prototype.run = function() {
    if (insideViewport(this)) {
        this.update();
        this.show();
    }

    if ((mil - this.born > this.life)) {
        iArr.splice(iArr.indexOf(this), 1);
    }
};

Item.prototype.eatBy = function(t) {
    if(!this.nameGun || t != p){
        var d = p5.Vector.dist(this.pos, t.pos);

        if (d < t.radius) {
            t.health += this.radius / 5;
            t.score += this.radius / 10;
            t.updateSize();

            iArr.splice(iArr.indexOf(this), 1);

        } else {
            this.vel = v(t.pos.x - this.pos.x, t.pos.y - this.pos.y).setMag(250 / (d - t.radius)).limit(15);
        }
    }
};

Item.prototype.update = function() {
    this.pos.add(random(-2, 2), random(-2, 2));
    this.pos.add(this.vel.copy().mult(60 / (fr + 1)));
    this.vel.mult(0.8);
    collisionEdge(this, 1);
};

Item.prototype.show = function() {
    if (this.nameGun) {
        var c = this.col;
        fill(10);
        stroke(c[0], c[1], c[2]);
        strokeWeight(1);
        ellipse(this.pos.x, this.pos.y, 30);

        fill(c[0], c[1], c[2]);
        noStroke();
        text(this.nameGun, this.pos.x, this.pos.y);

    } else {
        noStroke();

        fill(this.col[0], this.col[1], this.col[2], 50);
        ellipse(this.pos.x, this.pos.y, this.radius * 2);

        fill(this.col[0], this.col[1], this.col[2], 150);
        ellipse(this.pos.x, this.pos.y, this.radius * 1.5);

        fill(this.col[0], this.col[1], this.col[2], 255);
        ellipse(this.pos.x, this.pos.y, this.radius);
    }
};
// =========== Name Database =============
var RandomName = [
    "Jacob", "William", "Ethan", "Daniel", "Logan", "God Of God",
    "Matthew", "Lucas", "Jackson", "David", "Samuel", "Dont Kill Me",
    "Luke", "Henry", "Andrew", "Nathan", "Huong", "Nhien", "Hacker",
    "Nhung", "Huynh", "Dat", "Dinh", "Hanh", "Ros", "Tay", "Japan Anti Virus",
    "Thanh", "Hue", "Nang", "Mua", "DeadClick", "Bao", "Tam", "FuckYou",
    "Dem", "Sang", "Cute", "Dude", "Kiss", "Hope", "Car", "God", "Ninja",
    "Fake", "Alan", "Hoi", "Diem", "Master", "Be Friend or Die", "Chấm",
    "Yi", "Yasuo", "Irela", "Vi", "Lux", "Sion", "Doctor", "U r mine",
    "Jinx", "Jhin", "Roma", "Computer", "Fax", "Plane", "Sky", "Head",
    "Tree", "Lake", "Water", "Fire", "Snow", "Mountain", "Dog", "Hóng",
    "Cat", "Bird", "Snack", "Candy", "Huu", "Noah", "Mason", "Best Gamer",
    "Hoang", "Hien", "Linh", "Nam", "Tam", "Hau", "Foria", "J A V  A",
    "Hoa", "Thao", "Trang", "Thuy", "Huan", "Luong", "Test Game", "...",
    "Hao", "Thuan", "Nga", "Huy", "Hang", "An", "Anh", "Call me",
    "Thien", "Ngan", "<3", "Love", "Michael", "Seclo", "Play Alone",
    "Heo", "Julia", "Jame", "Thomson", "LOL", "Ris", "Soldier",
    "Tris", "Nhan", "Dang", "Dam", "Hi Five", "Viet Nam", "US"
];
var musics = {
    SongList: [{
        name: "Sea Wave Sound - Nature Sound - Beach Bums",
        link: "https://api.soundcloud.com/tracks/200099207/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "Relaxation Music Sleeping - Rain and Thunder (1 hours) - ELIRT",
        link: "https://api.soundcloud.com/tracks/146823529/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "Relaxing Rain and Loud Thunder - R.J. Stefanski",
        link: "https://api.soundcloud.com/tracks/52301001/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "Relaxing Rain and Thunder Sound , Sleep Meditation - Ibne Waheedi",
        link: "https://api.soundcloud.com/tracks/110697958/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "30 Minute Deep Sleep Music - T Mega",
        link: "https://api.soundcloud.com/tracks/237317520/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "RELAX – relaxdaily N°048 - relaxdaily",
        link: "https://api.soundcloud.com/tracks/49267945/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "Smooth jazz music - JWilborn",
        link: "https://api.soundcloud.com/tracks/58735518/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "DEEP HOUSE SUMMER MIX 2 - AHMET KILIC - Ahmet Kilic",
        link: "https://api.soundcloud.com/tracks/143041228/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "As she passes - Levi Patel",
        link: "https://api.soundcloud.com/tracks/191576787/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "Maroon 5 - Girls Like You ft. Cardi B (Hiderway Remix)",
        link: "https://api.soundcloud.com/tracks/455069910/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "TroyBoi - Afterhours (feat. Diplo & Nina Sky)",
        link: "https://api.soundcloud.com/tracks/224375276/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "DJ Snake ft. Justin Bieber - Let Me Love You (Koni Remix)",
        link: "https://api.soundcloud.com/tracks/276962559/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "Cartoon - Why We Lose (feat. Coleman Trapp)",
        link: "https://api.soundcloud.com/tracks/210195404/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "Electro-Light - Symbolism",
        link: "https://api.soundcloud.com/tracks/178912631/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "Tobu - Infectious",
        link: "https://api.soundcloud.com/tracks/155512892/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "Nova - Ahrix",
        link: "https://api.soundcloud.com/tracks/81619639/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "Lensko - Cetus [NCS Release] - NCS",
        link: "https://api.soundcloud.com/tracks/162536037/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "\"Sax On The Beach\" Mixtape Part 1",
        link: "https://api.soundcloud.com/tracks/105110459/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "Deep House Mix 2013 *Free Download* - Owen Royal",
        link: "https://api.soundcloud.com/tracks/75853154/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "Diamond Eyes - Flutter",
        link: "https://api.soundcloud.com/tracks/515672067/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name: "Last Heroes x TwoWorldsApart - Eclipse (feat. AERYN)",
        link: "https://api.soundcloud.com/tracks/512204838/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name:"Robin Hustin x Tobimorrow - Light It Up (feat. Jex)",
        link:"https://api.soundcloud.com/tracks/484120113/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name:"Lost Sky - Dreams",
        link:"https://api.soundcloud.com/tracks/477898656/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }, {
        name:"Unknown Brain - Perfect 10 (feat. Heather Sommer)",
        link:"https://api.soundcloud.com/tracks/470287734/stream?client_id=587aa2d384f7333a886010d5f52f302a"
    }]
};
function Notification(textInside, size, col, time) {
    this.textInside = textInside;
    this.size = size || 20;
    this.col = col || [255, 255, 255, 170];
    this.life = time;
    this.born = mil;

    this.run = function() {
        if (mil - this.born < this.life) {
            var y = notifi.indexOf(this) * (this.size + 10) + 30;
            textAlign(CENTER);
            textSize(this.size);
            noStroke();
            fill(this.col[0], this.col[1], this.col[2], 170);
            text(this.textInside, width / 2, y);
        } else {
            notifi.splice(notifi.indexOf(this), 1);
        }
    }
}
var effects = {
    force: function(inOrOut, applyTo, pos, radius, excepts) {
        var bs = [],
            is = [],
            ps = [];

        if (applyTo.indexOf('bullet') != -1) {
            bs = getBullets(pos, radius, excepts);
            for (var bi of bs) {
                if (p5.Vector.dist(bi.pos, pos) < bi.info.radius + radius) {
                    var d = (inOrOut == 'in' ? p5.Vector.sub(pos, bi.pos) : p5.Vector.sub(bi.pos, pos));
                    bi.vel.add(d.limit(bi.info.speed)).limit(bi.info.speed * 3);
                }
            }
        }

        if (applyTo.indexOf('item') != -1) {
            is = getItems(pos, radius, excepts);
            for (var ii of is) {
                if (p5.Vector.dist(ii.pos, pos) < ii.radius + radius) {
                    var d = (inOrOut == 'in' ? p5.Vector.sub(pos, ii.pos) : p5.Vector.sub(ii.pos, pos));
                    ii.vel.add(d.setMag(map(radius + ii.radius - d.mag(), 0, radius, 1, 10)));
                }
            }
        }

        if (applyTo.indexOf('player') != -1) {
            ps = getPlayers(pos, radius, excepts);
            for (var pi of ps) {
                if (p5.Vector.dist(pi.pos, pos) < pi.radius + radius) {
                    var d = (inOrOut == 'in' ? p5.Vector.sub(pos, pi.pos) : p5.Vector.sub(pi.pos, pos));;
                    pi.vel.add(d.setMag(map(radius + pi.radius - d.mag(), 0, radius, 1, pi.vel.mag())));
                    if (pi.nextPoint) pi.nextPoint = null;
                }
            }
        }

        return {
            bulls: bs,
            items: is,
            players: ps,
            all: ps.concat(is).concat(bs)
        };
    },
    explore: function(pos, numOfBull, colo, owner) {
        var dir, damage, radius, col, lifeSpan, vel;
        for (var i = 0; i < numOfBull; i++) {
            damage = random(5, 10);
            vel = 25 - damage;
            dir = v(random(-vel, vel), random(-vel, vel));
            radius = damage / 1.5;
            col = colo || [random(255), random(255), random(255)];
            lifeSpan = random(0.1, 0.8);

            var btype = {
                name: "explore",
                damage: damage,
                radius: radius,
                speed: vel,
                life: lifeSpan, // seconds
                color: col
            }
            bArr.push(new Bullet(pos, dir, btype, owner));
        }
    },
    smoke: function(x, y, num, life, r, randR) {
        randR = randR || 50;
        for (var i = 0; i < num; i++)
            sArr.push(new Smoke(x + random(-randR, randR), y + random(-randR, randR), life, r));
    },
    collision: function(base, obj, distance, calVel) {
        var d = distance || p5.Vector.dist(base.pos, obj.pos);

        if(d < base.radius + (obj.radius || obj.info.radius)){
            var overlap = 0.5 * (d - base.radius - (obj.radius || obj.info.radius));

            obj.pos.x += overlap * (base.pos.x - obj.pos.x) / d;
            obj.pos.y += overlap * (base.pos.y - obj.pos.y) / d;

            if (calVel) {
                // normal
                var nx = (obj.pos.x - base.pos.x) / d;
                var ny = (obj.pos.y - base.pos.y) / d;

                var tx = -ny;
                var ty = nx;

                var dpTan2 = obj.vel.x * tx + obj.vel.y * ty;

                // new vel
                var magvel = obj.vel.mag();
                obj.vel.x = tx * dpTan2 + nx * magvel * 0.7;
                obj.vel.y = ty * dpTan2 + ny * magvel * 0.7;
            }
        }
    }
}
function ExplorePoint(x, y, numOfBulls, colo, timeCount, owner) {
    this.o = owner;
    this.pos = v(x, y);
    this.num = numOfBulls;
    this.col = colo;

    this.timeCount = timeCount;
    this.startTime = mil;

    this.radius = this.timeCount / 10;
}

ExplorePoint.prototype.checkExplore = function(contain) {
    if (mil - this.startTime >= this.timeCount) {
        effects.explore(this.pos, this.num, this.col, this.o);
        if (insideViewport(this))
            effects.force('out', ['player', 'item'], this.pos, 400);
        contain.splice(contain.indexOf(this), 1);
    }
};

ExplorePoint.prototype.show = function() {
    if (insideViewport(this)) {
        var radius = map((mil - this.startTime), 0, this.timeCount, 0, this.radius);
        var opacity = map(radius, 0, this.radius, 0, 255);
        noStroke();
        fill(200, 10, 10, opacity);
        ellipse(this.pos.x, this.pos.y, this.radius - radius);
    }
};
function RedZone(x, y, r, life, owner) {
    this.o = owner;
    this.pos = v(x, y);
    this.radius = r;
    this.ep = [];
    this.preDrop = mil;

    this.redRange = [120, 255];
    this.redValue = random(120, 255);
    this.grow = (this.redRange[1] - this.redRange[0]) / 50;

    this.born = mil;
    this.life = life;
}

RedZone.prototype.dropBoom = function() {
    if (mil - this.preDrop > 100000 / this.radius) {
        this.preDrop = mil;

        var len = v(random(-1, 1), random(-1, 1)).setMag(random(this.radius));
        var pos = p5.Vector.add(this.pos, len);
        this.ep.push(new ExplorePoint(pos.x, pos.y, random(10, 20), [255, 255, 0], random(500, 2000), this.o));

        if (random(1) > 0.5) iArr.push(new Item(pos.x, pos.y));
        else if (random(1) > 0.9) bArr.push(new Bullet(pos, v(0, 0), bulletTypes.Mine));
    }
};

RedZone.prototype.show = function() {
    this.redValue += this.grow;
    if (this.redValue <= this.redRange[0] || this.redValue >= this.redRange[1])
        this.grow *= -1;

    if (insideViewport(this)) {
        noStroke();
        fill(this.redValue, 10, 10, 35);
        ellipse(this.pos.x, this.pos.y, this.radius * 2);

        for (var i = this.ep.length - 1; i >= 0; i--) {
            this.ep[i].show();
        }
    };

    for (var i = this.ep.length - 1; i >= 0; i--) {
        this.ep[i].checkExplore(this.ep);
    }

    if (mil - this.born > this.life) {
        redArr.splice(redArr.indexOf(this), 1);

    } else this.dropBoom();
};
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
function Smoke(x, y, life, r) {
    this.pos = v(x, y);
    this.vel = v(0, 0);
    this.radius = r || floor(random(10, 50));
    this.born = mil;
    this.life = life;
}

Smoke.prototype.show = function() {
    if (insideViewport(this)) {
        this.vel.add(random(-1, 1), random(-1, 1));
        this.pos.add(this.vel);
        this.vel.mult(0.9);

        // show 
        if (this.radius < 100)
            this.radius += random(7) * (30 / (fr + 1));
        var c = map(this.life - (mil - this.born), 0, this.life, 30, 255);
        fill(c, c * 2);
        noStroke();

        ellipse(this.pos.x, this.pos.y, this.radius * 2);
    }

    // check end
    if (mil - this.born > this.life) {
        sArr.splice(sArr.indexOf(this), 1);
    }
};
function Bullet(pos, dir, type, owner) {
    this.info = type;
    this.pos = pos.copy(); // pos is a vector
    this.vel = dir;
    this.o = owner;
    this.born = mil;

    this.col = this.info.color || [random(255), random(255), random(255)];
    if (this.info.whenfire) this.info.whenfire(this);
}

Bullet.prototype.run = function() {
    this.update();
    if (insideViewport(this)) this.show();
    if (this.info.working) this.info.working(this);
    if ((mil - this.born) / 1000 > this.info.life) {
        this.end();
    }
};

Bullet.prototype.end = function() {
    if (this.info.finished) this.info.finished(this);
    bArr.splice(bArr.indexOf(this), 1);
};

Bullet.prototype.update = function() {
    this.pos.add(this.vel.copy().mult(60 / (fr + 1)));
    collisionEdge(this, 0.99);
};

Bullet.prototype.show = function() {
    noStroke();
    fill(this.col[0], this.col[1], this.col[2], 200);
    ellipse(this.pos.x, this.pos.y, this.info.radius * 2);
};
function Gun(owner, type) {
    this.info = type;
    this.o = owner;
    this.preShoot = 0;

    this.bullsLeft = this.info.maxBulls;
}

Gun.prototype.fire = function(target) {
    if (this.bullsLeft > 0) {
        if (!this.reloading && (mil - this.preShoot) >= this.info.delay * 1000) {
            var h = 100 - this.info.hitRatio * 100;
            var dir, vel, bpos;
            for (var i = 0; i < this.info.bullsPerTimes; i++) {
                dir = v(target.x - this.o.pos.x, target.y - this.o.pos.y).add(random(-h, h), random(-h, h));
                vel = dir.copy().setMag(this.o.weapon.bullet.speed + ((this.o.weapon.gun.info.bullsPerTimes > 1) ? random(-2, 2) : 0))
                bpos = this.o.pos.copy().add(dir.copy().setMag(this.o.radius + this.o.weapon.bullet.radius + 5));

                bArr.push(new Bullet(bpos, vel, this.o.weapon.bullet, this.o));
            }
            this.preShoot = mil;
            this.bullsLeft--;
        }

    } else {
        this.reload();
        if(this.o == viewport.target) addSound('audio/empty_fire_01.mp3', false, 0.7);
    }
};

Gun.prototype.reload = function() {
    this.preShoot = mil + (this.info.reloadTime * 1000);
    this.bullsLeft = this.info.maxBulls;
    this.reloading = true;
}

Gun.prototype.update = function() {
    if (this.reloading && mil > this.preShoot) {
        this.reloading = false;

        this.preShoot = mil - (this.info.delay * 1000); // reset pre time
    }
};
// =========== gun types database ==============
var gunTypes = {
    Minigun: {
        maxBulls: 60,
        delay: 0.1, // seconds
        reloadTime: 2,
        bullsPerTimes: 2,
        hitRatio: 0.7
    },
    AK: {
        maxBulls: 30,
        delay: 0.125, // seconds
        reloadTime: 1,
        bullsPerTimes: 1,
        hitRatio: 0.9
    },
    Lazer: {
        maxBulls: 35,
        delay: 0.2, // seconds
        reloadTime: 1,
        bullsPerTimes: 1,
        hitRatio: 0.85
    },
    Mine: {
        maxBulls: 5,
        delay: 0.5,
        reloadTime: 2,
        bullsPerTimes: 1,
        hitRatio: 1
    },
    Bazoka: {
        maxBulls: 2,
        delay: 1,
        reloadTime: 2,
        bullsPerTimes: 1,
        hitRatio: 0.9
    },
    Shotgun: {
        maxBulls: 5,
        delay: 0.7,
        reloadTime: 1.25,
        bullsPerTimes: 4,
        hitRatio: 0.3
    },
    Portalgun: {
        maxBulls: 2,
        delay: 1,
        reloadTime: 2, // ready when pre portal is activate
        bullsPerTimes: 1,
        hitRatio: 1
    }
}

// =========== bullet types database ==============
var bulletTypes = {
    AK: {
        name: "AK",
        damage: 3,
        radius: 4,
        speed: 20,
        life: 1.5, // seconds
        color: [255, 255, 0]
    },
    Shotgun: {
        name: "Shotgun",
        damage: 4,
        radius: 5,
        speed: 20,
        life: 1.5, // seconds
        color: [200, 255, 10]
    },
    Minigun: {
        name: "Mini",
        damage: 1,
        radius: 3,
        speed: 22,
        life: 1, // seconds
        color: [255, 255, 0]
    },
    Bazoka: {
        name: "Bazoka",
        damage: 1,
        radius: 15,
        speed: 14,
        life: 5, // seconds
        color: [200, 10, 10],
        finished: function(bull) {
            effects.explore(bull.pos, 15, [255, 255, 0], bull.o);
            effects.force('out', ['player', 'item'], bull.pos, 400, []);
            effects.smoke(bull.pos.x, bull.pos.y, 3, 600);
        },
        working: function(bull) {
            if (mil - (bull.smoked || 1) > 30) {
                effects.smoke(bull.pos.x, bull.pos.y, 1, 200, random(10, 30), 15);
                bull.smoked = mil;
            }
        }
    },
    Mine: {
        name: "Mini",
        damage: 5,
        radius: 10,
        speed: 0.1,
        life: 30, // seconds
        color: null,
        finished: function(bull) {
            epArr.push(new ExplorePoint(bull.pos.x, bull.pos.y, 30, [255, 100, 50], 400, bull.o));
            setTimeout(function() {
                effects.smoke(bull.pos.x, bull.pos.y, 4, 1000);
            }, 400);
        }
    },
    PortalBullet: {
        name: "PortalBullet",
        damage: 0,
        radius: 7,
        speed: 12,
        life: 5, // seconds
        color: [232, 165, 71],
        whenfire: function(bull) {
            bull.forceType = random(['in', 'out']);
        },
        working: function(bull) {
            noStroke();
            effects.force(bull.forceType, ['player', 'item', 'bullet'], bull.pos, 100, [bull, bull.o]);
            if (bull.forceType == 'in')
                fill(200, 10, 10, random(0, 30));
            else fill(10, 200, 10, random(0, 30));
            ellipse(bull.pos.x, bull.pos.y, 150, 150);
        },
        finished: function(bull) {
            var found = false;
            for (var i = pArr.length - 1; i >= 0; i--) {
                var pi = pArr[i];
                if (pi.inGate.o == bull.o && !pi.outGate) {
                    found = pi;
                    pi.outGate = new Portal('out', bull.pos.x, bull.pos.y, null, null, 10, bull.o);
                    pi.inGate.connectWith = pi.outGate;
                    pi.inGate.born = mil;

                    // add smoke
                    effects.smoke(bull.pos.x, bull.pos.y, 5, 1500);

                    break;
                }
            }
            if (!found) {
                var newObj = {
                    inGate: new Portal('in', bull.pos.x, bull.pos.y, null, null, 10, bull.o),
                    outGate: null
                };
                pArr.push(newObj);
            }
        }
    },
    RedzoneBullet: {
        name: "RedzoneBullet",
        damage: 10,
        radius: 15,
        speed: 8,
        life: 5, // seconds
        color: [255, 150, 30],
        working: function(bull) {
            effects.force('in', ['player', 'item', 'bullet'], bull.pos, (mil - bull.born) / 20, [bull.o, bull]);
            noStroke();
            fill(40, 168, 102, random(0, 10));
            ellipse(bull.pos.x, bull.pos.y, (mil - bull.born) / 10, (mil - bull.born) / 10);
        },
        finished: function(bull) {
            effects.explore(bull.pos, 10, [200, 200, 0], bull.o);
            redArr.push(new RedZone(bull.pos.x, bull.pos.y, (mil - bull.born) / 10, 5000, bull.o));
            effects.smoke(bull.pos.x, bull.pos.y, 3, 600)
        }
    },
    Lazer: {
        name: "Lazer",
        damage: 4.5,
        radius: 3.5,
        speed: 30,
        life: 1, // seconds
        color: [255, 30, 30],
        working: function(bull) {
            strokeWeight(7);
            stroke(255, 30, 30);
            beginShape();
            for (var i = 0; i < 3; i++) {
                vertex(bull.pos.x + bull.vel.x * i, bull.pos.y + bull.vel.y * i);
            }
            endShape(CLOSE);
        },
        finished: function(bull) {
            effects.smoke(bull.pos.x, bull.pos.y, 1, 200, 5, true);
        }
    },
    Bomp: {
        name: "Bomp",
        damage: 0,
        radius: 0,
        speed: 100,
        life: 0, // seconds
        color: null,
        whenfire: function(bull) {
            var mouse;
            if(bull.o == p) mouse = fakeToReal(mouseX, mouseY);
            else mouse = bull.o.target;
            epArr.push(new ExplorePoint(mouse.x, mouse.y, 20, [200, 200, 0], 700, bull.o));

            setTimeout(function() {
                effects.smoke(mouse.x, mouse.y, 3, 800);
                effects.force('out', ['player', 'item'], mouse, 400, []);
            }, 700);
        }
    },
    Rocket: {
        name: "Rocket",
        damage: 5,
        radius: 10,
        speed: 15,
        life: 5, // seconds
        color: [200, 10, 10],
        working: function(bull) {
            if (!bull.target) {
                var pls = getPlayers(bull.pos, 100, [bull.o]);
                if (pls.length) {
                    var t = null;
                    var minDist = 100 + maxSizeNow;
                    for (var pl of pls) {
                        if (!pl.hide) {
                            if(bull.o.idTeam && bull.o.idTeam != pl.idTeam){
                                var d = p5.Vector.dist(pl.pos, bull.pos);
                                if (d < minDist && d < pl.radius + 100) {
                                    minDist = d;
                                    t = pl;
                                }
                            }
                        }
                    }
                    bull.target = t;
                }
                noFill();
                strokeWeight(3);
                stroke(100, random(100));
                ellipse(bull.pos.x, bull.pos.y, 100 * 2);

            } else {
                bull.vel = p5.Vector.lerp(bull.vel, p5.Vector.sub(bull.target.pos, bull.pos).setMag(bull.info.speed), 0.05);

                noFill();
                strokeWeight(1);
                stroke(200, 10, 10, 100);
                ellipse(bull.target.pos.x, bull.target.pos.y, bull.target.radius * 2 + 10);
                line(bull.pos.x, bull.pos.y, bull.target.pos.x, bull.target.pos.y);

                if(bull.target.hide) bull.target = null;
            }

            if (mil - (bull.smoked || 1) > 30) {
                effects.smoke(bull.pos.x, bull.pos.y, 1, 200, random(10, 30), 15);
                bull.smoked = mil;
            }
        },
        finished: function(bull) {
            effects.explore(bull.pos, 15, [255, 255, 0], bull.o);
            effects.force('out', ['player', 'item'], bull.pos, 400, []);
            effects.smoke(bull.pos.x, bull.pos.y, 3, 600);
        },
    },
    Turret: {
        name: "Turret",
        damage: 10,
        radius: 20,
        speed: 1,
        life: 15, // seconds
        color: [20, 20, 20],
        whenfire: function(bull) {
            bull.preShoot = mil;
            bull.shootCount = 0;
            bull.dir = 0;
        },
        working: function(bull) {
            var pls = getPlayers(bull.pos, 300, [bull.o]);
            if (pls.length) {
                var t = null;
                var minDist = 300 + maxSizeNow;
                for (var pl of pls) {
                    if (!pl.hide) {
                        if(bull.o.idTeam && bull.o.idTeam != pl.idTeam){
                            var d = p5.Vector.dist(pl.pos, bull.pos);
                            if (d < minDist && d < pl.radius + 300) {
                                minDist = d;
                                t = pl;
                            }
                        }
                    }
                }
                bull.target = t;

            } else {
                bull.target = null;
            }

            drawPlayerWithShape({
                pos: bull.pos,
                vel: bull.vel,
                radius: 30,
                col: bull.o.col
            }, 'Pentagon', bull.dir);

            if (bull.target) {
                noFill();
                strokeWeight(1);
                stroke(200, 10, 10, 100);
                ellipse(bull.target.pos.x, bull.target.pos.y, bull.target.radius * 2 + 10);
                line(bull.pos.x, bull.pos.y, bull.target.pos.x, bull.target.pos.y);

                if (mil - bull.preShoot > 250) {
                    bull.preShoot = mil;
                    var type;
                    switch(bull.shootCount){
                        case 2: type = bulletTypes.SuperIce; break;
                        case 6: type = bulletTypes.Bazoka; break;
                        case 8: type = bulletTypes.Rocket; break;
                        default: type =  bulletTypes.Lazer;
                    }
                    var dir = p5.Vector.sub(bull.target.pos.copy().add(bull.target.vel.x*2, bull.target.vel.y*2), bull.pos);
                    var vel = dir.copy().setMag(type.speed);
                    bArr.push(new Bullet(bull.pos, vel, type, bull.o));

                    bull.dir = dir.heading();
                    bull.shootCount += (bull.shootCount >= 8 ? -8 : 1);
                }

            } else {
                noFill();
                stroke(100, random(100));
                strokeWeight(2);
                ellipse(bull.pos.x, bull.pos.y, 300 * 2);
            }
        },
        finished: function(bull) {
            epArr.push(new ExplorePoint(bull.pos.x, bull.pos.y, 20, [200, 200, 0], 250, bull.o));

            setTimeout(function() {
                effects.smoke(bull.pos.x, bull.pos.y, 3, 1000);
                effects.force('out', ['player', 'item'], bull.pos, 400, []);
            }, 250);
        }
    },
    IceBall: {
        name: "IceBall",
        damage: 3.5,
        radius: 10,
        speed: 20,
        life: 2, // seconds
        color: [150, 200, 255],
        finished: function(bull) {
            effects.smoke(bull.pos.x, bull.pos.y, 1, 200, 5, true);
        },
        effectToTarget: function(pl) {
            pl.setFric(0.5, 200);
        }
    },
    SuperIce: {
        name: "SuperIce",
        damage: 1,
        radius: 20,
        speed: 15,
        life: 5, // seconds
        color: [150, 200, 255],
        finished: function(bull) {
            effects.smoke(bull.pos.x, bull.pos.y, 3, 500, 15, 1);
            for(var i = 0; i < 7; i++) {
                var dir = v(random(-1, 1), random(-1, 1)).setMag(random(15));
                bArr.push(new Bullet(bull.pos, dir, bulletTypes.IceBall, bull.o));
            }
        },
        effectToTarget: function(pl) {
            pl.setFric(0.1, 1500);
        }
    }
}

// ======================= WEAPONS DATABASE ======================
var weapons = {
    AK: {
        name: "AK",
        gun: gunTypes.AK,
        bullet: bulletTypes.AK,
        color: [255, 255, 255],
        sound: "audio/mp5_01.mp3"
    },
    Shotgun: {
        name: "Shotgun",
        gun: gunTypes.Shotgun,
        bullet: bulletTypes.Shotgun,
        color: [255, 255, 255],
        sound: "audio/sv98_01.mp3"
    },
    Minigun: {
        name: "Minigun",
        gun: gunTypes.Minigun,
        bullet: bulletTypes.Minigun,
        color: [77, 155, 111],
        sound: ""
    },
    Mine: {
        name: "Mine",
        gun: gunTypes.Mine,
        bullet: bulletTypes.Mine,
        color: [77, 155, 111],
        sound: ""
    },
    Bazoka: {
        name: "Bazoka",
        gun: gunTypes.Bazoka,
        bullet: bulletTypes.Bazoka,
        color: [74, 91, 173],
        sound: "audio/mosin_01.mp3"
    },
    DropBomp: {
        name: "DropBomp",
        gun: gunTypes.Mine,
        bullet: bulletTypes.Bomp,
        color: [74, 91, 173],
        sound: ""
    },
    Lazer: {
        name: "Lazer",
        gun: gunTypes.Lazer,
        bullet: bulletTypes.Lazer,
        color: [183, 96, 86],
        sound: ""
    },
    IceBall: {
        name: "IceBall",
        gun: gunTypes.Lazer,
        bullet: bulletTypes.IceBall,
        color: [183, 96, 86],
        sound: ""
    },
    SuperIce: {
        name: "SuperIce",
        gun: gunTypes.Bazoka,
        bullet: bulletTypes.SuperIce,
        color: [176, 87, 186],
        sound: ""  
    },
    PortalGun: {
        name: "PortalGun",
        gun: gunTypes.Portalgun,
        bullet: bulletTypes.PortalBullet,
        color: [183, 96, 86],
        sound: ""
    },
    Redzone: {
        name: "Redzone",
        gun: gunTypes.Bazoka,
        bullet: bulletTypes.RedzoneBullet,
        color: [183, 96, 86],
        sound: ""
    },
    Rocket: {
        name: "Rocket",
        gun: gunTypes.Bazoka,
        bullet: bulletTypes.Rocket,
        color: [176, 87, 186],
        sound: ""
    },
    Turret: {
        name: "Turret",
        gun: gunTypes.Bazoka,
        bullet: bulletTypes.Turret,
        color: [176, 87, 186],
        sound: ""
    }
}
function InfoWeapon() {
    this.pos = v(0, height - 10 - 50 / 2);
    this.size = v(100, 50);

    this.show = function() {

        this.pos.x = width - this.size.x / 2 - 5;
        this.pos.y = height - gmap.minimapSize - 10 - this.size.y;

        strokeWeight(2);
        for(var i = 3; i >= 0 ; i--) {
            // this.pos.x = (gmap.offSetX || width) - this.size.x / 2 - 20;
            var anpha;

            // box contain
            if(viewport.target.weaponBox[i] == viewport.target.weapon){
                stroke(150);
                anpha = 255;

            } else {
                anpha = 70;
                noStroke();  
            } 
            fill(120, 50);
            rect(this.pos.x, this.pos.y - this.size.y * 0.25, this.size.x, this.size.y * 0.5);
            fill(0, 50);
            rect(this.pos.x, this.pos.y + this.size.y * 0.25, this.size.x, this.size.y * 0.5);

            if(viewport.target.weaponBox[i]) {
                // name gun
                noStroke();
                textAlign(CENTER);

                var c = viewport.target.weaponBox[i].color;
                fill(c[0], c[1], c[2], anpha);
                text(viewport.target.weaponBox[i].name, this.pos.x, this.pos.y - this.size.y * 0.15);
                if (viewport.target.weaponBox[i].gun.reloading) {
                    fill(255, 150, 20, anpha);
                    text("...", this.pos.x, this.pos.y + this.size.y / 3);
                } else {
                    fill(255, anpha);
                    text(viewport.target.weaponBox[i].gun.bullsLeft, this.pos.x, this.pos.y + this.size.y * 0.3);            
                }
            }

            // inc y
            this.pos.y -= (this.size.y + 20);
        }
    }
}

var teams = {};

function addPlayerToTeam(player, idTeam) {
    if(!teams[idTeam]) {
        teams[idTeam] = {id: idTeam, teamate: [player], leader: 0};
    
    } else teams[idTeam].teamate.push(player);
    changeLeader(idTeam);
}

function changeLeader(idTeam) {
    if(teams[idTeam].teamate.length > 0){
        var maxHealth = 0;
        for(var i = 0; i < teams[idTeam].teamate.length; i++) {
            var pl = teams[idTeam].teamate[i];
            if(pl == p) return p;
            if(pl.health > maxHealth) {
                maxHealth = pl.health;
                teams[idTeam].leader = i;
            }
        }
        return getLeader(idTeam);
    } 
    return false;
}

function getLeader(idTeam) {
    var lead = teams[idTeam].leader;
    return teams[idTeam].teamate[ lead ];
}

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
    this.weapon.gun.update();
    this.update();
    this.eat();
    if (insideViewport(this)) this.show(this == p ? fakeToReal(mouseX, mouseY) : this.target);
    collisionBullets(this);
};

Character.prototype.update = function() {
    this.pos.add(this.vel.copy().mult(60 / (fr + 1)));
    this.vel.mult(this.friction);
    this.vel.limit(this.maxSpeed);
    this.collidePlayer();
    this.updateFric();

    if (this.shield) this.makeShield();
    if (this.healthShield < 50) this.healthShield += 0.1 * (30 / (fr + 1));
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

Character.prototype.setFric = function(fric, time) {
    if(fric <= this.friction) {
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
            // b.end();
        }

    strokeWeight(1);
    stroke(70);
    fill(this.col[0], this.col[1], this.col[2], random(30, 50));
    ellipse(this.pos.x, this.pos.y, radius * 2, radius * 2);
};

Character.prototype.updateSize = function() {
    var s = 30 / 100 * this.health;
    if (s > 20 && s < 600) this.radius = s;
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
        newWeapon.gun = new Gun(this, newWeapon.gun);

        if(this.weaponBox.length < 4) {
            this.weaponBox.push(newWeapon);
            this.changeWeaponTo(this.weaponBox.length - 1);
        
        } else {
            var nameGun = this.weaponBox[this.weaponBox.indexOf(this.weapon)].name;
            
            // get gun
            var index = this.weaponBox.indexOf(this.weapon)
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

    // alert if this in p team
    if(p && this.idTeam == p.idTeam) {
        addAlertBox('"' + this.name + '"' + " in your Team was died.");
    }

    // change leader
    if(team > 1)
    if(this == getLeader(this.idTeam)) {
        teams[this.idTeam].teamate.splice(teams[this.idTeam].leader, 1);
        changeLeader(this.idTeam);
    }

    // delete this
    eArr.splice(eArr.indexOf(this), 1);

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
    if(p) {
        if(!eArr.length){
            addAlertBox("Congratulations .You Won this match", '#5f5', '#000');
            var pcol = hexToRgb(document.getElementById('pickColor').value)
            addMessage(pname + ' Win', 'Server', true, color(pcol.r, pcol.g, pcol.b));
            menuWhenDie("open");
        }

    } else if(eArr.length == 1) {
        var c = eArr[0].col;
        addAlertBox(eArr[0].name+ " Won this match", '#5f5', '#000');
        addMessage(eArr[0].name + ' Win', 'Server', true, color(c[0], c[1], c[2]));
    }
};

AICharacter.prototype.followLeader = function() {
    var leader = getLeader(this.idTeam);
    if(p5.Vector.dist(this.pos, leader.pos) > 2000) 
        this.nextPoint = leader.pos.copy().add(random(-500, 500), random(-500, 500));
};
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

    // speed up when out of map
    if(this.killed >= 10){
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

    p = null;
    setTimeout(function() {
        if (!p) {
            viewport.changeTarget(manFire);
            menuWhenDie("open");
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
function addAICharacter() {
    eArr = [];
    var dis = 500;
    for (var j = 1; j < floor(maxE / team + 1); j++) {
        var pos = v(random(gmap.size.x), random(gmap.size.y));
        for(var i = 0; i < team; i++) {
            var e = new AICharacter(null, pos.x + random(-dis, dis), pos.y + random(-dis, dis), null, null, j+1);
            addPlayerToTeam(e, j+1);
            eArr.push(e);
        }
        changeLeader(j+1);
    }

    // add bot to p team
    for(var i = 1; i < team; i++) {
        var e = new AICharacter(null, p.pos.x + random(-dis, dis), p.pos.y + random(-dis, dis), null, null, 1);
        addPlayerToTeam(e, 1);
        eArr.push(e);
    }
}

function addPlayer() {
    // khoi tao nhan vat
    var col = hexToRgb(document.getElementById('pickColor').value);
    var pcol = [col.r, col.g, col.b];
    p = new Player(pname, random(gmap.size.x), random(gmap.size.y), pcol, 100, 1);
    addPlayerToTeam(p, 1);

    // effect
    effects.smoke(p.pos.x, p.pos.y, 5, 700, 30);
    addSound('audio/punch_swing_01.mp3');
}

function createWorld() { 
    bArr = []; // bullets
    iArr = []; // items
    pArr = []; // portals
    redArr = []; // redzones
    epArr = []; // explore points
    wArr = []; //waters
    rArr = []; // rocks
    tArr = []; // trees

    // them rocks
    for (var i = 0; i < world.maxRock; i++)
        rArr.push(new Rock(random(gmap.size.x), random(gmap.size.y), 
            random(world.SizeRock[0], world.SizeRock[1])));

    // them barrels
    for (var i = 0; i < world.maxBarrel; i++)
        rArr.push(new Barrel(random(gmap.size.x), random(gmap.size.y), 
            random(world.SizeBarrel[0], world.SizeBarrel[1])));    

    // them trees
    for (var i = 0; i < world.maxTree; i++)
        tArr.push(new Tree(random(gmap.size.x), random(gmap.size.y), 
            random(world.SizeTree[0], world.SizeTree[1])));

    // them waters
    for (var i = 0; i < world.maxWater; i++)
        wArr.push(new Water(random(gmap.size.x), random(gmap.size.y), 
            random(world.SizeWater[0], world.SizeWater[1])));

    gmap.createMinimap();
}

function reset() {
    eArr = []; // enemys
    sArr = []; // smokes
    notifi = []; // notification
    teams = {}; // reset teams

    addPlayer();
    addAICharacter();

    // khung nhin
    viewport = new Viewport(p);

    createWorld();
}

function realToFake(realX, realY) {
    return v(width / 2 + realX - viewport.pos.x,
        height / 2 + realY - viewport.pos.y);;
}

function fakeToReal(fakeX, fakeY) {
    return v(fakeX - width / 2 + viewport.pos.x,
        fakeY - height / 2 + viewport.pos.y);
}

function collisionBullets(t) {
    var radius = t.radius + 50;
    var range = new Circle(t.pos.x, t.pos.y, radius);
    var bulletsInRange = quadBulls.query(range);
    var hit = false;
    var thuPham;

    if (bulletsInRange.length) {
        for (var b of bulletsInRange) {
            if (p5.Vector.dist(t.pos, b.pos) < t.radius + b.info.radius) {
                if(b.info.effectToTarget) b.info.effectToTarget(t);
                t.health -= b.info.damage;
                t.updateSize();
                hit = true;
                thuPham = b;
                b.end();
            }
        }

        // hit effect
        if (hit) { // is player
            t.nextPoint = null; // reset nextPoint
            var r = t.radius * 2 + 30;
            fill(255, 0, 0, 120);
            ellipse(t.pos.x, t.pos.y, r, r);
        }

        if (t.health <= 0) t.die(thuPham);
    }
}

function collisionEdge(t, bounce) {
    //khoi tao bien luu giu
    var radius = t.radius || t.info.radius;
    var top = radius;
    var left = radius;
    var bottom = gmap.size.y - radius;
    var right = gmap.size.x - radius;

    // bien tren
    if (t.pos.y < top) {
        t.vel.y *= -bounce;
        t.pos.y = top;
    }

    //bien duoi
    else if (t.pos.y > bottom) {
        t.vel.y *= -bounce;
        t.pos.y = bottom;
    }

    // bien trai
    if (t.pos.x < left) {
        t.vel.x *= -bounce;
        t.pos.x = left;
    }

    // bien phai
    else if (t.pos.x > right) {
        t.vel.x *= -bounce;
        t.pos.x = right;
    }
}

function isInside(point, posrect, sizerect) {
    return (point.x > posrect.x - sizerect.x / 2 &&
            point.x < posrect.x + sizerect.x / 2&&
            point.y > posrect.y - sizerect.y / 2&&
            point.y < posrect.y + sizerect.y / 2);
}

function insideViewport(t) {
    var pos = t.pos;
    var radius = (t.radius || t.info.radius) * 2; 
    return isInside(pos, viewport.pos, v(width + radius, height + radius));
}

function polygon(x, y, radius, npoints) {
    var angle = TWO_PI / npoints;
    beginShape();
    for (var a = 0; a < TWO_PI; a += angle) {
        var sx = x + cos(a) * radius;
        var sy = y + sin(a) * radius;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

function prettyTime(s) {
    s = s || 0;

    var seconds = (s % 60) | 0;
    var minutes = (s / 60 % 60) | 0;
    var hours = (s / 3600) | 0;

    if (hours) return hours + ':' + ('0' + minutes).substr(-2) + ':' + ('0' + seconds).substr(-2);
    else return minutes + ':' + ('0' + seconds).substr(-2);
}

function v(x, y) {
    return createVector(x, y);
}

// ================== Color =============
function randHex() {
    return ("#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);}));
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function hexToRgb2(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// ============= Audio ====================
function createNewAudio(linkMedia) {
    if (myAudio == null) {
        myAudio = createAudio(linkMedia);
        myAudio.elt.controls = true;
        myAudio.elt.volume = 0.5;
        myAudio.autoplay(true);
        myAudio.onended(function(e) {
            changeSong(1);
        });
        myAudio.elt.onloadeddata = function() {
            myAudio.elt.currentTime = random(myAudio.elt.duration);
        };
        myAudio.connect(p5.soundOut);

    } else {
        myAudio.src = linkMedia;
    }
}

function changeSong(step) {
    songNow += step;
    if (songNow >= musics.SongList.length) songNow = 0;
    else if (songNow < 0) songNow = musics.SongList.length - 1;

    notifi.push(new Notification("Song: " + musics.SongList[songNow].name, 20, null, 5000));
    createNewAudio(musics.SongList[songNow].link);
}

function addSound(link, loop, volume) {
    if (dataSound[link]) {
        var x = dataSound[link];
        x.setVolume(volume || 1);
        if (loop) x._onended = function() {
            this.play();
        }
        x.play();

    } else {
        if(loop)
            loadSound(link, function(data) {
                dataSound[link] = data;
                dataSound[link]._onended = function() {
                    this.play();
                }
                dataSound[link].play();
            });
        else 
            loadSound(link, function(data) {
                dataSound[link] = data;
                dataSound[link].play();
            });
    }
}

// ============= Alert Notification ==============
function addAlertBox(text, bgcolor, textcolor) {
    var al = document.getElementById('alert');
    al.childNodes[0].nodeValue = text;
    al.style.backgroundColor = bgcolor;
    al.style.opacity = 0.7;
    al.style.zIndex = 2;

    if (textcolor) al.style.color = textcolor;
}

function addMessage(mes, from, withTime, color, onclickFunc) {
    var newMes = document.createElement('p');
    if (color) {
        newMes.style.backgroundColor = ("rgba(" + color.levels[0] + "," + color.levels[1] + "," + color.levels[2] + "," + "0.3)");
    }

    if (withTime) {
        var timeNode = document.createElement('span');
        timeNode.textContent = (withTime ? (prettyTime(mil / 1000) + "  ") : "");
        newMes.appendChild(timeNode);
    }

    if (from) {
        var fromNode = document.createElement('span');
        fromNode.style.fontWeight = 'bold';
        fromNode.textContent = (from ? (from + ": ") : "");
        newMes.appendChild(fromNode);
    }

    if (mes) {
        var mesNode = document.createTextNode(mes);
        newMes.appendChild(mesNode);
    }

    if (onclickFunc) {
        newMes.addEventListener("mouseover", function() {
            newMes.style.cursor = 'pointer';
            newMes.style.borderWidth = "1px 0 1px 0";
            newMes.style.borderColor = "white";
            newMes.style.borderStyle = "dashed";
        });
        newMes.addEventListener("mouseout", function() {
            newMes.style.border = "none";
        });
        newMes.addEventListener("click", onclickFunc);
    }

    document.getElementById('conversation').appendChild(newMes);
    newMes.scrollIntoView();
}

function help() {
    addMessage(" - - - - - Gun Game 2 - - - - - ", '', false, color(255), function() {
        window.open('https://hoangtran0410.github.io/GunGame2/index.html')
    });
    addMessage("Eat And Fight to Survive", '', false, color(150));
    addMessage("W A S D / ArrowKey: Move.");
    addMessage("LEFT-Mouse : Shoot.");
    addMessage("SCROLL-Mouse, 1->9 : Change weapon.");
    addMessage("R : Reload.");
    addMessage("F : Pickup weapon.");
    addMessage("E : Shield (can't shoot).");
    addMessage("Q (Hold): look around (minimap).");
    addMessage("M: Open/close minimap.");
    addMessage("N: Change music.");
    addMessage("ENTER : Chat.");
    addMessage("C : Show/Hide Chat box.");
    addMessage("V : FreeCam Mode (on/off).");
    addMessage("Type '/help' for more option", '', false, color(200));
    addMessage("--------------------------------");
}

function showChat(show) {
    if (show) {
        document.getElementById('showHideChat').value = 'Hide';
        document.getElementById('conversation').style.width = "100%";
        document.getElementById('chatBox').style.left = "0px";
    } else {
        document.getElementById('showHideChat').value = 'Show';
        document.getElementById('conversation').style.width = "25%";
        document.getElementById('chatBox').style.left = "-240px";
    }
}

function isTyping() {
    return (document.getElementById('inputMes') === document.activeElement);
}

function clearChat(){
    var myNode = document.getElementById('conversation');
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}
// ======= Array , Object function ========

function getPlayers(pos, radius, excepts, justOne) {
    excepts = excepts || [];
    var range = new Circle(pos.x, pos.y, radius);
    var result = [];

    if (justOne) result = quadPlayers.query(range, [], true);
    else result = quadPlayers.query(range);

    if (result.length && excepts.length)
        for (var except of excepts) {
            var i = result.indexOf(except);
            if (i != -1) {
                result.splice(i, 1);
            }
        }

    return result;
}

function getItems(pos, radius, excepts, justOne) {
    excepts = excepts || [];
    var range = new Circle(pos.x, pos.y, radius);
    var result = [];

    if (justOne) result = quadItems.query(range, [], true);
    else result = quadItems.query(range);

    if (result.length && excepts.length)
        for (var except of excepts) {
            var i = result.indexOf(except);
            if (i != -1) {
                result.splice(i, 1);
            }
        }

    return result;
}

function getBullets(pos, radius, excepts, justOne) {
    excepts = excepts || [];
    var range = new Circle(pos.x, pos.y, radius);
    var result = [];

    if (justOne) result = quadBulls.query(range, [], true);
    else result = quadBulls.query(range);

    if (result.length && excepts.length)
        for (var except of excepts) {
            var i = result.indexOf(except);
            if (i != -1) {
                result.splice(i, 1);
            }
        }

    return result;
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function clone2(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function getObjectIndex(obj, keyToFind) {
    var result = Object.keys(obj).indexOf(keyToFind);
    if (result == -1) result = null;
    return result;
}

function getValueAtIndex(obj, index) {
    return Object.keys(obj)[index];
}

function getObjectLength(obj) {
    return Object.keys(obj).length;
}

// =============== window onload =============
window.onload = () => {
    document.addEventListener('contextmenu', e => e.preventDefault());

    document.getElementById('pickColor').value = randHex();
    var color_picker = document.getElementById("pickColor");
    var color_picker_wrapper = document.getElementById("color-picker-wrapper");
    color_picker.onchange = function() {
        color_picker_wrapper.style.backgroundColor = color_picker.value;    
    }
    color_picker_wrapper.style.backgroundColor = color_picker.value;    

    document.getElementById('newGame')
        .addEventListener('click', (e) => {
            // e.target.style.display = 'none';
            menuWhenDie("close");
            reset();
            runGame = true;
        });

    document.getElementById('solo')
        .addEventListener('click', (e) => {
            team = 1;
            clearChat();
            closeNav();
            start();
        })

    document.getElementById('duo')
        .addEventListener('click', (e) => {
            team = 2;
            clearChat();
            closeNav();
            start();
        })

    document.getElementById('squad')
        .addEventListener('click', (e) => {
            team = 4;
            clearChat();
            closeNav();
            start();
        })

    document.getElementById('backToStartMenu')
        .addEventListener('click', (e) => {
            runGame = false;
            showChat(false);
            menuWhenDie("close");
            openNav();
        })

    document.getElementById('closebtn')
        .addEventListener('mouseover', (event) => {
            // event.target.parentElement.style.display = "none";
            event.target.parentElement.style.opacity = 0;
            event.target.parentElement.style.zIndex = 0;
        });

    document.getElementById('showHideChat')
        .addEventListener('mouseover', function(event) {
            if (event.target.value == 'Hide') {
                showChat(false);

            } else {
                showChat(true);
            }
        });

    document.getElementById('cachchoi')
        .addEventListener('click', e => {
            var guide = document.getElementsByClassName('guide')[0];
            if(guide.style.display == "") {
                guide.style.display = "block";
                document.getElementById('cachchoi').scrollIntoView({ behavior: 'smooth', block: 'start' });

            } else {
                document.getElementById('ip-name').scrollIntoView({ behavior: 'smooth', block: 'end' });
                setTimeout(()=>{
                    guide.style.display = "";
                }, 200);
            }
        })

    var name  = localStorage.getItem('pname');
    document.getElementById('ip-name').value = name;

    openNav();
}

function autoAddPortals(num, step, life) {
    setInterval(function() {
        if (runGame && focused)
            for (var i = 0; i < num; i++) {
                var portalOut = new Portal('out', random(gmap.size.x), random(gmap.size.y), null, null, life);
                var portalIn = new Portal('in', random(gmap.size.x), random(gmap.size.y), portalOut, null, life);
                pArr.push({
                    inGate: portalIn,
                    outGate: portalOut
                });
            }
    }, step * 1000);
}

function autoAddRedzones(step) {
    setInterval(function() {
        if (runGame && focused)
            redArr.push(new RedZone(random(gmap.size.x), random(gmap.size.y),
                random(150, gmap.size.x / 8), random(15000, 60000)));
    }, step * 1000); // step in second
}

function autoAddItems(step) {
    // tu dong them item
    setInterval(function() {
        if(runGame && focused) {
            if (iArr.length > world.maxItem) {
                for (var i = 0; i < iArr.length - world.maxItem; i++)
                    iArr.shift();

            } else if (iArr.length < world.maxItem / 2) {
                for (var i = iArr.length; i < world.maxItem / 2; i++)
                    iArr.push(new Item(random(gmap.size.x), random(gmap.size.y)));
            }

            for (var i = 0; i < 5; i++) {
                iArr.push(new Item(random(gmap.size.x), random(gmap.size.y)));
            }

            var nameGun = getValueAtIndex(weapons, floor(random(getObjectLength(weapons))));
            iArr.push(new Item(random(gmap.size.x), random(gmap.size.y), null, null, nameGun));
        }

    }, step * 1000);
}

function autoAddPlayers(step) {
    // tu dong them player
    setInterval(function() {
        if (runGame && eArr.length < maxE) {
            var newCharacter = new AICharacter(null, random(gmap.size.x), random(gmap.size.y));
            eArr.push(newCharacter);
        }
    }, step * 1000);
}

function getMaxSizeNow(step) {
    setInterval(function() {
        if(runGame) {
            var m = p ? p.radius : (eArr.length?eArr[0].radius:0);
            for (var i of eArr) {
                if (i.radius > m)
                    m = i.radius;
            }
            maxSizeNow = m;
        }
    }, step * 1000);
}

function openFullscreen() {
    var elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
}

function closeFullscreen() {
    var elem = document.documentElement;
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
    }
}

function openNav() {
    document.getElementsByClassName("overlay")[0].style.height = "100%";
}

function closeNav() {
    document.getElementsByClassName("overlay")[0].style.height = "0%";
}

function menuWhenDie(e) {
    document.getElementById("menuWhenDie").style.display = (e=="open"?"block":"none");
    if(e == "close") {
        document.getElementById("alert").style.opacity = 0;
        document.getElementById("alert").style.zIndex = 0;  
    }
}

//  ============== Info ==================
function hiding_info() {
    var x = gmap.size.x * 0.5;
    var y = -1000;

    if (insideViewport({
            pos: {
                x: x,
                y: y
            },
            radius: 500
        })) {
        noStroke();
        fill(200);

        text("Author: Hoang Tran.", x, y += 30);
        text("Start Day: July 2018.", x, y += 30);
        text("From: Viet Nam.", x, y += 30);
        text("", x, y += 30);

        text("Github: HoangTran0410.", x, y += 30);
        text("Facebook: Hoang Tran.", x, y += 30);
        text("Type '/contact' to chat box for more info.", x, y += 30);
        text("", x, y += 30);

        text("Thank For Playing.", x, y += 30);
    }
}

// Save Canvas 
// var c= document.getElementsByTagName("canvas")...;
// var d = c.toDataURL("image/png");
// var w = window.open('about:blank','image from canvas');
// w.document.write("<img src='"+d+"' alt='from canvas'/>");

// var socket;

var myAudio;
var songNow;
var ampData;
var ampLevel;
var dataSound = {};

var viewport;
var gmap; // game map

var p;
var eArr = []; // enemys
var bArr = []; // bullets
var iArr = []; // items
var rArr = []; // rocks
var tArr = []; // trees
var pArr = []; // portals
var redArr = []; // redzones
var epArr = []; // explore points
var sArr = []; // smokes
var wArr = []; //waters
var notifi = []; // notification

var pname;
var team = 1;
var maxE = 15;
var world;

var quadPlayers;
var quadItems;
var quadBulls;
var boundMap;

var fr; // frameRate
var mil = 0; // milliseconds from begin of game
var _gameTime = 0; // time from begin of game to now
var gameTime = ""; // string time
var maxSizeNow = 100;
var weaponInfo;
var runGame = false;

function preload() {
    dataSound['audio/ambient_stream_01.mp3'] = loadSound('audio/ambient_stream_01.mp3');
}

function setup() {
    createCanvas(windowWidth, windowHeight).position(0, 0);
    noSmooth();
    rectMode(CENTER);
    textAlign(LEFT);
    textFont('Consolas');
    cursor(CROSS);

    ampData = new p5.Amplitude();
    songNow = floor(random(musics.SongList.length));

    setInterval(function() {
        if (runGame) {
            _gameTime++;
            gameTime = prettyTime(_gameTime);
        }
    }, 1000);

    setInterval(function() {
        if (runGame && gmap) {
            gmap.createMinimap();
        }
    }, 10000);

    // autoAddPlayers(5);
    autoAddItems(5);
    autoAddRedzones(30);
    getMaxSizeNow(2);
    autoAddPortals(2, 15, 14);
}

function start() {
    // khoi tao moi truong ban do
    gmap = new GameMap(10000, 10000, 300);
    var w = document.getElementById('worlds-select').value;
    world = worlds[w || getValueAtIndex(worlds, floor(random(getObjectLength(worlds))))];

    // time
    _gameTime = 0;

    // get player name
    pname = document.getElementById('ip-name').value || RandomName[floor(random(RandomName.length))];

    reset();
    weaponInfo = new InfoWeapon();

    // dung cho quadtree
    boundMap = new Rectangle(gmap.size.x / 2, gmap.size.y / 2, gmap.size.x, gmap.size.y);
    quadItems = new QuadTree(boundMap, 5);
    quadBulls = new QuadTree(boundMap, 5);
    quadPlayers = new QuadTree(boundMap, 1);

    help(10);

    runGame = true;
    document.getElementById('chatBox').style.display = "block";

    if(!myAudio) changeSong(1);
    addSound('audio/ambient_stream_01.mp3', true);
    addAlertBox('Please read the Rules in chat box.', '#f55', '#fff');
}

function draw() {
    if (runGame && focused) {

        background(world.bg);

        //star effects
        if(world.bg[3])
        for (var i = 0; i < 2; i++) {
            stroke(random(200, 255), 100);
            strokeWeight(random(7, 20));
            point(random(width), random(height));
        }

        // get value
        fr = frameRate();
        mil = millis();
        ampLevel = ampData.getLevel();

        viewport.run();

        push();
        translate(-viewport.pos.x + width / 2, -viewport.pos.y + height / 2);

        // fill(world.bg);
        // noStroke();
        // rect(gmap.size.x / 2, gmap.size.y / 2, gmap.safezone.x, gmap.safezone.y);
        // gmap.safezone.x--; 
        // gmap.safezone.y--;

        gmap.run();

        // update quadtrees
        quadItems.clear();
        for (var i of iArr) quadItems.insert(i);

        quadBulls.clear();
        for (var b of bArr) quadBulls.insert(b);

        quadPlayers.clear();
        if (p) quadPlayers.insert(p);
        for (var ei of eArr) quadPlayers.insert(ei);

        for (var w of wArr)
            w.run();

        // bullets
        for (var i = bArr.length - 1; i >= 0; i--)
            bArr[i].run();

        // // rocks
        for (var i = rArr.length - 1; i >= 0; i--)
            rArr[i].run();

        // // items
        for (var i = iArr.length - 1; i >= 0; i--)
            iArr[i].run();

        // characters
        if (p) {
            p.move();
            p.run();
        }
        for (var ei of eArr) {
            if (!ei) console.log(ei);

            else {
                ei.fire();
                ei.move();
                ei.run();
            }
        }

        // reset hide value
        if (p) p.hide = false;
        for (var ei of eArr) ei.hide = false;

        // fire
        if (p && mouseIsPressed && mouseButton == 'left') p.fireTo(fakeToReal(mouseX, mouseY));
        if (keyIsDown(32)) viewport.pos = viewport.target.pos.copy();

        // portals
        for (var i = pArr.length - 1; i >= 0; i--) {
            if (!pArr[i].inGate.run() && pArr[i].outGate)
                pArr[i].outGate.run();
        }

        // trees
        for (var i = tArr.length - 1; i >= 0; i--)
            tArr[i].run();

        // smokes
        for (var i = sArr.length - 1; i >= 0; i--)
            sArr[i].show();

        // red zone
        for (var i = redArr.length - 1; i >= 0; i--)
            redArr[i].show();

        // explore points
        for (var i = epArr.length - 1; i >= 0; i--) {
            epArr[i].show();
            epArr[i].checkExplore(epArr);
        }

        pop();

        // notifications
        for (var n of notifi) {
            n.run();
        }

        gmap.showMinimap();
        weaponInfo.show();

        // fps
        textSize(20);
        textAlign(LEFT);
        noStroke();
        fill(255, 150);
        text('Fps: ' + floor(frameRate()), 5, 20);
        text('Time: ' + gameTime, 5, 45);
        text('Players: ' + ((p ? 1 : 0) + eArr.length), 5, 70);
        text('Killed: ' + viewport.target.killed, 5, 95);

        textAlign(CENTER);
        text(floor(viewport.pos.x) + " " + floor(viewport.pos.y), width / 2, height - 25);
    }
}

function keyPressed() {
    if(keyCode == 27) { // ESC
        var n = document.getElementById("menuWhenDie").style.display;
        if(n == "block") {
            runGame = true;
            menuWhenDie("close");
        } else {
            if(p) runGame = false;
            menuWhenDie("open");
        }
    }

    if (runGame && !isTyping()) {
        if (keyCode == 86) { // V
            viewport.follow = !viewport.follow;

        } else if (keyCode == 77) { // M
            gmap.hiddenMinimap = !gmap.hiddenMinimap;

        } else if (keyCode == 69) { // E
            if (p) p.shield = !p.shield;

        } else if (keyCode == 70) { // F
            if (p) p.pickWeapon();

        } else if (keyCode == 66) { // B
            if (p) collisionEdge(p, 0.6);

        } else if (keyCode >= 49 && keyCode <= 57) { // number
            if (p && keyCode - 49 < p.weaponBox.length) {
                var weaponNow = p.weaponBox.indexOf(p.weapon);
                p.changeWeapon(keyCode - 49 - weaponNow);
            }

        } else if (keyCode == 82) { // R
            if (p) p.weapon.gun.reload();

        } else if (keyCode == 67) { // C
            var value = document.getElementById('showHideChat').value;
            if (value == 'Show') showChat(true);
            else showChat(false);

        } else if (keyCode == 78) { // N
            changeSong(1);

        } else if (keyCode == 72) { // H
            help(5);

        } else if (keyCode == 13) {
            showChat(true);
            document.getElementById('inputMes').focus();
        }

    } else if (keyCode == 13) {
        var ele = document.getElementById('inputMes');
        switch (ele.value) {
            case '':
                break;

            case '/help':
                addMessage('/howtoplay, /showplayers, /clear, /more, /contact', 'Server');
                break;

            case '/howtoplay':
                help();
                break;

            case '/showplayers':
                var names = "";
                for (var e of eArr) {
                    names += (e.name + ", ");
                }
                addMessage(names, 'Server', false, color(0));
                break;

            case '/clear':
                clearChat();
                break;

            case '/more':
                addMessage('click here \u2665', 'Visualize music', false, color(255, 0, 0),
                    function() {
                        window.open('https://github.com/HoangTran0410/Visualyze-design-your-own-')
                    });
                addMessage('click here \u2665', 'Giphy Api', false, color(255, 100, 0),
                    function() {
                        window.open('https://hoangtran0410.github.io/giphyApi/')
                    });
                addMessage('click here \u2665', 'Sort Simulate', false, color(255, 255, 0),
                    function() {
                        window.open('https://hoangtran0410.github.io/Sort-Simulate/')
                    });
                addMessage('click here \u2665', 'Write Point', false, color(0, 255, 0),
                    function() {
                        window.open('https://hoangtran0410.github.io/Write-Points/')
                    });
                addMessage('click here \u2665', 'Maze Pacman', false, color(0, 0, 255),
                    function() {
                        window.open('https://hoangtran0410.github.io/Maze-generate/')
                    });
                addMessage('click here \u2665', 'Simple Paint', false, color(70, 60, 90),
                    function() {
                        window.open('https://hoangtran0410.github.io/Paint-P5/')
                    });
                addMessage('click here \u2665', 'Box2D Testing', false, color(255, 0, 255),
                    function() {
                        window.open('https://hoangtran0410.github.io/box2D-2/')
                    });
                addMessage('click here \u2665', 'Lsystem Simulate', false, color(255, 0, 0),
                    function() {
                        window.open('https://hoangtran0410.github.io/L-system-dat.gui/')
                    });
                addMessage('click here \u2665', 'Simple Firework', false, color(255, 100, 0),
                    function() {
                        window.open('https://hoangtran0410.github.io/Fire-work/')
                    });
                break;

            case '/contact':
                addMessage('click here \u2665', 'My Github', false, color(100),
                    function() {
                        window.open('https://github.com/HoangTran0410')
                    });
                addMessage('click here \u2665', 'My Facebook', false, color(0, 0, 255),
                    function() {
                        window.open('https://www.facebook.com/people/Hoang-Tran/100004848287494')
                    });
                break;

            default:
                var pcol = hexToRgb(document.getElementById('pickColor').value);
                addMessage(event.target.value, pname, true, color(pcol.r, pcol.g, pcol.b));
                break;
        }

        ele.blur();
        ele.value = '';
    }
}

function mousePressed(e) {
    if (!p && eArr.length) {
        if (e.target.matches('canvas')) {
            var newTarget = eArr[(eArr.indexOf(viewport.target) + 1) % eArr.length]
            viewport.target = newTarget;
        }
    }
}

function mouseWheel(e) {
    if (runGame && p) {
        if ((e.target.matches('canvas')) || document.getElementById('showHideChat').value == 'Show') {
            if (!p.shield) {
                p.changeWeapon(e.delta > 0 ? 1 : -1);
            }
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight, true);
    if (runGame) {
        gmap.offSetX = width - gmap.minimapSize - 10;
        weaponInfo = new InfoWeapon();
    }
}