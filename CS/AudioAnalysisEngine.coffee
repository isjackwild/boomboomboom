class window.AudioAnalysisEngine
	_context: null
	_source: null
	_testAudio: null
	_alreadySetup: false
	_automatic: true

	_samplesPerSecond: 30
	_ticker = null #analysis interval

	_frequencyData: []
	_averageFreqCalcArray: []

	_averageAmp: 0
	_lastAverageAmp: null

	_waitingForPeak: false
	_peakSensitivityOffset: 1.2 #how much the amp. has to fall by to register a peak
	_bassWaitingForPeak: false
	_bassCutoff: 1000 #will be overridde... which frequencies in the spectogram aree considered bass
	_frequencyOfPeak: {
		frequency: 0,
		freq: null
		lastFreq: null
	}

	_averageFrequency: 0
	_frequencyVariationCheck: []
	_lastFrequencyVariation: null
	_sensivitityForHighPeak: 2 #how much the peak has to be above average to be considered high
	_sensivitityForLowPeak: 2 #how much the peak has to be above average to be considered low
	_sensitivityForHighFrequencyVariation: 3 #how much the peaks have to differ from each other on average to trigger a hi freq variation zone

	_lastPeakTime: null
	_thisPeakTime: null
	_timeSinceLastPeak: null
	_shortBreakLength: 750
	_longBreakLength: 2000
	_breakSensitivity: 2

	_bpmCalcArray: []
	_approxBPM: 0
	_lastBPM: null
	_dropJumpBPMSensitivity: 100 #how much the bpm has to drop by on each sample to registera drop / jump

	_volCalcArray: []
	_averageVol: 0

	_visible: true


	constructor: ->
		try
			window.AudioContext = window.AudioContext || window.webkitAudioContext
			@_context = new window.AudioContext()
		catch e
			alert('Web Audio Not Supported')

		@setupAnalyser()
		@setupFilters()
		window.events.automatic.add @toggleAuto
		window.events.micAccepted.add @setupMic


	setupAnalyser: =>
		@_analyserNode = @_context.createAnalyser()
		# @_analyserNode.fftSize = 1024
		@_analyserNode.smoothingTimeConstant = 0.2
		@_frequencyData = new Uint8Array @_analyserNode.frequencyBinCount

	setupFilters: =>
		#http://www.w3.org/TR/webaudio/#DynamicsCompressorNode
		@_dynamicsCompressor = @_context.createDynamicsCompressor()
		@_dynamicsCompressor.threshold.value = -33
		@_dynamicsCompressor.knee = 30
		@_dynamicsCompressor.ratio = 12
		@_dynamicsCompressor.reduction = 0
		@_dynamicsCompressor.attack = 0.003
		@_dynamicsCompressor.release = 0.250
		@_biquadFilter = @_context.createBiquadFilter()
		@_biquadFilter.type = "lowshelf"
		@_biquadFilter.frequency.value = 300
		@_biquadFilter.gain.value = 5
		

	setupMic: (stream) =>
		if (@_alreadySetup)
			return
		@_source = @_context.createMediaStreamSource stream
		@_source.connect @_dynamicsCompressor
		@_dynamicsCompressor.connect @_biquadFilter
		@_biquadFilter.connect @_analyserNode
		@startAnalysis()
		@_alreadySetup = true


	startAnalysis: =>
		@_ticker = setInterval =>
			@analyse()
		, 1000 / @_samplesPerSecond


	toggleAuto: (onOff) =>
		if onOff is 'on'
			@_automatic = true
		else if onOff is 'off'
			@_automatic = false


	analyse: =>
		@_analyserNode.getByteFrequencyData @_frequencyData
		@_frequencyOfPeak.amp = 0

		for i in [0...@_frequencyData.length] #check for highest peak over the whole range

			if @_frequencyData[i] > @_frequencyOfPeak.amp
				@_frequencyOfPeak.freq = @convertToRange i, [0, 40], [0, 9] #set highest freq found as this one
				@_frequencyOfPeak.amp = @_frequencyData[i] #how high the peak was

			if i is 0 #reset
				@_lastAverageAmp = @_averageAmp
				@_averageAmp = 0
			
			@_averageAmp += @_frequencyData[i]

			if i is @_frequencyData.length-1
				@_averageAmp = @_averageAmp / @_frequencyData.length
				@_averageAmp = Math.ceil @_averageAmp  #average amplitude over all the frequencies
				@calculateAverageVol()
				@checkForPeak()


		for i in [@_bassCutoff...@_frequencyData.length]
			if i is @_bassCutoff
				@_lastBassAverageAmp = @_bassAverageAmp
				@_bassAverageAmp = 0

			@_bassAverageAmp += @_frequencyData[i]

			if i is @_frequencyData.length-1
				@_bassAverageAmp = @_bassAverageAmp / (@_frequencyData.length - @_bassCutoff)
				@_bassAverageAmp = Math.ceil @_bassAverageAmp
				@checkForBassPeak()


	checkForPeak: =>
		if @_averageAmp > @_lastAverageAmp and !@_waitingForPeak
			@_waitingForPeak = true

		if @_averageAmp+@_peakSensitivityOffset < @_lastAverageAmp and @_waitingForPeak
			@_waitingForPeak = false
			@checkForBreak()
			if @_automatic is true
				@calculateAveragePeakFrequency() #what was the highest frequency at the time of the peak
				@calculateAverageBpm() #what is the bmp
				@checkForFrequencyVariation()

			if @_averageFrequency and @_frequencyOfPeak.freq > @_averageFrequency+@_sensivitityForHighPeak
				@eventLogger "hiPeak"
				window.events.peak.dispatch 'hi'
			else if @_averageFrequency and @_frequencyOfPeak.freq < @_averageFrequency-@_sensivitityForLowPeak
				@eventLogger "loPeak"
				window.events.peak.dispatch 'lo'
			else if @_averageAmp+@_peakSensitivityOffset*3 < @_lastAverageAmp
				@eventLogger 'hardPeak'
				window.events.peak.dispatch 'hard'
			else
				@eventLogger "softPeak"
				window.events.peak.dispatch 'soft'


	checkForBassPeak: => 
		if @_bassAverageAmp > @_averageVol / 1.5
			if @_bassAverageAmp > @_lastBassAverageAmp and !@_bassWaitingForPeak
				@_bassWaitingForPeak = true

			if @_bassAverageAmp+@_peakSensitivityOffset < @_lastBassAverageAmp and @_bassWaitingForPeak
				@_bassWaitingForPeak = true
				@eventLogger "bass"
				window.events.bass.dispatch()


	calculateAveragePeakFrequency: =>
		@_averageFreqCalcArray.push @_frequencyOfPeak.freq #get ten peaks
		if @_averageFreqCalcArray.length is 10
			tempAvFreq = 0
			for i in [0...@_averageFreqCalcArray.length]
				tempAvFreq += @_averageFreqCalcArray[i]
				if i is @_averageFreqCalcArray.length-1
					tempAvFreq /= @_averageFreqCalcArray.length #get average freq of them
					@_averageFrequency = tempAvFreq
					window.events.frequency.dispatch @_averageFrequency
					@_averageFreqCalcArray = []
					@_bassCutoff = @_averageFrequency + 3


	#how much is the difference in frequency about the peaks, and when does the average difference in frequency change?
	checkForFrequencyVariation: =>
		if !@_frequencyOfPeak.lastFreq
			@_frequencyOfPeak.lastFreq = @_frequencyOfPeak.freq
		else
			differenceInFreq = Math.abs @_frequencyOfPeak.freq - @_frequencyOfPeak.lastFreq
			@_frequencyOfPeak.lastFreq = @_frequencyOfPeak.freq
			@_frequencyVariationCheck.push differenceInFreq
			if @_frequencyVariationCheck.length is 10
				for i in [0...@_frequencyVariationCheck.length]
					if i is 0
						avDifference = 0
					avDifference += @_frequencyVariationCheck[i]
					if i is @_frequencyVariationCheck.length-1
						avDifference /= @_frequencyVariationCheck.length
						@_frequencyVariationCheck = []
						if avDifference > @_sensitivityForHighFrequencyVariation
							@_currentFrequencyVariation = 'high'
						else
							@_currentFrequencyVariation = 'low'

						if @_lastFrequencyVariation != @_currentFrequencyVariation
							@eventLogger "changeFreqVar"
							window.events.changeFreqVar.dispatch @_currentFrequencyVariation
							@_lastFrequencyVariation = @_currentFrequencyVariation


	#check for jumps in the amplitude of the song
	checkForBreak: =>
		if !@_lastPeakTime
				@_lastPeakTime = new Date().getTime()
		else if @_lastAverageAmp > @_averageVol*@_breakSensitivity #check if this peak has had a big jump in amplitude
			@_thisPeakTime = new Date().getTime()
			@_timeSinceLastPeak = @_thisPeakTime - @_lastPeakTime
			@_lastPeakTime = @_thisPeakTime
			if @_timeSinceLastPeak > @_longBreakLength #if it's been a while since the last peak with a big difference in amplitude
				@eventLogger "longBreak"
				window.events.break.dispatch 'long'
			else if @_timeSinceLastPeak > @_shortBreakLength #if it's been a while since the last peak with a big difference in amplitude
				@eventLogger "shortBreak"
				window.events.break.dispatch 'short'



	calculateAverageBpm: =>
		@_bpmCalcArray.push new Date().getTime() #get ten times of bpm
		if @_bpmCalcArray.length is 10
			timeForTenPeaks = @_bpmCalcArray[@_bpmCalcArray.length-1] - @_bpmCalcArray[0]
			@_bpmCalcArray = []
			@_approxBPM = Math.floor (60000 / timeForTenPeaks)*10
			window.events.BPM.dispatch @_approxBPM
		
		if !@_lastBPM
			@_lastBPM = @_approxBPM
		else
			if @_approxBPM > @_lastBPM+@_dropJumpBPMSensitivity
				window.events.BPMJump.dispatch @_approxBPM
				@eventLogger 'BPMJump'
			else if @_approxBPM < @_lastBPM-@_dropJumpBPMSensitivity
				window.events.BPMDrop.dispatch @_approxBPM
				@eventLogger 'BPMDrop'
			@_lastBPM = @_approxBPM


	#Do logic which detects when there has been a significant change in the averages over the last few averages
	calculateAverageVol: =>
		@_volCalcArray.push @_averageAmp
		if @_volCalcArray.length is @_samplesPerSecond
			tempAvVol = 0
			for i in [0...@_volCalcArray.length]
				tempAvVol += @_volCalcArray[i]
				if i is @_volCalcArray.length-1
					tempAvVol /= @_volCalcArray.length
					@_averageVol = Math.floor tempAvVol
					window.events.volume.dispatch @_averageVol
					@_volCalcArray = []


	eventLogger: (event) =>
		return #comment this out this to log events
		switch event
			when "hiPeak" then console.log 'high peak'
			when "loPeak" then console.log 'low peak'
			when "hardPeak" then console.log 'hard peak'
			when "softPeak" then console.log 'soft peak'
			when "bass" then console.log 'BASSSS'
			when "shortBreak" then console.log 'short break'
			when "longBreak" then console.log 'long break'
			when "BPMDrop" then console.log 'drop in BPM'
			when "BPMJump" then console.log 'jump in BPM'
			when "changeFreqVar"
				if @_currentFrequencyVariation is "high"
					console.log 'CRAZY'
				else if @_currentFrequencyVariation is "low"
					console.log 'currently low frequency variation'


	#tools
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




