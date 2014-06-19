class window.TabletController
	_timeSinceLastKeyPress: 0
	_autoTimer: null

	constructor: ->
		console.log 'setup tablet controller'
		window.onkeydown = @keydown

		@_socket = io()
		@_socket.on 'button-push', (which) =>
			console.log 'ipad button pushed', which
			@mapSocketEvents which.button


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