(function() {
  var BackgroundGenerator,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $(function() {
    var backgroundGenerator;
    return backgroundGenerator = new BackgroundGenerator();
  });

  BackgroundGenerator = (function() {
    BackgroundGenerator.prototype._cv = null;

    BackgroundGenerator.prototype._whichColour = 0;

    function BackgroundGenerator() {
      this.randomiseBackgroundColour = __bind(this.randomiseBackgroundColour, this);
      console.log('setup background generation');
      this._cv = document.getElementById("magic");
      console.log(this._cv);
      this.setupListeners();
    }

    BackgroundGenerator.prototype.setupListeners = function() {
      return window.events.hardPeak.add(this.randomiseBackgroundColour);
    };

    BackgroundGenerator.prototype.randomiseBackgroundColour = function() {
      this._whichColour += 1;
      if (this._whichColour % 2 === 1) {
        return this._cv.style.background = "black";
      } else {
        return this._cv.style.background = "white";
      }
    };

    return BackgroundGenerator;

  })();

}).call(this);
