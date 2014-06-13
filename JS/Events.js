(function() {
  var Signal;

  Signal = signals.Signal;

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
    angela: new Signal()
  };

}).call(this);
