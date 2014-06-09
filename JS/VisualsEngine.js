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

    VisualsEngine.prototype._colourBucket = {
      fg: new Array(20),
      bg: new Array(5)
    };

    function VisualsEngine() {
      this.HSVtoRGB = __bind(this.HSVtoRGB, this);
      this.randomiseBackgroundColour = __bind(this.randomiseBackgroundColour, this);
      this.onPeak = __bind(this.onPeak, this);
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
      var i, tempCol, _i, _j, _results;
      console.log('update colours');
      for (i = _i = 0; _i < 20; i = ++_i) {
        tempCol = {
          h: Math.floor(Math.random() * 360),
          s: 70,
          v: 80
        };
        this._colourBucket.fg[i] = tempCol;
      }
      _results = [];
      for (i = _j = 0; _j < 5; i = ++_j) {
        tempCol = {
          h: Math.floor(Math.random() * 360),
          s: 20,
          v: 20
        };
        _results.push(this._colourBucket.bg[i] = tempCol);
      }
      return _results;
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
        tempS = 100;
        tempV = 100;
        col = this.HSVtoRGB(tempH, tempS, tempV);
        col = "rgb(" + col.r + "," + col.g + "," + col.b + ")";
      } else if (type === "lo") {
        tempV = tempV - 40;
        col = this.HSVtoRGB(tempH, tempS, tempV);
        col = "rgb(" + col.r + "," + col.g + "," + col.b + ")";
      }
      console.log(col);
      if (this._peakCount % 3 === 0) {
        circle = this._two.makeCircle(this._two.width / 2, this._two.height / 2, 400);
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
      this._whichColour += 1;
      if (this._whichColour % 2 === 1) {
        return this._twoElem.style.background = col1;
      } else {
        return this._twoElem.style.background = col2;
      }
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

    return VisualsEngine;

  })();

}).call(this);
