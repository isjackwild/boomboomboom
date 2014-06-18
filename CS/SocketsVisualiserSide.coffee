#socketevents
window.key = null
$ =>
	window.key = Math.floor Math.random()*99999
	window.key = window.key.toString()
	console.log 'the key for this is ' + window.key


socket = io()

socket.on 'button-push', (which) ->
	console.log 'ipad button pushed', which
	if which.key is window.key
		console.log 'im listening to this ipad'
	else
		console.log 'ignore'