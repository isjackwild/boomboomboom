(function() {
  var KeyboardController;

  $((function(_this) {
    return function() {
      return window.audioAnalysisEngine = new KeyboardController();
    };
  })(this));

  KeyboardController = (function() {
    function KeyboardController() {
      console.log('setup keyboard controller');
      window.onkeydown = this.keydown;
    }

    KeyboardController.prototype.keydown = function(e) {
      console.log('keydown', e.keyCode);
      switch (e.keyCode) {
        case 49:
          return window.events.frequency.dispatch(1);
        case 50:
          return window.events.frequency.dispatch(2);
        case 51:
          return window.events.frequency.dispatch(3);
        case 52:
          return window.events.frequency.dispatch(4);
        case 53:
          return window.events.frequency.dispatch(5);
        case 54:
          return window.events.frequency.dispatch(6);
        case 55:
          return window.events.frequency.dispatch(7);
        case 56:
          return window.events.frequency.dispatch(8);
        case 57:
          return window.events.frequency.dispatch(9);
        case 58:
          return window.events.frequency.dispatch(1);
      }
    };

    return KeyboardController;

  })();

}).call(this);
