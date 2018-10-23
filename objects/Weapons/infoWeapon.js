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