window.stripe = null
window.box = null
is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;


clickContinue = () ->
	$('.choice').addClass 'downAndOut'
	$('.accept').removeClass 'hidden'
	setTimeout () ->
		$('.accept').removeClass 'offLeft'
	, 1500


	clearInterval window.box	

	setTimeout () ->
		$('#keyboardOrIpad').addClass 'hidden'
		window.events.makeSpecial.dispatch 3
		window.stripe = setInterval () ->
			window.events.makeSpecial.dispatch 3
		,2000
	,1500


	navigator.webkitGetUserMedia
			audio: true
		,setupMic, onError

setupMic = (stream) ->
	$('.accept').addClass 'offRight'
	setTimeout () ->
		$('.accept').addClass 'hidden'
	, 500
	$('#about').removeClass 'solidBackground'
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

	window.key = 10000 + Math.floor Math.random()*89999
	window.key = window.key.toString()
	$('.key').html window.key
	$('#keyInAbout').removeClass 'hidden'

	window.tabletController = new window.TabletController()

showAbout = () ->
	$('#about').toggleClass 'upAndAway'
	$('#ipadInstructions').toggleClass 'faded'
	$('.showAbout').toggleClass 'aboutOpen'
	

$('.continue').on 'touchstart click', clickContinue
$('#tablet').on 'touchstart click', connectIpad
$('.showAbout').on 'touchstart click', showAbout
$('#makeFullScreen').on 'touchstart click', () ->
	document.getElementById('fullscreen').webkitRequestFullscreen()

$('body').bind 'webkitfullscreenchange fullscreenchange', () ->
	$('#makeFullScreen').toggleClass 'hidden'


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
	,4800

	# console.log navigator.userAgent.toLowerCase()

	if !is_chrome
		$('#browserNotSupported').removeClass 'hidden'
	else
		window.visualsEngine = new window.VisualsEngine();
		window.audioAnalysisEngine = new window.AudioAnalysisEngine();
		window.keyboardController = new window.KeyboardController()