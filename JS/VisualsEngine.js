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

    VisualsEngine.prototype._whichColour = 0;

    function VisualsEngine() {
      this.randomiseBackgroundColour = __bind(this.randomiseBackgroundColour, this);
      this.onPeak = __bind(this.onPeak, this);
      this.onLowPeak = __bind(this.onLowPeak, this);
      this.onHighPeak = __bind(this.onHighPeak, this);
      this.onSoftPeak = __bind(this.onSoftPeak, this);
      console.log('setup background generation');
      this._cv = document.getElementById("magic");
      this._ctx = this._cv.getContext('2d');
      this.setupListeners();
      this.setupTwoJs();
    }

    VisualsEngine.prototype.setupListeners = function() {
      window.events.longBreak.add(this.randomiseBackgroundColour);
      window.events.hardPeak.add(this.randomiseBackgroundColour);
      window.events.softPeak.add(this.onSoftPeak);
      window.events.highPeak.add(this.onHighPeak);
      return window.events.lowPeak.add(this.onLowPeak);
    };

    VisualsEngine.prototype.setupTwoJs = function() {
      var params;
      console.log('setup two');
      this._twoElem = document.getElementById('twoMagic');
      params = {
        fullscreen: true,
        autostart: true
      };
      this._two = new Two(params).appendTo(this._twoElem);
      return console.log(this._two);
    };

    VisualsEngine.prototype.onSoftPeak = function() {
      return this.onPeak("soft");
    };

    VisualsEngine.prototype.onHighPeak = function() {
      console.log("????");
      return this.onPeak("hi");
    };

    VisualsEngine.prototype.onLowPeak = function() {
      return this.onPeak("lo");
    };

    VisualsEngine.prototype.onPeak = function(type) {
      var circle, col, shape, _i, _len, _ref;
      if (type === "soft") {
        col = "rgb(0,200,200)";
      } else if (type === "hi") {
        col = "rgb(255,155,255)";
      } else if (type === "lo") {
        col = "rgb(100,0,100)";
      }
      if (this._peakCount % 3 === 0) {
        circle = this._two.makeCircle(Math.random() * this._two.width, Math.random() * this._two.height, 150);
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
      var col1, col2;
      col1 = "rgb(" + (10 + Math.floor(window.audioAnalysisEngine._averageFrequency * 4)) + "," + (10 + Math.floor(window.audioAnalysisEngine._averageFrequency * 4)) + "," + (10 + Math.floor(window.audioAnalysisEngine._averageFrequency * 4)) + ")";
      col2 = "rgb(" + (100 + Math.floor(window.audioAnalysisEngine._averageFrequency * 4)) + "," + (100 + Math.floor(window.audioAnalysisEngine._averageFrequency * 4)) + "," + (100 + Math.floor(window.audioAnalysisEngine._averageFrequency * 4)) + ")";
      console.log(col1, col2);
      this._whichColour += 1;
      if (this._whichColour % 2 === 1) {
        console.log("lalala");
        return this._twoElem.style.background = col1;
      } else {
        console.log("jsjsjs");
        return this._twoElem.style.background = col2;
      }
    };

    return VisualsEngine;

  })();

}).call(this);
