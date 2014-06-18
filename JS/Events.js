(function() {
  var Signal, socket;

  Signal = signals.Signal;

  $(window).on('blur', (function(_this) {
    return function() {
      var key, _results;
      _results = [];
      for (key in window.events) {
        window.events[key].active = false;
        _results.push(console.log('disable events'));
      }
      return _results;
    };
  })(this));

  $(window).on('focus', (function(_this) {
    return function() {
      var key, _results;
      _results = [];
      for (key in window.events) {
        window.events[key].active = true;
        _results.push(console.log('enable events', window.events[key].active));
      }
      return _results;
    };
  })(this));

  window.events = {
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

  socket = io();

}).call(this);
