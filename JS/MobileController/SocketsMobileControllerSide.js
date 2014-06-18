(function() {
  var socket;

  window.key = null;

  $((function(_this) {
    return function() {
      return window.key = prompt('enter key');
    };
  })(this));

  socket = io();

  $(document).on('touchstart click', (function(_this) {
    return function() {
      var button;
      button = {
        button: 'a1',
        key: window.key
      };
      return socket.emit('button-push', button);
    };
  })(this));

}).call(this);
