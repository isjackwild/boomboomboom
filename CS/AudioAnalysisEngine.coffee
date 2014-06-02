#Audio Analysis Engine
$ ->
	audioAnalysisEngine = new AudioAnalysisEngine();


class AudioAnalysisEngine
	_context: null
	_source: null
	_testAudio: null
	_alreadySetup: false

	_samplesPerSecond: 30
	_ticker = null #analysis interval
	_frequencyData: []
	_averageAmp: 0
	_lastAverageAmp: null
	_waitingForPeak: false


	constructor: ->
		@_context = new webkitAudioContext()
		@setupAnalyser()

		@_testAudio = document.getElementById('test_audio')
		document.getElementById('magic').onclick = => @setupTestAudio()
		# document.getElementById('magic').onclick = =>
		# 	navigator.webkitGetUserMedia
		# 		audio: true
		# 	,@setupMic, @onError

	setupAnalyser: =>
		@_analyserNode = @_context.createAnalyser()
		@_analyserNode.fftSide = 32
		@_frequencyData = new Uint8Array @_analyserNode.frequencyBinCount
		
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
		@_source.connect @_analyserNode
		@_analyserNode.connect @_context.destination
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
		length = @_frequencyData.length

		for i in [0..length-1] by 1
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

		if @_averageAmp < @_lastAverageAmp and @_waitingForPeak
			@_waitingForPeak = false
			console.log 'peak'


