/*
 * IntelliWeather.js
 * Copyright 2014 IntelliWeather, Inc.
 */

var IntelliWeather = (function() {
  'use strict';

  function IntelliWeather(o) {
    o = o || {};

    this.$container = o.container;
    this.descriptor = o.descriptor;
	
	this.$container.text('PLACEHOLDER TEXT');
  }

  return IntelliWeather;

})();
