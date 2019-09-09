/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,			// Canvas DOM element
	canvasBg,
	ctxBg,
	ctx,			// Canvas rendering context
	keys,			// Keyboard input
	localPlayer,
	remotePlayers,
	imgSprite,
	socket;

var mobile = false;

/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	var canvasWidth = 800;
	var canvasHeight = 500;
	// Declare the canvas and rendering context
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");
	// Maximise the canvas
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
  	canvas.addEventListener('click', on_canvas_click, false);

  	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
  		mobile = true;
	}

  	if(mobile){
	  	Hammer(canvas).on('dragstart dragend', function(ev){
	  		var touches = ev.gesture.touches;

	  		if(ev.type == 'dragstart'){
	  			localPlayer.setDragstart(touches[0].pageX, touches[0].pageY);
	  		}else if(ev.type == 'dragend'){
	  			localPlayer.setDragend(touches[0].pageX, touches[0].pageY);
	  		}
	  	});
  	}

  	// Set up background
	canvasBg = document.getElementById("gameBg");
	ctxBg = canvasBg.getContext("2d");
	canvasBg.width = canvasWidth;
	canvasBg.height = canvasHeight;

	// Initialise keyboard controls
	keys = new Keys();

  	// Initialise Sprite Image
  	imgSprite = new Image();
  	imgSprite.src = 'images/sprite.png';
  	imgSprite.addEventListener('load',drawBg,false);

	// Calculate a random start position for the local player
	// The minus 5 (half a player size) stops the player being
	// placed right on the egde of the screen
	var startX = Math.round(Math.random()*(canvas.width-shipLength+1)),
		startY = Math.round(Math.random()*(canvas.height-shipLength+1));

  	var colorChar = prompt("Please enter color","Enter your color here");

	// Initialise the local player
	localPlayer = new Player(startX, startY, colorChar);
	// Start listening for events
	remotePlayers = [];
	socket = io.connect("http://192.168.200.123", {port: 8080, transports: ["websocket"]});
	setEventHandlers();
};

/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Keyboard
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);
	// Window resize
	window.addEventListener("resize", onResize, false);

  	socket.on("connect", onSocketConnected);
  	socket.on("disconnect", onSocketDisconnect);
  	socket.on("new player", onNewPlayer);
  	socket.on("move player", onMovePlayer);
  	socket.on("remove player", onRemovePlayer);
  	socket.on("new shot", onNewShot);
};

// Keyboard key down
function onKeydown(e) {
	if (localPlayer) {
		keys.onKeyDown(e);
	};
};

// Keyboard key up
function onKeyup(e) {
	if (localPlayer) {
		keys.onKeyUp(e);
	};
};

// Browser window resize
function onResize(e) {
	// Maximise the canvas
	//canvas.width = window.innerWidth;
	//canvas.height = window.innerHeight;
};

function onSocketConnected() {
    console.log("Connected to socket server");

    socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY(), t:localPlayer.getType()});
};

function onSocketDisconnect() {
    console.log("Disconnected from socket server");
};

function onNewPlayer(data) {
    console.log("New player connected: "+data.id);
    
    var newPlayer = new Player(data.x, data.y, data.t);
    newPlayer.id = data.id;
    remotePlayers.push(newPlayer);
};

function onNewShot(data){
	console.log("Player "+data.id+" shot a new shot [sx:"+data.bullet.startX+" sy:"+data.bullet.startY+" cx:"+data.bullet.clickX+" cy:"+data.bullet.clickY+"]");
	var newPlayerShot = playerById(data.id);
	if(!newPlayerShot){
		console.log("Player not found: "+data.id);
		return;
	}

	newPlayerShot.addBullet(data.bullet.clickX, data.bullet.clickY);
}

function onMovePlayer(data) {
  var movePlayer = playerById(data.id);

  if (!movePlayer) {
      console.log("Player not found: "+data.id);
      return;
  };

  movePlayer.setX(data.x);
  movePlayer.setY(data.y);
};

function onRemovePlayer(data) {
  var removePlayer = playerById(data.id);

  if (!removePlayer) {
      console.log("Player not found: "+data.id);
      return;
  };

  remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};

/**************************************************
** GAME ANIMATION LOOP
**************************************************/
function animate() {
	update();
	draw();

	// Request a new animation frame using Paul Irish's shim
	window.requestAnimFrame(animate);
};


/**************************************************
** GAME UPDATE
**************************************************/
function update() {
  if (localPlayer.update(keys)) {
      socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY()});
  };
};


/**************************************************
** GAME DRAW
**************************************************/
function draw() {
	// Wipe the canvas clean
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// Draw the local player
	localPlayer.draw(ctx);
	for (var i = 0; i < remotePlayers.length; i++) {
	  remotePlayers[i].draw(ctx);
	};
};

function playerById(id) {
    var i;
    for (i = 0; i < remotePlayers.length; i++) {
        if (remotePlayers[i].id == id)
            return remotePlayers[i];
    };

    return false;
};

function drawBg(){
  ctxBg.drawImage(imgSprite,0,0,canvasBg.width,canvasBg.height,0,0,canvasBg.width,canvasBg.height);
};

function on_canvas_click(e){
	var x = e.offsetX==undefined?e.layerX:e.offsetX;
	var y = e.offsetY==undefined?e.layerY:e.offsetY;
	if(localPlayer) {localPlayer.addBullet(x, y)}
	//alert(x + ',' + y);
	socket.emit("new shot", { startX: localPlayer.getX(), startY: localPlayer.getY(), clickX: x, clickY: y});
	e.preventDefault();
};
