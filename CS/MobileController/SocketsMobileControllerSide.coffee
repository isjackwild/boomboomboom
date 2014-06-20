window.key = null

$ =>
	console.log 'setup controller'


socket = io()


$('#inputForm').on 'submit', (e) =>
	e.stopPropagation()
	e.preventDefault()
	window.key = $('#inputKey').val().toString()
	socket.emit 'key-entered', window.key
	$("#inputKey").blur()
	$('#introWrapper').addClass 'downAndOut'
	setTimeout ()->
		$('#introWrapper').addClass 'hidden'
	,666


$('.button').on 'touchstart', (event) =>
	console.log 'touch'
	whichButton = event.currentTarget.id
	button = {
		button: whichButton.toString();
		key: window.key
	}
	socket.emit 'button-push', button
	console.log button

