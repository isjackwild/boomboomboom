class window.TabletController
	_timeSinceLastKeyPress: 0
	_autoTimer: null

	constructor: ->
		console.log 'setup tablet controller'
		window.onkeydown = @keydown

		@_socket = io()

		@_socket.on 'button-push', (which) =>
			console.log 'ipad button pushed', which
			if which.key is window.key
				@mapSocketEvents which.button


		@_socket.on 'key-entered', (which) =>
			console.log 'key-entered', which
			if which is window.key
				console.log 'correct key'
				$('#ipadInstructions').addClass 'downAndOut'
				setTimeout () ->
					$('#ipadInstructions').addClass 'hidden'
				,666
			else
				console.log 'incorrect key'


	mapSocketEvents: (button) ->
		@setAutoTimer()
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
			when "a9" then window.events.frequency.dispatch 9
			when "a10" then window.events.inverseCols.dispatch()

			when "b1" then window.events.makeSpecial.dispatch 1
			when "b2" then window.events.makeSpecial.dispatch 2
			when "b3" then window.events.makeSpecial.dispatch 3
			when "b4" then window.events.makeSpecial.dispatch 4
			when "b5" then window.events.makeSpecial.dispatch 5
			when "b6" then window.events.makeSpecial.dispatch 6
			when "b7" then window.events.makeSpecial.dispatch 7
			when "b8" then window.events.makeSpecial.dispatch 8
			when "b9" then window.events.makeSpecial.dispatch 9
			when "b10" then window.events.makeSpecial.dispatch 0
			when "b11" then window.events.makeSpecial.dispatch 11

			when "c1" then window.events.showText.dispatch 'ber'
			when "c2" then window.events.showText.dispatch 'lin'
			when "c3" then window.events.showText.dispatch 'bisque'
			when "c4" then window.events.showText.dispatch 'rage'
			when "c5" then window.events.showText.dispatch 'putUpWall'
			when "c6" then window.events.showText.dispatch 'tearDownWall'
			when "c7" then window.events.showIllustration.dispatch 'food'
			when "c8" then window.events.showIllustration.dispatch 'mascot'
			when "c9" then window.events.showIllustration.dispatch 'landmark'

			when "d1" then window.events.angela.dispatch 'angela'
			when "d2" then window.events.angela.dispatch 'kiss'
			when "d3" then window.events.angela.dispatch 'wall'
			when "d4" then window.events.angela.dispatch 'ruins'
			when "d5" then window.events.bass.dispatch 'big'
			when "d6" then window.events.bass.dispatch 'small'
			when "d7" then window.events.filter.dispatch 'blur'
			when "d8" then window.events.break.dispatch 'short'
			when "d9" then window.events.break.dispatch 'long'


	setAutoTimer: () =>
		window.events.automatic.dispatch false
		clearInterval @_autoTimer
		@_timeSinceLastKeyPress = 0
		console.log 'automatic off'

		@_autoTimer = setInterval =>
			@_timeSinceLastKeyPress += 1
			if @_timeSinceLastKeyPress > 10
				clearInterval @_autoTimer
				@_timeSinceLastKeyPress = 0
				window.events.automatic.dispatch true
				console.log 'automatic ON'
		,1000

		console.log 'set auto timer'