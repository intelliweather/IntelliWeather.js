/*
 * IntelliWeather.js
 * Copyright 2014 IntelliWeather, Inc.
 */

var Carousel = (function() {
  'use strict';

  function Carousel(o) {
    this.settings = _.extend({}, this._defaults, o);
    this.$container = this.settings.container;
    this.slides = this.$container.find('img');
    this.currentSlide = 0;
    this.timer = 0;
    this.listeners = {};
    this.state = 'paused';

    this._setupControls();

    this.currentSlide = this.settings.startSlide;
    if(this.settings.startSlide < 0 || this.settings.startSlide >= this.slides.length) {
      this.currentSlide = 0;
    }
    $(this.slides[this.currentSlide]).css({ display: 'block' });
  }

  _.extend(Carousel.prototype, {
    _createSpeedIndicators: function createSpeedIndicators($speedControl) {
      var defaultPauseTime = this.settings.pauseTime;
      var percentage = defaultPauseTime * 0.20;
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
        this._setupPlaybackControls().appendTo(this.$controls);
        this._setupSpeedControl().appendTo(this.$controls);
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

    _doTimer: function doTimer() {
      if (this.settings.pauseTime && this.settings.pauseTime > 0) {
        clearTimeout(this.timer);
        var that = this;
        this.timer = setTimeout(function() {
          that.next();
        }, this.settings.pauseTime);
      }
    },

    _defaults: {
      pauseTime: 280,
      startSlide: 0,
      speedIndicatorCount: 5
    },

    destroy: function destroy() {
      clearTimeout(this.timer);
    },

    prev: function prev() {
      this.currentSlide--;
      if (this.currentSlide < 0) {
        this.currentSlide = this.slides.length - 1;
      }
      this.slides.css({ display: 'none' });
      var $slide = $(this.slides[this.currentSlide]);
      $slide.css({ display: 'block' });
      this._fire('slideChanged', $slide);
      if (this.state === 'play') {
        this._doTimer();
      }
    },

    next: function next() {
      this.currentSlide++;
      if (this.currentSlide >= this.slides.length) {
        this.currentSlide = 0;
      }
      this.slides.css({ display: 'none' });
      var $slide = $(this.slides[this.currentSlide]);
      $slide.css({ display: 'block' });
      this._fire('slideChanged', $slide);
      if (this.state === 'play') {
        this._doTimer();
      }
    },

    pause: function pause() {
      if (this.state === 'play' && this.slides.length > 1) {
        clearTimeout(this.timer);
        this.state = 'paused';
        this.$pausePlayControl.removeClass('fa-pause');
        this.$pausePlayControl.addClass('fa-play');
      }
    },

    play: function play() {
      if (this.state === 'paused' && this.slides.length > 1) {
        this.state = 'play';
        this.$pausePlayControl.removeClass('fa-play');
        this.$pausePlayControl.addClass('fa-pause');
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
