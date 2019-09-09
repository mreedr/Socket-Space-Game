// Placeholder file for Node.js game server
var util = require("util"),
    express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require("socket.io"),
    Player = require("./Player").Player;

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
});

app.configure('development', function(){
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


var socket,
    players;

function init() {
  players = [];

  server.listen(8000);

  socket = io.listen(8080);
  socket.configure(function() {
      socket.set("transports", ["websocket"]);
      socket.set("log level", 2);
  });
  setEventHandlers();
};

//why cant this be funciton setEventHandlers(); ??
var setEventHandlers = function() {
    socket.sockets.on("connection", onSocketConnection);
};

function onSocketConnection(client) {
    util.log("New player has connected: "+client.id);
    client.on("disconnect", onClientDisconnect);
    client.on("new player", onNewPlayer);
    client.on("move player", onMovePlayer);
    client.on("new shot", onNewShot);
};


function onClientDisconnect() {
    util.log("Player has disconnected: "+this.id);
    var removePlayer = playerById(this.id);

    if (!removePlayer) {
        util.log("Player not found: "+this.id);
        return;
    };

    players.splice(players.indexOf(removePlayer), 1);
    this.broadcast.emit("remove player", {id: this.id});
};

function onNewPlayer(data) {
  util.log("New player type " +data.t);
  var newPlayer = new Player(data.x, data.y, data.t);
  newPlayer.id = this.id;
  this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), t: newPlayer.getType()});

  var i, existingPlayer;
  for (i = 0; i < players.length; i++) {
      existingPlayer = players[i];
      this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY(), t: existingPlayer.getType()});
  };
  players.push(newPlayer);

};

function onNewShot(data) {
	util.log("Player has shot: "+this.id);
	var newShotPlayer = playerById(this.id);

	if(!newShotPlayer){
		util.log("Player not found "+this.id);
		return;
	}
	newShotPlayer.addBullet(data.startX, data.startY, data.clickX, data.clickY);

	this.broadcast.emit("new shot", {id: newShotPlayer.id, bullet: newShotPlayer.getBullet()});
}

function onMovePlayer(data) {
  var movePlayer = playerById(this.id);

  if (!movePlayer) {
      util.log("Player not found: "+this.id);
      return;
  };

  movePlayer.setX(data.x);
  movePlayer.setY(data.y);

  this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()});
};

init();

function playerById(id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].id == id)
            return players[i];
    };

    return false;
};
