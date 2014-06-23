window.stripe = null
window.box = null


clickContinue = () ->
	$('.choice').addClass 'downAndOut'
	$('.accept').removeClass 'hidden'

	clearInterval window.box	

	setTimeout () ->
		$('#keyboardOrIpad').addClass 'hidden'
		window.events.makeSpecial.dispatch 3
		window.stripe = setInterval () ->
			window.events.makeSpecial.dispatch 3
		,2000
	,1000


	navigator.webkitGetUserMedia
			audio: true
		,setupMic, onError

setupMic = (stream) ->
	$('.accept').addClass 'hidden'
	clearInterval window.stripe
	setTimeout () ->
		$('#instructions').addClass 'hidden'
	, 500

	window.events.micAccepted.dispatch stream;

onError = (err) ->
	console.log 'error setting up mic'


connectIpad = () ->
	$('#ipadInstructions').removeClass 'hidden'
	
	setTimeout () ->
		$('#ipadInstructions').removeClass 'upAndAway'
	,666

	console.log 'conect ipad'
	window.key = 10000 + Math.floor Math.random()*89999
	window.key = window.key.toString()
	console.log 'the key for this is ' + window.key
	$('#key').html window.key

	window.tabletController = new window.TabletController()
	

$('.continue').on 'touchstart click', clickContinue
$('#tablet').on 'touchstart click', connectIpad


$ =>
	
	setTimeout () ->
		$('#music').removeClass 'hidden'
		window.events.makeSpecial.dispatch 9
		window.events.makeSpecial.dispatch 11
	,500

	setTimeout () ->
		$('#visuals').removeClass 'hidden'
		window.events.makeSpecial.dispatch 9
		window.events.makeSpecial.dispatch 11
	,1250

	setTimeout () ->
		$('#play').removeClass 'hidden'
		window.events.makeSpecial.dispatch 9
		window.events.makeSpecial.dispatch 11
	,2000

	setTimeout () ->
		$('.instruction').addClass 'hidden'
		$('#keyboardOrIpad').removeClass 'hidden'
	,4000

	setTimeout () ->
		$('#instructions').addClass 'hidden'
		$('.choice').removeClass 'upAndAway'
		window.box = setInterval () ->
			window.events.makeSpecial.dispatch 11
		,2000
	,5500