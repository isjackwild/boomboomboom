(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.TabletController = (function() {
    TabletController.prototype._timeSinceLastKeyPress = 0;

    TabletController.prototype._autoTimer = null;

    function TabletController() {
      this.setAutoTimer = __bind(this.setAutoTimer, this);
      this.mapSocketEvents = __bind(this.mapSocketEvents, this);
      this.onKeyAccepted = __bind(this.onKeyAccepted, this);
      this.generateKey = __bind(this.generateKey, this);
      console.log('setup tablet controller');
      this._socket = io();
      this.generateKey();
    }

    TabletController.prototype.generateKey = function() {
      window.key = 10000 + Math.floor(Math.random() * 89999);
      window.key = window.key.toString();
      this._socket.emit('new-desktop-client', window.key);
      this._socket.on('key-accepted', this.onKeyAccepted);
      return this._socket.on('key-unaccepted', this.generateKey);
    };

    TabletController.prototype.onKeyAccepted = function() {
      $('.key').html(window.key);
      $('#keyInAbout').removeClass('hidden');
      this._socket.on('button-push', (function(_this) {
        return function(button) {
          return _this.mapSocketEvents(button);
        };
      })(this));
      return this._socket.on('key-entered', (function(_this) {
        return function(key) {
          if (key === window.key) {
            $('#ipadInstructions').addClass('downAndOut');
            return setTimeout(function() {
              return $('#ipadInstructions').addClass('hidden');
            }, 666);
          } else {
            return console.log('incorrect key');
          }
        };
      })(this));
    };

    TabletController.prototype.mapSocketEvents = function(button) {
      this.setAutoTimer();
      window.events.automatic.dispatch('off');
      switch (button) {
        case "a1":
          return window.events.frequency.dispatch(1);
        case "a2":
          return window.events.frequency.dispatch(2);
        case "a3":
          return window.events.frequency.dispatch(3);
        case "a4":
          return window.events.frequency.dispatch(4);
        case "a5":
          return window.events.frequency.dispatch(5);
        case "a6":
          return window.events.frequency.dispatch(6);
        case "a7":
          return window.events.frequency.dispatch(7);
        case "a8":
          return window.events.frequency.dispatch(8);
        case "a9":
          return window.events.frequency.dispatch(9);
        case "a10":
          return window.events.inverseCols.dispatch();
        case "b1":
          return window.events.makeSpecial.dispatch(1);
        case "b2":
          return window.events.makeSpecial.dispatch(2);
        case "b3":
          return window.events.makeSpecial.dispatch(3);
        case "b4":
          return window.events.makeSpecial.dispatch(4);
        case "b5":
          return window.events.makeSpecial.dispatch(5);
        case "b6":
          return window.events.makeSpecial.dispatch(6);
        case "b7":
          return window.events.makeSpecial.dispatch(7);
        case "b8":
          return window.events.makeSpecial.dispatch(8);
        case "b9":
          return window.events.makeSpecial.dispatch(9);
        case "b10":
          return window.events.makeSpecial.dispatch(0);
        case "b11":
          return window.events.makeSpecial.dispatch(11);
        case "c1":
          return window.events.showText.dispatch('boom');
        case "c2":
          return window.events.showText.dispatch('tssk');
        case "c3":
          return window.events.showText.dispatch('wobb');
        case "c4":
          return window.events.showText.dispatch('clap');
        case "c5":
          return window.events.showIllustration.dispatch('heart');
        case "c6":
          return window.events.showIllustration.dispatch('hand');
        case "c7":
          return window.events.showIllustration.dispatch('mouth');
        case "c8":
          return window.events.showIllustration.dispatch('eye');
        case "c9":
          return window.events.showIllustration.dispatch('ear');
        case "c10":
          return window.events.transform.dispatch('squashX');
        case "c11":
          return window.events.transform.dispatch('squashY');
        case "d1":
          return window.events.angela.dispatch('angela');
        case "d2":
          return window.events.angela.dispatch('obama');
        case "d3":
          return window.events.angela.dispatch('queen');
        case "d4":
          return window.events.angela.dispatch('charles');
        case "d5":
          return window.events.bass.dispatch('big');
        case "d6":
          return window.events.bass.dispatch('small');
        case "d7":
          return window.events.filter.dispatch('blur');
        case "d8":
          return window.events.squishy.dispatch();
        case "d9":
          return window.events["break"].dispatch('short');
        case "d0":
          return window.events["break"].dispatch('long');
      }
    };

    TabletController.prototype.setAutoTimer = function() {
      clearInterval(this._autoTimer);
      this._timeSinceLastKeyPress = 0;
      return this._autoTimer = setInterval((function(_this) {
        return function() {
          _this._timeSinceLastKeyPress += 1;
          if (_this._timeSinceLastKeyPress > 10) {
            clearInterval(_this._autoTimer);
            _this._timeSinceLastKeyPress = 0;
            window.events.automatic.dispatch('on');
            return console.log('automatic ON');
          }
        };
      })(this), 7000);
    };

    return TabletController;

  })();

}).call(this);
