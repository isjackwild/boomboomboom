# $ =>
# 	window.keyboardController = new KeyboardController()


class window.KeyboardController
	_bpmCalcArray: []
	_dropJumpBPMSensitivity: 50
	_timeSinceLastKeyPress: 0
	_autoTimer: null

	constructor: ->
		# console.log 'setup keyboard controller'
		window.onkeydown = @keydown

	keydown: (e) =>
		# console.log e.keyCode, e
		#do this only if any of the function keys are pressed
		if e.keyCode >= 37 and e.keyCode <=40 or e.keyCode >= 48 and e.keyCode <= 57 or e.keyCode >= 65 and e.keyCode <= 90 or e.keyCode is 219 or e.keyCode is 221
			@setAutoTimer()
			window.events.automatic.dispatch 'off'

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
				when 90 then window.events.angela.dispatch 'angela'
				when 88 then window.events.angela.dispatch 'obama'
				when 67 then window.events.angela.dispatch 'queen'
				when 86 then window.events.angela.dispatch 'charles'
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
				when 219 then window.events.makeSpecial.dispatch 11
				#text
				when 65 then window.events.showText.dispatch 'boom'
				when 83 then window.events.showText.dispatch 'tssk'
				when 68 then window.events.showText.dispatch 'wobb'
				when 70 then window.events.showText.dispatch 'clap'
				#illustrations
				when 71 then window.events.showIllustration.dispatch 'hand'
				when 72 then window.events.showIllustration.dispatch 'heart'
				when 74 then window.events.showIllustration.dispatch 'ear'
				when 75 then window.events.showIllustration.dispatch 'eye'
				when 76 then window.events.showIllustration.dispatch 'mouth'
				#filters
				when 77 then window.events.filter.dispatch 'blur'
				#flashes
				when 188 then window.events.break.dispatch 'long'
				when 190 then window.events.break.dispatch 'short'
				#transform
				when 186 then window.events.transform.dispatch 'squashX'
				when 222 then window.events.transform.dispatch 'squashY'


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
		clearInterval @_autoTimer
		@_timeSinceLastKeyPress = 0

		@_autoTimer = setInterval =>
			@_timeSinceLastKeyPress += 1
			if @_timeSinceLastKeyPress > 10
				clearInterval @_autoTimer
				@_timeSinceLastKeyPress = 0
				window.events.automatic.dispatch 'on'
				console.log 'automatic ON'
		,1000

		console.log 'set auto timer'

