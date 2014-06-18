clickContinue = () ->
	$('.accept').removeClass 'hidden'
	navigator.webkitGetUserMedia
			audio: true
		,setupMic, onError

setupMic = (stream) ->
	console.log 'setup Mic'
	$('.accept').addClass 'hidden'
	$('#instructions').addClass 'hidden'
	$('#ipadInstructions').addClass 'hidden'
	window.events.micAccepted.dispatch stream;

onError = (err) ->
	console.log 'error setting up mic'


connectIpad = () ->
	$('#instructions').addClass 'hidden'
	$('#ipadInstructions').removeClass 'hidden'
	console.log 'conect ipad'
	window.key = 10000 + Math.floor Math.random()*89999
	window.key = window.key.toString()
	console.log 'the key for this is ' + window.key
	socket = io()
	socket.on 'button-push', (which) ->
		console.log 'ipad button pushed', which
		if which.key is window.key
			console.log 'im listening to this ipad'
		else
			console.log 'ignore'



$('.continue').on 'touchstart click', clickContinue
$('.connectipad').on 'touchstart click', connectIpad