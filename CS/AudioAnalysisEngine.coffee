# Signal = signals.Signal
# events = {
# 	hiPeak: new Signal()
# 	loPeak: new Signal()
# 	hardPeak: new Signal()
# 	softPeak: new Signal()
# 	bass: new Signal()
# 	shortBreak: new Signal()
# 	longBreak: new Signal()
# 	BPM: new Signal()
# 	BPMDrop: new Signal()
# 	BPMJump: new Signal()
# 	changeFreqVar: new Signal()
# 	volume: new Signal()
# }



#Audio Analysis Engine
$ =>
	audioAnalysisEngine = new AudioAnalysisEngine();

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
	_peakSensitivityOffset: 5 #how much the amp. has to fall by to register a peak
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
	_sensivitityForHighPeak: 33 #how much the peak has to be above average to be considered high
	_sensivitityForLowPeak: 20 #how much the peak has to be above average to be considered low
	_sensitivityForHighFrequencyVariation: 55 #how much the peaks have to differ from each other on average to trigger a hi freq variation zone

	_lastPeakTime: null
	_thisPeakTime: null
	_timeSinceLastPeak: null
	_shortBreakLength: 1000
	_longBreakLength: 2500
	_breakSensitivity: 2

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
		document.getElementById('magic').onclick = => @setupTestAudio()

		#comment this out to disable mid and use audio insteaad
		# document.getElementById('magic').onclick = =>
		# 	navigator.webkitGetUserMedia
		# 		audio: true
		# 	,@setupMic, @onError

	setupAnalyser: =>
		@_analyserNode = @_context.createAnalyser()
		# @_analyserNode.fftSize = 1024
		@_analyserNode.smoothingTimeConstant = 0.2
		@_frequencyData = new Uint8Array @_analyserNode.frequencyBinCount

	setupFilters: =>
		#http://www.w3.org/TR/webaudio/#DynamicsCompressorNode
		@_dynamicsCompressor = @_context.createDynamicsCompressor()
		@_dynamicsCompressor.threshold = -24
		@_dynamicsCompressor.knee = 30
		@_dynamicsCompressor.ratio = 12
		@_dynamicsCompressor.reduction = 0
		@_dynamicsCompressor.attack = 0.003
		@_dynamicsCompressor.release = 0.250
		
	setupTestAudio: =>
		console.log 'setup test audio', @_testAudio
		if (@_alreadySetup)
			return
		@_source = @_context.createMediaElementSource(@_testAudio)
		@_source.connect @_analyserNode
		@_analyserNode.connect @_context.destination
		@_testAudio.play()
		@startAnalysis()
		@_alreadySetup = true

	setupMic: (stream) =>
		console.log 'setup mic'
		if (@_alreadySetup)
			return
		@_source = @_context.createMediaStreamSource(stream)
		@_source.connect @_dynamicsCompressor
		@_dynamicsCompressor.connect @_analyserNode
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

		for i in [0..@_frequencyData.length-1] by 1 #check for highest peak over the whole range

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


		for i in [@_bassCutoff..@_frequencyData.length-1] by 1
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
				window.events.hiPeak.dispatch()
			else if @_averageFrequency and @_frequencyOfPeak.freq < @_averageFrequency-@_sensivitityForLowPeak
				@eventLogger "loPeak"
				window.events.loPeak.dispatch()
			else
				if @_averageAmp+@_peakSensitivityOffset*3 < @_lastAverageAmp
					@eventLogger 'hardPeak'
					window.events.hardPeak.dispatch()
				else
					@eventLogger "softPeak"
					window.events.softPeak.dispatch()


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
			for i in [0..@_averageFreqCalcArray.length-1] by 1
				tempAvFreq += @_averageFreqCalcArray[i]
				if i is @_averageFreqCalcArray.length-1
					tempAvFreq /= @_averageFreqCalcArray.length #get average freq of them
					@_averageFrequency = tempAvFreq
					@_averageFreqCalcArray = []
					@_bassCutoff = @_averageFrequency + 500


	#how much is the difference in frequency about the peaks, and when does the average difference in frequency change?
	checkForFrequencyVariation: =>
		if !@_frequencyOfPeak.lastFreq
			@_frequencyOfPeak.lastFreq = @_frequencyOfPeak.freq
		else
			differenceInFreq = Math.abs @_frequencyOfPeak.freq - @_frequencyOfPeak.lastFreq
			@_frequencyOfPeak.lastFreq = @_frequencyOfPeak.freq
			@_frequencyVariationCheck.push differenceInFreq
			if @_frequencyVariationCheck.length is 10
				for i in [0..@_frequencyVariationCheck.length-1] by 1
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
				window.events.longBreak.dispatch()
			else if @_timeSinceLastPeak > @_shortBreakLength #if it's been a while since the last peak with a big difference in amplitude
				window.events.shortBreak.dispatch()
				@eventLogger "shortBreak"


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
			for i in [0..@_volCalcArray.length-1] by 1
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
		for i in [0..@_frequencyData.length-1] by 2
			@_debugCTX.beginPath()
			@_debugCTX.moveTo i/2, @_debugCV.height
			@_debugCTX.lineTo i/2, @_debugCV.height - @_frequencyData[i]/2
			@_debugCTX.stroke()




