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

    isObject: $.isPlainObject,

    isBool: function(obj) { return typeof obj === 'boolean'; },

    isNumber: function(obj) { return typeof obj === 'number'; },

    isString: function(obj) { return typeof obj === 'string'; },

    isArray: $.isArray,

    has: function(obj, key) {
      return obj != null && Object.prototype.hasOwnProperty.call(obj, key);
    },

    padZeroes: function(str) {
      str = str.toString();

      while (str.length < 2) {
        str = '0' + str;
      }

      return str;
    },

    toAbbRelativeTime: function(milliseconds) {
      var secs = Math.abs(milliseconds / 1000);
      var days = Math.floor(secs / (3600 * 24));
      secs %= 3600 * 24;
      var hrs = Math.floor(secs / 3600);
      secs %= 3600;
      var mns = Math.floor(secs / 60);
      secs %= 60;

      return this.padZeroes(days) + 'd ' +
              this.padZeroes(hrs) + 'h ' +
              this.padZeroes(mns) + 'm' +
             (milliseconds < 0 ? ' ago' : ' from now');
    }
  };

})();
