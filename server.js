var express = require('express');

var http = require('http');

var socket = require('socket.io');

var path = require('path');

var bodyParser = require('body-parser');

var bounscale = require('bounscale');

var app = express();

var server = http.createServer(app);

var io = socket.listen(server);

app.use(bounscale);

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


var desktopClients = [];

function desktopClient(desktopClientDetails, key){
  console.log('new room', key);
  this.desktopClientDetails = desktopClientDetails;
  this.key = key;
};


io.sockets.on('connection', function(client) {
  console.log('a client connected');


  client.on('new-desktop-client', function(key) {
    var keyExists = false;
    console.log("create room", key);
    for (i=0; i<desktopClients.length; i++){
      if (desktopClients[i].key == key){
        keyExists = true;
      }
    }
    if (keyExists == false){
      desktopClients.push(new desktopClient(client, key));
      client.emit('key-accepted')
    } else {
      setTimeout(function(){
        client.emit('key-unaccepted')
      },200) //just safety to stop crashing JUST IN CASE max num of rooms was reached, which is super unlikely!
    }
  });


  client.on('key-entered', function(key) {
    console.log("key entered", key);
    for (i=0; i<desktopClients.length; i++){
      if (desktopClients[i].key == key){
        client.desktopToTalkTo = desktopClients[i].desktopClientDetails;
      }
    }
    if (client.desktopToTalkTo){
      client.desktopToTalkTo.emit('key-entered', key);
      client.emit('correct-key');
    } else {
      client.emit('incorrect-key');
    }
  });


  client.on('button-push', function(which) {
    if (client.desktopToTalkTo){
      client.desktopToTalkTo.emit('button-push', which);
    }
  });

  client.on('disconnect', function() {
    for (i=desktopClients.length-1; i>=0; i--){
      if (desktopClients[i].desktopClientDetails == client) {
        console.log('room deleted');
        desktopClients[i];
        desktopClients.splice (i, 1);
      }
    }

  });

});

server.listen(port, function() {
  return console.log('listening on ' + port);
});
