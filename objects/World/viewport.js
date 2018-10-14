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