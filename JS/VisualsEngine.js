(function() {
  var VisualsEngine,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $(function() {
    return window.visualsEngine = new VisualsEngine();
  });

  VisualsEngine = (function() {
    var _currentBlur, _targetBlur;

    VisualsEngine.prototype._cv = null;

    VisualsEngine.prototype._shapes = [];

    VisualsEngine.prototype._peakCount = 0;

    VisualsEngine.prototype._two = null;

    VisualsEngine.prototype._twoElem = null;

    VisualsEngine.prototype._middleGround = null;

    VisualsEngine.prototype._foreGround = null;

    VisualsEngine.prototype._volume = 20;

    VisualsEngine.prototype._frequency = 5;

    VisualsEngine.prototype._bpm = 200;

    VisualsEngine.prototype._bpmJumpTime = new Date().getTime();

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

    _targetBlur = 0;

    _currentBlur = 0;

    function VisualsEngine() {
      this.HSVtoRGB = __bind(this.HSVtoRGB, this);
      this.lerp = __bind(this.lerp, this);
      this.removeShapes = __bind(this.removeShapes, this);
      this.animateMiddleGroundFlux = __bind(this.animateMiddleGroundFlux, this);
      this.lerpBackground = __bind(this.lerpBackground, this);
      this.onTwoUpdate = __bind(this.onTwoUpdate, this);
      this.onBass = __bind(this.onBass, this);
      this.onBreak = __bind(this.onBreak, this);
      this.showAngela = __bind(this.showAngela, this);
      this.showIllustration = __bind(this.showIllustration, this);
      this.showText = __bind(this.showText, this);
      this.makeSpecial = __bind(this.makeSpecial, this);
      this.onPeak = __bind(this.onPeak, this);
      this.addFilter = __bind(this.addFilter, this);
      this.updateBackgroundColour = __bind(this.updateBackgroundColour, this);
      this.gotVolume = __bind(this.gotVolume, this);
      this.inverseCols = __bind(this.inverseCols, this);
      this.onChangeFrequencyVariation = __bind(this.onChangeFrequencyVariation, this);
      this.gotFrequency = __bind(this.gotFrequency, this);
      this.onBPMJump = __bind(this.onBPMJump, this);
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
      window.events.BPMJump.add(this.onBPMJump);
      window.events.volume.add(this.gotVolume);
      window.events.frequency.add(this.gotFrequency);
      window.events.inverseCols.add(this.inverseCols);
      window.events.makeSpecial.add(this.makeSpecial);
      window.events.showText.add(this.showText);
      window.events.showIllustration.add(this.showIllustration);
      window.events.angela.add(this.showAngela);
      window.events.filter.add(this.addFilter);
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
      this._bgColLerpSpeed = this.convertToRange(this._bpm, [50, 500], [0.005, 0.009]);
      return this.updateColourBucket();
    };

    VisualsEngine.prototype.onBPMJump = function() {
      return this._bpmJumpTime = new Date().getTime();
    };

    VisualsEngine.prototype.gotFrequency = function(freq) {
      this._frequency = freq;
      console.log(this._frequency, "got freq", this._frequency);
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

    VisualsEngine.prototype.inverseCols = function() {
      console.log('inverseCols');
      if (this._negativeColours === false) {
        this._negativeColours = true;
      } else {
        this._negativeColours = false;
      }
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
          sOffset = Math.floor(this.convertToRange(this._frequency, [1, 9], [10, -20]) + Math.floor(this.convertToRange(this._bpm, [60, 600], [-50, 15])));
          vOffset = Math.floor(this.convertToRange(this._frequency, [1, 9], [15, -15]));
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
      if (this._negativeColours === false) {
        col = Math.floor(this.convertToRange(this._frequency, [1, 9], [30, 190]) + Math.random() * 33);
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

    VisualsEngine.prototype.addFilter = function(type) {
      if (this._filterTimer) {
        clearTimeout(this._filterTimer);
      }
      switch (type) {
        case 'blur':
          this._targetBlur = 20;
          this._currentBlur = 0;
          return $('#twoMagic svg').css("-webkit-filter", "blur(" + this._currentBlur + "px)");
      }
    };

    VisualsEngine.prototype.onPeak = function(type) {
      var circle, col, duration, peakTime, v, whichCol;
      console.log('peak');
      this._peakCount++;
      peakTime = new Date().getTime();
      if (type === 'hard') {
        this.updateBackgroundColour();
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
          v = this.convertToRange(this._frequency, [1, 9], [80, 90]);
          col = this.HSVtoRGB(col.h, 15, v);
        } else if (type === 'lo') {
          v = this.convertToRange(this._frequency, [1, 9], [15, 33]);
          col = this.HSVtoRGB(col.h, 15, v);
        }
      } else if (this._negativeColours === true) {
        if (type === 'hard') {
          col = {
            r: 155,
            g: 155,
            b: 155
          };
        } else if (type === 'soft') {
          col = {
            r: 190,
            g: 190,
            b: 190
          };
        } else if (type === 'hi') {
          col = {
            r: 230,
            g: 230,
            b: 230
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
      duration = Math.floor(this.convertToRange(this._bpm, [100, 600], [2500, 5000]));
      if (this._peakCount % 2 === 0 && peakTime - this._bpmJumpTime < duration && this._bpm > 150) {
        return this.makeSpecial(Math.floor(Math.random() * 10));
      }
    };

    VisualsEngine.prototype.makeSpecial = function(which) {
      var animationSpeed, line, section, sectionX, sectionY;
      switch (which) {
        case 1:
          sectionX = this._two.width / 20;
          sectionY = this._two.height / 20;
          line = this._two.makePolygon(0, 0, sectionX, sectionY, sectionX * 2, sectionY * 2, sectionX * 3, sectionY * 3, sectionX * 4, sectionY * 4, sectionX * 5, sectionY * 5, sectionX * 6, sectionY * 6, sectionX * 7, sectionY * 7, sectionX * 8, sectionY * 8, sectionX * 9, sectionY * 9, sectionX * 10, sectionY * 10, sectionX * 11, sectionY * 11, sectionX * 12, sectionY * 12, sectionX * 13, sectionY * 13, sectionX * 14, sectionY * 14, sectionX * 15, sectionY * 15, sectionX * 16, sectionY * 16, sectionX * 17, sectionY * 17, sectionX * 18, sectionY * 18, sectionX * 19, sectionY * 19, this._two.width, this._two.height);
          break;
        case 2:
          sectionX = this._two.width / 20;
          sectionY = this._two.height / 20;
          line = this._two.makePolygon(this._two.width, this._two.height, sectionX * 19, sectionY * 19, sectionX * 18, sectionY * 18, sectionX * 17, sectionY * 17, sectionX * 16, sectionY * 16, sectionX * 15, sectionY * 15, sectionX * 14, sectionY * 14, sectionX * 13, sectionY * 13, sectionX * 12, sectionY * 12, sectionX * 11, sectionY * 11, sectionX * 10, sectionY * 10, sectionX * 9, sectionY * 9, sectionX * 8, sectionY * 8, sectionX * 7, sectionY * 7, sectionX * 6, sectionY * 6, sectionX * 5, sectionY * 5, sectionX * 4, sectionY * 4, sectionX * 3, sectionY * 3, sectionX * 2, sectionY * 2, sectionX, sectionY, 0, 0);
          break;
        case 3:
          sectionX = this._two.width / 20;
          sectionY = this._two.height / 20;
          line = this._two.makePolygon(0, this._two.height, sectionX, this._two.height - sectionY, sectionX * 2, this._two.height - sectionY * 2, sectionX * 3, this._two.height - sectionY * 3, sectionX * 4, this._two.height - sectionY * 4, sectionX * 5, this._two.height - sectionY * 5, sectionX * 6, this._two.height - sectionY * 6, sectionX * 7, this._two.height - sectionY * 7, sectionX * 8, this._two.height - sectionY * 8, sectionX * 9, this._two.height - sectionY * 9, sectionX * 10, this._two.height - sectionY * 10, sectionX * 11, this._two.height - sectionY * 11, sectionX * 12, this._two.height - sectionY * 12, sectionX * 13, this._two.height - sectionY * 13, sectionX * 14, this._two.height - sectionY * 14, sectionX * 15, this._two.height - sectionY * 15, sectionX * 16, this._two.height - sectionY * 16, sectionX * 17, this._two.height - sectionY * 17, sectionX * 18, this._two.height - sectionY * 18, sectionX * 19, this._two.height - sectionY * 19, this._two.width, 0);
          break;
        case 4:
          sectionX = this._two.width / 20;
          sectionY = this._two.height / 20;
          line = this._two.makePolygon(this._two.width, 0, this._two.width - sectionX, sectionY, this._two.width - sectionX * 2, sectionY * 2, this._two.width - sectionX * 3, sectionY * 3, this._two.width - sectionX * 4, sectionY * 4, this._two.width - sectionX * 5, sectionY * 5, this._two.width - sectionX * 6, sectionY * 6, this._two.width - sectionX * 7, sectionY * 7, this._two.width - sectionX * 8, sectionY * 8, this._two.width - sectionX * 9, sectionY * 9, this._two.width - sectionX * 10, sectionY * 10, this._two.width - sectionX * 11, sectionY * 11, this._two.width - sectionX * 12, sectionY * 12, this._two.width - sectionX * 13, sectionY * 13, this._two.width - sectionX * 14, sectionY * 14, this._two.width - sectionX * 15, sectionY * 15, this._two.width - sectionX * 16, sectionY * 16, this._two.width - sectionX * 17, sectionY * 17, this._two.width - sectionX * 18, sectionY * 18, this._two.width - sectionX * 19, sectionY * 19, 0, this._two.height);
          break;
        case 5:
          section = this._two.width / 20;
          line = this._two.makePolygon(0, this._two.height / 2, section, this._two.height / 2, section * 2, this._two.height / 2, section * 3, this._two.height / 2, section * 4, this._two.height / 2, section * 5, this._two.height / 2, section * 6, this._two.height / 2, section * 7, this._two.height / 2, section * 8, this._two.height / 2, section * 9, this._two.height / 2, section * 10, this._two.height / 2, section * 11, this._two.height / 2, section * 12, this._two.height / 2, section * 13, this._two.height / 2, section * 14, this._two.height / 2, section * 15, this._two.height / 2, section * 16, this._two.height / 2, section * 17, this._two.height / 2, section * 18, this._two.height / 2, section * 19, this._two.height / 2, this._two.width, this._two.height / 2);
          line.beginning = 0.5;
          line.ending = 0.5;
          line.type = 'stripe+';
          break;
        case 6:
          section = this._two.height / 15;
          line = this._two.makePolygon(this._two.width / 2, 0, this._two.width / 2, section, this._two.width / 2, section * 2, this._two.width / 2, section * 3, this._two.width / 2, section * 4, this._two.width / 2, section * 5, this._two.width / 2, section * 6, this._two.width / 2, section * 7, this._two.width / 2, section * 8, this._two.width / 2, section * 9, this._two.width / 2, section * 10, this._two.width / 2, section * 11, this._two.width / 2, section * 12, this._two.width / 2, section * 13, this._two.width / 2, section * 14, this._two.width / 2, this._two.height);
          line.beginning = 0.5;
          line.ending = 0.5;
          line.type = 'stripe+';
          break;
        case 7:
          section = this._two.width / 20;
          line = this._two.makePolygon(0, this._two.height / 2, section, this._two.height / 2, section * 2, this._two.height / 2, section * 3, this._two.height / 2, section * 4, this._two.height / 2, section * 5, this._two.height / 2, section * 6, this._two.height / 2, section * 7, this._two.height / 2, section * 8, this._two.height / 2, section * 9, this._two.height / 2, section * 10, this._two.height / 2, section * 11, this._two.height / 2, section * 12, this._two.height / 2, section * 13, this._two.height / 2, section * 14, this._two.height / 2, section * 15, this._two.height / 2, section * 16, this._two.height / 2, section * 17, this._two.height / 2, section * 18, this._two.height / 2, section * 19, this._two.height / 2, this._two.width, this._two.height / 2);
          line.type = 'stripe+Reverse';
          break;
        case 8:
          section = this._two.height / 15;
          line = this._two.makePolygon(this._two.width / 2, 0, this._two.width / 2, section, this._two.width / 2, section * 2, this._two.width / 2, section * 3, this._two.width / 2, section * 4, this._two.width / 2, section * 5, this._two.width / 2, section * 6, this._two.width / 2, section * 7, this._two.width / 2, section * 8, this._two.width / 2, section * 9, this._two.width / 2, section * 10, this._two.width / 2, section * 11, this._two.width / 2, section * 12, this._two.width / 2, section * 13, this._two.width / 2, section * 14, this._two.width / 2, this._two.height);
          line.type = 'stripe+Reverse';
          break;
        case 9:
          line = this._two.makeCircle(this._two.width / 2, this._two.height / 2, this._two.height * 0.43);
          break;
        case 0:
          line = this._two.makeCircle(this._two.width / 2, this._two.height / 2, this._two.height * 0.3);
      }
      animationSpeed = this.convertToRange(this._bpm, [60, 600], [0.05, 0.12]);
      if (which >= 1 && which <= 4) {
        line.type = 'stripeX';
        line.beginning = 0;
        line.ending = 0;
        line.closed = false;
        line.animationSpeed = animationSpeed;
      } else if (which >= 5 && which <= 8) {
        line.closed = false;
        line.animationSpeed = animationSpeed / 1.3;
      } else if (which === 9 || which === 0) {
        line.type = 'circle';
        line.animationSpeed = animationSpeed * 20;
      }
      if (this._frequency <= 4) {
        line.stroke = "rgb(" + 255 + "," + 255 + "," + 255 + ")";
      } else {
        line.stroke = "rgb(" + 0 + "," + 0 + "," + 0 + ")";
      }
      line.noFill();
      line.linewidth = 20;
      line.cap = "butt";
      this._foreGround.add(line);
      return this._shapes.push(line);
    };

    VisualsEngine.prototype.showText = function(which) {
      var elem, hang;
      if (this._textTimer) {
        clearTimeout(this._textTimer);
      }
      hang = this.convertToRange(this._bpm, [60, 600], [1500, 800]);
      switch (which) {
        case 'ber':
          elem = "#ber";
          $("#bisque").removeClass('show');
          $("#putUpWall").removeClass('show');
          $("#tearDownWall").removeClass('show');
          break;
        case 'lin':
          elem = "#lin";
          $("#rage").removeClass('show');
          $("#putUpWall").removeClass('show');
          $("#tearDownWall").removeClass('show');
          break;
        case 'bisque':
          elem = "#bisque";
          $("#ber").removeClass('show');
          $("#putUpWall").removeClass('show');
          $("#tearDownWall").removeClass('show');
          break;
        case 'rage':
          elem = "#rage";
          $("#lin").removeClass('show');
          $("#putUpWall").removeClass('show');
          $("#tearDownWall").removeClass('show');
          break;
        case 'putUpWall':
          elem = "#putUpWall";
          hang = 3500;
          $("#bisque").removeClass('show');
          $("#rage").removeClass('show');
          $("#ber").removeClass('show');
          $("#lin").removeClass('show');
          $("#tearDownWall").removeClass('show');
          break;
        case 'tearDownWall':
          elem = "#tearDownWall";
          hang = 3500;
          $("#bisque").removeClass('show');
          $("#rage").removeClass('show');
          $("#ber").removeClass('show');
          $("#lin").removeClass('show');
          $("#putUpWall").removeClass('show');
      }
      $(elem).addClass('show');
      return this._textTimer = setTimeout((function(_this) {
        return function() {
          return $(".show").removeClass('show');
        };
      })(this), hang);
    };

    VisualsEngine.prototype.showIllustration = function(which) {
      var i, id, illustration, shape, _i, _len, _ref;
      _ref = this._shapes;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        shape = _ref[i];
        if (shape.isIllustration) {
          return;
        }
      }
      switch (which) {
        case 'food':
          if (Math.random() > 0.49) {
            id = 'currywurst';
          } else {
            id = 'pretzel';
          }
          break;
        case 'mascot':
          if (Math.random() > 0.49) {
            id = 'ample';
          } else {
            id = 'bear';
          }
          break;
        case 'landmark':
          if (Math.random() > 0.49) {
            id = 'tower';
          } else {
            id = 'tor';
          }
      }
      illustration = this._two.interpret(document.getElementById(id));
      illustration.center().translation.set(this._two.width / 2, this._two.height / 2);
      this._foreGround.add(illustration);
      illustration.lifeSpan = 100;
      illustration.creationTime = new Date().getTime();
      illustration.isIllustration = true;
      return this._shapes.push(illustration);
    };

    VisualsEngine.prototype.showAngela = function(which) {
      $('#angela').removeClass();
      $('#angela').addClass(which);
      clearTimeout(this._angelaTimer);
      return this._angelaTimer = setTimeout((function(_this) {
        return function() {
          return $('#angela').removeClass();
        };
      })(this), 2000);
    };

    VisualsEngine.prototype.onBreak = function(length) {
      var b, breakTimer, col, g, hang, offset, r;
      if (this._pauseBgLerp === false) {
        this._pauseBgLerp = true;
        if (length === 'long') {
          offset = 75;
          hang = this.convertToRange(this._bpm, [60, 600], [200, 80]);
        } else if (length === 'short') {
          offset = 20;
          hang = this.convertToRange(this._bpm, [60, 600], [200, 80]);
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

    VisualsEngine.prototype.onBass = function(bigOrSmall) {
      if (bigOrSmall == null) {
        bigOrSmall = 'small';
      }
      if (this._middleGround.isScaling === false) {
        this._middleGround.isScaling = true;
        if (bigOrSmall === 'big') {
          return this._middleGround.targetScale = 1.2;
        } else {
          return this._middleGround.targetScale = 1.05;
        }
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
        this.removeShapes();
      }
      if (this._targetBlur > this._currentBlur) {
        this._currentBlur += 2.5;
        $('#twoMagic svg').css("-webkit-filter", "blur(" + this._currentBlur + "px)");
      }
      if (Math.abs(this._targetBlur - this._currentBlur < 0.5)) {
        this._targetBlur = 0;
        this._currentBlur = 0;
        return $('#twoMagic svg').css("-webkit-filter", "initial");
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
          if (shape.type === 'stripeX') {
            if (shape.ending < 1) {
              shape.ending += shape.animationSpeed;
            } else {
              shape.beginning += shape.animationSpeed;
              if (shape.beginning >= 1) {
                shape.remove();
                this._shapes.splice(i, 1);
              }
            }
          }
          if (shape.type === 'stripe+') {
            shape.beginning -= shape.animationSpeed;
            shape.ending += shape.animationSpeed;
            if (shape.beginning <= 0 || shape.ending >= 1) {
              shape.remove();
              this._shapes.splice(i, 1);
            }
          }
          if (shape.type === 'stripe+Reverse') {
            shape.beginning += shape.animationSpeed;
            shape.ending -= shape.animationSpeed;
            if (shape.beginning >= 0.5 || shape.ending <= 0.5) {
              shape.remove();
              this._shapes.splice(i, 1);
            }
          }
          if (shape.type === 'circle') {
            shape.linewidth -= shape.animationSpeed;
            if (shape.linewidth <= 0) {
              shape.remove();
              _results.push(this._shapes.splice(i, 1));
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
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
