#Audio Analysis Engine
$ =>
	window.audioAnalysisEngine = new AudioAnalysisEngine();

	gui = new dat.GUI()
	gui.add audioAnalysisEngine, '_samplesPerSecond'
	gui.add audioAnalysisEngine, '_peakSensitivityOffset'
	gui.add audioAnalysisEngine, '_sensivitityForHighPeak'
	gui.add audioAnalysisEngine, '_sensivitityForLowPeak'
	gui.add audioAnalysisEngine, '_longBreakLength'
	gui.add audioAnalysisEngine, '_shortBreakLength'
	gui.add audioAnalysisEngine, '_breakSensitivity'
	gui.add audioAnalysisEngine, '_dropJumpBPMSensitivity'
	gui.add audioAnalysisEngine, '_sensitivityForHighFrequencyVariation'
	gui.add audioAnalysisEngine._analyserNode, 'smoothingTimeConstant'
	gui.add audioAnalysisEngine._analyserNode, 'fftSize'
	gui.add(audioAnalysisEngine, '_bassCutoff').listen()
	gui.add(audioAnalysisEngine, '_approxBPM').listen()
	gui.add(audioAnalysisEngine, '_averageFrequency').listen()
	gui.add(audioAnalysisEngine, '_averageVol').listen()



class AudioAnalysisEngine
	#some of these should probably be made as variables not properties. check which ones are only used in the functions and get rid of them
	_context: null
	_source: null
	_testAudio: null
	_alreadySetup: false

	_samplesPerSecond: 30
	_ticker = null #analysis interval

	_frequencyData: []
	_averageFreqCalcArray: []

	_averageAmp: 0
	_lastAverageAmp: null

	_waitingForPeak: false
	_peakSensitivityOffset: 3 #how much the amp. has to fall by to register a peak
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
	_sensivitityForHighPeak: 12 #how much the peak has to be above average to be considered high
	_sensivitityForLowPeak: 12 #how much the peak has to be above average to be considered low
	_sensitivityForHighFrequencyVariation: 12 #how much the peaks have to differ from each other on average to trigger a hi freq variation zone

	_lastPeakTime: null
	_thisPeakTime: null
	_timeSinceLastPeak: null
	_shortBreakLength: 750
	_longBreakLength: 2000
	_breakSensitivity: 2

	#move things such as volume and approx BPM into the Events.coffee file — send them out as events and listen / store in an object in there. Keep it clean.
	_bpmCalcArray: []
	_approxBPM: 0
	_lastBPM: null
	_dropJumpBPMSensitivity: 150 #how much the bpm has to drop by on each sample to registera drop / jump

	_volCalcArray: []
	_averageVol: 0

	_debugCV: null
	_debugCTX: null


	constructor: ->
		@_context = new webkitAudioContext()
		@setupAnalyser()
		@setupFilters()
		@setupDebugEqualizer()

		@_testAudio = document.getElementById('test_audio')
		document.getElementById('twoMagic').onclick = => @setupTestAudio()

		#comment this out to disable mid and use audio insteaad
		document.getElementById('twoMagic').onclick = =>
			navigator.webkitGetUserMedia
				audio: true
			,@setupMic, @onError

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
		console.log @_biquadFilter, @_dynamicsCompressor
		
	setupTestAudio: =>
		console.log 'setup test audio', @_testAudio
		if (@_alreadySetup)
			return
		@_source = @_context.createMediaElementSource @_testAudio
		@_source.connect @_biquadFilter
		@_biquadFilter.connect @_analyserNode
		@_analyserNode.connect @_context.destination
		@_testAudio.play()
		@startAnalysis()
		@_alreadySetup = true

	setupMic: (stream) =>
		console.log 'setup mic'
		if (@_alreadySetup)
			return
		@_source = @_context.createMediaStreamSource stream
		@_source.connect @_dynamicsCompressor
		@_dynamicsCompressor.connect @_biquadFilter
		@_biquadFilter.connect @_analyserNode
		# @_analyserNode.connect @_context.destination
		@startAnalysis()
		@_alreadySetup = true

	onError: (err) =>
		console.log 'error setting up mic', err

	startAnalysis: =>
		console.log 'analysis started'
		@_ticker = setInterval =>
			@analyse()
		, 1000 / @_samplesPerSecond


	analyse: =>
		@_analyserNode.getByteFrequencyData @_frequencyData
		@drawDebugEqualizer()
		@_frequencyOfPeak.amp = 0

		for i in [0...@_frequencyData.length] by 1 #check for highest peak over the whole range

			if @_frequencyData[i] > @_frequencyOfPeak.amp
				@_frequencyOfPeak.freq = i #set highest freq found as this one
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


		for i in [@_bassCutoff...@_frequencyData.length] by 1
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
			@calculateAveragePeakFrequency() #what was the highest frequency at the time of the peak
			@calculateAverageBpm() #what is the bmp
			@checkForBreak()
			@checkForFrequencyVariation()

			#look for times where this is changing a lot... lots of songs have times where this changes a lot and then areas when all peaks are around average
			if @_averageFrequency and @_frequencyOfPeak.freq > @_averageFrequency+@_sensivitityForHighPeak
				@eventLogger "hiPeak"
				window.events.peak.dispatch 'hi'
			else if @_averageFrequency and @_frequencyOfPeak.freq < @_averageFrequency-@_sensivitityForLowPeak
				@eventLogger "loPeak"
				window.events.peak.dispatch 'lo'
			else
				if @_averageAmp+@_peakSensitivityOffset*2 < @_lastAverageAmp
					@eventLogger 'hardPeak'
					# @calculateAverageBpm() #what is the bmp
					window.events.peak.dispatch 'hard'
				else
					@eventLogger "softPeak"
					window.events.peak.dispatch 'soft'


	checkForBassPeak: => #would be good if this was based on a peak much lower than the average. At the moment a very bassy song would set this off every time a peak was detected.
		if @_bassAverageAmp > @_averageVol / 1.5
			if @_bassAverageAmp > @_lastBassAverageAmp and !@_bassWaitingForPeak
				@_bassWaitingForPeak = true

			if @_bassAverageAmp+@_peakSensitivityOffset < @_lastBassAverageAmp and @_bassWaitingForPeak
				@_bassWaitingForPeak = true
				@eventLogger "bass"
				window.events.bass.dispatch()


	#Do logic which detects when there has been a significant change in the averages over the last few averages
	calculateAveragePeakFrequency: =>
		@_averageFreqCalcArray.push @_frequencyOfPeak.freq #get ten peaks
		if @_averageFreqCalcArray.length is 10
			tempAvFreq = 0
			for i in [0...@_averageFreqCalcArray.length] by 1
				tempAvFreq += @_averageFreqCalcArray[i]
				if i is @_averageFreqCalcArray.length-1
					tempAvFreq /= @_averageFreqCalcArray.length #get average freq of them
					@_averageFrequency = tempAvFreq
					window.events.frequency.dispatch @_averageFrequency
					@_averageFreqCalcArray = []
					@_bassCutoff = @_averageFrequency + 40


	#how much is the difference in frequency about the peaks, and when does the average difference in frequency change?
	checkForFrequencyVariation: =>
		if !@_frequencyOfPeak.lastFreq
			@_frequencyOfPeak.lastFreq = @_frequencyOfPeak.freq
		else
			differenceInFreq = Math.abs @_frequencyOfPeak.freq - @_frequencyOfPeak.lastFreq
			@_frequencyOfPeak.lastFreq = @_frequencyOfPeak.freq
			@_frequencyVariationCheck.push differenceInFreq
			if @_frequencyVariationCheck.length is 10
				for i in [0...@_frequencyVariationCheck.length] by 1
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


	#check for jumps in the volume of the song
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


	#Do logic which detects when there has been a significant change in the averages over the last few averages
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
			for i in [0...@_volCalcArray.length] by 1
				tempAvVol += @_volCalcArray[i]
				if i is @_volCalcArray.length-1
					tempAvVol /= @_volCalcArray.length
					@_averageVol = Math.floor tempAvVol
					window.events.volume.dispatch @_averageVol
					@_volCalcArray = []


	#replace this with the events signal system
	eventLogger: (event) =>
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


	setupDebugEqualizer: =>
		@_debugCV = document.getElementById 'debugVisualiser'
		@_debugCV.width = 600
		@_debugCV.height = 150
		@_debugCTX = @_debugCV.getContext "2d"



	drawDebugEqualizer: =>
		@_debugCTX.clearRect 0,0,@_debugCV.width,@_debugCV.height
		for i in [0...@_frequencyData.length] by 2
			@_debugCTX.beginPath()
			@_debugCTX.moveTo i/2, @_debugCV.height
			@_debugCTX.lineTo i/2, @_debugCV.height - @_frequencyData[i]/2
			@_debugCTX.stroke()


#clean-up / comment out the methods i don't end up using in the graphics

#if using mic for parties etc, should write a setup method to normalise the volumes etc.

#should probably try and re-write pretty much all the methods to make them more accurate... look into this after experimenting with the graphics

#two modes: music controlled and ipad / iphone controlled



