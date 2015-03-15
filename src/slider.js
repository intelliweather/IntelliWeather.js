/*
 * IntelliWeather.js
 * Copyright 2014 IntelliWeather, Inc.
 */

var Slider = (function() {
  'use strict';

  function Slider(o) {
    this.settings = _.extend({}, this._defaults, o);
    this.$container = this.settings.container;
    this.slides = this.$container.children();
    this.currentSlide = 0;
    this.timer = 0;

    this.currentSlide = this.settings.startSlide;
    if(this.settings.startSlide < 0 || this.settings.startSlide >= this.slides.length) {
      this.currentSlide = 0;
    }
    $(this.slides[this.currentSlide]).css({ display: 'block' });
  }

  _.extend(Slider.prototype, {
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
      $(this.slides[this.currentSlide]).css({ display: 'block' });
      this._doTimer();
    },

    next: function next() {
      this.currentSlide++;
      if (this.currentSlide >= this.slides.length) {
        this.currentSlide = 0;
      }
      this.slides.css({ display: 'none' });
      $(this.slides[this.currentSlide]).css({ display: 'block' });
      this._doTimer();
    },

    pause: function pause() {
      clearTimeout(this.timer);
    },

    play: function play() {
      if (this.slides.length > 1) {
        this._doTimer();
      }
    }
  });

  return Slider;

})();
