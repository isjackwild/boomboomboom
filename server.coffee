#node server

express = require 'express'
path = require 'path'
bodyParser = require 'body-parser'
http = require 'http'

app = express()

sever = http.createServer app

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

app.listen 8080
