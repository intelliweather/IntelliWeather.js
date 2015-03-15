/*
 * IntelliWeather.js
 * Copyright 2014 IntelliWeather, Inc.
 */

var _ = (function() {
  'use strict';

  return {
    extend: $.extend,

    expandUrl: function(url, dictionary) {
      for (var key in dictionary) {
        url = url.replace('{' + key + '}', dictionary[key]);
      }
      return url;
    },

    isNull: function(obj) { return obj === null; },

    isUndefined: function(obj) { return typeof obj === 'undefined'; },

    isFunction: $.isFunction,

    isBool: function(obj) { return typeof obj === 'boolean'; },

    isNumber: function(obj) { return typeof obj === 'number'; },

    isString: function(obj) { return typeof obj === 'string'; },

    isArray: $.isArray,

    has: function(obj, key) {
      return obj != null && Object.prototype.hasOwnProperty.call(obj, key);
    }
  };

})();
