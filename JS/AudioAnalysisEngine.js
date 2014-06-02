(function() {
  var AudioAnalysisEngine,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $(function() {
    var audioAnalysisEngine;
    return audioAnalysisEngine = new AudioAnalysisEngine();
  });

  AudioAnalysisEngine = (function() {
    AudioAnalysisEngine.prototype._context = null;

    AudioAnalysisEngine.prototype._source = null;

    AudioAnalysisEngine.prototype._testAudio = null;

    AudioAnalysisEngine.prototype._alreadySetup = false;

    function AudioAnalysisEngine() {
      this.startAnalysis = __bind(this.startAnalysis, this);
      this.onError = __bind(this.onError, this);
      this.setupMic = __bind(this.setupMic, this);
      this.setupTestAudio = __bind(this.setupTestAudio, this);
      this.setupAnalyser = __bind(this.setupAnalyser, this);
      this._context = new webkitAudioContext();
      this.setupAnalyser();
      this._testAudio = document.getElementById('test_audio');
      document.getElementById('magic').onclick = (function(_this) {
        return function() {
          return navigator.webkitGetUserMedia({
            audio: true
          }, _this.setupMic, _this.onError);
        };
      })(this);
    }

    AudioAnalysisEngine.prototype.setupAnalyser = function() {
      this._analyserNode = this._context.createAnalyser();
      return this._analyserNode.fftSide = 32;
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
      return console.log('analysis started');
    };

    return AudioAnalysisEngine;

  })();

}).call(this);
