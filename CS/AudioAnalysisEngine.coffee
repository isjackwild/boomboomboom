#Audio Analysis Engine
$ ->
	audioAnalysisEngine = new AudioAnalysisEngine();

	gui = new dat.GUI()
	gui.add audioAnalysisEngine, '_samplesPerSecond'
	gui.add audioAnalysisEngine, '_peakSensitivityOffset'
	gui.add audioAnalysisEngine, '_sensivitityForHighPeak'
	gui.add audioAnalysisEngine._analyserNode, 'smoothingTimeConstant'
	gui.add audioAnalysisEngine._analyserNode, 'fftSize'


class AudioAnalysisEngine
	_context: null
	_source: null
	_testAudio: null
	_alreadySetup: false

	_samplesPerSecond: 20
	_ticker = null #analysis interval
	_frequencyData: []
	_averageFreqCalcArray: []
	_averageAmp: 0
	_lastAverageAmp: null
	_waitingForPeak: false
	_peakSensitivityOffset: 1

	_frequencyOfPeak: {
		frequency: 0,
		freq: null
	}
	_averageFrequency: null
	_sensivitityForHighPeak: 5

	_bpmCalcArray: []
	_approxBPM: null

	_debugCV: null
	_debugCTX: null


	constructor: ->
		@_context = new webkitAudioContext()
		@setupAnalyser()
		@setupFilters()
		@setupDebugEqualizer()

		@_testAudio = document.getElementById('test_audio')
		document.getElementById('magic').onclick = => @setupTestAudio()
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

		# setInterval =>
		# 	console.log @_frequencyData
		# , 5000


	analyse: =>
		@_analyserNode.getByteFrequencyData @_frequencyData
		@drawDebugEqualizer()

		@_frequencyOfPeak.amp = 0

		for i in [0..@_frequencyData.length-1] by 1

			if @_frequencyData[i] > @_frequencyOfPeak.amp
				@_frequencyOfPeak.amp = @_frequencyData[i]
				@_frequencyOfPeak.freq = i

			if i is 0
				@_lastAverageAmp = @_averageAmp
				@_averageAmp = 0
			
			@_averageAmp += @_frequencyData[i];

			if i is @_frequencyData.length-1
				@_averageAmp = @_averageAmp / @_frequencyData.length
				@_averageAmp = Math.ceil @_averageAmp
				@checkForPeak()



	checkForPeak: =>
		if @_averageAmp > @_lastAverageAmp and !@_waitingForPeak
			@_waitingForPeak = true

		if @_averageAmp+@_peakSensitivityOffset < @_lastAverageAmp and @_waitingForPeak
			@_waitingForPeak = false
			@calculateAveragePeakFrequency()
			@calculateAverageBpm()

			if @_averageFrequency and @_frequencyOfPeak.freq > @_averageFrequency*@_sensivitityForHighPeak
				console.log 'high peak', @_frequencyOfPeak.freq
			# else
			# 	console.log 'peak' 


	calculateAveragePeakFrequency: =>
		#dont include high peaks as they skew the average
		if @_averageFrequency and @_frequencyOfPeak.freq > @_averageFrequency*@_sensivitityForHighPeak
			return

		@_averageFreqCalcArray.push @_frequencyOfPeak.freq
		if @_averageFreqCalcArray.length is 10
			tempAvFreq = 0
			for i in [0..@_averageFreqCalcArray.length-1] by 1
				tempAvFreq += @_averageFreqCalcArray[i]
				if i is @_averageFreqCalcArray.length-1
					tempAvFreq /= @_averageFreqCalcArray.length
					@_averageFrequency = tempAvFreq
					@_averageFreqCalcArray = []
					console.log 'av freq is ' + @_averageFrequency


	calculateAverageBpm: =>
		@_bpmCalcArray.push new Date().getTime()
		if @_bpmCalcArray.length is 10
			timeForTenPeaks = @_bpmCalcArray[@_bpmCalcArray.length-1] - @_bpmCalcArray[0]
			@_bpmCalcArray = []
			@_approxBPM = Math.floor (60000 / timeForTenPeaks)*10
			console.log "approx BPM is " + @_approxBPM


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




