/*
 * IntelliWeather.js
 * Copyright 2014 IntelliWeather, Inc.
 */

var IntelliWeather = (function() {
  'use strict';

  function IntelliWeather(o) {
    o = o || {};

    this.$container = o.container;
    this.descriptor = _.extend({}, this._defaults, o.descriptor);
    this.slider = null;

    // TODO: Take into account current width and height
    this.$container.css({
      width: this.descriptor.displayWidth,
      height: this.descriptor.displayHeight
    });

    var poller = new Poller(this.descriptor);
    poller.addListener('datasetChanged', this, this._render);
    poller.start();
  }

  _.extend(IntelliWeather.prototype, {

    _renderImages: function renderImages(dataset) {
      var that = this;
      $.each(dataset.images, function(index, image) {
        that.$container.append(image.html);
      });
    },

    _preloadImages: function preloadImages(imagePath, dataset) {
      var d = $.Deferred(), loaders = [], that = this;

      $.each(dataset.images, function(index, image) {
        var src = _.expandUrl(imagePath, _.extend(that.descriptor, dataset, image));
        var d = $.Deferred();

        var $img = $('<img />').attr('id', image.id).attr('src', src);
        $img.css({ display: 'none' });

        $img.load(function() {
          image.html = this;
          d.resolveWith(that);
        });

        loaders.push(d.promise());
      });

      $.when.apply($, loaders).done(function() {
        d.resolveWith(that);
      });

      return d;
    },

    _render: function render(dataset) {
      this.destroy();

      var width = Math.min(this.descriptor.displayWidth || dataset.width);
      var height = Math.min(this.descriptor.displayHeight || dataset.height);
      var imagePath = queryString.addQuery(this.descriptor.imagePath,
        _.extend({}, this.descriptor.commands, { width: width, height: height }));

      this._preloadImages(imagePath, dataset).done(function() {
        this._renderImages(dataset);
        this.slider = new Slider({ container: this.$container });
        this.slider.play();
      });
    },

    _defaults: {
      imageHost: 'https://172.16.125.131:44305',
      imagePath: '{imageHost}/c/{channel}/{id}.{format}',
      // If a channel doesn't have a standard sequence length, use this value
      defaultSequenceLength: 12,
      // Check for updates every 60 seconds
      pollInterval: 60,
      // Stop polling after 10 minutes
      pollDuration: 60 * 10,
      // Disable polling by default
      poll: true
    },

    destroy: function destroy() {
      this.$container.empty();

      if (this.slider) {
        this.slider.destroy();
        this.slider = null;
      }
    }

  });

  return IntelliWeather;

})();
