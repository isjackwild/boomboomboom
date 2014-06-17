(function() {
  var app, bodyParser, express, http, path, sever;

  express = require('express');

  path = require('path');

  bodyParser = require('body-parser');

  http = require('http');

  app = express();

  app.use(express["static"](path.join(__dirname, '')));

  sever = http.createServer(app);

  app.get('/', function(request, response) {
    var ua;
    ua = request.headers['user-agent'];
    if (/mobile/i.test(ua)) {
      return console.log('mobile');
    } else {
      response.sendfile(__dirname + "/index.html");
      return console.log('desktop');
    }
  });

  app.listen(8080);

}).call(this);
