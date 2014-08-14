(function() {
  var clickContinue, connectIpad, is_chrome, onError, setupMic, showAbout;

  window.stripe = null;

  window.box = null;

  is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

  window.focus = true;

  $(window).on('blur', (function(_this) {
    return function() {
      return window.focus = false;
    };
  })(this));

  $(window).on('focus', (function(_this) {
    return function() {
      return window.focus = true;
    };
  })(this));

  clickContinue = function() {
    $('.choice').addClass('downAndOut');
    $('.accept').removeClass('hidden');
    setTimeout(function() {
      return $('.accept').removeClass('offLeft');
    }, 1500);
    setTimeout(function() {
      return $('.accept').addClass('flash');
    }, 6500);
    clearInterval(window.box);
    window.pester = setTimeout(function() {
      $('#keyboardOrIpad').addClass('hidden');
      window.events.makeSpecial.dispatch(3);
      return window.stripe = setInterval(function() {
        if (window.focus === true) {
          return window.events.makeSpecial.dispatch(3);
        }
      }, 2000);
    }, 1500);
    return navigator.webkitGetUserMedia({
      audio: true
    }, setupMic, onError);
  };

  setupMic = function(stream) {
    clearInterval(window.stripe);
    clearTimeout(window.pester);
    $('.accept').addClass('offRight');
    setTimeout(function() {
      return $('.accept').addClass('hidden');
    }, 500);
    $('#about').removeClass('solidBackground');
    setTimeout(function() {
      return $('#instructions').addClass('hidden');
    }, 500);
    return window.events.micAccepted.dispatch(stream);
  };

  onError = function(err) {
    return console.log('error setting up mic');
  };

  connectIpad = function() {
    $('#ipadInstructions').removeClass('hidden');
    setTimeout(function() {
      return $('#ipadInstructions').removeClass('upAndAway');
    }, 666);
    return window.tabletController = new window.TabletController();
  };

  showAbout = function() {
    $('#about').toggleClass('upAndAway');
    $('#ipadInstructions').toggleClass('faded');
    return $('.showAbout').toggleClass('aboutOpen');
  };

  $('.continue').on('touchstart click', clickContinue);

  $('#tablet').on('touchstart click', connectIpad);

  $('.showAbout').on('touchstart click', showAbout);

  $('#makeFullScreen').on('touchstart click', function() {
    return document.getElementById('fullscreen').webkitRequestFullscreen();
  });

  $('body').bind('webkitfullscreenchange fullscreenchange', function() {
    return $('#makeFullScreen').toggleClass('hidden');
  });

  $((function(_this) {
    return function() {
      setTimeout(function() {
        $('#music').removeClass('hidden');
        window.events.makeSpecial.dispatch(9);
        return window.events.makeSpecial.dispatch(11);
      }, 500);
      setTimeout(function() {
        $('#visuals').removeClass('hidden');
        window.events.makeSpecial.dispatch(9);
        return window.events.makeSpecial.dispatch(11);
      }, 1250);
      setTimeout(function() {
        $('#play').removeClass('hidden');
        window.events.makeSpecial.dispatch(9);
        return window.events.makeSpecial.dispatch(11);
      }, 2000);
      setTimeout(function() {
        $('.instruction').addClass('hidden');
        return $('#keyboardOrIpad').removeClass('hidden');
      }, 4000);
      setTimeout(function() {
        $('#instructions').addClass('hidden');
        $('.choice').removeClass('upAndAway');
        return window.box = setInterval(function() {
          if (window.focus === true) {
            return window.events.makeSpecial.dispatch(11);
          }
        }, 2000);
      }, 4800);
      if (!is_chrome) {
        return $('#browserNotSupported').removeClass('hidden');
      } else {
        window.audioAnalysisEngine = new window.AudioAnalysisEngine();
        window.visualsEngine = new window.VisualsEngine();
        return window.keyboardController = new window.KeyboardController();
      }
    };
  })(this));

}).call(this);
