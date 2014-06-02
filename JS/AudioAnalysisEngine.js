(function() {
  var AudioAnalysisEngine,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $(function() {
    var audioAnalysisEngine;
    return audioAnalysisEngine = new AudioAnalysisEngine();
  });

  AudioAnalysisEngine = (function() {
    var _ticker;

    AudioAnalysisEngine.prototype._context = null;

    AudioAnalysisEngine.prototype._source = null;

    AudioAnalysisEngine.prototype._testAudio = null;

    AudioAnalysisEngine.prototype._alreadySetup = false;

    AudioAnalysisEngine.prototype._samplesPerSecond = 30;

    _ticker = null;

    AudioAnalysisEngine.prototype._frequencyData = [];

    AudioAnalysisEngine.prototype._averageAmp = 0;

    AudioAnalysisEngine.prototype._lastAverageAmp = null;

    AudioAnalysisEngine.prototype._waitingForPeak = false;

    AudioAnalysisEngine.prototype._debugCV = null;

    AudioAnalysisEngine.prototype._debugCTX = null;

    function AudioAnalysisEngine() {
      this.drawDebugEqualizer = __bind(this.drawDebugEqualizer, this);
      this.setupDebugEqualizer = __bind(this.setupDebugEqualizer, this);
      this.checkForPeak = __bind(this.checkForPeak, this);
      this.analyse = __bind(this.analyse, this);
      this.startAnalysis = __bind(this.startAnalysis, this);
      this.onError = __bind(this.onError, this);
      this.setupMic = __bind(this.setupMic, this);
      this.setupTestAudio = __bind(this.setupTestAudio, this);
      this.setupAnalyser = __bind(this.setupAnalyser, this);
      this._context = new webkitAudioContext();
      this.setupAnalyser();
      this.setupDebugEqualizer();
      this._testAudio = document.getElementById('test_audio');
      document.getElementById('magic').onclick = (function(_this) {
        return function() {
          return _this.setupTestAudio();
        };
      })(this);
    }

    AudioAnalysisEngine.prototype.setupAnalyser = function() {
      this._analyserNode = this._context.createAnalyser();
      this._analyserNode.fftSize = 1024;
      this._analyserNode.smoothingTimeConstant = 0.3;
      return this._frequencyData = new Uint8Array(this._analyserNode.frequencyBinCount);
    };

    AudioAnalysisEngine.prototype.setupTestAudio = function() {
      console.log('setup test audio', this._testAudio);
      if (this._alreadySetup) {
        return;
      }
      this._source = this._context.createMediaElementSource(this._testAudio);
      this._source.connect(this._analyserNode);
      this._analyserNode.connect(this._context.destination);
      this._testAudio.play();
      this.startAnalysis();
      return this._alreadySetup = true;
    };

    AudioAnalysisEngine.prototype.setupMic = function(stream) {
      console.log('setup mic');
      if (this._alreadySetup) {
        return;
      }
      this._source = this._context.createMediaStreamSource(stream);
      this._source.connect(this._analyserNode);
      this._analyserNode.connect(this._context.destination);
      this.startAnalysis();
      return this._alreadySetup = true;
    };

    AudioAnalysisEngine.prototype.onError = function(err) {
      return console.log('error setting up mic', err);
    };

    AudioAnalysisEngine.prototype.startAnalysis = function() {
      console.log('analysis started');
      return this._ticker = setInterval((function(_this) {
        return function() {
          return _this.analyse();
        };
      })(this), 1000 / this._samplesPerSecond);
    };

    AudioAnalysisEngine.prototype.analyse = function() {
      var i, length, _i, _ref, _results;
      this._analyserNode.getByteFrequencyData(this._frequencyData);
      length = this._frequencyData.length;
      this.drawDebugEqualizer();
      _results = [];
      for (i = _i = 0, _ref = length - 1; _i <= _ref; i = _i += 1) {
        if (i === 0) {
          this._lastAverageAmp = this._averageAmp;
          this._averageAmp = 0;
        }
        this._averageAmp += this._frequencyData[i];
        if (i === length - 1) {
          this._averageAmp = this._averageAmp / length;
          this._averageAmp = Math.ceil(this._averageAmp);
          _results.push(this.checkForPeak());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    AudioAnalysisEngine.prototype.checkForPeak = function() {
      if (this._averageAmp > this._lastAverageAmp && !this._waitingForPeak) {
        this._waitingForPeak = true;
      }
      if (this._averageAmp < this._lastAverageAmp && this._waitingForPeak) {
        this._waitingForPeak = false;
        return console.log('peak');
      }
    };

    AudioAnalysisEngine.prototype.setupDebugEqualizer = function() {
      this._debugCV = document.getElementById('debugVisualiser');
      this._debugCV.width = 600;
      this._debugCV.height = 150;
      return this._debugCTX = this._debugCV.getContext("2d");
    };

    AudioAnalysisEngine.prototype.drawDebugEqualizer = function() {
      var i, _i, _ref, _results;
      this._debugCTX.clearRect(0, 0, this._debugCV.width, this._debugCV.height);
      _results = [];
      for (i = _i = 0, _ref = this._frequencyData.length - 1; _i < _ref; i = _i += 1) {
        this._debugCTX.beginPath();
        this._debugCTX.moveTo(i, this._debugCV.height);
        this._debugCTX.lineTo(i, this._debugCV.height - this._frequencyData[i] / 2);
        _results.push(this._debugCTX.stroke());
      }
      return _results;
    };

    return AudioAnalysisEngine;

  })();

}).call(this);
