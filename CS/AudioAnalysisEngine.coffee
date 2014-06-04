#Audio Analysis Engine
$ ->
	audioAnalysisEngine = new AudioAnalysisEngine();

	gui = new dat.GUI()
	gui.add audioAnalysisEngine, '_samplesPerSecond'
	gui.add audioAnalysisEngine, '_peakSensitivityOffset'
	gui.add audioAnalysisEngine, '_sensivitityForHighPeak'
	gui.add audioAnalysisEngine, '_sensivitityForLowPeak'
	gui.add audioAnalysisEngine._analyserNode, 'smoothingTimeConstant'
	gui.add audioAnalysisEngine._analyserNode, 'fftSize'
	gui.add(audioAnalysisEngine, '_bassCutoff').listen()
	gui.add(audioAnalysisEngine, '_approxBPM').listen()
	gui.add(audioAnalysisEngine, '_averageFrequency').listen()
	gui.add(audioAnalysisEngine, '_averageVol').listen()


class AudioAnalysisEngine
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
	_bassWaitingForPeak: false
	_bassCutoff: 1000
	_peakSensitivityOffset: 1

	_frequencyOfPeak: {
		frequency: 0,
		freq: null
	}
	_averageFrequency: 0
	_sensivitityForHighPeak: 33
	_sensivitityForLowPeak: 20

	_bpmCalcArray: []
	_approxBPM: 0

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
		document.getElementById('magic').onclick = =>
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

		# setInterval =>
		# 	console.log @_frequencyData
		# , 5000


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

		# console.log @_frequencyData
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
			#a peak has happened
			@_waitingForPeak = false
			@calculateAveragePeakFrequency() #what was the highest frequency at the time of the peak
			@calculateAverageBpm() #what is the bmp

			# console.log "peak"

			#look for times where this is changing a lot... lots of songs have times where this changes a lot and then areas when all peaks are around average
			if @_averageFrequency and @_frequencyOfPeak.freq > @_averageFrequency+@_sensivitityForHighPeak
				console.log 'higher than av peak'
			else if @_averageFrequency and @_frequencyOfPeak.freq < @_averageFrequency-@_sensivitityForLowPeak
				console.log 'lower than av peak'
			else
				console.log 'average peak'

			if @_lastAverageAmp - @_averageAmp > @_lastAverageAmp*1.5
				console.log "amp difference " + (@_lastAverageAmp - @_averageAmp)

	checkForBassPeak: => #would be good if this was based on a peak much lower than the average. At the moment a very bassy song would set this off every time a peak was detected.
		if @_bassAverageAmp > @_averageVol / 2
			if @_bassAverageAmp > @_lastBassAverageAmp and !@_bassWaitingForPeak
				@_bassWaitingForPeak = true

			if @_bassAverageAmp+@_peakSensitivityOffset < @_lastBassAverageAmp and @_bassWaitingForPeak
				@_bassWaitingForPeak = true
				console.log "BASSSSS", @_bassAverageAmp



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

					@_bassCutoff = @_averageFrequency + 555
					# console.log 'av freq is ' + @_averageFrequency


	#Do logic which detects when there has been a significant change in the averages over the last few averages
	calculateAverageBpm: =>
		@_bpmCalcArray.push new Date().getTime() #get ten times of bpm
		if @_bpmCalcArray.length is 10
			timeForTenPeaks = @_bpmCalcArray[@_bpmCalcArray.length-1] - @_bpmCalcArray[0]
			@_bpmCalcArray = []
			@_approxBPM = Math.floor (60000 / timeForTenPeaks)*10
			# console.log "approx BPM is " + @_approxBPM


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
					@_volCalcArray = []
					# console.log 'av vol is ' + @_averageVol


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



#Data I have to work with:

#When there is a peak
#When there is a peak of a higher freq than the average
#When there is a peak of a lower freq than the average
#When there is a peak at a really low frequency
#BPM
#Approx frequency of the peaks are at the moment
#Approx volume at the moment



