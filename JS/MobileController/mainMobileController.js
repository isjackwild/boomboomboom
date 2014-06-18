(function() {
  var socket;

  window.key = null;

  $((function(_this) {
    return function() {
      window.key = prompt('enter key');
      return alert('connected with key ' + window.key);
    };
  })(this));

  socket = io();

  document.onclick = (function(_this) {
    return function() {
      var button;
      button = {
        button: 'a1',
        key: window.key
      };
      socket.emit('button-push', button);
      return console.log('pushed button on ipad');
    };
  })(this);

}).call(this);
