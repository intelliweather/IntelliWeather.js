/*
 * IntelliWeather.js
 * Copyright 2014 IntelliWeather, Inc.
 */

(function() {
  'use strict';

  var dataKey = 'iw', methods;

  methods = {
    initialize: function initialize(o) {
      var $container = $(this);

      return this.each(attach);

      function fail() {
        console.log('failed retrieving the remote descriptor');
      }

      function success() {
        var remote = _.isObject(o.remote) ? o.remote : {};
        var descriptor = _.extend({}, o.local, remote);
        var intelliWeather = new IntelliWeather({
          container: $container,
          descriptor: descriptor
        });

        $container.data(dataKey, intelliWeather);
      }

      function getRemoteDescriptor(o) {
        var deferred;

        if (o.remote) {
          deferred = $.ajax(o.remote, {
            type: 'GET',
            dataType: 'json',
            context: this
          }).done(handleRemoteResponse);
        }
        else {
          deferred = $.Deferred().resolve();
        }

        return deferred;

        function handleRemoteResponse(resp) {
          o.remote = resp;
        }
      }

      function attach() {
        getRemoteDescriptor(o).done(success).fail(fail);
      }
    }
  };

  $.fn.intelliWeather = function(o) {
    return methods.initialize.apply(this, arguments);
  };

})();
