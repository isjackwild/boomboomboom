(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.AudioAnalysisEngine = (function() {
    var _ticker;

    AudioAnalysisEngine.prototype._context = null;

    AudioAnalysisEngine.prototype._source = null;

    AudioAnalysisEngine.prototype._testAudio = null;

    AudioAnalysisEngine.prototype._alreadySetup = false;

    AudioAnalysisEngine.prototype._automatic = true;

    AudioAnalysisEngine.prototype._samplesPerSecond = 30;

    _ticker = null;

    AudioAnalysisEngine.prototype._frequencyData = [];

    AudioAnalysisEngine.prototype._averageFreqCalcArray = [];

    AudioAnalysisEngine.prototype._averageAmp = 0;

    AudioAnalysisEngine.prototype._lastAverageAmp = null;

    AudioAnalysisEngine.prototype._waitingForPeak = false;

    AudioAnalysisEngine.prototype._peakSensitivityOffset = 1.2;

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

    AudioAnalysisEngine.prototype._sensivitityForHighPeak = 2;

    AudioAnalysisEngine.prototype._sensivitityForLowPeak = 2;

    AudioAnalysisEngine.prototype._sensitivityForHighFrequencyVariation = 3;

    AudioAnalysisEngine.prototype._lastPeakTime = null;

    AudioAnalysisEngine.prototype._thisPeakTime = null;

    AudioAnalysisEngine.prototype._timeSinceLastPeak = null;

    AudioAnalysisEngine.prototype._shortBreakLength = 750;

    AudioAnalysisEngine.prototype._longBreakLength = 2000;

    AudioAnalysisEngine.prototype._breakSensitivity = 2;

    AudioAnalysisEngine.prototype._bpmCalcArray = [];

    AudioAnalysisEngine.prototype._approxBPM = 0;

    AudioAnalysisEngine.prototype._lastBPM = null;

    AudioAnalysisEngine.prototype._dropJumpBPMSensitivity = 100;

    AudioAnalysisEngine.prototype._volCalcArray = [];

    AudioAnalysisEngine.prototype._averageVol = 0;

    AudioAnalysisEngine.prototype._visible = true;

    function AudioAnalysisEngine() {
      this.eventLogger = __bind(this.eventLogger, this);
      this.calculateAverageVol = __bind(this.calculateAverageVol, this);
      this.calculateAverageBpm = __bind(this.calculateAverageBpm, this);
      this.checkForBreak = __bind(this.checkForBreak, this);
      this.checkForFrequencyVariation = __bind(this.checkForFrequencyVariation, this);
      this.calculateAveragePeakFrequency = __bind(this.calculateAveragePeakFrequency, this);
      this.checkForBassPeak = __bind(this.checkForBassPeak, this);
      this.checkForPeak = __bind(this.checkForPeak, this);
      this.analyse = __bind(this.analyse, this);
      this.toggleAuto = __bind(this.toggleAuto, this);
      this.startAnalysis = __bind(this.startAnalysis, this);
      this.setupMic = __bind(this.setupMic, this);
      this.setupFilters = __bind(this.setupFilters, this);
      this.setupAnalyser = __bind(this.setupAnalyser, this);
      this.setupListeners = __bind(this.setupListeners, this);
      var e;
      try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this._context = new window.AudioContext();
      } catch (_error) {
        e = _error;
        alert('Web Audio Not Supported');
      }
      this.setupAnalyser();
      this.setupFilters();
      this.setupListeners();
    }

    AudioAnalysisEngine.prototype.setupListeners = function() {
      window.events.automatic.add(this.toggleAuto);
      return window.events.micAccepted.add(this.setupMic);
    };

    AudioAnalysisEngine.prototype.setupAnalyser = function() {
      this._analyserNode = this._context.createAnalyser();
      this._analyserNode.smoothingTimeConstant = 0.2;
      return this._frequencyData = new Uint8Array(this._analyserNode.frequencyBinCount);
    };

    AudioAnalysisEngine.prototype.setupFilters = function() {
      this._dynamicsCompressor = this._context.createDynamicsCompressor();
      this._dynamicsCompressor.threshold.value = -33;
      this._dynamicsCompressor.knee = 30;
      this._dynamicsCompressor.ratio = 12;
      this._dynamicsCompressor.reduction = 0;
      this._dynamicsCompressor.attack = 0.003;
      this._dynamicsCompressor.release = 0.250;
      this._biquadFilter = this._context.createBiquadFilter();
      this._biquadFilter.type = "lowshelf";
      this._biquadFilter.frequency.value = 300;
      return this._biquadFilter.gain.value = 5;
    };

    AudioAnalysisEngine.prototype.setupMic = function(stream) {
      if (this._alreadySetup) {
        return;
      }
      this._source = this._context.createMediaStreamSource(stream);
      this._source.connect(this._dynamicsCompressor);
      this._dynamicsCompressor.connect(this._biquadFilter);
      this._biquadFilter.connect(this._analyserNode);
      this.startAnalysis();
      return this._alreadySetup = true;
    };

    AudioAnalysisEngine.prototype.startAnalysis = function() {
      return this._ticker = setInterval((function(_this) {
        return function() {
          return _this.analyse();
        };
      })(this), 1000 / this._samplesPerSecond);
    };

    AudioAnalysisEngine.prototype.toggleAuto = function(onOff) {
      if (onOff === 'on') {
        return this._automatic = true;
      } else if (onOff === 'off') {
        return this._automatic = false;
      }
    };

    AudioAnalysisEngine.prototype.analyse = function() {
      var i, _i, _j, _ref, _ref1, _ref2, _results;
      this._analyserNode.getByteFrequencyData(this._frequencyData);
      this._frequencyOfPeak.amp = 0;
      for (i = _i = 0, _ref = this._frequencyData.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (this._frequencyData[i] > this._frequencyOfPeak.amp) {
          this._frequencyOfPeak.freq = this.convertToRange(i, [0, 40], [0, 9]);
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
      for (i = _j = _ref1 = this._bassCutoff, _ref2 = this._frequencyData.length; _ref1 <= _ref2 ? _j < _ref2 : _j > _ref2; i = _ref1 <= _ref2 ? ++_j : --_j) {
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
        this.checkForBreak();
        if (this._automatic === true) {
          this.calculateAveragePeakFrequency();
          this.calculateAverageBpm();
          this.checkForFrequencyVariation();
        }
        if (this._averageFrequency && this._frequencyOfPeak.freq > this._averageFrequency + this._sensivitityForHighPeak) {
          this.eventLogger("hiPeak");
          return window.events.peak.dispatch('hi');
        } else if (this._averageFrequency && this._frequencyOfPeak.freq < this._averageFrequency - this._sensivitityForLowPeak) {
          this.eventLogger("loPeak");
          return window.events.peak.dispatch('lo');
        } else if (this._averageAmp + this._peakSensitivityOffset * 3 < this._lastAverageAmp) {
          this.eventLogger('hardPeak');
          return window.events.peak.dispatch('hard');
        } else {
          this.eventLogger("softPeak");
          return window.events.peak.dispatch('soft');
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
        for (i = _i = 0, _ref = this._averageFreqCalcArray.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          tempAvFreq += this._averageFreqCalcArray[i];
          if (i === this._averageFreqCalcArray.length - 1) {
            tempAvFreq /= this._averageFreqCalcArray.length;
            this._averageFrequency = tempAvFreq;
            if (this._automatic === true) {
              console.log('send freq');
              window.events.frequency.dispatch(this._averageFrequency);
            }
            this._averageFreqCalcArray = [];
            _results.push(this._bassCutoff = this._averageFrequency + 3);
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
          for (i = _i = 0, _ref = this._frequencyVariationCheck.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
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
          return window.events["break"].dispatch('long');
        } else if (this._timeSinceLastPeak > this._shortBreakLength) {
          this.eventLogger("shortBreak");
          return window.events["break"].dispatch('short');
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
        for (i = _i = 0, _ref = this._volCalcArray.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
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
      return;
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

    AudioAnalysisEngine.prototype.convertToRange = function(value, srcRange, dstRange) {
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

    return AudioAnalysisEngine;

  })();

}).call(this);
