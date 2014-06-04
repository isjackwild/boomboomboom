$ ->
	backgroundGenerator = new BackgroundGenerator();

	# test = =>
	# 	console.log 'event system works'

	# window.events.softPeak.add(test);

class BackgroundGenerator
	_cv: null

	_whichColour: 0

	constructor: ->
		console.log 'setup background generation'
		@_cv = document.getElementById "magic"
		console.log @_cv
		@setupListeners()

	setupListeners: ->
		window.events.hardPeak.add(@randomiseBackgroundColour);

	randomiseBackgroundColour: =>
		@_whichColour += 1
		if @_whichColour % 2 is 1
			@_cv.style.background = "black"
		else
			@_cv.style.background = "white"

