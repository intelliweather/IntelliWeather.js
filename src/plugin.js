/*
 * IntelliWeather.js
 * Copyright 2014 IntelliWeather, Inc.
 */

(function() {
  'use strict';

  var dataKey = 'iw';

  $.fn.intelliWeather = function(o) {
    return this.each(function() {
      var $container = $(this);

      var intelliWeather = new IntelliWeather({
        container: $container,
        descriptor: o
      });

      $container.data(dataKey, intelliWeather);
    });
  };

})();
