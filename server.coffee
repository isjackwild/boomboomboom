#node server

express = require 'express'
http = require 'http'
socket = require 'socket.io'
path = require 'path'
bodyParser = require 'body-parser'

app = express()

server = http.createServer app
io = socket.listen server


io.sockets.on 'connection', (client) ->
	console.log 'client connected'



app.get '/', (request, response) ->
	console.log 'request sent'
	ua = request.headers['user-agent']
	if /mobile/i.test ua
		console.log 'mobile'
		app.use express.static(path.join(__dirname, ''))
		response.sendfile __dirname + "/mobile.html"
	else
		app.use express.static(path.join(__dirname, ''))
		response.sendfile __dirname + "/index.html"
		console.log 'desktop'

server.listen 8080, '0.0.0.0'
