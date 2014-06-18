window.key = null

$ =>
	window.key = prompt 'enter key'
	alert 'connected with key ' + window.key

socket = io()

document.onclick = =>
	button = {
		button: 'a1'
		key: window.key
	}

	socket.emit 'button-push', button
	console.log 'pushed button on ipad'