function Boss(name, x, y, col, health, idTeam) {
	AICharacter.call(this, name, x, y, col, health, idTeam);

	this.isBoss = true;
	this.maxSpeed = 10;
}

Boss.prototype = Object.create(AICharacter.prototype);
Boss.prototype.constructor = Boss;

Boss.prototype.fireTo = function(target) {
	if (!this.shield) {
        if (this.weapon.gun.bullsLeft == 0)
            this.changeWeapon(1);
        this.weapon.gun.fire(target);
    }
};

AICharacter.prototype.fire = function() {
	if(this.target)
		this.fireTo(this.target);
};

Boss.prototype.move = function() {
    // if(team > 1) this.followLeader();

    var players = getPlayers(this.pos, this.radius + width / 2, [this], true);

    if(players.length) {
    	this.nextPoint = players[0].pos.copy().add(random(500));
    	this.target = players[0].pos;

    } else if (!this.nextPoint || p5.Vector.dist(this.pos, this.nextPoint) < this.radius) {
    	if(p && random(1) > 0.5){
    		this.nextPoint = p.pos.copy().add(random(500));
    		this.target = p.pos;

    	} else {
    		var rand = floor(random(eArr.length));
    		this.nextPoint = eArr[rand].pos.copy().add(random(500));	
    		this.target = eArr[rand].pos;
    	} 
        
    } else {
        if (this.vel.mag() < this.maxSpeed / 1.2)
            this.vel.add((this.nextPoint.x - this.pos.x) / 4, (this.nextPoint.y - this.pos.y) / 4).limit(this.maxSpeed);
        this.vel.mult(this.friction);
    }
};