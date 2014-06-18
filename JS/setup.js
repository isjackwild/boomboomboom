(function() {
  var clickContinue, connectIpad, onError, setupMic;

  clickContinue = function() {
    $('.accept').removeClass('hidden');
    return navigator.webkitGetUserMedia({
      audio: true
    }, setupMic, onError);
  };

  setupMic = function(stream) {
    console.log('setup Mic');
    $('.accept').addClass('hidden');
    $('#instructions').addClass('hidden');
    $('#ipadInstructions').addClass('hidden');
    return window.events.micAccepted.dispatch(stream);
  };

  onError = function(err) {
    return console.log('error setting up mic');
  };

  connectIpad = function() {
    var socket;
    $('#instructions').addClass('hidden');
    $('#ipadInstructions').removeClass('hidden');
    console.log('conect ipad');
    window.key = 10000 + Math.floor(Math.random() * 89999);
    window.key = window.key.toString();
    console.log('the key for this is ' + window.key);
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

}).call(this);
