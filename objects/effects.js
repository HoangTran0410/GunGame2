var effects = {
	force: function(inOrOut, applyTo, pos, radius, mag, except) {
		var range = new Circle(pos.x, pos.y, radius + 100);

		var bulletsInRange = [], itemsInRange = [], playersInRange = [];
		
		if(applyTo.indexOf('bullet') != -1){
			bulletsInRange = quadBulls.query(range);
			for (var b of bulletsInRange) {
				if(b != except && p5.Vector.dist(b.pos, pos) < b.info.radius + radius){
					var d = (inOrOut=='in'?p5.Vector.sub(pos, b.pos):p5.Vector.sub(b.pos, pos));
					// b.vel.add(d.setMag( mag*(map((radius - d.mag()), 0, radius, 0, 1)) ));
					b.vel.add(d.setMag(b.vel.mag())).limit(b.info.speed);
				}
			}
		}

		if(applyTo.indexOf('item') != -1){
			itemsInRange = quadItems.query(range);
			for (var i of itemsInRange) {
				if(i != except && p5.Vector.dist(i.pos, pos) < i.radius + radius){
					var d = (inOrOut=='in'?p5.Vector.sub(pos, i.pos):p5.Vector.sub(i.pos, pos));;
					i.vel.add(d.setMag(i.vel.mag()+1));
				}
			}
		}

		if(applyTo.indexOf('player') != -1){
			playersInRange = quadPlayers.query(range);
			for (var pl of playersInRange) {
				if(pl != except && p5.Vector.dist(pl.pos, pos) < pl.radius + radius){
					var d = (inOrOut=='in'?p5.Vector.sub(pos, pl.pos):p5.Vector.sub(pl.pos, pos));;
					pl.vel.add(d.setMag(pl.vel.mag()*0.1+1));
					if(pl.nextPoint) pl.nextPoint = null;
				}
			}
		}

		return {items: itemsInRange, 
				players: playersInRange,
				bulls: bulletsInRange,
				all: itemsInRange.concat(playersInRange).concat(bulletsInRange)};
	},
	explore: function(pos, numOfBull, colo, owner) {
		var dir, damage, radius, col, lifeSpan, vel;
		for (var i = 0; i < numOfBull; i++) {
			damage = random(1, 5);
			vel = 15 - damage;
			dir = v(random(-vel, vel), random(-vel, vel));
			radius = damage * 2;
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
	}
}