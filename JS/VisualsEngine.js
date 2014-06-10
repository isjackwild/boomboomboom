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

    VisualsEngine.prototype._volume = 20;

    VisualsEngine.prototype._frequency = 10;

    VisualsEngine.prototype._bpm = 200;

    VisualsEngine.prototype._whichColour = 0;

    VisualsEngine.prototype._coloursSetup = false;

    VisualsEngine.prototype._baseColours = {
      fg: [
        {
          h: 346,
          s: 85,
          v: 95
        }, {
          h: 17,
          s: 90,
          v: 97
        }, {
          h: 45,
          s: 97,
          v: 97
        }, {
          h: 154,
          s: 65,
          v: 92
        }, {
          h: 149,
          s: 95,
          v: 70
        }, {
          h: 196,
          s: 87,
          v: 92
        }, {
          h: 220,
          s: 76,
          v: 80
        }, {
          h: 316,
          s: 40,
          v: 95
        }, {
          h: 277,
          s: 61,
          v: 71
        }, {
          h: 261,
          s: 46,
          v: 84
        }
      ]
    };

    VisualsEngine.prototype._colourBucket = {
      fg: []
    };

    VisualsEngine.prototype._bgColFrom = 130;

    VisualsEngine.prototype._bgColTo = 130;

    VisualsEngine.prototype._bgColLerp = 1;

    VisualsEngine.prototype._bgColLerpSpeed = 0.02;

    function VisualsEngine() {
      this.HSVtoRGB = __bind(this.HSVtoRGB, this);
      this.lerp = __bind(this.lerp, this);
      this.onTwoUpdate = __bind(this.onTwoUpdate, this);
      this.onPeak = __bind(this.onPeak, this);
      this.updateBackgroundColour = __bind(this.updateBackgroundColour, this);
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
      this._two = new Two(params).appendTo(this._twoElem);
      return this._two.bind('update', this.onTwoUpdate);
    };

    VisualsEngine.prototype.gotBPM = function(BPM) {
      this._bpm = BPM;
      this._bgColLerpSpeed = this.convertToRange(this._bpm, [100, 500], [0.005, 0.15]);
      this._bgColLerpSpeed = 0.005;
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
      var i, sOffset, vOffset, _i, _j, _ref, _ref1, _results, _results1;
      if (this._coloursSetup === false) {
        this._coloursSetup = true;
        _results = [];
        for (i = _i = 0, _ref = this._baseColours.fg.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          _results.push(this._colourBucket.fg[i] = Object.create(this._baseColours.fg[i]));
        }
        return _results;
      } else {
        _results1 = [];
        for (i = _j = 0, _ref1 = this._colourBucket.fg.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
          sOffset = Math.floor(this.convertToRange(this._frequency, [0, 50], [10, -20]) + Math.floor(this.convertToRange(this._bpm, [60, 600], [-50, 5])));
          vOffset = Math.floor(this.convertToRange(this._frequency, [0, 50], [-15, 15]));
          this._colourBucket.fg[i] = Object.create(this._baseColours.fg[i]);
          this._colourBucket.fg[i].s = this._colourBucket.fg[i].s + sOffset;
          _results1.push(this._colourBucket.fg[i].v -= vOffset);
        }
        return _results1;
      }
    };

    VisualsEngine.prototype.updateBackgroundColour = function() {
      var newCol;
      newCol = Math.floor(this.convertToRange(this._frequency, [0, 40], [50, 240]));
      if (Math.abs(this._bgColFrom - newCol) < 10 || this._bgColLerp < 0.97) {

      } else {
        this._bgColFrom = this._bgColTo;
        this._bgColTo = newCol;
        this._bgColLerp = 0;
        return console.log('update background colour');
      }
    };

    VisualsEngine.prototype.onPeak = function(type) {
      var circle, col, whichCol;
      if (type === 'hard') {
        this.updateBackgroundColour();
        return;
      }
      whichCol = Math.ceil(Math.random() * (this._colourBucket.fg.length - 1));
      col = this._colourBucket.fg[whichCol];
      if (type === 'hi') {
        col = this.HSVtoRGB(col.h, col.s - 40, 100);
        circle = this._two.makeCircle(0, this._two.height / 4, 800);
      } else if (type === 'lo') {
        col = this.HSVtoRGB(col.h, col.s - 40, 20);
        circle = this._two.makeCircle(this._two.width, this._two.height, 600);
      } else {
        col = this.HSVtoRGB(col.h, col.s, col.v);
        circle = this._two.makeCircle(this._two.width / 2, this._two.height / 2, 300);
      }
      col = "rgb(" + col.r + "," + col.g + "," + col.b + ")";
      circle.fill = col;
      circle.lifeSpan = 500;
      circle.creationTime = new Date().getTime();
      circle.noStroke();
      return this._shapes.push(circle);
    };

    VisualsEngine.prototype.onTwoUpdate = function() {
      var shape, tempCol, time, _i, _len, _ref, _results;
      if (this._bgColLerp < 1) {
        this._bgColLerp = this._bgColLerp + this._bgColLerpSpeed;
        tempCol = this.lerp(this._bgColFrom, this._bgColTo, this._bgColLerp);
        tempCol = Math.ceil(tempCol);
        tempCol = "rgb(" + tempCol + "," + tempCol + "," + tempCol + ")";
        this._twoElem.style.background = tempCol;
      }
      time = new Date().getTime();
      _ref = this._shapes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        shape = _ref[_i];
        if (shape && time - shape.creationTime > shape.lifeSpan) {
          shape.remove();
          _results.push(this._shapes.splice(shape.index, 1));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    VisualsEngine.prototype.lerp = function(from, to, control) {
      return from + control * (to - from);
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
