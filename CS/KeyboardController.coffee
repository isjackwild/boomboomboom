$ =>
	window.audioAnalysisEngine = new KeyboardController();


class KeyboardController

	constructor: ->
		console.log 'setup keyboard controller'
		window.onkeydown = @keydown

	keydown: (e) ->
		console.log 'keydown', e.keyCode

		switch e.keyCode
			when 49 then window.events.frequency.dispatch 1
			when 50 then window.events.frequency.dispatch 2
			when 51 then window.events.frequency.dispatch 3
			when 52 then window.events.frequency.dispatch 4
			when 53 then window.events.frequency.dispatch 5
			when 54 then window.events.frequency.dispatch 6
			when 55 then window.events.frequency.dispatch 7
			when 56 then window.events.frequency.dispatch 8
			when 57 then window.events.frequency.dispatch 9
			
			when 58 then window.events.frequency.dispatch 1