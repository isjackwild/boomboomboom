$ ->
	window.visualsEngine = new VisualsEngine();


class VisualsEngine
	_cv: null

	_shapes: []
	_peakCount: 0

	_two: null
	_twoElem: null
	_middleGround: null
	_foreGround: null

	_volume: 20
	_frequency: 10
	_bpm: 200


	_coloursSetup: false
	_negativeColours: false
	_baseColours: {
		fg: [{h: 346, s: 85, v: 95}, {h: 17, s: 90, v: 97}, {h: 45, s: 97, v: 97}, {h: 154, s: 65, v: 92}, {h: 149, s: 95, v: 70}, {h: 196, s: 87, v: 92}, {h: 220, s: 76, v: 80}, {h: 316, s: 40, v: 95}, {h: 277, s: 61, v: 71}, {h: 261, s: 46, v: 84}]
	}
	_colourBucket: {
		fg: []
	}
	_bgColFrom: {r: 130, g: 130, b: 130}
	_bgColTo: {r: 150, g: 150, b: 150}
	_bgColCurrent: {r: 130, g: 130, b: 130}
	_bgColLerp: 0
	_bgColLerpSpeed: 0.005
	_pauseBgLerp: false

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
		window.events.peak.add @onPeak
		window.events.bass.add @onBass
		window.events.break.add @onBreak
		window.events.BPM.add @gotBPM
		window.events.volume.add @gotVolume
		window.events.frequency.add @gotFrequency
		window.events.changeFreqVar.add @onChangeFrequencyVariation


	setupTwoJs: ->
		console.log 'setup two'
		@_twoElem = document.getElementById 'twoMagic'
		params = {
			fullscreen: true
			autostart: true
		}
		@_two = new Two(params).appendTo(@_twoElem)
		@_two.bind 'update', @onTwoUpdate
		@_foreGround = @_two.makeGroup()
		@_foreGround.id = 'foreground'
		@_middleGround = @_two.makeGroup()
		@_middleGround.id = 'middleground'
		@_middleGround.isScaling = false
		@_middleGround.center()


	gotBPM: (BPM) =>
		@_bpm = BPM
		@_bgColLerpSpeed = @convertToRange(@_bpm, [100,500], [0.005, 0.009])
		@updateColourBucket()


	gotFrequency: (freq) =>
		@_frequency = freq
		@updateBackgroundColour()
		@updateColourBucket()


	onChangeFrequencyVariation: (currentVar) =>
		if currentVar is 'high'
			@_negativeColours = true
		else if currentVar is 'low'
			@_negativeColours = false
		@_bgColLerp = 1
		@updateBackgroundColour()


	gotVolume: (vol) =>
		@_volume = vol
		@updateColourBucket()


	updateColourBucket: ->
		if @_coloursSetup is false
			@_coloursSetup = true
			for i in [0...@_baseColours.fg.length]
				@_colourBucket.fg[i] = Object.create @_baseColours.fg[i]
		else
			for i in [0...@_colourBucket.fg.length]
				#maybe add in volume if / when can accuratly normalise mic volume
				sOffset = Math.floor @convertToRange(@_frequency, [5,60], [10, -20]) + Math.floor @convertToRange(@_bpm, [60,600], [-50, 15])
				vOffset = Math.floor @convertToRange(@_frequency, [5,60], [15, -15])
				@_colourBucket.fg[i] = Object.create @_baseColours.fg[i]
				@_colourBucket.fg[i].s = @_colourBucket.fg[i].s + sOffset
				if @_colourBucket.fg[i].s < 25 then @_colourBucket.fg[i].s = 25
				@_colourBucket.fg[i].v -= vOffset


	updateBackgroundColour: =>
		console.log 'updateBackgroundColour'
		if @_negativeColours is false
			col = Math.floor(@convertToRange(@_frequency, [8,60], [30, 190])+Math.random()*20)
			col = {r: col, g: col, b: col}
		else if @_negativeColours is true
			whichCol = Math.ceil Math.random()*(@_colourBucket.fg.length-1)
			col = @_colourBucket.fg[whichCol]
			col = @HSVtoRGB col.h, col.s, col.v

		if @_bgColLerp > 0.95
			@_bgColFrom = @_bgColTo
			@_bgColTo = col
			@_bgColLerp = 0
	

	onPeak: (type) =>
		if type is 'hard'
			circle = @_two.makeCircle @_two.width/2, @_two.height/2, @_two.height*0.43
		else if type is 'soft'
			circle = @_two.makeCircle @_two.width/2, @_two.height/2, @_two.height*0.3
		else if type is 'hi'
			circle = @_two.makeCircle 0, @_two.height/4, @_two.height*0.82
		else if type is 'lo'
			circle = @_two.makeCircle @_two.width, @_two.height, @_two.height*0.75

		if @_negativeColours is false
			whichCol = Math.ceil Math.random()*(@_colourBucket.fg.length-1)
			col = @_colourBucket.fg[whichCol]
			if type is 'hard' or type is 'soft'
				col = @HSVtoRGB col.h, col.s, col.v
			else if type is 'hi'
				v = @convertToRange @_frequency, [5, 60], [80,100]
				col = @HSVtoRGB col.h, 7, v
			else if type is 'lo'
				v = @convertToRange @_frequency, [5, 60], [15,33]
				if col.s < 8 then col.s = 8
				col = @HSVtoRGB col.h, 10, v
		else if @_negativeColours is true
			if type is 'hard'
				col = {r: 170, g: 170, b: 170}
			else if type is 'soft'
				col = {r: 210, g: 210, b: 210}
			else if type is 'hi'
				col = {r: 255, g: 255, b: 255}
			else if type is 'lo'
				col = {r: 50, g: 50, b: 50}

		#write code to use #ffffff colours
		col = "rgb("+col.r+","+col.g+","+col.b+")"
		@_middleGround.add circle
		circle.fill = col
		circle.lifeSpan = Math.floor @convertToRange(@_bpm, [60,600], [1000, 400])
		circle.creationTime = new Date().getTime()
		circle.noStroke()
		@_shapes.push circle


	onBreak: (length) =>
		if @_pauseBgLerp is false
			@_pauseBgLerp = true
			if length is 'long'
				offset = 200
				hang = 500
			else if length is 'short'
				offset = 30
				hang = 120
			r = @_bgColCurrent.r + offset
			g = @_bgColCurrent.g + offset
			b = @_bgColCurrent.b + offset
			col = "rgb("+r+","+g+","+b+")"
			@_twoElem.style.background = col
			clearTimeout breakTimer
			breakTimer = setTimeout =>
				@_twoElem.style.background = "rgb("+@_bgColCurrent.r+","+@_bgColCurrent.g+","+@_bgColCurrent.b+")"
				@_pauseBgLerp = false
			, hang

	onBass: () =>
		if @_middleGround.isScaling is false
			@_middleGround.isScaling = true
			@_middleGround.targetScale = 1.1


	onTwoUpdate: () =>
		# console.log "render"
		if @_bgColLerp < 1 and @_pauseBgLerp is false
			@_bgColLerp  += @_bgColLerpSpeed
			@_bgColCurrent = @lerpColour @_bgColFrom, @_bgColTo, @_bgColLerp
			col = "rgb("+@_bgColCurrent.r+","+@_bgColCurrent.g+","+@_bgColCurrent.b+")"
			@_twoElem.style.background = col

		if @_shapes.length >= 1
			@removeShapes()


		if @_middleGround.targetScale > @_middleGround.scale
			@_middleGround.scale += 0.05
			xOffset = @convertToRange @_middleGround.scale, [0,2], [@_two.width/2, -@_two.width/2]
			yOffset = @convertToRange @_middleGround.scale, [0,2], [@_two.height/2, -@_two.height/2]
			@_middleGround.translation.set xOffset, yOffset
			if @_middleGround.scale >= @_middleGround.targetScale
				@_middleGround.targetScale = 1
		else if @_middleGround.targetScale < @_middleGround.scale
			@_middleGround.scale -= 0.05
			xOffset = @convertToRange @_middleGround.scale, [0,2], [@_two.width/2, -@_two.width/2]
			yOffset = @convertToRange @_middleGround.scale, [0,2], [@_two.height/2, -@_two.height/2]
			@_middleGround.translation.set xOffset, yOffset
			if @_middleGround.scale <= @_middleGround.targetScale
				@_middleGround.scale = 1
				@_middleGround.targetScale = 1
				@_middleGround.isScaling = false


	removeShapes: () =>
		time = new Date().getTime()
		for shape, i in @_shapes by -1
			if time - shape.creationTime >= shape.lifeSpan
				shape.remove()
				@_shapes.splice i, 1


	#add this to my UTILS
	lerpColour: (from, to, control) ->
		resultR = Math.ceil from.r + (to.r - from.r) * control
		resultG = Math.ceil from.g + (to.g - from.g) * control
		resultB = Math.ceil from.b + (to.b - from.b) * control

		result = {r:resultR, g:resultG, b:resultB}
		return result
	#add this to my UTILS
	lerp: (from, to, control) =>
		return from + control *	(to - from)
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




