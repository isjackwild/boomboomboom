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
	_frequency: 5
	_bpm: 333
	_bpmJumpTime: new Date().getTime()


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

	_targetBlur = 0
	_currentBlur = 0

	
	constructor: ->
		console.log 'setup background generation'
		@_cv = document.getElementById "magic"
		@_ctx = @_cv.getContext '2d'
		@setupListeners()
		@setupTwoJs()
		@updateColourBucket()
		

	setupListeners: =>
		console.log 'setup listeners'
		window.events.peak.add @onPeak
		window.events.bass.add @onBass
		window.events.break.add @onBreak
		window.events.BPM.add @gotBPM
		window.events.BPMJump.add @onBPMJump
		window.events.volume.add @gotVolume
		window.events.frequency.add @gotFrequency
		window.events.inverseCols.add @inverseCols
		window.events.makeSpecial.add @makeSpecial
		window.events.showText.add @showText
		window.events.showIllustration.add @showIllustration
		window.events.angela.add @showPhoto
		window.events.filter.add @addFilter
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
		@_middleGround = @_two.makeGroup()
		@_middleGround.id = 'middleground'
		@_middleGround.isScaling = false
		@_middleGround.center()
		@_foreGround = @_two.makeGroup()
		@_foreGround.id = 'foreground'
		


	gotBPM: (BPM) =>
		@_bpm = BPM
		@_bgColLerpSpeed = @convertToRange(@_bpm, [50,500], [0.005, 0.009])
		@updateColourBucket()


	onBPMJump: () =>
		@_bpmJumpTime = new Date().getTime()


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

	inverseCols: () =>
		if @_negativeColours is false
			@_negativeColours = true
		else
			@_negativeColours = false
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
				sOffset = Math.floor @convertToRange(@_frequency, [1,9], [10, -20]) + Math.floor @convertToRange(@_bpm, [60,600], [-50, 15])
				vOffset = Math.floor @convertToRange(@_frequency, [1,9], [15, -15])
				@_colourBucket.fg[i] = Object.create @_baseColours.fg[i]
				@_colourBucket.fg[i].s = @_colourBucket.fg[i].s + sOffset
				if @_colourBucket.fg[i].s < 25 then @_colourBucket.fg[i].s = 25
				@_colourBucket.fg[i].v -= vOffset


	updateBackgroundColour: =>
		if @_negativeColours is false
			col = Math.floor(@convertToRange(@_frequency, [1,9], [30, 190])+Math.random()*33)
			col = {r: col, g: col, b: col}
		else if @_negativeColours is true
			whichCol = Math.ceil Math.random()*(@_colourBucket.fg.length-1)
			col = @_colourBucket.fg[whichCol]
			col = @HSVtoRGB col.h, col.s, col.v

		if @_bgColLerp > 0.95
			@_bgColFrom = @_bgColTo
			@_bgColTo = col
			@_bgColLerp = 0

	addFilter: (type) =>
		if @_filterTimer
			clearTimeout @_filterTimer
		switch type
			when 'blur'
				@_targetBlur = 20
				@_currentBlur = 0
				$('#twoMagic svg').css "-webkit-filter", "blur("+@_currentBlur+"px)"

	

	onPeak: (type) =>
		@_peakCount++
		peakTime = new Date().getTime()

		if type is 'hard'
			@updateBackgroundColour()
			circle = @_two.makeCircle @_two.width/2, @_two.height/2, @_two.height*0.43
		else if type is 'soft'
			circle = @_two.makeCircle @_two.width/2, @_two.height/2, @_two.height*0.3
		else if type is 'hi'
			circle = @_two.makeCircle 0, @_two.height/4, @_two.height*0.82
			circle.fadeOut = true
			circle.fadeOutSpeed = @convertToRange(@_bpm, [60,500], [0.015, 0.1])
		else if type is 'lo'
			circle = @_two.makeCircle @_two.width, @_two.height, @_two.height*0.75
			circle.fadeOut = true
			circle.fadeOutSpeed = @convertToRange(@_bpm, [60,500], [0.1, 0.25])

		if @_negativeColours is false
			whichCol = Math.ceil Math.random()*(@_colourBucket.fg.length-1)
			col = @_colourBucket.fg[whichCol]
			if type is 'hard' or type is 'soft'
				col = @HSVtoRGB col.h, col.s, col.v
			else if type is 'hi'
				v = @convertToRange @_frequency, [1, 9], [80,90]
				col = @HSVtoRGB col.h, 15, v
			else if type is 'lo'
				v = @convertToRange @_frequency, [1, 9], [15,33]
				col = @HSVtoRGB col.h, 15, v
		else if @_negativeColours is true
			if type is 'hard'
				col = {r: 155, g: 155, b: 155}
			else if type is 'soft'
				col = {r: 190, g: 190, b: 190}
			else if type is 'hi'
				col = {r: 230, g: 230, b: 230}
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


		
		duration = Math.floor @convertToRange(@_bpm, [100,600], [2500, 5000])
		if @_peakCount % 2 is 0 and peakTime - @_bpmJumpTime < duration and @_bpm > 150
			@makeSpecial Math.floor Math.random()*10


	makeSpecial: (which) =>
		switch which
			when 1
				sectionX = @_two.width/20
				sectionY = @_two.height/20
				line = @_two.makePolygon 0, 0, sectionX, sectionY, sectionX*2, sectionY*2, sectionX*3, sectionY*3, sectionX*4, sectionY*4, sectionX*5, sectionY*5, sectionX*6, sectionY*6, sectionX*7, sectionY*7, sectionX*8, sectionY*8, sectionX*9, sectionY*9, sectionX*10, sectionY*10,  sectionX*11, sectionY*11, sectionX*12, sectionY*12, sectionX*13, sectionY*13, sectionX*14, sectionY*14, sectionX*15, sectionY*15, sectionX*16, sectionY*16, sectionX*17, sectionY*17, sectionX*18, sectionY*18, sectionX*19, sectionY*19, @_two.width, @_two.height 
			when 2
				sectionX = @_two.width/20
				sectionY = @_two.height/20
				line = @_two.makePolygon @_two.width, @_two.height, sectionX*19, sectionY*19, sectionX*18, sectionY*18, sectionX*17, sectionY*17, sectionX*16, sectionY*16, sectionX*15, sectionY*15, sectionX*14, sectionY*14, sectionX*13, sectionY*13, sectionX*12, sectionY*12, sectionX*11, sectionY*11, sectionX*10, sectionY*10,  sectionX*9, sectionY*9, sectionX*8, sectionY*8, sectionX*7, sectionY*7, sectionX*6, sectionY*6, sectionX*5, sectionY*5, sectionX*4, sectionY*4, sectionX*3, sectionY*3, sectionX*2, sectionY*2, sectionX, sectionY, 0, 0
			when 3
				sectionX = @_two.width/20
				sectionY = @_two.height/20
				line = @_two.makePolygon 0, @_two.height, sectionX, @_two.height-sectionY, sectionX*2, @_two.height-sectionY*2, sectionX*3, @_two.height-sectionY*3, sectionX*4, @_two.height-sectionY*4, sectionX*5, @_two.height-sectionY*5, sectionX*6, @_two.height-sectionY*6, sectionX*7, @_two.height-sectionY*7, sectionX*8, @_two.height-sectionY*8, sectionX*9, @_two.height-sectionY*9, sectionX*10, @_two.height-sectionY*10,  sectionX*11, @_two.height-sectionY*11, sectionX*12, @_two.height-sectionY*12, sectionX*13, @_two.height-sectionY*13, sectionX*14, @_two.height-sectionY*14, sectionX*15, @_two.height-sectionY*15, sectionX*16, @_two.height-sectionY*16, sectionX*17, @_two.height-sectionY*17, sectionX*18, @_two.height-sectionY*18, sectionX*19, @_two.height-sectionY*19, @_two.width, 0
			when 4
				sectionX = @_two.width/20
				sectionY = @_two.height/20
				line = @_two.makePolygon @_two.width, 0, @_two.width-sectionX, sectionY, @_two.width-sectionX*2, sectionY*2, @_two.width-sectionX*3, sectionY*3,  @_two.width-sectionX*4, sectionY*4, @_two.width-sectionX*5, sectionY*5, @_two.width-sectionX*6, sectionY*6, @_two.width-sectionX*7, sectionY*7, @_two.width-sectionX*8, sectionY*8, @_two.width-sectionX*9, sectionY*9, @_two.width-sectionX*10, sectionY*10, @_two.width-sectionX*11, sectionY*11, @_two.width-sectionX*12, sectionY*12, @_two.width-sectionX*13, sectionY*13, @_two.width-sectionX*14, sectionY*14, @_two.width-sectionX*15, sectionY*15, @_two.width-sectionX*16, sectionY*16, @_two.width-sectionX*17, sectionY*17, @_two.width-sectionX*18, sectionY*18, @_two.width-sectionX*19, sectionY*19, 0, @_two.height 
			when 5
				section = @_two.width/20
				line = @_two.makePolygon 0, @_two.height/2, section, @_two.height/2, section*2, @_two.height/2, section*3, @_two.height/2, section*4, @_two.height/2, section*5, @_two.height/2, section*6, @_two.height/2, section*7, @_two.height/2, section*8, @_two.height/2, section*9, @_two.height/2, section*10, @_two.height/2,  section*11, @_two.height/2, section*12, @_two.height/2, section*13, @_two.height/2, section*14, @_two.height/2, section*15, @_two.height/2, section*16, @_two.height/2, section*17, @_two.height/2, section*18, @_two.height/2, section*19, @_two.height/2, @_two.width, @_two.height/2 
				line.beginning = 0.5
				line.ending = 0.5
				line.type = 'stripe+'
			when 6
				section = @_two.height/15
				line = @_two.makePolygon @_two.width/2, 0, @_two.width/2, section, @_two.width/2, section*2, @_two.width/2, section*3, @_two.width/2, section*4, @_two.width/2, section*5, @_two.width/2, section*6, @_two.width/2, section*7, @_two.width/2, section*8, @_two.width/2, section*9, @_two.width/2, section*10, @_two.width/2, section*11, @_two.width/2, section*12, @_two.width/2, section*13, @_two.width/2, section*14, @_two.width/2, @_two.height
				line.beginning = 0.5
				line.ending = 0.5
				line.type = 'stripe+'
			when 7
				section = @_two.width/20
				line = @_two.makePolygon 0, @_two.height/2, section, @_two.height/2, section*2, @_two.height/2, section*3, @_two.height/2, section*4, @_two.height/2, section*5, @_two.height/2, section*6, @_two.height/2, section*7, @_two.height/2, section*8, @_two.height/2, section*9, @_two.height/2, section*10, @_two.height/2,  section*11, @_two.height/2, section*12, @_two.height/2, section*13, @_two.height/2, section*14, @_two.height/2, section*15, @_two.height/2, section*16, @_two.height/2, section*17, @_two.height/2, section*18, @_two.height/2, section*19, @_two.height/2, @_two.width, @_two.height/2 
				line.type = 'stripe+Reverse'
			when 8
				section = @_two.height/15
				line = @_two.makePolygon @_two.width/2, 0, @_two.width/2, section, @_two.width/2, section*2, @_two.width/2, section*3, @_two.width/2, section*4, @_two.width/2, section*5, @_two.width/2, section*6, @_two.width/2, section*7, @_two.width/2, section*8, @_two.width/2, section*9, @_two.width/2, section*10, @_two.width/2, section*11, @_two.width/2, section*12, @_two.width/2, section*13, @_two.width/2, section*14, @_two.width/2, @_two.height
				line.type = 'stripe+Reverse'
			when 9
				line = @_two.makeCircle @_two.width/2, @_two.height/2, @_two.height*0.43
			when 0
				line = @_two.makeCircle @_two.width/2, @_two.height/2, @_two.height*0.3
			when 11
				line = @_two.makeRectangle @_two.width/2,  @_two.height/2, @_two.width-40, @_two.height-40

		animationSpeed = @convertToRange(@_bpm, [60,600], [0.05, 0.12])
		if which >= 1 and which <= 4
			line.type = 'stripeX'
			line.beginning = 0
			line.ending = 0
			line.closed = false
			line.animationSpeed = animationSpeed
		else if which >= 5 and which <= 8
			line.closed = false
			line.animationSpeed = animationSpeed/1.3
		else if which is 9 or which is 0
			line.type = 'circle'
			line.animationSpeed = animationSpeed*20
		else if which is 11
			line.type = 'rect'
			line.animationSpeed = animationSpeed*20

		if line
			if @_frequency <= 4
				line.stroke = "rgb("+255+","+255+","+255+")"
			else
				line.stroke = "rgb("+0+","+0+","+0+")"	

			line.noFill()
			line.linewidth = 20
			line.cap = "butt"
			@_foreGround.add line
			@_shapes.push line
	

	showText: (which) =>
		if @_textTimer
			clearTimeout @_textTimer
		hang = @convertToRange(@_bpm, [60,600], [1500, 800])
		switch which
			when 'ber'
				elem = "#ber"
				$("#bisque").removeClass 'show'
				$("#putUpWall").removeClass 'show'
				$("#tearDownWall").removeClass 'show'
			when 'lin'
				elem = "#lin"
				$("#rage").removeClass 'show'
				$("#putUpWall").removeClass 'show'
				$("#tearDownWall").removeClass 'show'
			when 'bisque'
				elem = "#bisque"
				$("#ber").removeClass 'show'
				$("#putUpWall").removeClass 'show'
				$("#tearDownWall").removeClass 'show'
			when 'rage'
				elem = "#rage"
				$("#lin").removeClass 'show'
				$("#putUpWall").removeClass 'show'
				$("#tearDownWall").removeClass 'show'
			when 'putUpWall'
				elem = "#putUpWall"
				hang = 3500
				$("#bisque").removeClass 'show'
				$("#rage").removeClass 'show'
				$("#ber").removeClass 'show'
				$("#lin").removeClass 'show'
				$("#tearDownWall").removeClass 'show'
			when 'tearDownWall'
				elem = "#tearDownWall"
				hang = 3500
				$("#bisque").removeClass 'show'
				$("#rage").removeClass 'show'
				$("#ber").removeClass 'show'
				$("#lin").removeClass 'show'
				$("#putUpWall").removeClass 'show'

		$(elem).addClass 'show'
		@_textTimer = setTimeout =>
			$(".show").removeClass 'show'
		, hang

	showIllustration: (which) =>
		for shape, i in @_shapes
			if shape.isIllustration is true
				return

		switch which
			when 'food'
				if Math.random() > 0.49
					id = 'currywurst'
				else
					id = 'pretzel'
			when 'mascot'
				if Math.random() > 0.49
					id = 'ample'
				else
					id = 'bear'
			when 'landmark'
				if Math.random() > 0.49
					id = 'tower'
				else
					id = 'tor'
				
		illustration = @_two.interpret document.getElementById id
		
		if id is 'pretzel'
			illustration.center().translation.set 12+(@_two.width / 2), @_two.height / 2
		else
			illustration.center().translation.set @_two.width / 2, @_two.height / 2

		@_foreGround.add illustration
		illustration.lifeSpan = 100
		illustration.creationTime = new Date().getTime()
		illustration.isIllustration = true
		@_shapes.push illustration

	showPhoto: (which) =>
		$('#photo').removeClass()

		$('#photo').addClass which
		$('#photo').addClass 'show'
		clearTimeout @_angelaTimer
		clearTimeout @_angelaTimer2

		@_angelaTimer = setTimeout =>
			$('#photo').removeClass 'show'
		, 2000
		@_angelaTimer2 = setTimeout =>
			$('#photo').removeClass which
		, 2500



	onBreak: (length) =>
		if @_pauseBgLerp is false
			@_pauseBgLerp = true
			if length is 'long'
				offset = 75
				hang = @convertToRange(@_bpm, [60,600], [200, 80])
			else if length is 'short'
				offset = 20
				hang = @convertToRange(@_bpm, [60,600], [200, 80])
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

	onBass: (bigOrSmall = 'small') =>
		if @_middleGround.isScaling is false
			@_middleGround.isScaling = true
			if bigOrSmall is 'big'
				@_middleGround.targetScale = 1.2
			else
				@_middleGround.targetScale = 1.05


	onTwoUpdate: () =>
		if @_bgColLerp < 1 and @_pauseBgLerp is false
			@lerpBackground()
		if @_middleGround.isScaling is true
			@animateMiddleGroundFlux()
		if @_shapes.length >= 1
			@removeShapes()

		if @_targetBlur > @_currentBlur
			@_currentBlur += 2.5
			$('#twoMagic svg').css "-webkit-filter", "blur("+@_currentBlur+"px)"
		if Math.abs @_targetBlur - @_currentBlur < 0.5
			@_targetBlur = 0
			@_currentBlur = 0
			$('#twoMagic svg').css "-webkit-filter", "initial"


	lerpBackground: () =>
		@_bgColLerp  += @_bgColLerpSpeed
		@_bgColCurrent = @lerpColour @_bgColFrom, @_bgColTo, @_bgColLerp
		col = "rgb("+@_bgColCurrent.r+","+@_bgColCurrent.g+","+@_bgColCurrent.b+")"
		@_twoElem.style.background = col


	animateMiddleGroundFlux: () =>
		if @_middleGround.targetScale > @_middleGround.scale
			@_middleGround.scale += 0.03
			xOffset = @convertToRange @_middleGround.scale, [0,2], [@_two.width/2, -@_two.width/2]
			yOffset = @convertToRange @_middleGround.scale, [0,2], [@_two.height/2, -@_two.height/2]
			@_middleGround.translation.set xOffset, yOffset
			if @_middleGround.scale >= @_middleGround.targetScale
				@_middleGround.targetScale = 1
		else if @_middleGround.targetScale < @_middleGround.scale
			@_middleGround.scale -= 0.03
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
			if shape.lifeSpan
				if time - shape.creationTime >= shape.lifeSpan
					if shape.fadeOut is true
						shape.opacity -= 0.01
						if shape.opacity < 0
							shape.remove()
							@_shapes.splice i, 1
					else
						shape.remove()
						@_shapes.splice i, 1
			else if shape.animationSpeed
				if shape.type is 'stripeX'
					if shape.ending < 1
						shape.ending += shape.animationSpeed
					else
						shape.beginning += shape.animationSpeed
						if shape.beginning >= 1
							shape.remove()
							@_shapes.splice i, 1
				if shape.type is 'stripe+'
					shape.beginning -= shape.animationSpeed
					shape.ending += shape.animationSpeed
					if shape.beginning <= 0 or shape.ending >= 1
						shape.remove()
						@_shapes.splice i, 1
				if shape.type is 'stripe+Reverse'
					shape.beginning += shape.animationSpeed
					shape.ending -= shape.animationSpeed
					if shape.beginning >= 0.5 or shape.ending <= 0.5
						shape.remove()
						@_shapes.splice i, 1
				if shape.type is 'circle' or shape.type is 'rect'
					shape.linewidth -= shape.animationSpeed
					if shape.linewidth <= 0
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




