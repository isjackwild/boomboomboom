(function() {
  var KeyboardController,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $((function(_this) {
    return function() {
      return window.audioAnalysisEngine = new KeyboardController();
    };
  })(this));

  KeyboardController = (function() {
    KeyboardController.prototype._bpmCalcArray = [];

    KeyboardController.prototype._dropJumpBPMSensitivity = 50;

    function KeyboardController() {
      this.getBPM = __bind(this.getBPM, this);
      this.keydown = __bind(this.keydown, this);
      console.log('setup keyboard controller');
      window.onkeydown = this.keydown;
    }

    KeyboardController.prototype.keydown = function(e) {
      switch (e.keyCode) {
        case 48:
          return window.events.inverseCols.dispatch();
        case 49:
          return window.events.frequency.dispatch(1);
        case 50:
          return window.events.frequency.dispatch(2);
        case 51:
          return window.events.frequency.dispatch(3);
        case 52:
          return window.events.frequency.dispatch(4);
        case 53:
          return window.events.frequency.dispatch(5);
        case 54:
          return window.events.frequency.dispatch(6);
        case 55:
          return window.events.frequency.dispatch(7);
        case 56:
          return window.events.frequency.dispatch(8);
        case 57:
          return window.events.frequency.dispatch(9);
        case 32:
          return this.getBPM();
      }
    };

    KeyboardController.prototype.getBPM = function() {
      var time, timeForTenPeaks;
      console.log('bpm');
      time = new Date().getTime();
      if (this._bpmCalcArray.length > 0) {
        if (time - this._bpmCalcArray[this._bpmCalcArray.length - 1] > 2000) {
          this._bpmCalcArray = [];
          console.log('restet bpm calc array');
        }
      }
      this._bpmCalcArray.push(time);
      if (this._bpmCalcArray.length === 10) {
        timeForTenPeaks = this._bpmCalcArray[this._bpmCalcArray.length - 1] - this._bpmCalcArray[0];
        this._bpmCalcArray = [];
        this._approxBPM = Math.floor((60000 / timeForTenPeaks) * 10);
        window.events.BPM.dispatch(this._approxBPM);
        console.log('new bpm is', this._approxBPM);
      }
      if (!this._lastBPM) {
        return this._lastBPM = this._approxBPM;
      } else {
        if (this._approxBPM > this._lastBPM + this._dropJumpBPMSensitivity) {
          window.events.BPMJump.dispatch(this._approxBPM);
        } else if (this._approxBPM < this._lastBPM - this._dropJumpBPMSensitivity) {
          window.events.BPMDrop.dispatch(this._approxBPM);
        }
        return this._lastBPM = this._approxBPM;
      }
    };

    return KeyboardController;

  })();

}).call(this);
