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

    VisualsEngine.prototype._middleGround = null;

    VisualsEngine.prototype._foreGround = null;

    VisualsEngine.prototype._volume = 20;

    VisualsEngine.prototype._frequency = 10;

    VisualsEngine.prototype._bpm = 200;

    VisualsEngine.prototype._coloursSetup = false;

    VisualsEngine.prototype._negativeColours = false;

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

    VisualsEngine.prototype._bgColFrom = {
      r: 130,
      g: 130,
      b: 130
    };

    VisualsEngine.prototype._bgColTo = {
      r: 150,
      g: 150,
      b: 150
    };

    VisualsEngine.prototype._bgColCurrent = {
      r: 130,
      g: 130,
      b: 130
    };

    VisualsEngine.prototype._bgColLerp = 0;

    VisualsEngine.prototype._bgColLerpSpeed = 0.005;

    VisualsEngine.prototype._pauseBgLerp = false;

    function VisualsEngine() {
      this.HSVtoRGB = __bind(this.HSVtoRGB, this);
      this.lerp = __bind(this.lerp, this);
      this.removeShapes = __bind(this.removeShapes, this);
      this.animateMiddleGroundFlux = __bind(this.animateMiddleGroundFlux, this);
      this.lerpBackground = __bind(this.lerpBackground, this);
      this.onTwoUpdate = __bind(this.onTwoUpdate, this);
      this.onBass = __bind(this.onBass, this);
      this.onBreak = __bind(this.onBreak, this);
      this.onPeak = __bind(this.onPeak, this);
      this.updateBackgroundColour = __bind(this.updateBackgroundColour, this);
      this.gotVolume = __bind(this.gotVolume, this);
      this.onChangeFrequencyVariation = __bind(this.onChangeFrequencyVariation, this);
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
      window.events.bass.add(this.onBass);
      window.events["break"].add(this.onBreak);
      window.events.BPM.add(this.gotBPM);
      window.events.volume.add(this.gotVolume);
      window.events.frequency.add(this.gotFrequency);
      return window.events.changeFreqVar.add(this.onChangeFrequencyVariation);
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
      this._two.bind('update', this.onTwoUpdate);
      this._middleGround = this._two.makeGroup();
      this._middleGround.id = 'middleground';
      this._middleGround.isScaling = false;
      this._middleGround.center();
      this._foreGround = this._two.makeGroup();
      return this._foreGround.id = 'foreground';
    };

    VisualsEngine.prototype.gotBPM = function(BPM) {
      this._bpm = BPM;
      this._bgColLerpSpeed = this.convertToRange(this._bpm, [100, 500], [0.005, 0.009]);
      return this.updateColourBucket();
    };

    VisualsEngine.prototype.gotFrequency = function(freq) {
      this._frequency = freq;
      this.updateBackgroundColour();
      return this.updateColourBucket();
    };

    VisualsEngine.prototype.onChangeFrequencyVariation = function(currentVar) {
      if (currentVar === 'high') {
        this._negativeColours = true;
      } else if (currentVar === 'low') {
        this._negativeColours = false;
      }
      this._bgColLerp = 1;
      return this.updateBackgroundColour();
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
          sOffset = Math.floor(this.convertToRange(this._frequency, [4, 33], [10, -20]) + Math.floor(this.convertToRange(this._bpm, [60, 600], [-50, 15])));
          vOffset = Math.floor(this.convertToRange(this._frequency, [4, 33], [15, -15]));
          this._colourBucket.fg[i] = Object.create(this._baseColours.fg[i]);
          this._colourBucket.fg[i].s = this._colourBucket.fg[i].s + sOffset;
          if (this._colourBucket.fg[i].s < 25) {
            this._colourBucket.fg[i].s = 25;
          }
          _results1.push(this._colourBucket.fg[i].v -= vOffset);
        }
        return _results1;
      }
    };

    VisualsEngine.prototype.updateBackgroundColour = function() {
      var col, whichCol;
      console.log('updateBackgroundColour');
      if (this._negativeColours === false) {
        col = Math.floor(this.convertToRange(this._frequency, [4, 33], [30, 190]) + Math.random() * 20);
        col = {
          r: col,
          g: col,
          b: col
        };
      } else if (this._negativeColours === true) {
        whichCol = Math.ceil(Math.random() * (this._colourBucket.fg.length - 1));
        col = this._colourBucket.fg[whichCol];
        col = this.HSVtoRGB(col.h, col.s, col.v);
      }
      if (this._bgColLerp > 0.95) {
        this._bgColFrom = this._bgColTo;
        this._bgColTo = col;
        return this._bgColLerp = 0;
      }
    };

    VisualsEngine.prototype.onPeak = function(type) {
      var circle, col, line, sectionX, sectionY, v, whichCol;
      this._peakCount++;
      if (type === 'hard') {
        circle = this._two.makeCircle(this._two.width / 2, this._two.height / 2, this._two.height * 0.43);
      } else if (type === 'soft') {
        circle = this._two.makeCircle(this._two.width / 2, this._two.height / 2, this._two.height * 0.3);
      } else if (type === 'hi') {
        circle = this._two.makeCircle(0, this._two.height / 4, this._two.height * 0.82);
        circle.fadeOut = true;
        circle.fadeOutSpeed = this.convertToRange(this._bpm, [60, 500], [0.015, 0.1]);
      } else if (type === 'lo') {
        circle = this._two.makeCircle(this._two.width, this._two.height, this._two.height * 0.75);
        circle.fadeOut = true;
        circle.fadeOutSpeed = this.convertToRange(this._bpm, [60, 500], [0.1, 0.25]);
      }
      if (this._negativeColours === false) {
        whichCol = Math.ceil(Math.random() * (this._colourBucket.fg.length - 1));
        col = this._colourBucket.fg[whichCol];
        if (type === 'hard' || type === 'soft') {
          col = this.HSVtoRGB(col.h, col.s, col.v);
        } else if (type === 'hi') {
          v = this.convertToRange(this._frequency, [4, 33], [80, 100]);
          col = this.HSVtoRGB(col.h, 7, v);
        } else if (type === 'lo') {
          v = this.convertToRange(this._frequency, [4, 33], [15, 33]);
          if (col.s < 8) {
            col.s = 8;
          }
          col = this.HSVtoRGB(col.h, 10, v);
        }
      } else if (this._negativeColours === true) {
        if (type === 'hard') {
          col = {
            r: 170,
            g: 170,
            b: 170
          };
        } else if (type === 'soft') {
          col = {
            r: 210,
            g: 210,
            b: 210
          };
        } else if (type === 'hi') {
          col = {
            r: 255,
            g: 255,
            b: 255
          };
        } else if (type === 'lo') {
          col = {
            r: 50,
            g: 50,
            b: 50
          };
        }
      }
      col = "rgb(" + col.r + "," + col.g + "," + col.b + ")";
      this._middleGround.add(circle);
      circle.fill = col;
      circle.lifeSpan = Math.floor(this.convertToRange(this._bpm, [60, 600], [1000, 400]));
      circle.creationTime = new Date().getTime();
      circle.noStroke();
      this._shapes.push(circle);
      sectionX = this._two.width / 20;
      sectionY = this._two.height / 20;
      if (this._peakCount % 2 === 0 && this._bpm > 300) {
        switch (Math.ceil(Math.random() * 4)) {
          case 1:
            line = this._two.makePolygon(0, 0, sectionX, sectionY, sectionX * 2, sectionY * 2, sectionX * 3, sectionY * 3, sectionX * 4, sectionY * 4, sectionX * 5, sectionY * 5, sectionX * 6, sectionY * 6, sectionX * 7, sectionY * 7, sectionX * 8, sectionY * 8, sectionX * 9, sectionY * 9, sectionX * 10, sectionY * 10, sectionX * 11, sectionY * 11, sectionX * 12, sectionY * 12, sectionX * 13, sectionY * 13, sectionX * 14, sectionY * 14, sectionX * 15, sectionY * 15, sectionX * 16, sectionY * 16, sectionX * 17, sectionY * 17, sectionX * 18, sectionY * 18, sectionX * 19, sectionY * 19, this._two.width, this._two.height);
            break;
          case 2:
            line = this._two.makePolygon(this._two.width, this._two.height, sectionX * 19, sectionY * 19, sectionX * 18, sectionY * 18, sectionX * 17, sectionY * 17, sectionX * 16, sectionY * 16, sectionX * 15, sectionY * 15, sectionX * 14, sectionY * 14, sectionX * 13, sectionY * 13, sectionX * 12, sectionY * 12, sectionX * 11, sectionY * 11, sectionX * 10, sectionY * 10, sectionX * 9, sectionY * 9, sectionX * 8, sectionY * 8, sectionX * 7, sectionY * 7, sectionX * 6, sectionY * 6, sectionX * 5, sectionY * 5, sectionX * 4, sectionY * 4, sectionX * 3, sectionY * 3, sectionX * 2, sectionY * 2, sectionX, sectionY, 0, 0);
            break;
          case 3:
            line = this._two.makePolygon(0, this._two.height, sectionX, this._two.height - sectionY, sectionX * 2, this._two.height - sectionY * 2, sectionX * 3, this._two.height - sectionY * 3, sectionX * 4, this._two.height - sectionY * 4, sectionX * 5, this._two.height - sectionY * 5, sectionX * 6, this._two.height - sectionY * 6, sectionX * 7, this._two.height - sectionY * 7, sectionX * 8, this._two.height - sectionY * 8, sectionX * 9, this._two.height - sectionY * 9, sectionX * 10, this._two.height - sectionY * 10, sectionX * 11, this._two.height - sectionY * 11, sectionX * 12, this._two.height - sectionY * 12, sectionX * 13, this._two.height - sectionY * 13, sectionX * 14, this._two.height - sectionY * 14, sectionX * 15, this._two.height - sectionY * 15, sectionX * 16, this._two.height - sectionY * 16, sectionX * 17, this._two.height - sectionY * 17, sectionX * 18, this._two.height - sectionY * 18, sectionX * 19, this._two.height - sectionY * 19, this._two.width, 0);
            break;
          case 4:
            line = this._two.makePolygon(this._two.width, 0, this._two.width - sectionX, sectionY, this._two.width - sectionX * 2, sectionY * 2, this._two.width - sectionX * 3, sectionY * 3, this._two.width - sectionX * 4, sectionY * 4, this._two.width - sectionX * 5, sectionY * 5, this._two.width - sectionX * 6, sectionY * 6, this._two.width - sectionX * 7, sectionY * 7, this._two.width - sectionX * 8, sectionY * 8, this._two.width - sectionX * 9, sectionY * 9, this._two.width - sectionX * 10, sectionY * 10, this._two.width - sectionX * 11, sectionY * 11, this._two.width - sectionX * 12, sectionY * 12, this._two.width - sectionX * 13, sectionY * 13, this._two.width - sectionX * 14, sectionY * 14, this._two.width - sectionX * 15, sectionY * 15, this._two.width - sectionX * 16, sectionY * 16, this._two.width - sectionX * 17, sectionY * 17, this._two.width - sectionX * 18, sectionY * 18, this._two.width - sectionX * 19, sectionY * 19, 0, this._two.height);
        }
        this._foreGround.add(line);
        line.noFill();
        line.stroke = "rgb(" + 0 + "," + 0 + "," + 0 + ")";
        line.linewidth = 20;
        line.cap = 'butt';
        line.animationSpeed = this.convertToRange(this._bpm, [60, 600], [0.05, 0.12]);
        line.beginning = 0;
        line.ending = 0;
        return this._shapes.push(line);
      }
    };

    VisualsEngine.prototype.onBreak = function(length) {
      var b, breakTimer, col, g, hang, offset, r;
      if (this._pauseBgLerp === false) {
        this._pauseBgLerp = true;
        if (length === 'long') {
          offset = 120;
          hang = 500;
        } else if (length === 'short') {
          offset = 20;
          hang = 120;
        }
        r = this._bgColCurrent.r + offset;
        g = this._bgColCurrent.g + offset;
        b = this._bgColCurrent.b + offset;
        col = "rgb(" + r + "," + g + "," + b + ")";
        this._twoElem.style.background = col;
        clearTimeout(breakTimer);
        return breakTimer = setTimeout((function(_this) {
          return function() {
            _this._twoElem.style.background = "rgb(" + _this._bgColCurrent.r + "," + _this._bgColCurrent.g + "," + _this._bgColCurrent.b + ")";
            return _this._pauseBgLerp = false;
          };
        })(this), hang);
      }
    };

    VisualsEngine.prototype.onBass = function() {
      if (this._middleGround.isScaling === false) {
        this._middleGround.isScaling = true;
        return this._middleGround.targetScale = 1.05;
      }
    };

    VisualsEngine.prototype.onTwoUpdate = function() {
      if (this._bgColLerp < 1 && this._pauseBgLerp === false) {
        this.lerpBackground();
      }
      if (this._middleGround.isScaling === true) {
        this.animateMiddleGroundFlux();
      }
      if (this._shapes.length >= 1) {
        return this.removeShapes();
      }
    };

    VisualsEngine.prototype.lerpBackground = function() {
      var col;
      this._bgColLerp += this._bgColLerpSpeed;
      this._bgColCurrent = this.lerpColour(this._bgColFrom, this._bgColTo, this._bgColLerp);
      col = "rgb(" + this._bgColCurrent.r + "," + this._bgColCurrent.g + "," + this._bgColCurrent.b + ")";
      return this._twoElem.style.background = col;
    };

    VisualsEngine.prototype.animateMiddleGroundFlux = function() {
      var xOffset, yOffset;
      if (this._middleGround.targetScale > this._middleGround.scale) {
        this._middleGround.scale += 0.03;
        xOffset = this.convertToRange(this._middleGround.scale, [0, 2], [this._two.width / 2, -this._two.width / 2]);
        yOffset = this.convertToRange(this._middleGround.scale, [0, 2], [this._two.height / 2, -this._two.height / 2]);
        this._middleGround.translation.set(xOffset, yOffset);
        if (this._middleGround.scale >= this._middleGround.targetScale) {
          return this._middleGround.targetScale = 1;
        }
      } else if (this._middleGround.targetScale < this._middleGround.scale) {
        this._middleGround.scale -= 0.03;
        xOffset = this.convertToRange(this._middleGround.scale, [0, 2], [this._two.width / 2, -this._two.width / 2]);
        yOffset = this.convertToRange(this._middleGround.scale, [0, 2], [this._two.height / 2, -this._two.height / 2]);
        this._middleGround.translation.set(xOffset, yOffset);
        if (this._middleGround.scale <= this._middleGround.targetScale) {
          this._middleGround.scale = 1;
          this._middleGround.targetScale = 1;
          return this._middleGround.isScaling = false;
        }
      }
    };

    VisualsEngine.prototype.removeShapes = function() {
      var i, shape, time, _i, _ref, _results;
      time = new Date().getTime();
      _ref = this._shapes;
      _results = [];
      for (i = _i = _ref.length - 1; _i >= 0; i = _i += -1) {
        shape = _ref[i];
        if (shape.lifeSpan) {
          if (time - shape.creationTime >= shape.lifeSpan) {
            if (shape.fadeOut === true) {
              shape.opacity -= 0.01;
              if (shape.opacity < 0) {
                shape.remove();
                _results.push(this._shapes.splice(i, 1));
              } else {
                _results.push(void 0);
              }
            } else {
              shape.remove();
              _results.push(this._shapes.splice(i, 1));
            }
          } else {
            _results.push(void 0);
          }
        } else if (shape.animationSpeed) {
          if (shape.ending < 1) {
            _results.push(shape.ending += shape.animationSpeed);
          } else {
            shape.beginning += shape.animationSpeed;
            if (shape.beginning > 1) {
              shape.remove();
              _results.push(this._shapes.splice(i, 1));
            } else {
              _results.push(void 0);
            }
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    VisualsEngine.prototype.lerpColour = function(from, to, control) {
      var result, resultB, resultG, resultR;
      resultR = Math.ceil(from.r + (to.r - from.r) * control);
      resultG = Math.ceil(from.g + (to.g - from.g) * control);
      resultB = Math.ceil(from.b + (to.b - from.b) * control);
      result = {
        r: resultR,
        g: resultG,
        b: resultB
      };
      return result;
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
