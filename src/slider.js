/*
 * IntelliWeather.js
 * Copyright 2014 IntelliWeather, Inc.
 */

var Slider = (function() {
  'use strict';

  function Slider(o) {
    this.settings = _.extend({}, this._defaults, o);
    this.$container = this.settings.container;
    this.slides = this.$container.children('img');
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

  _.extend(Slider.prototype, {
    _setupControls: function setupControls() {
      if (this.slides.length > 1 && this.settings.controlArea && $(this.settings.controlArea).length) {
        this.$controls = $(html.controls).css(css.iwControls);
        this.$previousControl = $(html.previousControl).css(css.iwPrevious).appendTo(this.$controls);
        this.$pausePlayControl = $(html.pausePlayControl).css(css.iwPausePlay).appendTo(this.$controls);
        this.$nextControl = $(html.nextControl).css(css.iwNext).appendTo(this.$controls);

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

        $(this.settings.controlArea).append(this.$controls);
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
      pauseTime: 700,
      pauseOnHover: true,
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

  return Slider;

})();
