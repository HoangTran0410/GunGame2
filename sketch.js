// var socket;

var myAudio;
var songNow;
var ampData;
var ampLevel;

var viewport;
var gmap; // game map

var p;
var pname;
var eArr = []; // enemys
var bArr = []; // bullets
var iArr = []; // items
var rArr = []; // rocks
var tArr = []; // trees
var pArr = []; // portals
var redArr = []; // redzones
var epArr = []; // explore points
var notifi = []; // notification

var quadPlayers;
var quadItems;
var quadBulls;
var boundMap;

var fr; // frameRate
var mil = 0; // milliseconds from begin of game
var gameTime = 0; // time from begin of game to now
var maxItem = 500;
var maxSizeNow = 100;
var weaponInfo;

function setup() {
    createCanvas(windowWidth, windowHeight).position(0, 0);
    noSmooth();
    rectMode(CENTER);
    textAlign(LEFT);
    textFont('Consolas');

    ampData = new p5.Amplitude();
    songNow = floor(random(musics.SongList.length));

    // khoi tao moi truong ban do
    gmap = new GameMap(10000, 10000, 300);

    // get player name
    pname = window.prompt('Enter your Player Name');
    if (pname) localStorage.setItem('pname', pname);
    else pname = localStorage.getItem('pname');

    reset();

    weaponInfo = new InfoWeapon();
    setInterval(function() {
        gmap.createMinimap();
    }, 10000);

    // dung cho quadtree
    boundMap = new Rectangle(gmap.size.x / 2, gmap.size.y / 2, gmap.size.x, gmap.size.y);
    quadItems = new QuadTree(boundMap, 5);
    quadBulls = new QuadTree(boundMap, 5);
    quadPlayers = new QuadTree(boundMap, 1);

    autoAddPlayers(5);
    autoAddItems(5);
    autoAddRedzones(30);
    getMaxSizeNow(2);
    autoAddPortals(2, 15, 14);

    help(10);
    changeSong(1);
    addAlertBox('Please read the Rules in chat box.', '#f55', '#fff');
}

function draw() {
    if (focused) {

        background(20);
        fr = frameRate();
        mil = millis();
        ampLevel = ampData.getLevel();

        gmap.run();
        viewport.run();

        // update quadtrees
        quadItems.clear();
        for (var i of iArr) quadItems.insert(i);

        quadBulls.clear();
        for (var b of bArr) quadBulls.insert(b);

        quadPlayers.clear();
        if(p) quadPlayers.insert(p);
        for (var ei of eArr) quadPlayers.insert(ei);

        // // items
        for (var i = iArr.length - 1; i >= 0; i--)
            iArr[i].run();

        // bullets
        for (var i = bArr.length - 1; i >= 0; i--)
            bArr[i].run();

        // // rocks
        for (var i = rArr.length - 1; i >= 0; i--)
            rArr[i].run();

        // characters
        if(p){
            p.move();
            p.run();
        }
        for (var ei of eArr) {
            ei.autoMove();
            ei.autoFire();
            ei.run();
        }

        // reset hide value
        if(p) p.hide = false;
        for (var ei of eArr) ei.hide = false;

        // fire
        if (mouseIsPressed && p) p.fire(fakeToReal(mouseX, mouseY));
        if (keyIsDown(32)) viewport.pos = viewport.target.pos.copy();

        // portals
        for (var i = pArr.length - 1; i >= 0; i--) {
            if (!pArr[i].inGate.run() && pArr[i].outGate)
                pArr[i].outGate.run();
        }

        // trees
        for (var i = tArr.length - 1; i >= 0; i--)
            tArr[i].run();

        gmap.showMinimap();
        weaponInfo.show();

        // red zone
        for (var i = redArr.length - 1; i >= 0; i--)
            redArr[i].show();

        // explore points
        for (var i = epArr.length - 1; i >= 0; i--) {
            epArr[i].show();
            epArr[i].checkExplore(epArr);
        }

        // notifications
        for (var n of notifi) {
            n.run();
        }

        // fps
        textSize(20);
        textAlign(LEFT);
        noStroke();
        fill(255, 150);
        text('Fps: ' + floor(frameRate()), 5, 20);
        text('Time: ' + gameTime, 5, 45);
        text('Players: ' + ((p ? 1 : 0) + eArr.length), 5, 70);
        text('Killed: ' + viewport.target.killed, 5, 95);

        textAlign(CENTER);
        text(floor(viewport.pos.x) + " " + floor(viewport.pos.y), width / 2, height - 25);
    }
}

function keyPressed() {
    if (!isTyping()) {
        if (keyCode == 86) { // V
            viewport.follow = !viewport.follow;

        } else if (keyCode == 77) { // M
            gmap.hiddenMinimap = !gmap.hiddenMinimap;

        } else if (keyCode == 70) { // F
            if(p) p.shield = !p.shield;

        } else if (keyCode >= 49 && keyCode <= 57) { // number
            if (p && keyCode - 49 < getObjectLength(weapons)) {
                var weaponNow = getObjectIndex(weapons, p.weapon.name);
                p.changeWeapon(keyCode - 49 - weaponNow);
            }

        } else if (keyCode == 82) { // R
            if (p) p.weapon.gun.reload();

        } else if (keyCode == 67) { // C
            var value = document.getElementById('showHideChat').value;
            if (value == 'Show') showChat(true);
            else showChat(false);

        } else if (keyCode == 78) { // N
            changeSong(1);

        } else if (keyCode == 72) { // H
            help(5);
        
        } else if (keyCode == 13) {
            showChat(true);
            document.getElementById('inputMes').focus();
        }

    } else if(keyCode == 13){
        var ele = document.getElementById('inputMes');
        switch (ele.value) {
            case '':
                break;

            case '/help':
                addMessage('/howtoplay, /showplayers, /clear, /reset, /contact', 'Server');
                break;

            case '/howtoplay':
                help();
                break;

            case '/showplayers':
                var names = "";
                for (var i = 0; i < e.length; i++) {
                    names += (e[i].name + ", ");
                }
                addMessage(names, 'Server', false, color(0));
                break;

            case '/clear':
                var myNode = document.getElementById('conversation');
                while (myNode.firstChild) {
                    myNode.removeChild(myNode.firstChild);
                }
                break;

            case '/reset':
                reset();
                addMessage('The Game has been Restarted', 'Server', true, color(0, 150, 0));
                break;

            case '/contact':
                addMessage('click here \u2665', 'My Github', false, color(100), 
                    function(){window.open('https://github.com/HoangTran0410')});
                addMessage('click here \u2665', 'My Facebook', false, color(0, 0, 255), 
                    function(){window.open('https://www.facebook.com/people/Hoang-Tran/100004848287494')});
                break;

            default:
                addMessage(event.target.value, p.name, true, color(p.col[0],p.col[1],p.col[2]));
                break;
        }

        ele.blur();
        ele.value = '';
    }
}

function mousePressed() {
    if(!p)
    if (event.target.matches('canvas') || document.getElementById('showHideChat').value == 'Show') {
        var newTarget = eArr[(eArr.indexOf(viewport.target) + 1) % eArr.length]
        viewport.target = newTarget;
    }
}

function mouseWheel(event) {
    if (p && (event.target.matches('canvas')) || document.getElementById('showHideChat').value == 'Show') 
        if (!p.shield) p.changeWeapon(event.delta > 0 ? 1 : -1);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight, true);
    // gmap.createMinimap();
    gmap.offSetX = width - gmap.minimapSize - 10;
    weaponInfo = new InfoWeapon();
}
