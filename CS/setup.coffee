setupMic = (stream) ->
	console.log 'setup Mic'
	window.events.micAccepted.dispatch stream;

onError = (err) ->
	console.log 'error setting up mic'


$('.continue').on 'touchstart click', () =>
	$('.accept').removeClass 'hidden'
	navigator.webkitGetUserMedia
			audio: true
		,setupMic, onError


$('.usekeyboard').on 'touchstart click', () =>
	$('#instructions').addClass 'hidden'