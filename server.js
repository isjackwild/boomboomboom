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

io.sockets.on('connection', function(client) {
  console.log('a client connected');
  client.on('button-push', function(which) {
    console.log(which);
    return io.emit('button-push', which);
  });
  client.on('key-entered', function(which) {
    console.log("key entered", which);
    return io.emit('key-entered', which);
  });
  return client.on('disconnect', function(client) {
    return console.log('a client disconnect');
  });
});

server.listen(port, function() {
  return console.log('listening on ' + port);
});
