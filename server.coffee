#node server

express = require 'express'
http = require 'http'
socket = require 'socket.io'
path = require 'path'
bodyParser = require 'body-parser'

app = express()

server = http.createServer app
io = socket.listen server


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

port = Number(process.env.PORT || 8080)

io.sockets.on 'connection', (client) ->
	console.log 'a client connected'

	client.on 'button-push', (which) ->
		console.log which
		io.emit 'button-push', which

	client.on 'key-entered', (which) ->
		console.log "key entered", which
		io.emit 'key-entered', which

	client.on 'disconnect', (client) ->
		console.log 'a client disconnect'

# server.listen 5000, '0.0.0.0'
server.listen port, () ->
	console.log 'listening on ' + port