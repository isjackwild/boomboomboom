(function() {
  var pressTimer, socket;

  window.key = null;

  $((function(_this) {
    return function() {
      return console.log('setup controller');
    };
  })(this));

  pressTimer = null;

  socket = io();

  $('#inputForm').on('submit', (function(_this) {
    return function(e) {
      e.stopPropagation();
      e.preventDefault();
      window.key = $('#inputKey').val().toString();
      socket.emit('key-entered', window.key);
      $("#inputKey").blur();
      $('#introWrapper').addClass('downAndOut');
      return setTimeout(function() {
        return $('#introWrapper').addClass('hidden');
      }, 666);
    };
  })(this));

  $('.button').on('touchstart', (function(_this) {
    return function(event) {
      var button, whichButton;
      $('body').addClass('press');
      clearTimeout(pressTimer);
      pressTimer = setTimeout(function() {
        return $('body').removeClass('press');
      }, 100);
      whichButton = event.currentTarget.id;
      button = {
        button: whichButton.toString(),
        key: window.key
      };
      return socket.emit('button-push', button);
    };
  })(this));

}).call(this);
