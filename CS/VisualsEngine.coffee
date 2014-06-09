$ ->
	window.visualsEngine = new VisualsEngine();


class VisualsEngine
	_cv: null

	_shapes: []
	_peakCount: 0

	_two: null
	_twoElem: null

	_volume: 10
	_frequency: 10
	_bpm: 150

	_whichColour: 0

	_coloursSetup: false
	_colourBucket: {
		fg: new Array 20
		bg: new Array 5
	}

	#colours
		#bg = low sat and low bright
		#fg = high sat and high bright
		#OR sometimes reverse this and have bg bright and saturated, and fg desat and darker
		#high volume / high BPM = more saturated colours
		#low freq = darker, high = lighter

		#when beats are softer (but still hard enough to change bg colour) then contrast between bg colours should be less

		#manage colours with a colour bucket manager... change colour scheme when things such as freq / vol / bpm change. sometimes lerp between old and new colours, sometimes straight swap
		#make lots of colour buckets with similar properties on each change, and then randomly pick which one to use in the method which makes the shape / bg


	constructor: ->
		console.log 'setup background generation'
		@_cv = document.getElementById "magic"
		@_ctx = @_cv.getContext '2d'
		@setupListeners()
		@setupTwoJs()
		@updateColourBucket()
		

	setupListeners: ->
		window.events.longBreak.add @randomiseBackgroundColour
		window.events.peak.add @onPeak
		window.events.BPM.add @gotBPM
		window.events.volume.add @gotVolume
		window.events.frequency.add @gotFrequency


	setupTwoJs: ->
		console.log 'setup two'
		@_twoElem = document.getElementById 'twoMagic'
		params = {
			fullscreen: true
			autostart: true
		}
		@_two = new Two(params).appendTo(@_twoElem)


	gotBPM: (BPM) =>
		@_bpm = BPM
		@updateColourBucket()


	gotFrequency: (freq) =>
		@_frequency = freq
		@updateColourBucket()


	gotVolume: (vol) =>
		@_volume = vol
		@updateColourBucket()



	updateColourBucket: ->
		if @_coloursSetup is false
			console.log 'generate colours'
			@_coloursSetup = true
			for i in [0...@_colourBucket.fg.length]
				tempCol = {
					h: Math.floor Math.random()*360
					s: 70
					v: 80
				}
				@_colourBucket.fg[i] = tempCol
			for i in [0...@_colourBucket.bg.length]
				tempCol = {
					h: Math.floor Math.random()*360
					s: 20
					v: 20
				}
				@_colourBucket.bg[i] = tempCol
		else
			#this should take into account the vol, freq and bpm
			console.log 'update colours'
			for i in [0...@_colourBucket.fg.length]
				@_colourBucket.fg[i].s = 50
				@_colourBucket.fg[i].v = Math.floor @convertToRange(@_frequency, [0,50], [40,80])
				console.log @_colourBucket.fg[i].v, 'fg v'
			for i in [0...@_colourBucket.bg.length]
				@_colourBucket.bg[i].s = 40
				@_colourBucket.bg[i].v = Math.floor @convertToRange(@_frequency, [0,50], [10,60])
				console.log @_colourBucket.bg[i].v, 'bg v'


	onPeak: (type) =>

		if type is 'hard'
			@randomiseBackgroundColour()
			return

		#hi peaks have lighter colours, lo peaks have darker colours
		#take a colour from the bucket, and either add or minus from the viberance to get the colours for the high or low peaks
		whichCol = Math.ceil Math.random()*(@_colourBucket.fg.length-1)
		col = @_colourBucket.fg[whichCol]
		tempH = col.h
		tempS = col.s
		tempV = col.v

		if type is "soft"
			col = @HSVtoRGB tempH, tempS, tempV
			col = "rgb("+col.r+","+col.g+","+col.b+")"
		else if type is "hi"
			tempS = tempS+20
			tempV = 100
			col = @HSVtoRGB tempH, tempS, tempV
			col = "rgb("+col.r+","+col.g+","+col.b+")"
		else if type is "lo"
			tempV = tempV-50
			col = @HSVtoRGB tempH, tempS, tempV
			col = "rgb("+col.r+","+col.g+","+col.b+")"

		console.log col


		##a quick test
		if @_peakCount % 3 is 0
			circle = @_two.makeCircle @_two.width/2, @_two.height/2, 500
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
		whichCol = Math.ceil Math.random()*(@_colourBucket.bg.length-1)
		col = @_colourBucket.bg[whichCol]
		col = @HSVtoRGB col.h, col.s, col.v
		col = "rgb("+col.r+","+col.g+","+col.b+")"

		@_twoElem.style.background = col
		# col1 = "rgb("+(10+Math.floor(window.audioAnalysisEngine._averageFrequency*4))+","+(10+Math.floor(window.audioAnalysisEngine._averageFrequency*4))+","+(10+Math.floor(window.audioAnalysisEngine._averageFrequency*4))+")"
		# col2 = "rgb("+(100+Math.floor(window.audioAnalysisEngine._averageFrequency*4))+","+(100+Math.floor(window.audioAnalysisEngine._averageFrequency*4))+","+(100+Math.floor(window.audioAnalysisEngine._averageFrequency*4))+")"

		# @_whichColour += 1
		# if @_whichColour % 2 is 1
		# 	@_twoElem.style.background = col1
		# else
		# 	@_twoElem.style.background = col2


	#add this to my UTILS
	HSVtoRGB: (h,s,v) =>
		if s is undefined
			if h.h > 360
				h.h -= 360
			if h.s > 100
				h.s = 100
			if h.v > 100
				h.v = 100
			if h.h < 0
				h.h = 360 - Math.abs h.h
			if h.s < 0
				h.s = 0
			if h.v < 0
				h.v = 0

			s = h.s/100
			v = h.v/100
			h = h.h/360
		else
			if h > 360
				h -= 360
			if s > 100
				s = 100
			if v > 100
				v = 100
			if h < 0
				h = 360 - Math.abs h.h
			if s < 0
				s = 0
			if v < 0
				v = 0
			h = h/360
			s = s/100
			v = v/100
		i = Math.floor h*6
		f = h * 6 - i
		p = v * (1 - s)
		q = v * (1 - f * s)
		t = v * (1 - (1 - f) * s)

		switch i%6
			when 0
				r = v
				g = t
				b = p
			when 1
				r = q
				g = v
				b = p
			when 2
				r = p
				g = v
				b = t
			when 3
				r = p
				g = q
				b = v
			when 4
				r = t
				g = p
				b = v
			when 5
				r = v
				g = p
				b = q

		rgb = {
			r: Math.floor r * 255
			g: Math.floor g * 255
			b: Math.floor b * 255
		}
		
		return rgb
	#add this to my UTILS
	convertToRange: (value, srcRange, dstRange) ->
		if value < srcRange[0]
			return dstRange[0]
		else if value > srcRange[1]
			return dstRange[1]
		else
			srcMax = srcRange[1] - srcRange[0]
			dstMax = dstRange[1] - dstRange[0]
			adjValue = value  - srcRange[0]
			return (adjValue * dstMax / srcMax) + dstRange[0]




