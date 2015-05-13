/*
 * IntelliWeather.js
 * Copyright 2014 IntelliWeather, Inc.
 */

var Carousel = (function() {
  'use strict';

  function Carousel(o) {
    this.settings = _.extend({}, this._defaults, o);
    this.$container = this.settings.container;
    this.slides = this.$container.find('> img');
    this.currentSlideIndex = 0;
    this.timer = 0;
    this.listeners = {};
    this.state = 'paused';
    this.hasLooped = false;

    this.slides.each(function(index, slide) {
      $(slide).css({
        position: 'absolute',
        top: 0,
        left: 0,
        visibility: 'hidden'
      });
    });

    this._setupControls();

    this.currentSlideIndex = this.settings.startSlide;
    if(this.settings.startSlide < 0 || this.settings.startSlide >= this.slides.length) {
      this.currentSlideIndex = 0;
    }

    $(this.slides[this.currentSlideIndex]).css({
      opacity: 1,
      display: 'block',
      visibility: 'visible'
    });

    this._stackSlides(this.slides[this.currentSlideIndex],
        this.slides[this.currentSlideIndex + 1], true);
  }

  _.extend(Carousel.prototype, {
    _createSpeedIndicators: function createSpeedIndicators($speedControl) {
      var defaultPauseTime = this.settings.pauseTime;
      var percentage = defaultPauseTime * (this.settings.linearPercentage / 100);
      var speedIndicatorCount = this.settings.speedIndicatorCount;
      var middle = Math.floor(speedIndicatorCount / 2);
      var indicators = [];

      // Using a default percentage and given how many indicators we want to build,
      // we can build an array of indicators and their corresponding pause times,
      // based on an algorithm. The middle of the array is the defaultPauseTime,
      // basically the pauseTime we were passed during instantiation.
      // The algorithm is: defaultPauseTime + (percentage * (middle - i))
      // Example for five indicators:
      //   speedIndicatorCount = 5
      //   defaultPauseTime = 560
      //   percentage = 560 * 0.20 => 112
      //   middle = Math.floor(5/2) => 2
      //   [0] -> 560 + (112 * (2 - 0)) => 784
      //   [1] -> 560 + (112 * (2 - 1)) => 672
      //   [2] -> 560 + (112 * (2 - 2)) => 560
      //   [3] -> 560 + (112 * (2 - 3)) => 448
      //   [4] -> 560 + (112 * (2 - 4)) => 336
      for (var i = 0; i < speedIndicatorCount; i++) {
        var $element = $(html.speedIndicator).css(css.iwSpeedIndicator).appendTo($speedControl);
        var pauseTime = defaultPauseTime + (percentage * (middle - i));

        if (defaultPauseTime <= pauseTime) {
          $element.removeClass('fa-circle-o').addClass('fa-dot-circle-o');
        }

        indicators[i] = {
          element: $element,
          pauseTime: pauseTime
        };
      }

      return indicators;
    },
    _setupSpeedControl: function setupSpeedControl() {
      var $speedControl = $(html.speedControl);

      this.$minusControl = $(html.minusControl).css(css.iwMinus).appendTo($speedControl);

      var indicators = this._createSpeedIndicators($speedControl);

      // Based on the algorithm, the starting speed index is the middle
      this.currentSpeedIndex = Math.floor(indicators.length / 2);

      this.$plusControl = $(html.plusControl).css(css.iwPlus).appendTo($speedControl);

      var that = this;
      this.$minusControl.click(function () {
        if (that.currentSpeedIndex - 1 >= 0) {
          var $element = indicators[that.currentSpeedIndex].element;
          $element.removeClass('fa-dot-circle-o').addClass('fa-circle-o');
          that.currentSpeedIndex = that.currentSpeedIndex - 1;
          that.settings.pauseTime = indicators[that.currentSpeedIndex].pauseTime;
        }
      });

      this.$plusControl.click(function () {
        if (that.currentSpeedIndex + 1 < indicators.length) {
          that.currentSpeedIndex = that.currentSpeedIndex + 1;
          var $element = indicators[that.currentSpeedIndex].element;
          $element.removeClass('fa-circle-o').addClass('fa-dot-circle-o');
          that.settings.pauseTime = indicators[that.currentSpeedIndex].pauseTime;
        }
      });

      return $speedControl;
    },
    _setupPlaybackControls: function setupPlaybackControls() {
      var $playbackControls = $(html.playbackControls);
      this.$previousControl = $(html.previousControl).css(css.iwPrevious).appendTo($playbackControls);
      this.$pausePlayControl = $(html.pausePlayControl).css(css.iwPausePlay).appendTo($playbackControls);
      this.$nextControl = $(html.nextControl).css(css.iwNext).appendTo($playbackControls);

      var that = this;
      this.$previousControl.click(function() {
        that.pause();
        that.prev();
      });

      this.$pausePlayControl.click(function() {
        if (that.state == 'paused') {
          that.play();
        }
        else {
          that.pause();
        }
      });

      this.$nextControl.click(function() {
        that.pause();
        that.next();
      });

      return $playbackControls;
    },
    _setupControls: function setupControls() {
      if (this.slides.length > 1 && this.settings.controlArea && this.$container.find(this.settings.controlArea).length) {
        this.$controls = $(html.controls).css(css.iwControls);

        if (this.settings.displayPlaybackControls) {
          this._setupPlaybackControls().appendTo(this.$controls);
        }

        if (this.settings.displaySpeedControl) {
          this._setupSpeedControl().appendTo(this.$controls);
        }

        this.$container.find(this.settings.controlArea).append(this.$controls);
      }
    },

    _fire: function fire(event, element) {
      if (typeof event == 'string') {
        event = { type: event };
      }

      if (!event.target) {
        event.target = this;
      }

      if (!event.type) {
        throw new Error('Event object missing "type" property.');
      }

      if (this.listeners[event.type] instanceof Array) {
        var listeners = this.listeners[event.type];
        for (var i = 0, len = listeners.length; i < len; i++) {
          var listener = listeners[i];
          listener.callback.call(listener.context, element);
        }
      }
    },

    _transition: function transition(forward) {
      var currentSlide, previousSlide;

      currentSlide = this.slides[this.currentSlideIndex];
      previousSlide = forward ? this.slides[this.currentSlideIndex - 1] : this.slides[this.currentSlideIndex + 1];

      this._stackSlides(previousSlide, currentSlide, true);
      $(currentSlide).css({
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'block',
        opacity: 1,
        visibility: 'visible'
      });

      $(previousSlide).animate({opacity: 0}, 300);
    },

    _doTimer: function doTimer() {
      if (this.settings.pauseTime && this.settings.pauseTime > 0) {
        clearTimeout(this.timer);

        var timeout = this.settings.pauseTime;
        if (this.currentSlideIndex === 0 && !this.hasLooped) {
          timeout = this.settings.firstTimeout;
        } else if (this.currentSlideIndex === this.slides.length - 1) {
          timeout = this.settings.lastTimeout;
        }

        var that = this;
        this.timer = setTimeout(function() {
          that.next();
        }, timeout);
      }
    },

    _stackSlides: function stackSlides(current, next, forward) {
      var maxZ = 100;
      $(current).css('zIndex', maxZ);

      var i;
      var z = maxZ - 2;
      var length = this.slides.length;
      if (forward) {
        for (i = this.currentSlideIndex + 1; i < length; i++) {
          $(this.slides[i]).css('zIndex', z--);
        }
        for (i = 0; i < this.currentSlideIndex; i++) {
          $(this.slides[i]).css('zIndex', z--);
        }
      } else {
        for (i = this.currentSlideIndex - 1; i >= 0; i--) {
          $(this.slides[i]).css('zIndex', z--);
        }
        for (i = length - 1; i > this.currentSlideIndex; i--) {
          $(this.slides[i]).css('zIndex', z--);
        }
      }

      $(next).css('zIndex', maxZ - 1);
    },

    _defaults: {
      firstTimeout: 750,
      lastTimeout: 1500,
      pauseTime: 175,
      linearPercentage: 30,
      startSlide: 0,
      slideMaxZ: 100,
      displayPlaybackControls: true,
      displaySpeedControl: true,
      speedIndicatorCount: 5
    },

    destroy: function destroy() {
      clearTimeout(this.timer);
    },

    prev: function prev() {
      this.currentSlideIndex--;
      if (this.currentSlideIndex < 0) {
        this.currentSlideIndex = this.slides.length - 1;
      }

      this._transition(false);

      this._fire('slideChanged', $(this.slides[this.currentSlideIndex]));
      if (this.state === 'play') {
        this._doTimer();
      }
    },

    next: function next() {
      this.currentSlideIndex++;
      if (this.currentSlideIndex >= this.slides.length) {
        this.currentSlideIndex = 0;
        this.hasLooped = true;
      }

      this._transition(true);

      this._fire('slideChanged', $(this.slides[this.currentSlideIndex]));
      if (this.state === 'play') {
        this._doTimer();
      }
    },

    pause: function pause() {
      if (this.state === 'play' && this.slides.length > 1) {
        clearTimeout(this.timer);
        this.state = 'paused';

        if (this.settings.displayPlaybackControls) {
          this.$pausePlayControl.removeClass('fa-pause');
          this.$pausePlayControl.addClass('fa-play');
        }
      }
    },

    play: function play() {
      if (this.state === 'paused' && this.slides.length > 1) {
        this.state = 'play';

        if (this.settings.displayPlaybackControls) {
          this.$pausePlayControl.removeClass('fa-play');
          this.$pausePlayControl.addClass('fa-pause');
        }

        this._doTimer();
      }
    },

    addListener: function addListener(type, context, listener) {
      if (typeof this.listeners[type] == 'undefined') {
        this.listeners[type] = [];
      }

      this.listeners[type].push({
        context: context,
        callback: listener
      });
    }
  });

  return Carousel;

})();
