(function() {
  var Signal;

  Signal = signals.Signal;

  $(window).on('blur', (function(_this) {
    return function() {
      var key, _results;
      console.log('disable events');
      _results = [];
      for (key in window.events) {
        _results.push(window.events[key].active = false);
      }
      return _results;
    };
  })(this));

  $(window).on('focus', (function(_this) {
    return function() {
      var key, _results;
      console.log('enable events');
      _results = [];
      for (key in window.events) {
        _results.push(window.events[key].active = true);
      }
      return _results;
    };
  })(this));

  window.events = {
    micAccepted: new Signal(),
    automatic: new Signal(),
    peak: new Signal(),
    bass: new Signal(),
    "break": new Signal(),
    BPM: new Signal(),
    BPMDrop: new Signal(),
    BPMJump: new Signal(),
    changeFreqVar: new Signal(),
    volume: new Signal(),
    frequency: new Signal(),
    inverseCols: new Signal(),
    makeSpecial: new Signal(),
    showText: new Signal(),
    showIllustration: new Signal(),
    filter: new Signal(),
    transform: new Signal(),
    angela: new Signal()
  };

}).call(this);
