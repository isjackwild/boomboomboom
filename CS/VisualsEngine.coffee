$ ->
	window.visualsEngine = new VisualsEngine();


class VisualsEngine
	_cv: null

	_shapes: []
	_peakCount: 0

	_two: null
	_twoElem: null

	_whichColour: 0

	constructor: ->
		console.log 'setup background generation'
		@_cv = document.getElementById "magic"
		@_ctx = @_cv.getContext '2d'
		@setupListeners()
		@setupTwoJs()
		

	setupListeners: ->
		window.events.longBreak.add @randomiseBackgroundColour
		window.events.hardPeak.add @randomiseBackgroundColour
		window.events.softPeak.add @onSoftPeak
		window.events.highPeak.add @onHighPeak
		window.events.lowPeak.add @onLowPeak


	setupTwoJs: ->
		console.log 'setup two'
		@_twoElem = document.getElementById 'twoMagic'
		params = {
			fullscreen: true
			autostart: true
		}
		@_two = new Two(params).appendTo(@_twoElem)

		console.log @_two

		# @_two.update()

	onSoftPeak: =>
		@onPeak "soft"

	onHighPeak: =>
		console.log "????"
		@onPeak "hi"

	onLowPeak: =>
		@onPeak "lo"

	onPeak: (type) =>
		# @_ctx.fillStyle = 'black'
		# @_ctx.rect @_cv.width/4, @_cv.height/4, (@_cv.width/4)*2, (@_cv.height/4)*2
		# @_ctx.fill()

		# clear = setTimeout =>
		# 	@_ctx.clearRect (@_cv.width/4)-10, (@_cv.height/4)-10, ((@_cv.width/4)*2)+10, ((@_cv.height/4)*2)+10
		# , 200

		if type is "soft"
			col = "rgb(0,200,200)"
		else if type is "hi"
			col = "rgb(255,155,255)"
		else if type is "lo"
			col = "rgb(100,0,100)"


		##a quick test
		if @_peakCount % 3 is 0
			circle = @_two.makeCircle Math.random()*@_two.width, Math.random()*@_two.height, 150
			circle.fill = col
			circle.lifeSpan = 500
			circle.noStroke()
			@_shapes.push circle
		else if @_peakCount % 3 is 1
			for shape in @_shapes
				shape.remove()
				@_shapes.splice shape.index, 1

		@_peakCount += 1


	randomiseBackgroundColour: =>

		col1 = "rgb("+(10+Math.floor(window.audioAnalysisEngine._averageFrequency*4))+","+(10+Math.floor(window.audioAnalysisEngine._averageFrequency*4))+","+(10+Math.floor(window.audioAnalysisEngine._averageFrequency*4))+")"
		col2 = "rgb("+(100+Math.floor(window.audioAnalysisEngine._averageFrequency*4))+","+(100+Math.floor(window.audioAnalysisEngine._averageFrequency*4))+","+(100+Math.floor(window.audioAnalysisEngine._averageFrequency*4))+")"
		console.log col1, col2

		@_whichColour += 1
		if @_whichColour % 2 is 1
			console.log "lalala"
			@_twoElem.style.background = col1
		else
			console.log "jsjsjs"
			@_twoElem.style.background = col2

