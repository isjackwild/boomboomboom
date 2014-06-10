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
          s: 85,
          v: 97
        }, {
          h: 45,
          s: 92,
          v: 97
        }, {
          h: 1124,
          s: 53,
          v: 92
        }, {
          h: 142,
          s: 80,
          v: 84
        }, {
          h: 196,
          s: 82,
          v: 92
        }, {
          h: 234,
          s: 71,
          v: 80
        }, {
          h: 316,
          s: 78,
          v: 90
        }
      ],
      bg: [
        {
          h: 0,
          s: 0,
          v: 75
        }, {
          h: 0,
          s: 0,
          v: 65
        }, {
          h: 0,
          s: 0,
          v: 85
        }
      ]
    };

    VisualsEngine.prototype._colourBucket = {
      fg: [],
      bg: []
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
      var i, sOffset, vOffset, _i, _j, _k, _ref, _ref1, _ref2, _results, _results1;
      if (this._coloursSetup === false) {
        this._coloursSetup = true;
        for (i = _i = 0, _ref = this._baseColours.fg.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          this._colourBucket.fg[i] = Object.create(this._baseColours.fg[i]);
        }
        _results = [];
        for (i = _j = 0, _ref1 = this._colourBucket.bg.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
          _results.push(this._colourBucket.bg[i] = Object.create(this._baseColours.fg[i]));
        }
        return _results;
      } else {
        _results1 = [];
        for (i = _k = 0, _ref2 = this._colourBucket.fg.length; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
          sOffset = Math.floor(this.convertToRange(this._frequency, [0, 50], [6, -6]));
          vOffset = Math.floor(this.convertToRange(this._frequency, [0, 50], [-6, 6]));
          this._colourBucket.fg[i] = Object.create(this._baseColours.fg[i]);
          this._colourBucket.fg[i].s -= sOffset;
          _results1.push(this._colourBucket.fg[i].v -= vOffset);
        }
        return _results1;
      }
    };

    VisualsEngine.prototype.onPeak = function(type) {
      var circle, col, shape, whichCol, _i, _len, _ref;
      if (type === 'hard') {
        this.randomiseBackgroundColour();
        return;
      }
      whichCol = Math.ceil(Math.random() * (this._baseColours.fg.length - 1));
      col = this._baseColours.fg[whichCol];
      col = this.HSVtoRGB(col.h, col.s, col.v);
      col = "rgb(" + col.r + "," + col.g + "," + col.b + ")";
      if (this._peakCount % 3 === 0) {
        circle = this._two.makeCircle(this._two.width / 2, this._two.height / 2, 300);
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
      col = this._baseColours.bg[0];
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
