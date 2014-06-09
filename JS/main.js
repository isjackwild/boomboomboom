(function() {
  var AudioAnalysisEngine,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $((function(_this) {
    return function() {
      var gui;
      window.audioAnalysisEngine = new AudioAnalysisEngine();
      gui = new dat.GUI();
      gui.add(audioAnalysisEngine, '_samplesPerSecond');
      gui.add(audioAnalysisEngine, '_peakSensitivityOffset');
      gui.add(audioAnalysisEngine, '_sensivitityForHighPeak');
      gui.add(audioAnalysisEngine, '_sensivitityForLowPeak');
      gui.add(audioAnalysisEngine, '_longBreakLength');
      gui.add(audioAnalysisEngine, '_shortBreakLength');
      gui.add(audioAnalysisEngine, '_breakSensitivity');
      gui.add(audioAnalysisEngine, '_dropJumpBPMSensitivity');
      gui.add(audioAnalysisEngine, '_sensitivityForHighFrequencyVariation');
      gui.add(audioAnalysisEngine._analyserNode, 'smoothingTimeConstant');
      gui.add(audioAnalysisEngine._analyserNode, 'fftSize');
      gui.add(audioAnalysisEngine, '_bassCutoff').listen();
      gui.add(audioAnalysisEngine, '_approxBPM').listen();
      gui.add(audioAnalysisEngine, '_averageFrequency').listen();
      return gui.add(audioAnalysisEngine, '_averageVol').listen();
    };
  })(this));

  AudioAnalysisEngine = (function() {
    var _ticker;

    AudioAnalysisEngine.prototype._context = null;

    AudioAnalysisEngine.prototype._source = null;

    AudioAnalysisEngine.prototype._testAudio = null;

    AudioAnalysisEngine.prototype._alreadySetup = false;

    AudioAnalysisEngine.prototype._samplesPerSecond = 30;

    _ticker = null;

    AudioAnalysisEngine.prototype._frequencyData = [];

    AudioAnalysisEngine.prototype._averageFreqCalcArray = [];

    AudioAnalysisEngine.prototype._averageAmp = 0;

    AudioAnalysisEngine.prototype._lastAverageAmp = null;

    AudioAnalysisEngine.prototype._waitingForPeak = false;

    AudioAnalysisEngine.prototype._peakSensitivityOffset = 3;

    AudioAnalysisEngine.prototype._bassWaitingForPeak = false;

    AudioAnalysisEngine.prototype._bassCutoff = 1000;

    AudioAnalysisEngine.prototype._frequencyOfPeak = {
      frequency: 0,
      freq: null,
      lastFreq: null
    };

    AudioAnalysisEngine.prototype._averageFrequency = 0;

    AudioAnalysisEngine.prototype._frequencyVariationCheck = [];

    AudioAnalysisEngine.prototype._lastFrequencyVariation = null;

    AudioAnalysisEngine.prototype._sensivitityForHighPeak = 33;

    AudioAnalysisEngine.prototype._sensivitityForLowPeak = 20;

    AudioAnalysisEngine.prototype._sensitivityForHighFrequencyVariation = 55;

    AudioAnalysisEngine.prototype._lastPeakTime = null;

    AudioAnalysisEngine.prototype._thisPeakTime = null;

    AudioAnalysisEngine.prototype._timeSinceLastPeak = null;

    AudioAnalysisEngine.prototype._shortBreakLength = 1000;

    AudioAnalysisEngine.prototype._longBreakLength = 2500;

    AudioAnalysisEngine.prototype._breakSensitivity = 2;

    AudioAnalysisEngine.prototype._bpmCalcArray = [];

    AudioAnalysisEngine.prototype._approxBPM = 0;

    AudioAnalysisEngine.prototype._lastBPM = null;

    AudioAnalysisEngine.prototype._dropJumpBPMSensitivity = 150;

    AudioAnalysisEngine.prototype._volCalcArray = [];

    AudioAnalysisEngine.prototype._averageVol = 0;

    AudioAnalysisEngine.prototype._debugCV = null;

    AudioAnalysisEngine.prototype._debugCTX = null;

    function AudioAnalysisEngine() {
      this.drawDebugEqualizer = __bind(this.drawDebugEqualizer, this);
      this.setupDebugEqualizer = __bind(this.setupDebugEqualizer, this);
      this.eventLogger = __bind(this.eventLogger, this);
      this.calculateAverageVol = __bind(this.calculateAverageVol, this);
      this.calculateAverageBpm = __bind(this.calculateAverageBpm, this);
      this.checkForBreak = __bind(this.checkForBreak, this);
      this.checkForFrequencyVariation = __bind(this.checkForFrequencyVariation, this);
      this.calculateAveragePeakFrequency = __bind(this.calculateAveragePeakFrequency, this);
      this.checkForBassPeak = __bind(this.checkForBassPeak, this);
      this.checkForPeak = __bind(this.checkForPeak, this);
      this.analyse = __bind(this.analyse, this);
      this.startAnalysis = __bind(this.startAnalysis, this);
      this.onError = __bind(this.onError, this);
      this.setupMic = __bind(this.setupMic, this);
      this.setupTestAudio = __bind(this.setupTestAudio, this);
      this.setupFilters = __bind(this.setupFilters, this);
      this.setupAnalyser = __bind(this.setupAnalyser, this);
      this._context = new webkitAudioContext();
      this.setupAnalyser();
      this.setupFilters();
      this.setupDebugEqualizer();
      this._testAudio = document.getElementById('test_audio');
      document.getElementById('twoMagic').onclick = (function(_this) {
        return function() {
          return _this.setupTestAudio();
        };
      })(this);
      document.getElementById('twoMagic').onclick = (function(_this) {
        return function() {
          return navigator.webkitGetUserMedia({
            audio: true
          }, _this.setupMic, _this.onError);
        };
      })(this);
    }

    AudioAnalysisEngine.prototype.setupAnalyser = function() {
      this._analyserNode = this._context.createAnalyser();
      this._analyserNode.smoothingTimeConstant = 0.2;
      return this._frequencyData = new Uint8Array(this._analyserNode.frequencyBinCount);
    };

    AudioAnalysisEngine.prototype.setupFilters = function() {
      this._dynamicsCompressor = this._context.createDynamicsCompressor();
      this._dynamicsCompressor.threshold = -24;
      this._dynamicsCompressor.knee = 30;
      this._dynamicsCompressor.ratio = 12;
      this._dynamicsCompressor.reduction = 0;
      this._dynamicsCompressor.attack = 0.003;
      return this._dynamicsCompressor.release = 0.250;
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
      this._source.connect(this._dynamicsCompressor);
      this._dynamicsCompressor.connect(this._analyserNode);
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
      var i, _i, _j, _ref, _ref1, _ref2, _results;
      this._analyserNode.getByteFrequencyData(this._frequencyData);
      this.drawDebugEqualizer();
      this._frequencyOfPeak.amp = 0;
      for (i = _i = 0, _ref = this._frequencyData.length; _i < _ref; i = _i += 1) {
        if (this._frequencyData[i] > this._frequencyOfPeak.amp) {
          this._frequencyOfPeak.freq = i;
          this._frequencyOfPeak.amp = this._frequencyData[i];
        }
        if (i === 0) {
          this._lastAverageAmp = this._averageAmp;
          this._averageAmp = 0;
        }
        this._averageAmp += this._frequencyData[i];
        if (i === this._frequencyData.length - 1) {
          this._averageAmp = this._averageAmp / this._frequencyData.length;
          this._averageAmp = Math.ceil(this._averageAmp);
          this.calculateAverageVol();
          this.checkForPeak();
        }
      }
      _results = [];
      for (i = _j = _ref1 = this._bassCutoff, _ref2 = this._frequencyData.length; _j < _ref2; i = _j += 1) {
        if (i === this._bassCutoff) {
          this._lastBassAverageAmp = this._bassAverageAmp;
          this._bassAverageAmp = 0;
        }
        this._bassAverageAmp += this._frequencyData[i];
        if (i === this._frequencyData.length - 1) {
          this._bassAverageAmp = this._bassAverageAmp / (this._frequencyData.length - this._bassCutoff);
          this._bassAverageAmp = Math.ceil(this._bassAverageAmp);
          _results.push(this.checkForBassPeak());
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
      if (this._averageAmp + this._peakSensitivityOffset < this._lastAverageAmp && this._waitingForPeak) {
        this._waitingForPeak = false;
        this.calculateAveragePeakFrequency();
        this.calculateAverageBpm();
        this.checkForBreak();
        this.checkForFrequencyVariation();
        if (this._averageFrequency && this._frequencyOfPeak.freq > this._averageFrequency + this._sensivitityForHighPeak) {
          this.eventLogger("hiPeak");
          return window.events.peak.dispatch('hi');
        } else if (this._averageFrequency && this._frequencyOfPeak.freq < this._averageFrequency - this._sensivitityForLowPeak) {
          this.eventLogger("loPeak");
          return window.events.peak.dispatch('lo');
        } else {
          if (this._averageAmp + this._peakSensitivityOffset * 2.5 < this._lastAverageAmp) {
            this.eventLogger('hardPeak');
            return window.events.peak.dispatch('hard');
          } else {
            this.eventLogger("softPeak");
            return window.events.peak.dispatch('soft');
          }
        }
      }
    };

    AudioAnalysisEngine.prototype.checkForBassPeak = function() {
      if (this._bassAverageAmp > this._averageVol / 1.5) {
        if (this._bassAverageAmp > this._lastBassAverageAmp && !this._bassWaitingForPeak) {
          this._bassWaitingForPeak = true;
        }
        if (this._bassAverageAmp + this._peakSensitivityOffset < this._lastBassAverageAmp && this._bassWaitingForPeak) {
          this._bassWaitingForPeak = true;
          this.eventLogger("bass");
          return window.events.bass.dispatch();
        }
      }
    };

    AudioAnalysisEngine.prototype.calculateAveragePeakFrequency = function() {
      var i, tempAvFreq, _i, _ref, _results;
      this._averageFreqCalcArray.push(this._frequencyOfPeak.freq);
      if (this._averageFreqCalcArray.length === 10) {
        tempAvFreq = 0;
        _results = [];
        for (i = _i = 0, _ref = this._averageFreqCalcArray.length; _i < _ref; i = _i += 1) {
          tempAvFreq += this._averageFreqCalcArray[i];
          if (i === this._averageFreqCalcArray.length - 1) {
            tempAvFreq /= this._averageFreqCalcArray.length;
            this._averageFrequency = tempAvFreq;
            window.events.frequency.dispatch(this._averageFrequency);
            this._averageFreqCalcArray = [];
            _results.push(this._bassCutoff = this._averageFrequency + 500);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    AudioAnalysisEngine.prototype.checkForFrequencyVariation = function() {
      var avDifference, differenceInFreq, i, _i, _ref, _results;
      if (!this._frequencyOfPeak.lastFreq) {
        return this._frequencyOfPeak.lastFreq = this._frequencyOfPeak.freq;
      } else {
        differenceInFreq = Math.abs(this._frequencyOfPeak.freq - this._frequencyOfPeak.lastFreq);
        this._frequencyOfPeak.lastFreq = this._frequencyOfPeak.freq;
        this._frequencyVariationCheck.push(differenceInFreq);
        if (this._frequencyVariationCheck.length === 10) {
          _results = [];
          for (i = _i = 0, _ref = this._frequencyVariationCheck.length; _i < _ref; i = _i += 1) {
            if (i === 0) {
              avDifference = 0;
            }
            avDifference += this._frequencyVariationCheck[i];
            if (i === this._frequencyVariationCheck.length - 1) {
              avDifference /= this._frequencyVariationCheck.length;
              this._frequencyVariationCheck = [];
              if (avDifference > this._sensitivityForHighFrequencyVariation) {
                this._currentFrequencyVariation = 'high';
              } else {
                this._currentFrequencyVariation = 'low';
              }
              if (this._lastFrequencyVariation !== this._currentFrequencyVariation) {
                this.eventLogger("changeFreqVar");
                window.events.changeFreqVar.dispatch(this._currentFrequencyVariation);
                _results.push(this._lastFrequencyVariation = this._currentFrequencyVariation);
              } else {
                _results.push(void 0);
              }
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      }
    };

    AudioAnalysisEngine.prototype.checkForBreak = function() {
      if (!this._lastPeakTime) {
        return this._lastPeakTime = new Date().getTime();
      } else if (this._lastAverageAmp > this._averageVol * this._breakSensitivity) {
        this._thisPeakTime = new Date().getTime();
        this._timeSinceLastPeak = this._thisPeakTime - this._lastPeakTime;
        this._lastPeakTime = this._thisPeakTime;
        if (this._timeSinceLastPeak > this._longBreakLength) {
          this.eventLogger("longBreak");
          return window.events.longBreak.dispatch();
        } else if (this._timeSinceLastPeak > this._shortBreakLength) {
          window.events.shortBreak.dispatch();
          return this.eventLogger("shortBreak");
        }
      }
    };

    AudioAnalysisEngine.prototype.calculateAverageBpm = function() {
      var timeForTenPeaks;
      this._bpmCalcArray.push(new Date().getTime());
      if (this._bpmCalcArray.length === 10) {
        timeForTenPeaks = this._bpmCalcArray[this._bpmCalcArray.length - 1] - this._bpmCalcArray[0];
        this._bpmCalcArray = [];
        this._approxBPM = Math.floor((60000 / timeForTenPeaks) * 10);
        window.events.BPM.dispatch(this._approxBPM);
      }
      if (!this._lastBPM) {
        return this._lastBPM = this._approxBPM;
      } else {
        if (this._approxBPM > this._lastBPM + this._dropJumpBPMSensitivity) {
          window.events.BPMJump.dispatch(this._approxBPM);
          this.eventLogger('BPMJump');
        } else if (this._approxBPM < this._lastBPM - this._dropJumpBPMSensitivity) {
          window.events.BPMDrop.dispatch(this._approxBPM);
          this.eventLogger('BPMDrop');
        }
        return this._lastBPM = this._approxBPM;
      }
    };

    AudioAnalysisEngine.prototype.calculateAverageVol = function() {
      var i, tempAvVol, _i, _ref, _results;
      this._volCalcArray.push(this._averageAmp);
      if (this._volCalcArray.length === this._samplesPerSecond) {
        tempAvVol = 0;
        _results = [];
        for (i = _i = 0, _ref = this._volCalcArray.length; _i < _ref; i = _i += 1) {
          tempAvVol += this._volCalcArray[i];
          if (i === this._volCalcArray.length - 1) {
            tempAvVol /= this._volCalcArray.length;
            this._averageVol = Math.floor(tempAvVol);
            window.events.volume.dispatch(this._averageVol);
            _results.push(this._volCalcArray = []);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    AudioAnalysisEngine.prototype.eventLogger = function(event) {
      switch (event) {
        case "hiPeak":
          return console.log('high peak');
        case "loPeak":
          return console.log('low peak');
        case "hardPeak":
          return console.log('hard peak');
        case "softPeak":
          return console.log('soft peak');
        case "bass":
          return console.log('BASSSS');
        case "shortBreak":
          return console.log('short break');
        case "longBreak":
          return console.log('long break');
        case "BPMDrop":
          return console.log('drop in BPM');
        case "BPMJump":
          return console.log('jump in BPM');
        case "changeFreqVar":
          if (this._currentFrequencyVariation === "high") {
            return console.log('CRAZY');
          } else if (this._currentFrequencyVariation === "low") {
            return console.log('currently low frequency variation');
          }
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
      for (i = _i = 0, _ref = this._frequencyData.length; _i < _ref; i = _i += 2) {
        this._debugCTX.beginPath();
        this._debugCTX.moveTo(i / 2, this._debugCV.height);
        this._debugCTX.lineTo(i / 2, this._debugCV.height - this._frequencyData[i] / 2);
        _results.push(this._debugCTX.stroke());
      }
      return _results;
    };

    return AudioAnalysisEngine;

  })();

}).call(this);

(function() {
  var Signal;

  Signal = signals.Signal;

  window.events = {
    peak: new Signal(),
    bass: new Signal(),
    shortBreak: new Signal(),
    longBreak: new Signal(),
    BPM: new Signal(),
    BPMDrop: new Signal(),
    BPMJump: new Signal(),
    changeFreqVar: new Signal(),
    volume: new Signal(),
    frequency: new Signal()
  };

}).call(this);

(function() {
  var VisualsEngine,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $(function() {
    return window.visualsEngine = new VisualsEngine();
  });

  VisualsEngine = (function() {
    VisualsEngine.prototype._cv = null;

    VisualsEngine.prototype._shapes = [];

    VisualsEngine.prototype._peakCount = 0;

    VisualsEngine.prototype._two = null;

    VisualsEngine.prototype._twoElem = null;

    VisualsEngine.prototype._volume = 10;

    VisualsEngine.prototype._frequency = 10;

    VisualsEngine.prototype._bpm = 150;

    VisualsEngine.prototype._whichColour = 0;

    VisualsEngine.prototype._coloursSetup = false;

    VisualsEngine.prototype._colourBucket = {
      fg: new Array(20),
      bg: new Array(5)
    };

    function VisualsEngine() {
      this.HSVtoRGB = __bind(this.HSVtoRGB, this);
      this.randomiseBackgroundColour = __bind(this.randomiseBackgroundColour, this);
      this.onPeak = __bind(this.onPeak, this);
      this.gotVolume = __bind(this.gotVolume, this);
      this.gotFrequency = __bind(this.gotFrequency, this);
      this.gotBPM = __bind(this.gotBPM, this);
      console.log('setup background generation');
      this._cv = document.getElementById("magic");
      this._ctx = this._cv.getContext('2d');
      this.setupListeners();
      this.setupTwoJs();
      this.updateColourBucket();
    }

    VisualsEngine.prototype.setupListeners = function() {
      window.events.longBreak.add(this.randomiseBackgroundColour);
      window.events.peak.add(this.onPeak);
      window.events.BPM.add(this.gotBPM);
      window.events.volume.add(this.gotVolume);
      return window.events.frequency.add(this.gotFrequency);
    };

    VisualsEngine.prototype.setupTwoJs = function() {
      var params;
      console.log('setup two');
      this._twoElem = document.getElementById('twoMagic');
      params = {
        fullscreen: true,
        autostart: true
      };
      return this._two = new Two(params).appendTo(this._twoElem);
    };

    VisualsEngine.prototype.gotBPM = function(BPM) {
      this._bpm = BPM;
      return this.updateColourBucket();
    };

    VisualsEngine.prototype.gotFrequency = function(freq) {
      this._frequency = freq;
      return this.updateColourBucket();
    };

    VisualsEngine.prototype.gotVolume = function(vol) {
      this._volume = vol;
      return this.updateColourBucket();
    };

    VisualsEngine.prototype.updateColourBucket = function() {
      var i, tempCol, _i, _j, _k, _l, _ref, _ref1, _ref2, _ref3, _results, _results1;
      if (this._coloursSetup === false) {
        console.log('generate colours');
        this._coloursSetup = true;
        for (i = _i = 0, _ref = this._colourBucket.fg.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          tempCol = {
            h: Math.floor(Math.random() * 360),
            s: 70,
            v: 80
          };
          this._colourBucket.fg[i] = tempCol;
        }
        _results = [];
        for (i = _j = 0, _ref1 = this._colourBucket.bg.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
          tempCol = {
            h: Math.floor(Math.random() * 360),
            s: 20,
            v: 20
          };
          _results.push(this._colourBucket.bg[i] = tempCol);
        }
        return _results;
      } else {
        console.log('update colours');
        for (i = _k = 0, _ref2 = this._colourBucket.fg.length; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
          this._colourBucket.fg[i].s = 50;
          this._colourBucket.fg[i].v = Math.floor(this.convertToRange(this._frequency, [0, 50], [40, 80]));
          console.log(this._colourBucket.fg[i].v, 'fg v');
        }
        _results1 = [];
        for (i = _l = 0, _ref3 = this._colourBucket.bg.length; 0 <= _ref3 ? _l < _ref3 : _l > _ref3; i = 0 <= _ref3 ? ++_l : --_l) {
          this._colourBucket.bg[i].s = 40;
          this._colourBucket.bg[i].v = Math.floor(this.convertToRange(this._frequency, [0, 50], [10, 60]));
          _results1.push(console.log(this._colourBucket.bg[i].v, 'bg v'));
        }
        return _results1;
      }
    };

    VisualsEngine.prototype.onPeak = function(type) {
      var circle, col, shape, tempH, tempS, tempV, whichCol, _i, _len, _ref;
      if (type === 'hard') {
        this.randomiseBackgroundColour();
        return;
      }
      whichCol = Math.ceil(Math.random() * (this._colourBucket.fg.length - 1));
      col = this._colourBucket.fg[whichCol];
      tempH = col.h;
      tempS = col.s;
      tempV = col.v;
      if (type === "soft") {
        col = this.HSVtoRGB(tempH, tempS, tempV);
        col = "rgb(" + col.r + "," + col.g + "," + col.b + ")";
      } else if (type === "hi") {
        tempS = tempS + 20;
        tempV = 100;
        col = this.HSVtoRGB(tempH, tempS, tempV);
        col = "rgb(" + col.r + "," + col.g + "," + col.b + ")";
      } else if (type === "lo") {
        tempV = tempV - 50;
        col = this.HSVtoRGB(tempH, tempS, tempV);
        col = "rgb(" + col.r + "," + col.g + "," + col.b + ")";
      }
      console.log(col);
      if (this._peakCount % 3 === 0) {
        circle = this._two.makeCircle(this._two.width / 2, this._two.height / 2, 500);
        circle.fill = col;
        circle.lifeSpan = 500;
        circle.noStroke();
        this._shapes.push(circle);
      } else if (this._peakCount % 3 === 1) {
        _ref = this._shapes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          shape = _ref[_i];
          shape.remove();
          this._shapes.splice(shape.index, 1);
        }
      }
      return this._peakCount += 1;
    };

    VisualsEngine.prototype.randomiseBackgroundColour = function() {
      var col, whichCol;
      whichCol = Math.ceil(Math.random() * (this._colourBucket.bg.length - 1));
      col = this._colourBucket.bg[whichCol];
      col = this.HSVtoRGB(col.h, col.s, col.v);
      col = "rgb(" + col.r + "," + col.g + "," + col.b + ")";
      return this._twoElem.style.background = col;
    };

    VisualsEngine.prototype.HSVtoRGB = function(h, s, v) {
      var b, f, g, i, p, q, r, rgb, t;
      if (s === void 0) {
        if (h.h > 360) {
          h.h -= 360;
        }
        if (h.s > 100) {
          h.s = 100;
        }
        if (h.v > 100) {
          h.v = 100;
        }
        if (h.h < 0) {
          h.h = 360 - Math.abs(h.h);
        }
        if (h.s < 0) {
          h.s = 0;
        }
        if (h.v < 0) {
          h.v = 0;
        }
        s = h.s / 100;
        v = h.v / 100;
        h = h.h / 360;
      } else {
        if (h > 360) {
          h -= 360;
        }
        if (s > 100) {
          s = 100;
        }
        if (v > 100) {
          v = 100;
        }
        if (h < 0) {
          h = 360 - Math.abs(h.h);
        }
        if (s < 0) {
          s = 0;
        }
        if (v < 0) {
          v = 0;
        }
        h = h / 360;
        s = s / 100;
        v = v / 100;
      }
      i = Math.floor(h * 6);
      f = h * 6 - i;
      p = v * (1 - s);
      q = v * (1 - f * s);
      t = v * (1 - (1 - f) * s);
      switch (i % 6) {
        case 0:
          r = v;
          g = t;
          b = p;
          break;
        case 1:
          r = q;
          g = v;
          b = p;
          break;
        case 2:
          r = p;
          g = v;
          b = t;
          break;
        case 3:
          r = p;
          g = q;
          b = v;
          break;
        case 4:
          r = t;
          g = p;
          b = v;
          break;
        case 5:
          r = v;
          g = p;
          b = q;
      }
      rgb = {
        r: Math.floor(r * 255),
        g: Math.floor(g * 255),
        b: Math.floor(b * 255)
      };
      return rgb;
    };

    VisualsEngine.prototype.convertToRange = function(value, srcRange, dstRange) {
      var adjValue, dstMax, srcMax;
      if (value < srcRange[0]) {
        return dstRange[0];
      } else if (value > srcRange[1]) {
        return dstRange[1];
      } else {
        srcMax = srcRange[1] - srcRange[0];
        dstMax = dstRange[1] - dstRange[0];
        adjValue = value - srcRange[0];
        return (adjValue * dstMax / srcMax) + dstRange[0];
      }
    };

    return VisualsEngine;

  })();

}).call(this);
