$ =>
	window.audioAnalysisEngine = new KeyboardController();


class KeyboardController
	_bpmCalcArray: []
	_dropJumpBPMSensitivity: 50
	_timeSinceLastKeyPress: 0
	_autoTimer: null

	constructor: ->
		console.log 'setup keyboard controller'
		window.onkeydown = @keydown

	keydown: (e) =>
		console.log e.keyCode, e
		#do this only if any of the function keys are pressed
		if e.keyCode >= 37 and e.keyCode <=40 or e.keyCode >= 48 and e.keyCode <= 57 or e.keyCode >= 65 and e.keyCode <= 90
			@setAutoTimer()

		if e.metaKey is false
			e.preventDefault()
			switch e.keyCode
				#inverse colours with 0
				when 48 then window.events.inverseCols.dispatch()
				#set intensity of colours with 1-9 (1 = intense, 9 = subtle)
				when 49 then window.events.frequency.dispatch 1
				when 50 then window.events.frequency.dispatch 2
				when 51 then window.events.frequency.dispatch 3
				when 52 then window.events.frequency.dispatch 4
				when 53 then window.events.frequency.dispatch 5
				when 54 then window.events.frequency.dispatch 6
				when 55 then window.events.frequency.dispatch 7
				when 56 then window.events.frequency.dispatch 8
				when 57 then window.events.frequency.dispatch 9
				#set BPM by tapping spacebar
				when 32 then @getBPM()
				#bass with B
				when 78 then window.events.bass.dispatch 'small'
				when 66 then window.events.bass.dispatch 'big'
				#angela
				when 90 then window.events.angela.dispatch 'angela_1'
				when 88 then window.events.angela.dispatch 'angela_2'
				when 67 then window.events.angela.dispatch 'angela_3'
				when 86 then window.events.angela.dispatch 'angela_4'
				#peaks with up (high) down (low) left (soft) right (hard)
				when 38 then window.events.peak.dispatch 'hi'
				when 40 then window.events.peak.dispatch 'lo'
				when 37 then window.events.peak.dispatch 'soft'
				when 39 then window.events.peak.dispatch 'hard'
				#stripes
				when 81 then window.events.makeSpecial.dispatch 1
				when 87 then window.events.makeSpecial.dispatch 2
				when 69 then window.events.makeSpecial.dispatch 3
				when 82 then window.events.makeSpecial.dispatch 4
				when 84 then window.events.makeSpecial.dispatch 5
				when 89 then window.events.makeSpecial.dispatch 6
				when 85 then window.events.makeSpecial.dispatch 7
				when 73 then window.events.makeSpecial.dispatch 8
				when 79 then window.events.makeSpecial.dispatch 9
				when 80 then window.events.makeSpecial.dispatch 0
				#text
				when 65 then window.events.showText.dispatch 'ber'
				when 83 then window.events.showText.dispatch 'lin'
				when 68 then window.events.showText.dispatch 'bisque'
				when 70 then window.events.showText.dispatch 'rage'
				when 71 then window.events.showText.dispatch 'putUpWall'
				when 72 then window.events.showText.dispatch 'tearDownWall'
				#illustrations
				when 74 then window.events.showIllustration.dispatch 'food'
				when 75 then window.events.showIllustration.dispatch 'mascot'
				when 76 then window.events.showIllustration.dispatch 'landmark'
				#filters
				when 77 then window.events.filter.dispatch 'blur'


	getBPM: () =>
		console.log 'bpm'
		time = new Date().getTime()

		if @_bpmCalcArray.length > 0
			if time - @_bpmCalcArray[@_bpmCalcArray.length-1] > 2000
				@_bpmCalcArray = []
				console.log 'restet bpm calc array'

		@_bpmCalcArray.push time #get ten times of bpm

		if @_bpmCalcArray.length is 10
			timeForTenPeaks = @_bpmCalcArray[@_bpmCalcArray.length-1] - @_bpmCalcArray[0]
			@_bpmCalcArray = []
			@_approxBPM = Math.floor (60000 / timeForTenPeaks)*10
			window.events.BPM.dispatch @_approxBPM
			console.log 'new bpm is', @_approxBPM
		
		if !@_lastBPM
			@_lastBPM = @_approxBPM
		else
			if @_approxBPM > @_lastBPM+@_dropJumpBPMSensitivity
				window.events.BPMJump.dispatch @_approxBPM
			else if @_approxBPM < @_lastBPM-@_dropJumpBPMSensitivity
				window.events.BPMDrop.dispatch @_approxBPM
			@_lastBPM = @_approxBPM

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

