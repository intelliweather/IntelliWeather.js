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
    this.$images = [];
    this.carousel = null;
    this.timezone = timezone.determine();

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
    _modalCompleted: function modalCompleted(modal) {
      var descriptor = _.extend({}, this.descriptor.expand);
      modal.find('.content').intelliWeather({ local: descriptor });
    },

    _formatTimestamp: function formatTimestamp(timeStamp) {
      var month = _.padZeroes(timeStamp.getMonth() + 1);
      var day = _.padZeroes(timeStamp.getDate());
      var year = timeStamp.getFullYear();
      var hours = _.padZeroes(timeStamp.getHours());
      var minutes = _.padZeroes(timeStamp.getMinutes());
      return month + '/' +
             day + '/' +
             year + ' ' +
             hours + ':' +
             minutes + ' ' +
             this.timezone.abbr;
    },

    _updateTopBar: function updateTopBar(image) {
      var timestamp = image.data('timestamp') || '';

      if (this.$seriesTitle) {
        this.$seriesTitle.text(this.dataset.description || '');
      }

      if (this.$subTitle) {
        this.$subTitle.text(' - ' + _.toAbbRelativeTime(timestamp - Date.now()));
      }

      if (this.$labelFrame) {
        this.$labelFrame.text(' ' + _.padZeroes(image.data('index') + 1) + ' of ' + this.dataset.images.length + '');
      }

      if (this.$labelTime) {
        this.$labelTime.html(this._formatTimestamp(timestamp));
      }
    },

    _renderImages: function renderImages(dataset) {
      var that = this;
      $.each(dataset.images, function(index, image) {
        var $image = that.$images[image.id];
        if (that.descriptor.series && dataset.images.length > 1) {
          that.$container.append($image);
        }
        else {

          var $modal = $('<div></div>').attr('id', 'modal-' + image.id).css(_.extend({}, css.modal, {
            width: that.descriptor.expand.displayWidth,
            height: that.descriptor.expand.displayHeight
          }));
          $modal.addClass('iw');
          var $modalHeader = $(html.modalHeader).css(css.modalHeader);
          var $modalClose = $(html.modalClose).css(css.modalClose);
          $modalHeader.append($modalClose);
          var $modalContent = $(html.modalContent).css(css.modalContent);
          $modal.append($modalHeader).append($modalContent);
          $('body').append($modal);

          var $anchor = $('<a></a>').attr('href', '#modal-' + image.id);
          $anchor.append($image);
          that.$container.append($anchor);

          var modal = new Modal({
            anchor: $anchor,
            closeButton: $modalClose
          });
          modal.addListener('onComplete', that, that._modalCompleted);
        }
      });
    },

    _renderTopBar: function renderTopBar() {
      this.$topbar = $(html.topBar).css(css.iwTopBar);

      if (this.descriptor.series) {
        this.$seriesTitle = $(html.seriesTitle).appendTo(this.$topbar);
        this.$subTitle = $(html.subTitle).appendTo(this.$topbar);
        this.$labelFrame = $(html.labelFrame).appendTo(this.$topbar);
        this.$labelTime = $(html.labelTime).appendTo(this.$topbar).css(css.iwTime);
      } else {
        this.$labelTime = $(html.labelTime).appendTo(this.$topbar).css(css.iwTime);
      }

      this.$container.append(this.$topbar);
      var $firstImage = this.$images[this.dataset.images[0].id];
      this._updateTopBar($firstImage);
    },

    _preloadImages: function preloadImages(imagePath, dataset) {
      var d = $.Deferred(), loaders = [], that = this;

      $.each(dataset.images, function(index, image) {
        var src = _.expandUrl(imagePath, _.extend(that.descriptor, dataset, image));
        var d = $.Deferred();
        var $img = $('<img />').attr('id', image.id).attr('src', src);
        $img.data('index', index);
        $img.data('timestamp', new Date(image.time));
        $img.css({ display: 'none' });
        $img.load(function() {
          d.resolveWith(that);
        });
        that.$images[image.id] = $img;
        loaders.push(d.promise());
      });

      $.when.apply($, loaders).done(function() {
        d.resolveWith(that);
      });

      return d;
    },

    _render: function render(dataset) {
      this.destroy();
      this.dataset = dataset;

      var width = Math.min(this.descriptor.displayWidth || dataset.width);
      var height = Math.min(this.descriptor.displayHeight || dataset.height);
      var imagePath = queryString.addQuery(this.descriptor.imagePath,
        _.extend({}, this.descriptor.commands, { width: width, height: height }));

      this._preloadImages(imagePath, dataset).done(function() {
        this._renderTopBar();
        this._renderImages(dataset);
        var o = _.extend({
          container: this.$container,
          controlArea: '.iw-topbar'
        }, this.descriptor.carouselOptions);
        this.carousel = new Carousel(o);
        this.carousel.addListener('slideChanged', this, this._updateTopBar);
        this.carousel.play();
      });
    },

    _defaults: {
      imageHost: 'https://gfx1.intelliweather.net',
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
      this.dataset = null;
      this.$images = [];

      if (this.carousel) {
        this.carousel.destroy();
        this.carousel = null;
      }
    }

  });

  return IntelliWeather;

})();
