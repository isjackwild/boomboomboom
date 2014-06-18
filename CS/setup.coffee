clickContinue = () ->
	$('.accept').removeClass 'hidden'
	navigator.webkitGetUserMedia
			audio: true
		,setupMic, onError

setupMic = (stream) ->
	$('.accept').addClass 'hidden'

	$('#instructions, #ipadInstructions').addClass 'transitionOut'

	setTimeout () ->
		$('#instructions, #ipadInstructions').addClass 'hidden'
	, 500

	window.events.micAccepted.dispatch stream;

onError = (err) ->
	console.log 'error setting up mic'


connectIpad = () ->
	$('#instructions').addClass 'transitionOut'

	setTimeout () ->
		$('#instructions').addClass 'hidden'
	, 500

	$('#ipadInstructions').removeClass 'hidden'
	console.log 'conect ipad'
	window.key = 10000 + Math.floor Math.random()*89999
	window.key = window.key.toString()
	console.log 'the key for this is ' + window.key
	$('#key').html window.key
	socket = io()
	socket.on 'button-push', (which) ->
		console.log 'ipad button pushed', which
		if which.key is window.key
			console.log 'im listening to this ipad'
		else
			console.log 'ignore'



$('.continue').on 'touchstart click', clickContinue
$('.connectipad').on 'touchstart click', connectIpad

$ =>
	setTimeout () ->
		$('#music').removeClass 'hidden'
	,500

	setTimeout () ->
		$('#visuals').removeClass 'hidden'
	,1250

	setTimeout () ->
		$('#play').removeClass 'hidden'
	,2000

	setTimeout () ->
		$('.instruction').addClass 'hidden'
	,4500