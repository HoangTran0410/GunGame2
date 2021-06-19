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
        this.minimap.fill(w.col[0], w.col[1], w.col[2], 70);
        this.circleToMinimap(w.pos, w.radius, true);
    }

    for(var i of iceArr) {
        this.minimap.fill(i.col[0], i.col[1], i.col[2], 70);
        this.circleToMinimap(i.pos, i.radius, true);
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
                viewport.pos = p5.Vector.lerp(viewport.pos, pos, 0.2);

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
