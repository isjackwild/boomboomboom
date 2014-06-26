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


$('#inputForm').on 'submit', (e) =>
	e.stopPropagation()
	e.preventDefault()
	window.key = $('#inputKey').val().toString()
	socket.emit 'key-entered', window.key
	$("#inputKey").blur()
	$('body, intro').removeClass 'intro'
	$('#keypadWrapper').removeClass 'hidden'
	$('#introWrapper').addClass 'downAndOut'
	setTimeout ()->
		$('#introWrapper').addClass 'hidden'
	,666


$('.button').on 'touchstart', (event) =>
	$('body').addClass('press');
	clearTimeout pressTimer
	pressTimer = setTimeout () =>
		$('body').removeClass('press')
	,100

	whichButton = event.currentTarget.id
	button = whichButton.toString();
	socket.emit 'button-push', button



