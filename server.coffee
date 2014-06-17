#node server

express = require 'express'
path = require 'path'
bodyParser = require 'body-parser'
http = require 'http'

app = express()

#this should be in the pubic folder when i do the actual server setup. it should all be in the public folder
app.use express.static(path.join(__dirname, ''))

sever = http.createServer app

app.get '/', (request, response) ->
	ua = request.headers['user-agent']
	if /mobile/i.test ua
		console.log 'mobile'
	else
		response.sendfile __dirname + "/index.html"
		console.log 'desktop'

app.listen 8080
