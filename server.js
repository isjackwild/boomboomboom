(function() {
  var app, bodyParser, express, http, io, path, server, socket;

  express = require('express');

  http = require('http');

  socket = require('socket.io');

  path = require('path');

  bodyParser = require('body-parser');

  app = express();

  server = http.createServer(app);

  io = socket.listen(server);

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

  server.listen(8080, '0.0.0.0');

}).call(this);
