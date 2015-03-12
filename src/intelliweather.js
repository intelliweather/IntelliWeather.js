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

    var poller = new Poller(this.descriptor);
    poller.addListener('datasetChanged', this, this._render);
    poller.start();
  }

  _.extend(IntelliWeather.prototype, {

    _render: function render(dataset) {
      this.$wrapper.empty();
      var imagePath = this.descriptor.imagePath;

      // TODO: Centralize width and height
      var width = Math.min(this.descriptor.displayWidth || dataset.width);
      var height = Math.min(this.descriptor.displayHeight || dataset.height);
      imagePath = queryString.addQuery(imagePath,
        _.extend({}, this.descriptor.commands, { width: width, height: height }));

      var that = this;
      $.each(dataset.images, function(index, image) {
        var i = new Image();
        i.src = _.expandUrl(imagePath, _.extend(that.descriptor, dataset, image));
        var $slide = $('<div class="slide"></div>');
        that.$wrapper.append($slide.append(i));
      });
    },

    _buildDom: function buildDom(container) {
      // TODO: Set width/height dynamically based off
      // descriptor and meta
      var $container = $(container).css({
        width: this.descriptor.displayWidth + 'px',
        height: this.descriptor.displayHeight + 'px'
      });

      var $slider = $('<div class="iw-slider"></div>');

      return $container.append($slider);
    },

    _defaults: {
      imageHost: 'https://172.16.125.132:44305',
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
