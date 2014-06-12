(function() {
  var Signal;

  Signal = signals.Signal;

  window.events = {
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
    filter: new Signal()
  };

}).call(this);
