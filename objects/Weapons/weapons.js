// =========== gun types database ==============
var gunTypes = {
    Minigun: {
        maxBulls: 100,
        delay: 0.1, // seconds
        reloadTime: 2,
        bullsPerTimes: 2,
        hitRatio: 0.7
    },
    AK: {
        maxBulls: 30,
        delay: 0.125, // seconds
        reloadTime: 1,
        bullsPerTimes: 1,
        hitRatio: 0.9
    },
    Lazer: {
        maxBulls: 35,
        delay: 0.2, // seconds
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
        bullsPerTimes: 4,
        hitRatio: 0.3
    },
    Portalgun: {
        maxBulls: 2,
        delay: 1,
        reloadTime: 2, // ready when pre portal is activate
        bullsPerTimes: 1,
        hitRatio: 1
    }
}

// =========== bullet types database ==============
var bulletTypes = {
    AK: {
        name: "AK",
        damage: 3,
        radius: 4,
        speed: 20,
        life: 1.5, // seconds
        color: [255, 255, 0]
    },
    Shotgun: {
        name: "Shotgun",
        damage: 4,
        radius: 5,
        speed: 20,
        life: 1.5, // seconds
        color: [200, 255, 10]
    },
    Minigun: {
        name: "Mini",
        damage: 1,
        radius: 3,
        speed: 22,
        life: 1, // seconds
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
            effects.smoke(bull.pos.x, bull.pos.y, 3, 600);
        },
        working: function(bull) {
            if (mil - (bull.smoked || 1) > 30) {
                effects.smoke(bull.pos.x, bull.pos.y, 1, 200, random(10, 30), 15);
                bull.smoked = mil;
            }
        }
    },
    Mine: {
        name: "Mini",
        damage: 5,
        radius: 10,
        speed: 0.1,
        life: 30, // seconds
        color: null,
        finished: function(bull) {
            epArr.push(new ExplorePoint(bull.pos.x, bull.pos.y, 30, [255, 100, 50], 400, bull.o));
            setTimeout(function() {
                effects.smoke(bull.pos.x, bull.pos.y, 4, 1000);
            }, 400);
        }
    },
    PortalBullet: {
        name: "PortalBullet",
        damage: 0,
        radius: 7,
        speed: 12,
        life: 5, // seconds
        color: [232, 165, 71],
        whenfire: function(bull) {
            bull.forceType = random(['in', 'out']);
        },
        working: function(bull) {
            noStroke();
            effects.force(bull.forceType, ['player', 'item', 'bullet'], bull.pos, 100, [bull, bull.o]);
            if (bull.forceType == 'in')
                fill(200, 10, 10, random(0, 30));
            else fill(10, 200, 10, random(0, 30));
            ellipse(bull.pos.x, bull.pos.y, 150, 150);
        },
        finished: function(bull) {
            var found = false;
            for (var i = pArr.length - 1; i >= 0; i--) {
                var pi = pArr[i];
                if (pi.inGate.o == bull.o && !pi.outGate) {
                    found = pi;
                    pi.outGate = new Portal('out', bull.pos.x, bull.pos.y, null, null, 10, bull.o);
                    pi.inGate.connectWith = pi.outGate;
                    pi.inGate.born = mil;

                    // add smoke
                    effects.smoke(bull.pos.x, bull.pos.y, 5, 1500);

                    break;
                }
            }
            if (!found) {
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
            effects.force('in', ['player', 'item', 'bullet'], bull.pos, (mil - bull.born) / 20, [bull.o, bull]);
            noStroke();
            fill(40, 168, 102, random(0, 10));
            ellipse(bull.pos.x, bull.pos.y, (mil - bull.born) / 10, (mil - bull.born) / 10);
        },
        finished: function(bull) {
            effects.explore(bull.pos, 10, [200, 200, 0], bull.o);
            redArr.push(new RedZone(bull.pos.x, bull.pos.y, (mil - bull.born) / 10, 5000, bull.o));
            effects.smoke(bull.pos.x, bull.pos.y, 3, 600)
        }
    },
    Lazer: {
        name: "Lazer",
        damage: 5,
        radius: 3.5,
        speed: 30,
        life: 1, // seconds
        color: [255, 30, 30],
        working: function(bull) {
            strokeWeight(7);
            stroke(255, 30, 30);
            beginShape();
            for (var i = 0; i < 3; i++) {
                vertex(bull.pos.x + bull.vel.x * i, bull.pos.y + bull.vel.y * i);
            }
            endShape(CLOSE);
        },
        finished: function(bull) {
            effects.smoke(bull.pos.x, bull.pos.y, 1, 200, 5, true);
        }
    },
    Bomp: {
        name: "Bomp",
        damage: 0,
        radius: 0,
        speed: 100,
        life: 0, // seconds
        color: null,
        whenfire: function(bull) {
            if (bull.o == p) {
                var mouse = fakeToReal(mouseX, mouseY);
                epArr.push(new ExplorePoint(mouse.x, mouse.y, 20, [200, 200, 0], 700, bull.o));

                setTimeout(function() {
                    effects.smoke(mouse.x, mouse.y, 3, 800);
                    effects.force('out', ['player', 'item'], mouse, 400, []);
                }, 700);
            }
        }
    },
    Rocket: {
        name: "Rocket",
        damage: 5,
        radius: 10,
        speed: 15,
        life: 5, // seconds
        color: [200, 10, 10],
        working: function(bull) {
            if (!bull.target) {
                var pls = getPlayers(bull.pos, 100, [bull.o]);
                if (pls.length) {
                    var t = null;
                    var minDist = 100 + maxSizeNow;
                    for (var pl of pls) {
                        if (!pl.hide) {
                            if(bull.o.idTeam && bull.o.idTeam != pl.idTeam){
                                var d = p5.Vector.dist(pl.pos, bull.pos);
                                if (d < minDist && d < pl.radius + 100) {
                                    minDist = d;
                                    t = pl;
                                }
                            }
                        }
                    }
                    bull.target = t;
                }
                noFill();
                strokeWeight(3);
                stroke(100, random(100));
                ellipse(bull.pos.x, bull.pos.y, 100 * 2);

            } else {
                bull.vel = p5.Vector.lerp(bull.vel, p5.Vector.sub(bull.target.pos, bull.pos).setMag(bull.info.speed), 0.05);

                noFill();
                strokeWeight(1);
                stroke(200, 10, 10, 100);
                ellipse(bull.target.pos.x, bull.target.pos.y, bull.target.radius * 2 + 10);
                line(bull.pos.x, bull.pos.y, bull.target.pos.x, bull.target.pos.y);

                if(bull.target.hide) bull.target = null;
            }

            if (mil - (bull.smoked || 1) > 30) {
                effects.smoke(bull.pos.x, bull.pos.y, 1, 200, random(10, 30), 15);
                bull.smoked = mil;
            }
        },
        finished: function(bull) {
            effects.explore(bull.pos, 15, [255, 255, 0], bull.o);
            effects.force('out', ['player', 'item'], bull.pos, 400, []);
            effects.smoke(bull.pos.x, bull.pos.y, 3, 600);
        },
    },
    Turret: {
        name: "Turret",
        damage: 10,
        radius: 28,
        speed: 1,
        life: 15, // seconds
        color: [20, 20, 20],
        whenfire: function(bull) {
            bull.preShoot = mil;
            bull.shootCount = 0;
            bull.dir = 0;
        },
        working: function(bull) {
            var pls = getPlayers(bull.pos, 300, [bull.o]);
            if (pls.length) {
                var t = null;
                var minDist = 300 + maxSizeNow;
                for (var pl of pls) {
                    if (!pl.hide) {
                        if(bull.o.idTeam && bull.o.idTeam != pl.idTeam){
                            var d = p5.Vector.dist(pl.pos, bull.pos);
                            if (d < minDist && d < pl.radius + 300) {
                                minDist = d;
                                t = pl;
                            }
                        }
                    }
                }
                bull.target = t;

            } else {
                bull.target = null;
            }

            drawPlayerWithShape({
                pos: bull.pos,
                vel: bull.vel,
                radius: 30,
                col: bull.o.col
            }, 'Pentagon', bull.dir);

            if (bull.target) {
                noFill();
                strokeWeight(1);
                stroke(200, 10, 10, 100);
                ellipse(bull.target.pos.x, bull.target.pos.y, bull.target.radius * 2 + 10);
                line(bull.pos.x, bull.pos.y, bull.target.pos.x, bull.target.pos.y);

                if (mil - bull.preShoot > 250) {
                    bull.preShoot = mil;
                    var type;
                    switch(bull.shootCount){
                        case 4: type = bulletTypes.Bazoka; break;
                        case 8: type = bulletTypes.Rocket; break;
                        default: type =  bulletTypes.Lazer;
                    }
                    var dir = p5.Vector.sub(bull.target.pos.copy().add(bull.target.vel.x*2, bull.target.vel.y*2), bull.pos);
                    var vel = dir.copy().setMag(type.speed);
                    bArr.push(new Bullet(bull.pos, vel, type, bull.o));

                    bull.dir = dir.heading();
                    bull.shootCount += (bull.shootCount >= 8 ? -8 : 1);
                }

            } else {
                noFill();
                stroke(100, random(100));
                strokeWeight(2);
                ellipse(bull.pos.x, bull.pos.y, 300 * 2);
            }
        },
        finished: function(bull) {
            epArr.push(new ExplorePoint(bull.pos.x, bull.pos.y, 20, [200, 200, 0], 250, bull.o));

            setTimeout(function() {
                effects.smoke(bull.pos.x, bull.pos.y, 3, 1000);
                effects.force('out', ['player', 'item'], bull.pos, 400, []);
            }, 250);
        }
    }
}

// ======================= WEAPONS DATABASE ======================
var weapons = {
    AK: {
        name: "AK",
        gun: gunTypes.AK,
        bullet: bulletTypes.AK,
        color: [255, 255, 255],
        sound: "audio/mp5_01.mp3"
    },
    Shotgun: {
        name: "Shotgun",
        gun: gunTypes.Shotgun,
        bullet: bulletTypes.Shotgun,
        color: [255, 255, 255],
        sound: "audio/sv98_01.mp3"
    },
    Minigun: {
        name: "Minigun",
        gun: gunTypes.Minigun,
        bullet: bulletTypes.Minigun,
        color: [77, 155, 111],
        sound: ""
    },
    Mine: {
        name: "Mine",
        gun: gunTypes.Mine,
        bullet: bulletTypes.Mine,
        color: [77, 155, 111],
        sound: ""
    },
    Bazoka: {
        name: "Bazoka",
        gun: gunTypes.Bazoka,
        bullet: bulletTypes.Bazoka,
        color: [74, 91, 173],
        sound: "audio/mosin_01.mp3"
    },
    DropBomp: {
        name: "DropBomp",
        gun: gunTypes.Mine,
        bullet: bulletTypes.Bomp,
        color: [74, 91, 173],
        sound: ""
    },
    Lazer: {
        name: "Lazer",
        gun: gunTypes.Lazer,
        bullet: bulletTypes.Lazer,
        color: [183, 96, 86],
        sound: ""
    },
    PortalGun: {
        name: "PortalGun",
        gun: gunTypes.Portalgun,
        bullet: bulletTypes.PortalBullet,
        color: [183, 96, 86],
        sound: ""
    },
    Redzone: {
        name: "Redzone",
        gun: gunTypes.Bazoka,
        bullet: bulletTypes.RedzoneBullet,
        color: [183, 96, 86],
        sound: ""
    },
    Rocket: {
        name: "Rocket",
        gun: gunTypes.Bazoka,
        bullet: bulletTypes.Rocket,
        color: [176, 87, 186],
        sound: ""
    },
    Turret: {
        name: "Turret",
        gun: gunTypes.Bazoka,
        bullet: bulletTypes.Turret,
        color: [176, 87, 186],
        sound: ""
    }
}