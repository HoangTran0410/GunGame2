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
		return teams[idTeam].teamate[ teams[idTeam].leader ];
	} 
	return false;
}

function getLeader(idTeam) {
	var lead = teams[idTeam].leader;
	return teams[idTeam].teamate[ lead ];
}
