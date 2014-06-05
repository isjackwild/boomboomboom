(function() {
  var VisualsEngine,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $(function() {
    var visualsEngine;
    return visualsEngine = new VisualsEngine();
  });

  VisualsEngine = (function() {
    VisualsEngine.prototype._cv = null;

    VisualsEngine.prototype._whichColour = 0;

    function VisualsEngine() {
      this.randomiseBackgroundColour = __bind(this.randomiseBackgroundColour, this);
      this.onHighPeak = __bind(this.onHighPeak, this);
      this.onHardPeak = __bind(this.onHardPeak, this);
      console.log('setup background generation');
      this._cv = document.getElementById("magic");
      this._ctx = this._cv.getContext('2d');
      console.log(this._cv, this._ctx);
      this.setupListeners();
    }

    VisualsEngine.prototype.setupListeners = function() {
      window.events.longBreak.add(this.randomiseBackgroundColour);
      window.events.hardPeak.add(this.onHardPeak);
      return window.events.hiPeak.add(this.onHighPeak);
    };

    VisualsEngine.prototype.onHardPeak = function() {
      var clear;
      this._ctx.fillStyle = 'black';
      this._ctx.rect(this._cv.width / 4, this._cv.height / 4, (this._cv.width / 4) * 2, (this._cv.height / 4) * 2);
      this._ctx.fill();
      return clear = setTimeout((function(_this) {
        return function() {
          return _this._ctx.clearRect((_this._cv.width / 4) - 10, (_this._cv.height / 4) - 10, ((_this._cv.width / 4) * 2) + 10, ((_this._cv.height / 4) * 2) + 10);
        };
      })(this), 200);
    };

    VisualsEngine.prototype.onHighPeak = function() {
      var clear2;
      this._ctx.fillStyle = 'white';
      this._ctx.rect(0, 0, this._cv.width, this._cv.height / 6);
      this._ctx.fill();
      return clear2 = setTimeout((function(_this) {
        return function() {
          return _this._ctx.clearRect(0, 0, _this._cv.width, (_this._cv.height / 6) + 10);
        };
      })(this), 200);
    };

    VisualsEngine.prototype.randomiseBackgroundColour = function() {
      this._whichColour += 1;
      if (this._whichColour % 2 === 1) {
        return this._cv.style.background = "grey";
      } else {
        return this._cv.style.background = "DarkSlateGray ";
      }
    };

    return VisualsEngine;

  })();

}).call(this);
