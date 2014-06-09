(function() {
  var Signal;

  Signal = signals.Signal;

  window.events = {
    peak: new Signal(),
    bass: new Signal(),
    shortBreak: new Signal(),
    longBreak: new Signal(),
    BPM: new Signal(),
    BPMDrop: new Signal(),
    BPMJump: new Signal(),
    changeFreqVar: new Signal(),
    volume: new Signal()
  };

}).call(this);
