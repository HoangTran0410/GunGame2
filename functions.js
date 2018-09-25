function realToFake(realX, realY) {
	return v(width / 2 + realX - viewport.pos.x,
		height / 2 + realY - viewport.pos.y);;
}

function fakeToReal(fakeX, fakeY) {
	return v(fakeX - width / 2 + viewport.pos.x,
		fakeY - height / 2 + viewport.pos.y);
}

function getObjQuad(applyTo, pos, radius, excepts){
	var bI = [], iI = [], pI = []; // In range
	var rB = [], rI = [], rP = []; // Result

	excepts = excepts || [];
	var range = new Circle(pos.x, pos.y, radius + 100);

	if(applyTo.indexOf('bullet') != -1){
		bI = quadBulls.query(range);
		for (var b of bI) {
			if(excepts.indexOf(b) == -1){ // && p5.Vector.dist(b.pos, pos) < b.info.radius + radius
				rB.push(b);
			}
		}
	}

	if(applyTo.indexOf('item') != -1){
		iI = quadItems.query(range);
		for (var i of iI) {
			if(excepts.indexOf(i) == -1){ //  && p5.Vector.dist(i.pos, pos) < i.radius + radius
				rI.push(i);
			}
		}
	}

	if(applyTo.indexOf('player') != -1){
		pI = quadPlayers.query(range);
		for (var pl of pI) {
			if(excepts.indexOf(pl) == -1){ //  && p5.Vector.dist(pl.pos, pos) < pl.radius + radius
				rP.push(pl);
			}
		}
	}

	return {
		bulls: rB,
		items: rI, 
		players: rP,
		all: rB.concat(rI).concat(rP)
	}
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
	var thuPham;

	if(bulletsInRange.length){
		for (var b of bulletsInRange) {
			if (p5.Vector.dist(t.pos, b.pos) < t.radius + b.info.radius) {
				t.health -= b.info.damage;
				t.updateSize();
				hit = true;
				thuPham = b;
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

		if(t.health < 0) t.die(thuPham); 
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

// =============== window onload =============
window.onload = () => {
	// get time
	setInterval(function() {
		gameTime = prettyTime(mil / 1000);
	}, 1000);
}

function autoAddPortals(num, step, life){
	// auto make portal
	setInterval(function() {
		if (pArr.length < 1)
			for (var i = 0; i < num; i++) {
				var portalOut = new Portal('out', random(gmap.size.x), random(gmap.size.y), null, null, life);
				var portalIn = new Portal('in', random(gmap.size.x), random(gmap.size.y), portalOut, null, life);
				pArr.push(portalOut, portalIn);
			}
	}(), step * 1000);
}

function autoAddRedzones(step){
	setInterval(function() {
		redArr.push(new RedZone(random(gmap.size.x), random(gmap.size.y),
			random(150, gmap.size.x / 8), random(15000, 60000)));
	}, step * 1000); // step in second
}

function autoAddItems(step){
	// tu dong them item
	setInterval(function() {
		if (iArr.length > maxItem * 1.5) {
			for (var i = 0; i < iArr.length - maxItem; i++)
				iArr.shift();
		
		} else if (iArr.length < maxItem / 2) {
			for (var i = iArr.length; i < maxItem / 2; i++)
				iArr.push(new Item(random(gmap.size.x), random(gmap.size.y)));
		}
		
		for (var i = 0; i < 5; i++)
			iArr.push(new Item(random(gmap.size.x), random(gmap.size.y)));
	}(), step * 1000);
}

function autoAddPlayers(step){
	// tu dong them player
	setInterval(function() {
		if(eArr.length < 30)
			eArr.push(new Character('enemy'+eArr.length, random(gmap.size.x), random(gmap.size.y)));
	}, step * 1000);
}

function getMaxSizeNow(step){
	setInterval(function() {
		var m = p ? p.radius : eArr[0].radius;
		for (var i of eArr) {
			if (i.radius > m)
				m = i.radius;
		}
		maxSizeNow = m;
	}, step * 1000);
}