window.stripe = null
window.box = null
is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
window.focus = true

$(window).on 'blur', =>
	window.focus = false

$(window).on 'focus', =>
	window.focus = true


clickContinue = () ->
	$('.choice').addClass 'downAndOut'
	$('.accept').removeClass 'hidden'
	setTimeout () ->
		$('.accept').removeClass 'offLeft'
	, 1500
	setTimeout () ->
		$('.accept').addClass 'flash'
	, 6500


	clearInterval window.box	

	window.pester = setTimeout () ->
		$('#keyboardOrIpad').addClass 'hidden'
		window.events.makeSpecial.dispatch 3
		window.stripe = setInterval () ->
			if window.focus is true
				window.events.makeSpecial.dispatch 3
		,2000
	,1500

	#get user media
	navigator.webkitGetUserMedia
			audio: true
		,setupMic, onError

setupMic = (stream) ->
	clearInterval window.stripe
	clearTimeout window.pester
	$('.accept').addClass 'offRight'
	setTimeout () ->
		$('.accept').addClass 'hidden'
	, 500
	$('#about').removeClass 'solidBackground'
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
			if window.focus is true
				window.events.makeSpecial.dispatch 11
		,2000
	,4800


	if !is_chrome
		$('#browserNotSupported').removeClass 'hidden'
	else
		window.audioAnalysisEngine = new window.AudioAnalysisEngine()
		window.visualsEngine = new window.VisualsEngine()
		window.keyboardController = new window.KeyboardController()