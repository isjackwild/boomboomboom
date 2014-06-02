#Audio Analysis Engine
$ ->
	audioAnalysisEngine = new AudioAnalysisEngine();


class AudioAnalysisEngine
	_context: null
	_source: null
	_testAudio: null
	_alreadySetup: false


	constructor: ->
		@_context = new webkitAudioContext()
		@setupAnalyser()

		@_testAudio = document.getElementById('test_audio')
		# document.getElementById('magic').onclick = => @setupTestAudio()
		document.getElementById('magic').onclick = =>
			navigator.webkitGetUserMedia
				audio: true
			,@setupMic, @onError



	setupAnalyser: =>
		@_analyserNode = @_context.createAnalyser()
		@_analyserNode.fftSide = 32
		

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
