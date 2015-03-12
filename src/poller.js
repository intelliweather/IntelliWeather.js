/*
 * IntelliWeather.js
 * Copyright 2014 IntelliWeather, Inc.
 */

var Poller = (function() {
  'use strict';

  var that = this;

  function Poller(descriptor) {
    this.descriptor = descriptor;
    this.listeners = {};
  }

  _.extend(Poller.prototype, {

    _error: function error() {},

    _schedule: function schedule() {
      if (this.descriptor.poll &&
        ((new Date() - this.startedPollAt) / 1000 < this.descriptor.pollDuration)) {
        var closure = this;
        setTimeout(function() {
          closure.start();
        }, this.descriptor.pollInterval * 1000);
      }
    },

    _fire: function fire(event, dataset) {
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
          listener.callback.call(listener.context, dataset);
        }
      }
    },

    _datasetChanged: function datasetChanged(newDataset) {
      var oldDataset = this.dataset;
      this.dataset = newDataset;

      // Check for actual changes by checking first and last item Ids and count.
      var identical = oldDataset != null;
      if (identical) {
        identical = newDataset.length == oldDataset.length;
      }

      if (newDataset.length > 0) {
        if (identical) {
          identical = newDataset[0].id == oldDataset[0].id;
        }

        if (identical) {
          identical = newDataset[newDataset.length -1].id == oldDataset[oldDataset.length -1].id;
        }
      }

      if (!identical) {
        return true;
      }

      return false;
    },

    _success: function success(dataset) {
      if (this._datasetChanged(dataset)) {
        this._fire('datasetChanged', dataset);
      }

      this._schedule();
    },

    _buildDataset: function buildDataset(channelMeta) {
      var dataset = {
        description: channelMeta.description || '',
        width: channelMeta.width || 640,
        height: channelMeta.height || 480,
        format: channelMeta.format || 'jpg'
      };

      var count  = 0,
          key    = channelMeta.batch === true ? channelMeta.lastSequence : channelMeta.last,
          images = [];

      if (this.descriptor.series) {
        count = this.descriptor.seriesLength || channelMeta.maxItems;
      }
      else {
        count = 1;
      }

      while (images.length < count) {
        var image = { id: key };
        _.extend(image, channelMeta.images[key]);
        images.push(image);
        key--;
      }

      images.reverse();

      dataset.images = images;

      return dataset;
    },

    _getChannelMeta: function getChannelMeta() {
      var url = 'https://s3-us-west-1.amazonaws.com/iw-metadata/channels/{channel}.js';
      url = _.expandUrl(url, this.descriptor);
      return $.ajax(url, {
        type: 'GET',
        dataType: 'json',
        cache: false,
        context: this
      });
    },

    start: function start() {
      this.startedPollAt = new Date();
      this._getChannelMeta()
        .pipe(this._buildDataset)
        .done(this._success).fail(this._error);
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

  return Poller;

})();
