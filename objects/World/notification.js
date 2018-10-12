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