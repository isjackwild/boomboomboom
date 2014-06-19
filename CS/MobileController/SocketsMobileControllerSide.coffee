window.key = null

$ =>
	window.key = prompt 'enter key'
	console.log 'setup controller'

socket = io()

$('.button').on 'touchstart', (event) =>
	console.log 'touch'
	whichButton = event.currentTarget.id
	button = {
		button: whichButton.toString();
		key: window.key
	}
	socket.emit 'button-push', button
	console.log button
