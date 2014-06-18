(function() {
  var clickContinue, connectIpad, onError, setupMic;

  clickContinue = function() {
    $('.accept').removeClass('hidden');
    return navigator.webkitGetUserMedia({
      audio: true
    }, setupMic, onError);
  };

  setupMic = function(stream) {
    $('.accept').addClass('hidden');
    $('#instructions, #ipadInstructions').addClass('transitionOut');
    setTimeout(function() {
      return $('#instructions, #ipadInstructions').addClass('hidden');
    }, 500);
    return window.events.micAccepted.dispatch(stream);
  };

  onError = function(err) {
    return console.log('error setting up mic');
  };

  connectIpad = function() {
    var socket;
    $('#instructions').addClass('transitionOut');
    setTimeout(function() {
      return $('#instructions').addClass('hidden');
    }, 500);
    $('#ipadInstructions').removeClass('hidden');
    console.log('conect ipad');
    window.key = 10000 + Math.floor(Math.random() * 89999);
    window.key = window.key.toString();
    console.log('the key for this is ' + window.key);
    $('#key').html(window.key);
    socket = io();
    return socket.on('button-push', function(which) {
      console.log('ipad button pushed', which);
      if (which.key === window.key) {
        return console.log('im listening to this ipad');
      } else {
        return console.log('ignore');
      }
    });
  };

  $('.continue').on('touchstart click', clickContinue);

  $('.connectipad').on('touchstart click', connectIpad);

  $((function(_this) {
    return function() {
      setTimeout(function() {
        return $('#music').removeClass('hidden');
      }, 500);
      setTimeout(function() {
        return $('#visuals').removeClass('hidden');
      }, 1250);
      setTimeout(function() {
        return $('#play').removeClass('hidden');
      }, 2000);
      return setTimeout(function() {
        return $('.instruction').addClass('hidden');
      }, 4500);
    };
  })(this));

}).call(this);
