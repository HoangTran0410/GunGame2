var effects = {
    force: function(inOrOut, applyTo, pos, radius, excepts, n) {
        var arr = getObjQuad(applyTo, pos, radius, excepts);

        for (var bi of arr.bulls) {
            if (p5.Vector.dist(bi.pos, pos) < bi.info.radius + radius) {
                var d = (inOrOut == 'in' ? p5.Vector.sub(pos, bi.pos) : p5.Vector.sub(bi.pos, pos));
                bi.vel.add(d.limit(bi.info.speed)).limit(bi.info.speed * 3);
            }
        }

        for (var ii of arr.items) {
            if (p5.Vector.dist(ii.pos, pos) < ii.radius + radius) {
                var d = (inOrOut == 'in' ? p5.Vector.sub(pos, ii.pos) : p5.Vector.sub(ii.pos, pos));
                ii.vel.add(d.setMag(map(radius + ii.radius - d.mag(), 0, radius, 1, 10)));
            }
        }

        for (var pi of arr.players) {
            if (p5.Vector.dist(pi.pos, pos) < pi.radius + radius) {
                var d = (inOrOut == 'in' ? p5.Vector.sub(pos, pi.pos) : p5.Vector.sub(pi.pos, pos));;
                pi.vel.add(d.setMag(map(radius + pi.radius - d.mag(), 0, radius, 1, pi.vel.mag())));
                if (pi.nextPoint) pi.nextPoint = null;
            }
        }

        return {
            bulls: arr.bulls,
            items: arr.items,
            players: arr.players,
            all: arr.all
        };
    },
    explore: function(pos, numOfBull, colo, owner) {
        var dir, damage, radius, col, lifeSpan, vel;
        for (var i = 0; i < numOfBull; i++) {
            damage = random(5, 10);
            vel = 25 - damage;
            dir = v(random(-vel, vel), random(-vel, vel));
            radius = damage / 1.5;
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
    },
    smoke: function(x, y, num, life, r, norand) {
        for (var i = 0; i < num; i++)
            sArr.push(new Smoke(x + (norand?0:random(-50, 50)),
                                y + (norand?0:random(-50, 50)),
                                life, r));
    }
}