function reset() {
    // khoi tao socket.io (multiplayers)
    // socket = io.connect("http://localhost:3000");

    eArr = []; // enemys
    bArr = []; // bullets
    iArr = []; // items
    rArr = []; // rocks
    tArr = []; // trees
    pArr = []; // portals
    redArr = []; // redzones
    epArr = []; // explore points
    notifi = []; // notification

    // khoi tao nhan vat
    p = new Character(pname, random(gmap.size.x), random(gmap.size.y), null, 100);

    // khung nhin
    viewport = new Viewport(p);

    // // them player may
    for (var i = 0; i < 5; i++)
        eArr.push(new Character(null, random(gmap.size.x), random(gmap.size.y)));

    // them rocks
    for (var i = 0; i < 50; i++)
        rArr.push(new Rock(random(gmap.size.x), random(gmap.size.y), random(50, 300)));

    // them trees
    for (var i = 0; i < 100; i++)
        tArr.push(new Tree(random(gmap.size.x), random(gmap.size.y), random(50, 150)));

    gmap.createMinimap();
}

function realToFake(realX, realY) {
    return v(width / 2 + realX - viewport.pos.x,
        height / 2 + realY - viewport.pos.y);;
}

function fakeToReal(fakeX, fakeY) {
    return v(fakeX - width / 2 + viewport.pos.x,
        fakeY - height / 2 + viewport.pos.y);
}

function collisionBullets(t) {
    var radius = t.radius + 50;
    var range = new Circle(t.pos.x, t.pos.y, radius);
    var bulletsInRange = quadBulls.query(range);
    var hit = false;
    var thuPham;

    if (bulletsInRange.length) {
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
        if (hit) { // is player
            var r = t.radius * 2 + 30;
            fill(255, 0, 0, 120);
            // ellipse(t.fakepos.x, t.fakepos.y, r, r);
            ellipse(t.pos.x, t.pos.y, r, r);
        }

        if (t.health < 0) t.die(thuPham);
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
    }

    //bien duoi
    else if (t.pos.y > bottom) {
        t.vel.y *= -bounce;
        t.pos.y = bottom;
    }

    // bien trai
    if (t.pos.x < left) {
        t.vel.x *= -bounce;
        t.pos.x = left;
    }

    // bien phai
    else if (t.pos.x > right) {
        t.vel.x *= -bounce;
        t.pos.x = right;
    }
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

// ============= Audio ====================
function createNewAudio(linkMedia) {
    if (myAudio == null) {
        myAudio = createAudio(linkMedia);
        myAudio.elt.controls = true;
        myAudio.elt.volume = 0.5;
        myAudio.autoplay(true);
        myAudio.onended(function() {
            changeSong(1);
        });
        myAudio.elt.onloadeddata = function(){
            myAudio.elt.currentTime = random(myAudio.elt.duration / 1.5);
        };
        myAudio.connect(p5.soundOut);

    } else {
        myAudio.src = linkMedia;
    }
}

function changeSong(step) {
    songNow += step;
    if (songNow >= musics.SongList.length) songNow = 0;
    else if (songNow < 0) songNow = musics.SongList.length - 1;

    notifi.push(new Notification("Song: " + musics.SongList[songNow].name, 20, null, 5000));
    createNewAudio(musics.SongList[songNow].link);
}

// ============= Alert Notification ==============
function addAlertBox(text, bgcolor, textcolor) {
    var al = document.getElementById('alert');
    al.childNodes[0].nodeValue = text;
    al.style.backgroundColor = bgcolor;
    al.style.opacity = 0.7;
    al.style.zIndex = 10;

    if (textcolor) al.style.color = textcolor;
}

function addMessage(mes, from, withTime, color, onclickFunc) {
    var newMes = document.createElement('p');
    if (color) {
        newMes.style.backgroundColor = ("rgba(" + color.levels[0] + "," + color.levels[1] + "," + color.levels[2] + "," + "0.3)");
    }

    if(withTime){
        var timeNode = document.createElement('span');
        timeNode.textContent = (withTime ? (prettyTime(mil / 1000) + "  ") : "");
        newMes.appendChild(timeNode);
    }

    if(from){
        var fromNode = document.createElement('span');
        fromNode.style.fontWeight = 'bold';
        fromNode.textContent = (from ? (from + ": ") : "");
        newMes.appendChild(fromNode);
    }

    if(mes){
        var mesNode = document.createTextNode(mes);
        newMes.appendChild(mesNode);
    }
    
    if(onclickFunc){
        newMes.addEventListener("mouseover", function(){
            newMes.style.cursor = 'pointer';
            newMes.style.borderWidth = "1px 0 1px 0";
            newMes.style.borderColor = "white";
            newMes.style.borderStyle = "dashed";
        });
        newMes.addEventListener("mouseout", function(){
            newMes.style.border = "none";
        });
        newMes.addEventListener("click", onclickFunc);
    }

    document.getElementById('conversation').appendChild(newMes);
    newMes.scrollIntoView();
}

function help() {
    addMessage(" - - - - - Gun Game 2 - - - - - ", '', false, color(255), function(){window.open('https://github.com/HoangTran0410/2D-Game')});
    addMessage("Eat And Fire to Survive", '', false, color(150));
    addMessage("W A S D / ArrowKey: Move.");
    // addMessage("SpaceBar : Speed up.")
    addMessage("LEFT-Mouse : Shoot.");
    addMessage("SCROLL-Mouse, 1->9 : Change Gun.");
    addMessage("R : Reload.");
    addMessage("F : Shield (can't shoot).");
    addMessage("Q (Hold): look around (minimap).");
    addMessage("M: Open/close minimap.");
    addMessage("N: Change music.");
    addMessage("ENTER : Chat.");
    addMessage("C : Show/Hide Chat box.");
    addMessage("V : FreeCam Mode (on/off).");
    addMessage("Type '/help' for more option", '', false, color(200));
    addMessage("--------------------------------");
}

function showChat(show) {
    if (show) {
        document.getElementById('showHideChat').value = 'Hide';
        document.getElementById('conversation').style.width = "100%";
        document.getElementById('chatBox').style.left = "0px";
    } else {
        document.getElementById('showHideChat').value = 'Show';
        document.getElementById('conversation').style.width = "25%";
        document.getElementById('chatBox').style.left = "-240px";
    }
}

function isTyping() {
    return (document.getElementById('inputMes') === document.activeElement);
}

// ======= Array , Object function ========
function getObjQuad(applyTo, pos, radius, excepts) {
    var bI = [],
        iI = [],
        pI = []; // In range
    var rB = [],
        rI = [],
        rP = []; // Result

    excepts = excepts || [];
    var range = new Circle(pos.x, pos.y, radius + 100);

    if (applyTo.indexOf('bullet') != -1) {
        bI = quadBulls.query(range);
        for (var b of bI) {
            if (excepts.indexOf(b) == -1) {
                rB.push(b);
            }
        }
    }

    if (applyTo.indexOf('item') != -1) {
        iI = quadItems.query(range);
        for (var i of iI) {
            if (excepts.indexOf(i) == -1) {
                rI.push(i);
            }
        }
    }

    if (applyTo.indexOf('player') != -1) {
        pI = quadPlayers.query(range);
        for (var pl of pI) {
            if (excepts.indexOf(pl) == -1) {
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

    document.addEventListener('contextmenu', event => event.preventDefault());

    document.getElementById('closebtn')
        .addEventListener('mouseover', (event) => {
            event.target.parentElement.style.opacity = 0;
            event.target.parentElement.style.zIndex = 0;
        });

    document.getElementById('showHideChat')
        .addEventListener('mouseover', function(event) {
            if (event.target.value == 'Hide') {
                showChat(false);

            } else {
                showChat(true);
            }
        });
}

function autoAddPortals(num, step, life) {
    setInterval(function() {
        for (var i = 0; i < num; i++) {
            var portalOut = new Portal('out', random(gmap.size.x), random(gmap.size.y), null, null, life);
            var portalIn = new Portal('in', random(gmap.size.x), random(gmap.size.y), portalOut, null, life);
            pArr.push({
                inGate: portalIn,
                outGate: portalOut
            });
        }
    }, step * 1000);
}

function autoAddRedzones(step) {
    setInterval(function() {
        redArr.push(new RedZone(random(gmap.size.x), random(gmap.size.y),
            random(150, gmap.size.x / 8), random(15000, 60000)));
    }, step * 1000); // step in second
}

function autoAddItems(step) {
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
    }, step * 1000);
}

function autoAddPlayers(step) {
    // tu dong them player
    setInterval(function() {
        if (eArr.length < 20)
            eArr.push(new Character(null, random(gmap.size.x), random(gmap.size.y)));
    }, step * 1000);
}

function getMaxSizeNow(step) {
    setInterval(function() {
        var m = p ? p.radius : eArr[0].radius;
        for (var i of eArr) {
            if (i.radius > m)
                m = i.radius;
        }
        maxSizeNow = m;
    }, step * 1000);
}