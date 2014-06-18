(function() {
  var socket;

  window.key = null;

  $((function(_this) {
    return function() {
      window.key = Math.floor(Math.random() * 99999);
      window.key = window.key.toString();
      return console.log('the key for this is ' + window.key);
    };
  })(this));

  socket = io();

  socket.on('button-push', function(which) {
    console.log('ipad button pushed', which);
    if (which.key === window.key) {
      return console.log('im listening to this ipad');
    } else {
      return console.log('ignore');
    }
  });

}).call(this);
