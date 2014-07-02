window.key = null

$ =>
	console.log 'setup controller'
	doOnOrientationChange()
	window.addEventListener 'orientationchange', doOnOrientationChange

pressTimer = null;
socket = io()


doOnOrientationChange = () ->
	width = window.innerWidth
	height = window.innerHeight
	if width > height
		$('#rotateDevice').addClass 'fadeOut'
		setTimeout () ->
			$('#rotateDevice').addClass 'hidden'
		, 500
	else
		$('#rotateDevice').removeClass 'hidden'
		setTimeout () ->
			$('#rotateDevice').removeClass 'fadeOut'
		, 50

onCorrectKey = () ->
	$("#inputKey").blur()
	$('body, intro').removeClass 'intro'
	$('#keypadWrapper').removeClass 'hidden'
	$('#introWrapper').addClass 'downAndOut'
	setTimeout ()->
		$('#introWrapper').addClass 'hidden'
	,666


onIncorrectKey = () ->
	$('#incorrectKey').removeClass 'hidden'
	setTimeout () ->
		$('#incorrectKey').removeClass 'faded'
		$('#inputKey').val ''
	, 10
	setTimeout () ->
		$('#incorrectKey').addClass 'faded'
		setTimeout () ->
			$('#incorrectKey').addClass 'hidden'
		,333
	, 2200

$('#inputForm').on 'submit', (e) =>
	e.stopPropagation()
	e.preventDefault()
	window.key = $('#inputKey').val().toString()
	socket.emit 'key-entered', window.key
	socket.on 'correct-key', onCorrectKey
	socket.on 'incorrect-key', onIncorrectKey


$('.button').on 'touchstart', (event) =>
	$('body').addClass('press');
	clearTimeout pressTimer
	pressTimer = setTimeout () =>
		$('body').removeClass('press')
	,100

	whichButton = event.currentTarget.id
	button = whichButton.toString();
	socket.emit 'button-push', button



