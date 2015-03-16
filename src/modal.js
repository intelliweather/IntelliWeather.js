/*
 * IntelliWeather.js
 * Copyright 2014 IntelliWeather, Inc.
 */

var Modal = (function() {
  'use strict';

  function Modal(o) {
    var that = this;
    this.settings = _.extend({}, this._defaults, o);
    this.$overlay = $(html.overlay).css(css.overlay);
    $('body').append(this.$overlay);
    this.$anchor = this.settings.anchor;
    this.$anchor.click(function(e) {
      that._anchorClicked(this, e);
      e.preventDefault();
    });
    this.listeners = {};
  }

  _.extend(Modal.prototype, {
    _fire: function fire(event, modal) {
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
          listener.callback.call(listener.context, modal);
        }
      }
    },

    _close: function close(modalId) {
      this.$overlay.fadeOut(200);
      $(modalId).css({ display: 'none' });
    },

    _anchorClicked: function anchorClicked(anchor, e) {
      var modalId = $(anchor).attr('href'), that = this;

      this.$overlay.click(function() {
        that._close(modalId);
      });

      var $modal = $(modalId);
      var height = $modal.outerHeight();
      var width = $modal.outerWidth();

      this.$overlay.css({ display: 'block', opacity: 0 });
      this.$overlay.fadeTo(200, this.settings.overlay);

      $modal.css(_.extend({}, css.modal, {
        display: 'block',
        marginLeft: -(width / 2) + 'px',
        top: this.settings.top + 'px'
      }));
      $modal.fadeTo(200, 1);
      this._fire('onComplete', $modal);
    },

    _defaults: {
      top: 100,
      overlay: 0.5
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

  return Modal;
})();
