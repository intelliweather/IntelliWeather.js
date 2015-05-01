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
    _setupSpeedControl: function setupSpeedControl() {
      var $speedControl = $('<div id="speedControl"></div>');

      var pauseTime = this.settings.pauseTime;
      var percentage = pauseTime * 0.20;
      var pauseTimes = [];
      pauseTimes[0] = pauseTime + (percentage * 2);
      pauseTimes[1] = pauseTime + percentage;
      pauseTimes[2] = pauseTime;
      pauseTimes[3] = pauseTime - percentage;
      pauseTimes[4] = pauseTime - (percentage * 2);
      this.currentPauseTimeIndex = 2;

      this.$minusControl = $(html.minusControl).css(css.iwMinus).appendTo($speedControl);

      for (var i = 0; i < pauseTimes.length; i++) {
        var $indicator = $(html.speedIndicator).attr('id', 'ind-' + i).css(css.iwSpeedIndicator).appendTo($speedControl);

        if (pauseTime <= pauseTimes[i]) {
          $indicator.removeClass('fa-circle-o').addClass('fa-dot-circle-o');
        }
      }

      this.$plusControl = $(html.plusControl).css(css.iwPlus).appendTo($speedControl);

      var that = this;
      this.$minusControl.click(function () {
        if (that.currentPauseTimeIndex - 1 >= 0) {
          var selector = '#ind-' + that.currentPauseTimeIndex;
          $(selector).removeClass('fa-dot-circle-o').addClass('fa-circle-o');
          that.currentPauseTimeIndex = that.currentPauseTimeIndex - 1;
          that.settings.pauseTime = pauseTimes[that.currentPauseTimeIndex];
        }
      });

      this.$plusControl.click(function () {
        if (that.currentPauseTimeIndex + 1 < pauseTimes.length) {
          that.currentPauseTimeIndex = that.currentPauseTimeIndex + 1;
          var selector = '#ind-' + that.currentPauseTimeIndex;
          $(selector).removeClass('fa-circle-o').addClass('fa-dot-circle-o');
          that.settings.pauseTime = pauseTimes[that.currentPauseTimeIndex];
        }
      });

      return $speedControl;
    },
    _setupPlaybackControls: function setupPlaybackControls() {
      var $playbackControls = $('<div id="playbackControls"></div>');
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
      pauseTime: 560,
      startSlide: 0
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
