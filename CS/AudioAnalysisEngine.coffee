#Audio Analysis Engine
$ ->
	audioAnalysisEngine = new AudioAnalysisEngine();

	gui = new dat.GUI()
	gui.add audioAnalysisEngine, '_samplesPerSecond'
	gui.add audioAnalysisEngine, '_peakSensitivityOffset'
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
	_averageAmp: 0
	_lastAverageAmp: null
	_waitingForPeak: false
	_peakSensitivityOffset: 1

	_loudestFreqFound: {
		frequency: 0,
		index: null
	}

	_bpmCalcArray: []

	_debugCV: null
	_debugCTX: null


	constructor: ->
		@_context = new webkitAudioContext()
		@setupAnalyser()
		@setupFilters()
		@setupDebugEqualizer()

		@_testAudio = document.getElementById('test_audio')
		# document.getElementById('magic').onclick = => @setupTestAudio()
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
		length = @_frequencyData.length
		@drawDebugEqualizer()

		@_loudestFreqFound.frequency = 0

		for i in [0..length-1] by 1

			if @_frequencyData[i] > @_loudestFreqFound.frequency
				@_loudestFreqFound.frequency = @_frequencyData[i]
				@_loudestFreqFound.index = i

			if i is 0
				@_lastAverageAmp = @_averageAmp
				@_averageAmp = 0
			@_averageAmp += @_frequencyData[i];

			if i is length-1
				@_averageAmp = @_averageAmp / length
				@_averageAmp = Math.ceil @_averageAmp
				@checkForPeak()



	checkForPeak: =>
		if @_averageAmp > @_lastAverageAmp and !@_waitingForPeak
			@_waitingForPeak = true

		if @_averageAmp+@_peakSensitivityOffset < @_lastAverageAmp and @_waitingForPeak
			@_waitingForPeak = false
			#test if hi or lo freq peak
			if @_loudestFreqFound.index < 7
				console.log 'low peak', @_loudestFreqFound.index
			else if @_loudestFreqFound.index > 33
				console.log 'high peak', @_loudestFreqFound.index

			#calculate (approx) BPM
			@_bpmCalcArray.push new Date().getTime()
			if @_bpmCalcArray.length is 10
				timeForTenPeaks = @_bpmCalcArray[@_bpmCalcArray.length-1] - @_bpmCalcArray[0]
				@_bpmCalcArray = []
				approxBPM = Math.floor (60000 / timeForTenPeaks)*10
				console.log "approx BPM is " + approxBPM



	setupDebugEqualizer: =>
		@_debugCV = document.getElementById 'debugVisualiser'
		@_debugCV.width = 600
		@_debugCV.height = 150
		@_debugCTX = @_debugCV.getContext "2d"


	drawDebugEqualizer: =>
		@_debugCTX.clearRect 0,0,@_debugCV.width,@_debugCV.height

		for i in [0...@_frequencyData.length-1] by 2
			@_debugCTX.beginPath()
			@_debugCTX.moveTo i/2, @_debugCV.height
			@_debugCTX.lineTo i/2, @_debugCV.height - @_frequencyData[i]/2
			@_debugCTX.stroke()




