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