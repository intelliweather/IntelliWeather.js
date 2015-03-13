/*
 * IntelliWeather.js
 * Copyright 2014 IntelliWeather, Inc.
 */

var IntelliWeather = (function() {
  'use strict';

  function IntelliWeather(o) {
    o = o || {};

    this.descriptor = _.extend({}, this._defaults, o.descriptor);
    this.$node = this._buildDom(o.container);
    this.$wrapper = this.$node.find('.iw-slider');
    this.slider = null;

    var poller = new Poller(this.descriptor);
    poller.addListener('datasetChanged', this, this._render);
    poller.start();
  }

  _.extend(IntelliWeather.prototype, {

    _loadImage: function loadImage(src) {
      var d = $.Deferred();
      var i = new Image();
      var that = this;
      i.onload = function() {
        var $slide = $('<div class="iw-slider-slide"></div>');
        that.$wrapper.append($slide.append(i));
        d.resolve();
      };
      i.src = src;
      return d.promise();
    },

    _loadImages: function loadImages(imagePath, dataset) {
      var loaders = [];
      var that = this;
      $.each(dataset.images, function(index, image) {
        var src = _.expandUrl(imagePath, _.extend(that.descriptor, dataset, image));
        loaders.push(that._loadImage(src));
      });
      return loaders;
    },

    _render: function render(dataset) {
      this.$wrapper.empty();
      if (this.slider) {
        this.slider.destroy();
        this.slider = null;
      }

      var that = this;
      // TODO: Centralize width and height
      var width = Math.min(this.descriptor.displayWidth || dataset.width);
      var height = Math.min(this.descriptor.displayHeight || dataset.height);
      var imagePath = queryString.addQuery(this.descriptor.imagePath,
        _.extend({}, this.descriptor.commands, { width: width, height: height }));

      var loaders = this._loadImages(imagePath, dataset);
      $.when.apply($, loaders).done(function() {
        that.slider = new Slider({ wrapper: that.$wrapper });
        that.slider.play();
      });
    },

    _buildDom: function buildDom(container) {
      // TODO: Set width/height dynamically based off
      // descriptor and meta
      var $container = $(container).css({
        width: this.descriptor.displayWidth + 'px',
        height: this.descriptor.displayHeight + 'px'
      });

      var $wrapper = $('<div class="iw-slider"></div>');

      return $container.append($wrapper);
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
    }

  });

  return IntelliWeather;

})();
