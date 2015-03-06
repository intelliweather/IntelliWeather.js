/*
 * IntelliWeather.js
 * Copyright 2014 IntelliWeather, Inc.
 */

(function() {
  'use strict';

  var dataKey = 'iw';

  $.fn.intelliWeather = function() {
    return this.each(function() {
      var $container = $(this);

      var intelliWeather = new IntelliWeather({
        container: $container
      });

      $container.data(dataKey, intelliWeather);
    });
  };

})();
