(function() {
  var onError, setupMic;

  setupMic = function(stream) {
    console.log('setup Mic');
    return window.events.micAccepted.dispatch(stream);
  };

  onError = function(err) {
    return console.log('error setting up mic');
  };

  $('.continue').on('touchstart click', (function(_this) {
    return function() {
      $('.accept').removeClass('hidden');
      return navigator.webkitGetUserMedia({
        audio: true
      }, setupMic, onError);
    };
  })(this));

  $('.usekeyboard').on('touchstart click', (function(_this) {
    return function() {
      return $('#instructions').addClass('hidden');
    };
  })(this));

}).call(this);
