window.onload = () => {}

function realToFake(realX, realY) {
	return v(width / 2 + realX - viewport.pos.x,
		height / 2 + realY - viewport.pos.y);;
}

function fakeToReal(fakeX, fakeY) {
	return v(fakeX - width / 2 + viewport.pos.x,
		fakeY - height / 2 + viewport.pos.y);
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function insideViewport(t) {
	var pos = t.pos;
	var radius = t.radius || t.info.radius; // bullet save property 'radius' in 'info'
	return (pos.x > viewport.pos.x - width / 2 - radius &&
		pos.x < viewport.pos.x + width / 2 + radius &&
		pos.y > viewport.pos.y - height / 2 - radius &&
		pos.y < viewport.pos.y + height / 2 + radius)
}

function polygon(x, y, radius, npoints) {
	var angle = TWO_PI / npoints;
	beginShape();
	for (var a = 0; a < TWO_PI; a += angle) {
		var sx = x + cos(a) * radius;
		var sy = y + sin(a) * radius;
		vertex(sx, sy);
	}
	endShape(CLOSE);
}

function collisionBullets(t) {
	var radius = t.radius + 50;
	var range = new Circle(t.pos.x, t.pos.y, radius);
	var bulletsInRange = quadBulls.query(range);
	var hit = false;

	if(bulletsInRange.length){
		for (var b of bulletsInRange) {
			if (p5.Vector.dist(t.pos, b.pos) < t.radius + b.info.radius) {
				t.health -= b.info.damage;
				t.updateSize();
				hit = true;
				b.end();
			}
		}

		if (hit && t.nextPoint) { // if hit enemy => change direction enemy
			t.nextPoint = null; // reset nextPoint
		}

		// hit effect
		if(hit){ // is player
			var r = t.radius*2 + 30;
			fill(255, 0, 0, 120);
			ellipse(t.fakepos.x, t.fakepos.y, r, r);
		}
	}
}

function collisionEdge(t, bounce) {
	//khoi tao bien luu giu
	var radius = t.radius || t.info.radius;
	var top = radius;
	var left = radius;
	var bottom = gmap.size.y - radius;
	var right = gmap.size.x - radius;

	// bien tren
	if (t.pos.y < top) {
		t.vel.y *= -bounce;
		t.pos.y = top;

		//bien duoi
	} else if (t.pos.y > bottom) {
		t.vel.y *= -bounce;
		t.pos.y = bottom;
	}

	// bien trai
	if (t.pos.x < left) {
		t.vel.x *= -bounce;
		t.pos.x = left;

		// bien phai
	} else if (t.pos.x > right) {
		t.vel.x *= -bounce;
		t.pos.x = right;
	}
}

function prettyTime(s) {
	s = s || 0;

	var seconds = (s % 60) | 0;
	var minutes = (s / 60 % 60) | 0;
	var hours = (s / 3600) | 0;

	if (hours) return hours + ':' + ('0' + minutes).substr(-2) + ':' + ('0' + seconds).substr(-2);
	else return minutes + ':' + ('0' + seconds).substr(-2);
}

function v(x, y) {
	return createVector(x, y);
}

// ======= Array , Object function ========

function getObjectIndex(obj, keyToFind) {
	var result = Object.keys(obj).indexOf(keyToFind);
	if (result == -1) result = null;
	return result;
}

function getValueAtIndex(obj, index) {
	return Object.keys(obj)[index];
}

function getObjectLength(obj) {
	return Object.keys(obj).length;
}