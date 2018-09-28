// =========== gun types database ==============
var gunTypes = {
	Minigun: {
		maxBulls: 100,
		delay: 0.1, // seconds
		reloadTime: 2,
		bullsPerTimes: 2,
		hitRatio: 0.6
	},
	AK: {
		maxBulls: 30,
		delay: 0.15, // seconds
		reloadTime: 1,
		bullsPerTimes: 1,
		hitRatio: 0.9
	},
	Mine: {
		maxBulls: 5,
		delay: 0.5,
		reloadTime: 2,
		bullsPerTimes: 1,
		hitRatio: 1
	},
	Bazoka: {
		maxBulls: 2,
		delay: 1,
		reloadTime: 2,
		bullsPerTimes: 1,
		hitRatio: 0.9
	},
	Shotgun: {
		maxBulls: 5,
		delay: 0.7,
		reloadTime: 1.25,
		bullsPerTimes: 5,
		hitRatio: 0.6
	},
	Portalgun:{
		maxBulls: 2,
		delay: 1,
		reloadTime: 2, // ready when pre portal is activate
		bullsPerTimes: 1,
		hitRatio: 1
	}
}

// =========== bullet types database ==============
var bulletTypes = {
	Mine : {
		name: "Mini",
		damage: 5,
		radius: 10,
		speed: 0.1,
		life: 30, // seconds
		color: null,
		finished: function(bull) {
			epArr.push(new ExplorePoint(bull.pos.x, bull.pos.y, 
							30, [255, 100, 50], 400, bull.o));
		}
	},
	Minigun:{
		name: "Mini",
		damage: 1,
		radius: 3,
		speed: 22,
		life: 1, // seconds
		color: [255, 255, 0]
	},
	AK: {
		name: "AK",
		damage: 3,
		radius: 4,
		speed: 20,
		life: 1.5, // seconds
		color: [255, 255, 0]
	},
	Bazoka: {
		name: "Bazoka",
		damage: 1,
		radius: 15,
		speed: 14,
		life: 5, // seconds
		color: [200, 10, 10],
		finished: function(bull) {
			effects.explore(bull.pos, 15, [255, 255, 0], bull.o);
			effects.force('out', ['player', 'item'], bull.pos, 400, []);
		}
	},
	Shotgun: {
		name: "Shotgun",
		damage: 7,
		radius: 5,
		speed: 20,
		life: 1.5, // seconds
		color: [200, 255, 10]
	},
	PortalBullet: {
		name: "PortalBullet",
		damage: 0,
		radius: 7,
		speed: 12,
		life: 2, // seconds
		color: [232, 165, 71],
		whenfire: function(bull){
			bull.forceType = random(['in', 'out']);
		},
		working: function(bull) {
			noStroke();
			effects.force(bull.forceType, ['player', 'item', 'bullet'], bull.pos, 100, [bull, bull.o]);
			if(bull.forceType == 'in')
				fill(200, 10, 10, random(0, 30));
			else fill(10, 200, 10, random(0, 30));
			ellipse(bull.fakepos.x, bull.fakepos.y, 150, 150);
		},
		finished: function(bull){
			var found = false;
			for(var i = pArr.length - 1; i >= 0; i--){
				var pi = pArr[i];
				if(pi.inGate.o == bull.o && !pi.outGate){
					found = pi;
					pi.outGate = new Portal('out', bull.pos.x, bull.pos.y, null, null, 10, bull.o);
					pi.inGate.connectWith = pi.outGate;
					pi.inGate.born = mil;
					break;
				}
			}
			if(!found) {
				var newObj = {
					inGate: new Portal('in', bull.pos.x, bull.pos.y, null, null, 10, bull.o),
					outGate: null
				};
				pArr.push(newObj);
			}
		}
	},
	RedzoneBullet: {
		name: "RedzoneBullet",
		damage: 10,
		radius: 15,
		speed: 8,
		life: 5, // seconds
		color: [255, 150, 30],
		working: function(bull) {
			effects.force('in', ['player', 'item', 'bullet'], bull.pos, (mil - bull.born)/10, [bull.o, bull]);
			noStroke();
			fill(40, 168, 102, random(0, 10));
			ellipse(bull.fakepos.x, bull.fakepos.y, (mil - bull.born)/10, (mil - bull.born)/10);
		},
		finished: function(bull){
			// effects.force('out', ['player', 'item', 'bullet'], bull.pos, 500);
			effects.explore(bull.pos, 10, [200, 200, 0], bull.o);
			redArr.push(new RedZone(bull.pos.x, bull.pos.y, (mil - bull.born)/10, 5000));
		}
	},
	Lazer: {
		name: "Lazer",
		damage: 5,
		radius: 3.5,
		speed: 30,
		life: 1, // seconds
		color: [255, 30, 30],//[255, 255, 0],
		working : function(bull) {
			strokeWeight(7);
			stroke(255, 30, 30);
			beginShape();
			for(var i = 0; i < 3; i++){
				vertex(bull.fakepos.x + bull.vel.x * i, 
						bull.fakepos.y + bull.vel.y * i);
			}
			endShape(CLOSE);
		}
	}
}


// ======================= WEAPONS DATABASE ======================

var weapons = {
	AK: {
		name: "AK",
		gun: gunTypes.AK,
		bullet: bulletTypes.AK
	},
	Shotgun: {
		name:"Shotgun",
		gun: gunTypes.Shotgun,
		bullet: bulletTypes.Shotgun	
	},
	Minigun: {
		name: "Minigun",
		gun: gunTypes.Minigun,
		bullet: bulletTypes.Minigun
	},
	Lazer: {
		name: "Lazer",
		gun: gunTypes.AK,
		bullet: bulletTypes.Lazer
	},
	Bazoka: {
		name: "Bazoka",
		gun: gunTypes.Bazoka,
		bullet: bulletTypes.Bazoka
	},
	Mine: {
		name: "Mine",
		gun: gunTypes.Mine,
		bullet: bulletTypes.Mine
	},
	PortalGun: {
		name: "PortalGun",
		gun: gunTypes.Portalgun,
		bullet: bulletTypes.PortalBullet
	}
	,
	RedzoneGun: {
		name: "RedzoneGun",
		gun: gunTypes.Bazoka,
		bullet: bulletTypes.RedzoneBullet	
	}
}