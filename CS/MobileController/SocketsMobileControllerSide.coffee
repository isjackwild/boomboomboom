window.key = null

$ =>
	window.key = prompt 'enter key'

socket = io()

$(document).on 'touchstart click', () =>
	button = {
		button: 'a1'
		key: window.key
	}
	socket.emit 'button-push', button
