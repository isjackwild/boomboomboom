$ ->
	visualsEngine = new VisualsEngine();

	# test = =>
	# 	console.log 'event system works'

	# window.events.softPeak.add(test);

class VisualsEngine
	_cv: null

	_whichColour: 0

	constructor: ->
		console.log 'setup background generation'
		@_cv = document.getElementById "magic"
		@_ctx = @_cv.getContext '2d'
		console.log @_cv, @_ctx
		@setupListeners()

	setupListeners: ->
		window.events.longBreak.add(@randomiseBackgroundColour)
		window.events.hardPeak.add(@onHardPeak)
		window.events.hiPeak.add(@onHighPeak)

	onHardPeak: =>
		@_ctx.fillStyle = 'black'
		@_ctx.rect @_cv.width/4, @_cv.height/4, (@_cv.width/4)*2, (@_cv.height/4)*2
		@_ctx.fill()

		clear = setTimeout =>
			@_ctx.clearRect (@_cv.width/4)-10, (@_cv.height/4)-10, ((@_cv.width/4)*2)+10, ((@_cv.height/4)*2)+10
		, 200

	onHighPeak: =>
		@_ctx.fillStyle = 'white'
		@_ctx.rect 0, 0, @_cv.width, @_cv.height/6
		@_ctx.fill()

		clear2 = setTimeout =>
			@_ctx.clearRect 0, 0, @_cv.width, (@_cv.height/6)+10
		, 200

	randomiseBackgroundColour: =>
		@_whichColour += 1
		if @_whichColour % 2 is 1
			@_cv.style.background = "grey"
		else
			@_cv.style.background = "DarkSlateGray "

