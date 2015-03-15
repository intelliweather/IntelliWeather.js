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

    this.currentSlide = this.settings.startSlide;
    if(this.settings.startSlide < 0 || this.settings.startSlide >= this.slides.length) {
      this.currentSlide = 0;
    }
    $(this.slides[this.currentSlide]).css({ display: 'block' });
  }

  _.extend(Slider.prototype, {
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
      if (currentSlide < 0) {
        this.currentSlide = this.slides.length - 1;
      }
      this.slides.css({ display: 'none' });
      var $slide = $(this.slides[this.currentSlide]);
      $slide.css({ display: 'block' });
      this._fire('slideChanged', $slide);
      this._doTimer();
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
      this._doTimer();
    },

    pause: function pause() {
      clearTimeout(this.timer);
    },

    play: function play() {
      if (this.slides.length > 1) {
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
