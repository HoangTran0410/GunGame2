function Boss(name, x, y, col, health, idTeam) {
	Character.call(this, name, x, y, col, health, idTeam);
}

Boss.prototype = Object.create(Character.prototype);
Boss.prototype.constructor = Boss;