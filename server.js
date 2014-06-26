var express = require('express');

var http = require('http');

var socket = require('socket.io');

var path = require('path');

var bodyParser = require('body-parser');

var app = express();

var server = http.createServer(app);

var io = socket.listen(server);

app.get('/', function(request, response) {
  var ua;
  console.log('request sent');
  ua = request.headers['user-agent'];
  if (/mobile/i.test(ua)) {
    console.log('mobile');
    app.use(express["static"](path.join(__dirname, '')));
    return response.sendfile(__dirname + "/mobile.html");
  } else {
    app.use(express["static"](path.join(__dirname, '')));
    response.sendfile(__dirname + "/index.html");
    return console.log('desktop');
  }
});

var port = Number(process.env.PORT || 8080);


var rooms = [];
function room(roomSocket, roomId){
  console.log('new room', roomId);
  this.roomSocket = roomSocket;  //Stores the socket for the desktop connection
  this.roomId = roomId;          //The room id/name. A unique string that links desktop to mobile
  this.mobileSockets = [];       //A list of all the mobile connections
};


io.sockets.on('connection', function(client) {
  console.log('a client connected');

  client.on('button-push', function(which) {
    console.log(which);
    io.emit('button-push', which);
  });

  client.on('key-entered', function(key) {
    console.log("key entered", key);
    io.emit('key-entered', key);
  });

  client.on('create-room', function(roomId) {
    console.log("create room", roomId);
    rooms.push(new room(client, roomId));
  });

  client.on('disconnect', function(client) {
    console.log('a client disconnect');
  });

});

server.listen(port, function() {
  return console.log('listening on ' + port);
});
