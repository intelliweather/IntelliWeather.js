/*
 * IntelliWeather.js
 * Copyright 2014 IntelliWeather, Inc.
 */

 var timezone = (function() {
  'use strict';

  var constants = {
    HEMISPHERE_SOUTH: 's',
    BASELINE_YEAR: 2015
  };

  var timezones = {
    '0,0': {
      name: 'Coordinated Universal Time',
      abbr: 'UTC'
    },
    '-240,1': {
      name: 'Atlantic Time',
      abbr: 'AT'
    },
    '-300,1': {
      name: 'Eastern Time',
      abbr: 'ET'
    },
    '-360,1': {
      name: 'Central Time',
      abbr: 'CT'
    },
    '-420,1': {
      name: 'Mountain Time',
      abbr: 'MT'
    },
    '-420,0': {
      name: 'Mountain Time',
      abbr: 'MT'
    },
    '-480,1': {
      name: 'Pacific Time',
      abbr: 'PT'
    },
    '-540,1': {
      name: 'Alaska Time',
      abbr: 'AKT'
    },
    '-600,1': {
      name: 'Hawaii-Aleutian Time',
      abbr: 'HAT'
    },
    '-600,0': {
      name: 'Hawaii-Aleutian Time',
      abbr: 'HAT'
    },
    '-660,0': {
      name: 'Samoa Time',
      abbr: 'SST'
    },
    '600,0': {
      name: 'Chamorro Standard Time',
      abbr: 'ChST'
    }
  };

  return {
    determine: determine
  };

  function determine() {
    // Using timezoneOffset, determine the timezone
    // We only care about the United States, if it's a
    // time zone we don't recognize, then default to UTC
    return timezones[_lookupKey()] || timezones['0,0'];
  }

  function _getDateOffset(date) {
    var offset = -date.getTimezoneOffset();
    return (offset !== null ? offset : 0);
  }

  function _lookupKey() {
    var standard = _getDateOffset(new Date(constants.BASELINE_YEAR, 0, 2)),
        daylight = _getDateOffset(new Date(constants.BASELINE_YEAR, 5, 2)),
        diff = standard - daylight;

    if (diff < 0) {
      return standard + ',1';
    } else if (diff > 0) {
      return daylight + ',1,' + constants.HEMISPHERE_SOUTH;
    }

    return standard + ',0';
  }
 })();
