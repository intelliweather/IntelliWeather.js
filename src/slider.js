/*
 * IntelliWeather.js
 * Copyright 2014 IntelliWeather, Inc.
 */

var Slider = (function() {
  'use strict';

  function Slider(o) {
    this.settings = _.extend({}, this._defaults, o);
    this.$slider = $(this.settings.wrapper);
    this.slides = this.$slider.children();
    this.currentSlide = 0;
    this.timer = 0;

    this.currentSlide = this.settings.startSlide;
    if(this.settings.startSlide < 0 || this.settings.startSlide >= this.slides.length) {
      this.currentSlide = 0;
    }
    $(this.slides[this.currentSlide]).addClass('current');

    this._setupPauseOnHover();
  }

  _.extend(Slider.prototype, {
    _setupPauseOnHover: function setupPauseOnHover() {
      if (this.settings.pauseOnHover && this.settings.pauseTime && this.settings.pauseTime > 0) {
        var that = this;
        this.$slider.hover(
          function () {
            clearTimeout(that.timer);
          },
          function () {
            that._doTimer();
          }
        );
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
      this.slides.removeClass('current');
      this.currentSlide = 0;
      this.slides = null;
    },

    prev: function prev() {
      this.currentSlide--;
      if (currentSlide < 0) {
        this.currentSlide = this.slides.length - 1;
      }
      this.slides.removeClass('current');
      $(this.slides[this.currentSlide]).addClass('current');
      this._doTimer();
    },

    next: function next() {
      this.currentSlide++;
      if (this.currentSlide >= this.slides.length) {
        this.currentSlide = 0;
      }
      this.slides.removeClass('current');
      $(this.slides[this.currentSlide]).addClass('current');
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
