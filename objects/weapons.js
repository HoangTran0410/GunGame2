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
		hitRatio: 0.7
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
		damage: 3,
		radius: 10,
		speed: 12,
		life: 2, // seconds
		color: [150, 150, 30],
		whenfire: function(bull){
			
		},
		working: function(bull) {
			if(bull.typePortal == 'out'){
				effects.force('out', ['player', 'item', 'bullet'], bull.pos, 100, [bull, bull.o]);
				fill(232, 165, 71, random(0, 30));
				ellipse(bull.fakepos.x, bull.fakepos.y, 150, 150);
			
			} else {
				effects.force('in', ['player', 'item', 'bullet'], bull.pos, 100, [bull, bull.o]);
				fill(64, 121, 196, random(0, 30));
				ellipse(bull.fakepos.x, bull.fakepos.y, 150, 150);
			}
		},
		finished: function(bull){
			
		}
	},
	GravityBullet: {
		name: "GravityBullet",
		damage: 3,
		radius: 10,
		speed: 12,
		life: 5, // seconds
		color: [150, 150, 30],
		working: function(bull) {
			effects.force('in', ['player', 'item', 'bullet'], bull.pos, 200, [bull.o, bull]);
			fill(40, 168, 102, random(0, 10));
			ellipse(bull.fakepos.x, bull.fakepos.y, 250, 250);
		},
		finished: function(bull){
			fill(255, 0, 0, 150);
			ellipse(bull.fakepos.x, bull.fakepos.y, 500, 500);	
			effects.force('out', ['player', 'item', 'bullet'], bull.pos, 500);
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
	//,
	// GravityGun: {
	// 	name: "GravityGun",
	// 	gun: gunTypes.Bazoka,
	// 	bullet: bulletTypes.GravityBullet	
	// }
}
