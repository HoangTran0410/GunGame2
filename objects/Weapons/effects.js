var effects = {
    force: function(inOrOut, applyTo, pos, radius, excepts) {
        var bs = [],
            is = [],
            ps = [];

        if (applyTo.indexOf('bullet') != -1) {
            bs = getBullets(pos, radius, excepts);
            for (var bi of bs) {
                if (p5.Vector.dist(bi.pos, pos) < bi.info.radius + radius) {
                    var d = (inOrOut == 'in' ? p5.Vector.sub(pos, bi.pos) : p5.Vector.sub(bi.pos, pos));
                    bi.vel.add(d.limit(bi.info.speed)).limit(bi.info.speed * 3);
                }
            }
        }

        if (applyTo.indexOf('item') != -1) {
            is = getItems(pos, radius, excepts);
            for (var ii of is) {
                if (p5.Vector.dist(ii.pos, pos) < ii.radius + radius) {
                    var d = (inOrOut == 'in' ? p5.Vector.sub(pos, ii.pos) : p5.Vector.sub(ii.pos, pos));
                    ii.vel.add(d.setMag(map(radius + ii.radius - d.mag(), 0, radius, 1, 10)));
                }
            }
        }

        if (applyTo.indexOf('player') != -1) {
            ps = getPlayers(pos, radius, excepts);
            for (var pi of ps) {
                if (p5.Vector.dist(pi.pos, pos) < pi.radius + radius) {
                    var d = (inOrOut == 'in' ? p5.Vector.sub(pos, pi.pos) : p5.Vector.sub(pi.pos, pos));;
                    pi.vel.add(d.setMag(map(radius + pi.radius - d.mag(), 0, radius, 1, pi.vel.mag())));
                    if (pi.nextPoint) pi.nextPoint = null;
                }
            }
        }

        return {
            bulls: bs,
            items: is,
            players: ps,
            all: ps.concat(is).concat(bs)
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
                colorBull: col
            }
            bArr.push(new Bullet(pos, dir, btype, owner));
        }
    },
    smoke: function(x, y, num, life, r, randR) {
        randR = randR || 50;
        for (var i = 0; i < num; i++)
            sArr.push(new Smoke(x + random(-randR, randR), y + random(-randR, randR), life, r));
    },
    collision: function(base, obj, distance, calVel) {
        var d = distance || p5.Vector.dist(base.pos, obj.pos);

        if(d < base.radius + (obj.radius || obj.info.radius)){
            var overlap = 0.5 * (d - base.radius - (obj.radius || obj.info.radius));

            obj.pos.x += overlap * (base.pos.x - obj.pos.x) / d;
            obj.pos.y += overlap * (base.pos.y - obj.pos.y) / d;

            if (calVel) {
                // normal
                var nx = (obj.pos.x - base.pos.x) / d;
                var ny = (obj.pos.y - base.pos.y) / d;

                var tx = -ny;
                var ty = nx;

                var dpTan2 = obj.vel.x * tx + obj.vel.y * ty;

                // new vel
                var magvel = obj.vel.mag();
                obj.vel.x = tx * dpTan2 + nx * magvel * 0.7;
                obj.vel.y = ty * dpTan2 + ny * magvel * 0.7;
            }
        }
    }
}