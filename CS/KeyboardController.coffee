$ =>
	window.audioAnalysisEngine = new KeyboardController();


class KeyboardController
	_bpmCalcArray: []
	_dropJumpBPMSensitivity: 50

	constructor: ->
		console.log 'setup keyboard controller'
		window.onkeydown = @keydown

	keydown: (e) =>
		console.log e.keyCode
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
			when 66 then window.events.bass.dispatch()
			#breaks with < (short) and > (long)
			when 188 then window.events.break.dispatch 'short'
			when 190 then window.events.break.dispatch 'long'

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

