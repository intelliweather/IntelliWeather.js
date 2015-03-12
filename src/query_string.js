/*
 * IntelliWeather.js
 * Copyright 2014 IntelliWeather, Inc.
 */

var queryString = (function() {
  'use strict';

  return {
    unescape: unescape,
    escape: escape,
    addQuery: addQuery
  };

  function unescape(str, decodeSpaces) {
    return decodeURIComponent(decodeSpaces ? str.replace(/\+/g, ' ') : str);
  }

  function escape(str) {
    return encodeURIComponent(str);
  }

  function addQuery(url, query) {
    if (!query) { return url; }

    var c = url.indexOf('?');
    if (!(c < 0 && url.indexOf('=') < 0)) {
      query = _.mixin(true, {}, parse(url.substr(c + 1)), query);
      url = url.substr(0, c);
    }

    return url + '?' + stringify(query);
  }

  /**
   * <p>Converts an arbitrary value to a Query String representation.</p>
   *
   * <p>Objects with cyclical references will trigger an exception.</p>
   *
   * @method stringify
   * @param obj {Variant} any arbitrary value to convert to query string
   * @param sep {String} (optional) Character that should join param k=v pairs together. Default: "&"
   * @param eq  {String} (optional) Character that should join keys to their values. Default: "="
   * @param name {String} (optional) Name of the current key, for handling children recursively.
   * @static
   */
  function stringify(obj, sep, eq, name) {
    var stack = [];
    sep = sep || '&';
    eq = eq || '=';

    if (_.isNull(obj) || _.isUndefined(obj) || _.isFunction(obj)) {
      return name ? encodeURIComponent(name) + eq : '';
    }

    if (_.isBool(obj)) {
      obj = obj ? 'true' : 'false';
    }

    if (_.isNumber(obj) || _.isString(obj)) {
      return encodeURIComponent(name) + eq + encodeURIComponent(obj);
    }

    var s;
    if (_.isArray(obj)) {
      s = [];
      s.push(stringify(obj.join(','), sep, eq, name));
      return s.join(sep);
    }

    // Check for cyclical references in nested objects
    for (var i = stack.length - 1; i >= 0; --i) {
      if (stack[i] === obj) {
        $.error('QueryString.stringify. Cyclical reference');
      }
    }

    stack.push(obj);

    s = [];
    var begin = name ? name + '[' : '';
    var end = name ? ']' : '';
    for (var p in obj) {
      if (_.has(obj, p)) {
        var n = begin + p + end;
        s.push(stringify(obj[p], sep, eq, n));
      }
    }

    stack.pop();

    s = s.join(sep);

    if (!s && name) { return name + '='; }

    return s;
  }

  function parse(qs, sep, eq) {
    return _.reduce(_.map(qs.split(sep || '&'), pieceParser(eq || '=')), mergeParams);
  }

  // Parse a key=val string.
  // These can get pretty hairy
  // example flow:
  // parse(foo[bar][][bla]=baz)
  // return parse(foo[bar][][bla],"baz")
  // return parse(foo[bar][], {bla : "baz"})
  // return parse(foo[bar], [{bla:"baz"}])
  // return parse(foo, {bar:[{bla:"baz"}]})
  // return {foo:{bar:[{bla:"baz"}]}}
  function pieceParser(eq) {
    return function parsePiece(key, val) {
      var ret;
      if (arguments.length !== 2) {
        // key=val, called from the map/reduce
        key = key.split(eq);
        return parsePiece(
          unescape(key.shift(), true),
          unescape(key.join(eq), true)
        );
      }

      key = key.replace(/^\s+|\s+$/g, '');
      if (_.isString(val)) {
        val = val.replace(/^\s+|\s+$/g, '');
        // convert numerals to numbers
        if (!isNaN(val)) {
          var numVal = +val;
          if (val === numVal.toString(10)) { val = numVal; }
        }
      }

      var sliced = /(.*)\[([^\]]*)\]$/.exec(key);
      if (!sliced) {
        ret = {};
        if (key) { ret[key] = val; }
        return ret;
      }

      // ["foo[][bar][][baz]", "foo[][bar][]", "baz"]
      var tail = sliced[2], head = sliced[1];

      // array: key[]=val
      if (!tail) {
        return parsePiece(head, [val]);
      }

      // obj: key[subkey]=val
      ret = {};
      ret[tail] = val;

      return parsePiece(head, ret);
    };
  }

  // the reducer function that merges each query piece together into one set of params
  function mergeParams(params, addition) {
    return (
      // if it's uncontested, then just return the addition.
      (!params) ? addition
      // if the existing value is an array, then concat it.
      : (_.isArray(params)) ? params.concat(addition)
      // if the existing value is not an array, and either are not objects, arrayify it.
      : (!_.isObject(params, {}) || !_.isObject(addition, {})) ? [params].concat(addition)
      // else merge them as objects, which is a little more complex
      : mergeObjects(params, addition)
    );
  }

  // Merge two *objects* together. If this is called, we've already ruled
  // out the simple cases, and need to do the for-in business.
  function mergeObjects(params, addition) {
    for (var i in addition) {
      if (i && _.has(addition, i)) {
        params[i] = mergeParams(params[i], addition[i]);
      }
    }

    return params;
  }
})();
