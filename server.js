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
  this.roomSocket = roomSocket;
  this.roomId = roomId;
};


io.sockets.on('connection', function(client) {
  console.log('a client connected');

  client.on('create-room', function(roomId) {
    console.log("create room", roomId);
    rooms.push(new room(client, roomId));
  });


  client.on('key-entered', function(key) {
    console.log("key entered", key);
    for (i=0; i<rooms.length; i++){
      if (rooms[i].roomId == key){
        console.log('room found');
        client.desktopToTalkTo = rooms[i].roomSocket;
      }
    }
    if (client.desktopToTalkTo){
      client.desktopToTalkTo.emit('key-entered', key);
    } else {
      console.log('incorrect Code');
    }
  });


  client.on('button-push', function(which) {
    console.log(which);
    if (client.desktopToTalkTo){
      client.desktopToTalkTo.emit('button-push', which);
    } else {
      console.log('there appears to have been some sort of mistake :(')
    }
  });

  client.on('disconnect', function() {
    for (i=rooms.length-1; i>=0; i--){
      if (rooms[i].roomSocket == client) {
        console.log('room deleted');
        rooms[i];
        rooms.splice (i, 1);
      }
    }

  });

});

server.listen(port, function() {
  return console.log('listening on ' + port);
});
