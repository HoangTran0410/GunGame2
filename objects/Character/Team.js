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
		for(var i = teams[idTeam].teamate.length - 1; i >= 0 ; i--) {
			var pl = teams[idTeam].teamate[i];

			if(pl.died) {
				var index = teams[idTeam].teamate.indexOf(pl);
				teams[idTeam].teamate.splice(index, 1);
				continue;
			}

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
