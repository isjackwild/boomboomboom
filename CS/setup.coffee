window.stripe = null
window.box = null

mapSocketEvents = (button) ->
	#need to have the auto timer thing here also. AND move this to a new file.
	switch button
		when "a1" then window.events.frequency.dispatch 1
		when "a2" then window.events.frequency.dispatch 2
		when "a3" then window.events.frequency.dispatch 3
		when "a4" then window.events.frequency.dispatch 4
		when "a5" then window.events.frequency.dispatch 5
		when "a6" then window.events.frequency.dispatch 6
		when "a7" then window.events.frequency.dispatch 7
		when "a8" then window.events.frequency.dispatch 8
		when "a9" then window.events.inverseCols.dispatch()

		when "a10" then window.events.makeSpecial.dispatch 1
		when "b1" then window.events.makeSpecial.dispatch 2
		when "b2" then window.events.makeSpecial.dispatch 3
		when "b3" then window.events.makeSpecial.dispatch 4
		when "b4" then window.events.makeSpecial.dispatch 5
		when "b5" then window.events.makeSpecial.dispatch 6
		when "b6" then window.events.makeSpecial.dispatch 7
		when "b7" then window.events.makeSpecial.dispatch 8
		when "b8" then window.events.makeSpecial.dispatch 9
		when "b9" then window.events.makeSpecial.dispatch 0
		when "b10" then window.events.makeSpecial.dispatch 11
		when "b11" then window.events.makeSpecial.dispatch 12

		when "c1" then console.log 'a1'
		when "c2" then console.log 'a1'
		when "c3" then console.log 'a1'
		when "c4" then console.log 'a1'
		when "c5" then console.log 'a1'
		when "c6" then console.log 'a1'
		when "c7" then console.log 'a1'
		when "c8" then console.log 'a1'
		when "c9" then console.log 'a1'

		when "d1" then console.log 'a1'
		when "d2" then console.log 'a1'
		when "d3" then console.log 'a1'
		when "d4" then console.log 'a1'
		when "d5" then console.log 'a1'
		when "d6" then console.log 'a1'
		when "d7" then console.log 'a1'
		when "d8" then console.log 'a1'
		when "d9" then console.log 'a1'


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
	socket = io()

	socket.on 'button-push', (which) ->
		console.log 'ipad button pushed', which
		if which.key is window.key
			#this should only run once
			$('#ipadInstructions').addClass 'downAndOut'
			setTimeout () ->
				$('#ipadInstructions').addClass 'hidden'
			,666
			mapSocketEvents which.button
		else
			console.log 'ignore'



$('.continue').on 'touchstart click', clickContinue
$('#tablet').on 'touchstart click', connectIpad


$ =>
	#auto dowsn't work in visuals engine... why????
	window.events.automatic.dispatch false
	
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