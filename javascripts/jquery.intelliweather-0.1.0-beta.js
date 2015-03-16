/*!
 * IntelliWeather.js 0.1.0-beta
 * http://www.intelliweather.com
 * Copyright 2014 IntelliWeather, Inc.
 */

(function($) {
    var _ = function() {
        "use strict";
        return {
            extend: $.extend,
            expandUrl: function(url, dictionary) {
                for (var key in dictionary) {
                    url = url.replace("{" + key + "}", dictionary[key]);
                }
                return url;
            },
            isNull: function(obj) {
                return obj === null;
            },
            isUndefined: function(obj) {
                return typeof obj === "undefined";
            },
            isFunction: $.isFunction,
            isObject: $.isPlainObject,
            isBool: function(obj) {
                return typeof obj === "boolean";
            },
            isNumber: function(obj) {
                return typeof obj === "number";
            },
            isString: function(obj) {
                return typeof obj === "string";
            },
            isArray: $.isArray,
            has: function(obj, key) {
                return obj != null && Object.prototype.hasOwnProperty.call(obj, key);
            },
            padZeroes: function(str) {
                str = str.toString();
                while (str.length < 2) {
                    str = "0" + str;
                }
                return str;
            },
            toAbbRelativeTime: function(milliseconds) {
                var secs = Math.abs(milliseconds / 1e3);
                var days = Math.floor(secs / (3600 * 24));
                secs %= 3600 * 24;
                var hrs = Math.floor(secs / 3600);
                secs %= 3600;
                var mns = Math.floor(secs / 60);
                secs %= 60;
                return this.padZeroes(days) + "d " + this.padZeroes(hrs) + "h " + this.padZeroes(mns) + "m" + (milliseconds < 0 ? " ago" : " from now");
            }
        };
    }();
    var css = function() {
        "use strict";
        return {
            iwTopBar: {
                fontFamily: '"Tahoma", "Century Gothic", "Helvetica Neue", Helvetica, Arial',
                fontSize: "12px",
                fontWeight: "bold",
                width: "100%",
                zIndex: "100",
                position: "absolute",
                top: "0px",
                padding: "8px",
                paddingBottom: "0px",
                color: "white",
                textShadow: "-1px 1px 5px #000, 1px -1px 5px #000"
            },
            iwTime: {
                position: "absolute",
                top: "8px",
                right: "23px"
            },
            iwControls: {
                paddingTop: "8px",
                textAlign: "center",
                fontSize: "16px",
                textShadow: "2px 2px 6px black"
            },
            iwPrevious: {
                cursor: "pointer",
                padding: "8px",
                paddingLeft: "20px",
                paddingRight: "50px"
            },
            iwNext: {
                cursor: "pointer",
                padding: "8px",
                paddingLeft: "50px",
                paddingRight: "20px"
            },
            iwPausePlay: {
                cursor: "pointer",
                padding: "8px",
                paddingLeft: "50px",
                paddingRight: "50px"
            },
            overlay: {
                position: "fixed",
                zIndex: "500",
                top: "0px",
                left: "0px",
                height: "100%",
                width: "100%",
                background: "#000",
                display: "none"
            },
            modal: {
                display: "none",
                position: "fixed",
                opacity: "0",
                zIndex: "11000",
                left: "50%"
            }
        };
    }();
    var html = function() {
        "use strict";
        return {
            topBar: '<div class="iw-topbar"></div>',
            seriesTitle: '<span class="iw-title"></span>',
            subTitle: '<span class="iw-subtitle"></span>',
            labelFrame: '<span class="iw-frame-index"></span>',
            labelTime: '<span class="iw-time"></span>',
            controls: '<div class="iw-controls"></div>',
            previousControl: '<i class="iw-prev fa fa-backward fa-2x"></i>',
            pausePlayControl: '<i class="iw-pauseplay fa fa-pause fa-2x"></i>',
            nextControl: '<i class="iw-next fa fa-forward fa-2x"></i>',
            overlay: '<div id="overlay"></div>'
        };
    }();
    var Modal = function() {
        "use strict";
        function Modal(o) {
            var that = this;
            this.settings = _.extend({}, this._defaults, o);
            this.$overlay = $(html.overlay).css(css.overlay);
            $("body").append(this.$overlay);
            this.$anchor = this.settings.anchor;
            this.$anchor.click(function(e) {
                that._anchorClicked(this, e);
                e.preventDefault();
            });
            this.listeners = {};
        }
        _.extend(Modal.prototype, {
            _fire: function fire(event, modal) {
                if (typeof event == "string") {
                    event = {
                        type: event
                    };
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
                $(modalId).css({
                    display: "none"
                });
            },
            _anchorClicked: function anchorClicked(anchor, e) {
                var modalId = $(anchor).attr("href"), that = this;
                this.$overlay.click(function() {
                    that._close(modalId);
                });
                var $modal = $(modalId);
                var height = $modal.outerHeight();
                var width = $modal.outerWidth();
                this.$overlay.css({
                    display: "block",
                    opacity: 0
                });
                this.$overlay.fadeTo(200, this.settings.overlay);
                $modal.css(_.extend({}, css.modal, {
                    display: "block",
                    marginLeft: -(width / 2) + "px",
                    top: this.settings.top + "px"
                }));
                $modal.fadeTo(200, 1);
                this._fire("onComplete", $modal);
            },
            _defaults: {
                top: 100,
                overlay: .5
            },
            addListener: function addListener(type, context, listener) {
                if (typeof this.listeners[type] == "undefined") {
                    this.listeners[type] = [];
                }
                this.listeners[type].push({
                    context: context,
                    callback: listener
                });
            }
        });
        return Modal;
    }();
    var Slider = function() {
        "use strict";
        function Slider(o) {
            this.settings = _.extend({}, this._defaults, o);
            this.$container = this.settings.container;
            this.slides = this.$container.find("img");
            this.currentSlide = 0;
            this.timer = 0;
            this.listeners = {};
            this.state = "paused";
            this._setupControls();
            this.currentSlide = this.settings.startSlide;
            if (this.settings.startSlide < 0 || this.settings.startSlide >= this.slides.length) {
                this.currentSlide = 0;
            }
            $(this.slides[this.currentSlide]).css({
                display: "block"
            });
        }
        _.extend(Slider.prototype, {
            _setupControls: function setupControls() {
                if (this.slides.length > 1 && this.settings.controlArea && this.$container.find(this.settings.controlArea).length) {
                    this.$controls = $(html.controls).css(css.iwControls);
                    this.$previousControl = $(html.previousControl).css(css.iwPrevious).appendTo(this.$controls);
                    this.$pausePlayControl = $(html.pausePlayControl).css(css.iwPausePlay).appendTo(this.$controls);
                    this.$nextControl = $(html.nextControl).css(css.iwNext).appendTo(this.$controls);
                    var that = this;
                    this.$previousControl.click(function() {
                        that.pause();
                        that.prev();
                    });
                    this.$pausePlayControl.click(function() {
                        if (that.state == "paused") {
                            that.play();
                        } else {
                            that.pause();
                        }
                    });
                    this.$nextControl.click(function() {
                        that.pause();
                        that.next();
                    });
                    this.$container.find(this.settings.controlArea).append(this.$controls);
                }
            },
            _fire: function fire(event, element) {
                if (typeof event == "string") {
                    event = {
                        type: event
                    };
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
                        listener.callback.call(listener.context, element);
                    }
                }
            },
            _doTimer: function doTimer() {
                if (this.settings.pauseTime && this.settings.pauseTime > 0) {
                    clearTimeout(this.timer);
                    var that = this;
                    this.timer = setTimeout(function() {
                        that.next();
                    }, this.settings.pauseTime);
                }
            },
            _defaults: {
                pauseTime: 700,
                pauseOnHover: true,
                startSlide: 0
            },
            destroy: function destroy() {
                clearTimeout(this.timer);
            },
            prev: function prev() {
                this.currentSlide--;
                if (this.currentSlide < 0) {
                    this.currentSlide = this.slides.length - 1;
                }
                this.slides.css({
                    display: "none"
                });
                var $slide = $(this.slides[this.currentSlide]);
                $slide.css({
                    display: "block"
                });
                this._fire("slideChanged", $slide);
                if (this.state === "play") {
                    this._doTimer();
                }
            },
            next: function next() {
                this.currentSlide++;
                if (this.currentSlide >= this.slides.length) {
                    this.currentSlide = 0;
                }
                this.slides.css({
                    display: "none"
                });
                var $slide = $(this.slides[this.currentSlide]);
                $slide.css({
                    display: "block"
                });
                this._fire("slideChanged", $slide);
                if (this.state === "play") {
                    this._doTimer();
                }
            },
            pause: function pause() {
                if (this.state === "play" && this.slides.length > 1) {
                    clearTimeout(this.timer);
                    this.state = "paused";
                    this.$pausePlayControl.removeClass("fa-pause");
                    this.$pausePlayControl.addClass("fa-play");
                }
            },
            play: function play() {
                if (this.state === "paused" && this.slides.length > 1) {
                    this.state = "play";
                    this.$pausePlayControl.removeClass("fa-play");
                    this.$pausePlayControl.addClass("fa-pause");
                    this._doTimer();
                }
            },
            addListener: function addListener(type, context, listener) {
                if (typeof this.listeners[type] == "undefined") {
                    this.listeners[type] = [];
                }
                this.listeners[type].push({
                    context: context,
                    callback: listener
                });
            }
        });
        return Slider;
    }();
    var queryString = function() {
        "use strict";
        return {
            unescape: unescape,
            escape: escape,
            addQuery: addQuery
        };
        function unescape(str, decodeSpaces) {
            return decodeURIComponent(decodeSpaces ? str.replace(/\+/g, " ") : str);
        }
        function escape(str) {
            return encodeURIComponent(str);
        }
        function addQuery(url, query) {
            if (!query) {
                return url;
            }
            var c = url.indexOf("?");
            if (!(c < 0 && url.indexOf("=") < 0)) {
                query = _.mixin(true, {}, parse(url.substr(c + 1)), query);
                url = url.substr(0, c);
            }
            return url + "?" + stringify(query);
        }
        function stringify(obj, sep, eq, name) {
            var stack = [];
            sep = sep || "&";
            eq = eq || "=";
            if (_.isNull(obj) || _.isUndefined(obj) || _.isFunction(obj)) {
                return name ? encodeURIComponent(name) + eq : "";
            }
            if (_.isBool(obj)) {
                obj = obj ? "true" : "false";
            }
            if (_.isNumber(obj) || _.isString(obj)) {
                return encodeURIComponent(name) + eq + encodeURIComponent(obj);
            }
            var s;
            if (_.isArray(obj)) {
                s = [];
                s.push(stringify(obj.join(","), sep, eq, name));
                return s.join(sep);
            }
            for (var i = stack.length - 1; i >= 0; --i) {
                if (stack[i] === obj) {
                    $.error("QueryString.stringify. Cyclical reference");
                }
            }
            stack.push(obj);
            s = [];
            var begin = name ? name + "[" : "";
            var end = name ? "]" : "";
            for (var p in obj) {
                if (_.has(obj, p)) {
                    var n = begin + p + end;
                    s.push(stringify(obj[p], sep, eq, n));
                }
            }
            stack.pop();
            s = s.join(sep);
            if (!s && name) {
                return name + "=";
            }
            return s;
        }
        function parse(qs, sep, eq) {
            return _.reduce(_.map(qs.split(sep || "&"), pieceParser(eq || "=")), mergeParams);
        }
        function pieceParser(eq) {
            return function parsePiece(key, val) {
                var ret;
                if (arguments.length !== 2) {
                    key = key.split(eq);
                    return parsePiece(unescape(key.shift(), true), unescape(key.join(eq), true));
                }
                key = key.replace(/^\s+|\s+$/g, "");
                if (_.isString(val)) {
                    val = val.replace(/^\s+|\s+$/g, "");
                    if (!isNaN(val)) {
                        var numVal = +val;
                        if (val === numVal.toString(10)) {
                            val = numVal;
                        }
                    }
                }
                var sliced = /(.*)\[([^\]]*)\]$/.exec(key);
                if (!sliced) {
                    ret = {};
                    if (key) {
                        ret[key] = val;
                    }
                    return ret;
                }
                var tail = sliced[2], head = sliced[1];
                if (!tail) {
                    return parsePiece(head, [ val ]);
                }
                ret = {};
                ret[tail] = val;
                return parsePiece(head, ret);
            };
        }
        function mergeParams(params, addition) {
            return !params ? addition : _.isArray(params) ? params.concat(addition) : !_.isObject(params, {}) || !_.isObject(addition, {}) ? [ params ].concat(addition) : mergeObjects(params, addition);
        }
        function mergeObjects(params, addition) {
            for (var i in addition) {
                if (i && _.has(addition, i)) {
                    params[i] = mergeParams(params[i], addition[i]);
                }
            }
            return params;
        }
    }();
    var Poller = function() {
        "use strict";
        var that = this;
        function Poller(descriptor) {
            this.descriptor = descriptor;
            this.listeners = {};
        }
        _.extend(Poller.prototype, {
            _error: function error() {},
            _schedule: function schedule() {
                if (this.descriptor.poll && (new Date() - this.startedPollAt) / 1e3 < this.descriptor.pollDuration) {
                    var closure = this;
                    setTimeout(function() {
                        closure.start();
                    }, this.descriptor.pollInterval * 1e3);
                }
            },
            _fire: function fire(event, dataset) {
                if (typeof event == "string") {
                    event = {
                        type: event
                    };
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
                        listener.callback.call(listener.context, dataset);
                    }
                }
            },
            _datasetChanged: function datasetChanged(newDataset) {
                var oldDataset = this.dataset;
                this.dataset = newDataset;
                var identical = oldDataset != null;
                if (identical) {
                    identical = newDataset.length == oldDataset.length;
                }
                if (newDataset.length > 0) {
                    if (identical) {
                        identical = newDataset[0].id == oldDataset[0].id;
                    }
                    if (identical) {
                        identical = newDataset[newDataset.length - 1].id == oldDataset[oldDataset.length - 1].id;
                    }
                }
                if (!identical) {
                    return true;
                }
                return false;
            },
            _success: function success(dataset) {
                if (this._datasetChanged(dataset)) {
                    this._fire("datasetChanged", dataset);
                }
                this._schedule();
            },
            _buildDataset: function buildDataset(channelMeta) {
                var dataset = {
                    description: channelMeta.description || "",
                    width: channelMeta.width || 640,
                    height: channelMeta.height || 480,
                    format: channelMeta.format || "jpg"
                };
                var count = 0, key = channelMeta.batch === true ? channelMeta.lastSequence : channelMeta.last, images = [];
                if (this.descriptor.series) {
                    count = this.descriptor.seriesLength || channelMeta.maxItems || that.descriptor.defaultSequenceLength;
                } else {
                    count = 1;
                }
                while (images.length < count) {
                    var image = {
                        id: key
                    };
                    _.extend(image, channelMeta.images[key]);
                    images.push(image);
                    key--;
                }
                images.reverse();
                dataset.images = images;
                return dataset;
            },
            _getChannelMeta: function getChannelMeta() {
                var url = "https://s3-us-west-1.amazonaws.com/iw-metadata/channels/{channel}.js";
                url = _.expandUrl(url, this.descriptor);
                return $.ajax(url, {
                    type: "GET",
                    dataType: "json",
                    cache: false,
                    context: this
                });
            },
            start: function start() {
                this.startedPollAt = new Date();
                this._getChannelMeta().pipe(this._buildDataset).done(this._success).fail(this._error);
            },
            addListener: function addListener(type, context, listener) {
                if (typeof this.listeners[type] == "undefined") {
                    this.listeners[type] = [];
                }
                this.listeners[type].push({
                    context: context,
                    callback: listener
                });
            }
        });
        return Poller;
    }();
    var IntelliWeather = function() {
        "use strict";
        function IntelliWeather(o) {
            o = o || {};
            this.$container = o.container;
            this.descriptor = _.extend({}, this._defaults, o.descriptor);
            this.$images = [];
            this.slider = null;
            this.$container.css({
                width: this.descriptor.displayWidth,
                height: this.descriptor.displayHeight
            });
            var poller = new Poller(this.descriptor);
            poller.addListener("datasetChanged", this, this._render);
            poller.start();
        }
        _.extend(IntelliWeather.prototype, {
            _modalCompleted: function modalCompleted(modal) {
                var descriptor = _.extend({}, this.descriptor.expand);
                modal.intelliWeather({
                    local: descriptor
                });
            },
            _formatTimestamp: function formatTimestamp(timeStamp) {
                var month = _.padZeroes(timeStamp.getMonth() + 1);
                var day = _.padZeroes(timeStamp.getDate());
                var year = timeStamp.getFullYear();
                var hours = _.padZeroes(timeStamp.getHours());
                var minutes = _.padZeroes(timeStamp.getMinutes());
                return month + "/" + day + "/" + year + " " + hours + ":" + minutes + " " + this.descriptor.timeZone.toUpperCase();
            },
            _updateTopBar: function updateTopBar(image) {
                var dateUtc = image.data("timestamp") || "";
                this.$seriesTitle.text(this.dataset.description || "");
                this.$subTitle.text(" - " + _.toAbbRelativeTime(dateUtc - Date.now()));
                this.$labelFrame.text(" " + _.padZeroes(image.data("index") + 1) + " of " + this.dataset.images.length + "");
                this.$labelTime.html(this._formatTimestamp(image.data("timestamp")));
            },
            _renderImages: function renderImages(dataset) {
                var that = this;
                $.each(dataset.images, function(index, image) {
                    var $image = that.$images[image.id];
                    if (that.descriptor.series && dataset.images.length > 1) {
                        that.$container.append($image);
                    } else {
                        var $modal = $("<div></div>").attr("id", "modal-" + image.id).css(_.extend({}, css.modal, {
                            width: that.descriptor.expand.displayWidth,
                            height: that.descriptor.expand.displayHeight
                        }));
                        $modal.addClass("iw");
                        $("body").append($modal);
                        var $anchor = $("<a></a>").attr("href", "#modal-" + image.id);
                        $anchor.append($image);
                        that.$container.append($anchor);
                        var modal = new Modal({
                            anchor: $anchor,
                            top: 200
                        });
                        modal.addListener("onComplete", that, that._modalCompleted);
                    }
                });
            },
            _renderTopBar: function renderTopBar() {
                if (this.descriptor.series) {
                    this.$topbar = $(html.topBar).css(css.iwTopBar);
                    this.$seriesTitle = $(html.seriesTitle).appendTo(this.$topbar);
                    this.$subTitle = $(html.subTitle).appendTo(this.$topbar);
                    this.$labelFrame = $(html.labelFrame).appendTo(this.$topbar);
                    this.$labelTime = $(html.labelTime).appendTo(this.$topbar).css(css.iwTime);
                    this.$container.append(this.$topbar);
                    var $firstImage = this.$images[this.dataset.images[0].id];
                    this._updateTopBar($firstImage);
                }
            },
            _preloadImages: function preloadImages(imagePath, dataset) {
                var d = $.Deferred(), loaders = [], that = this;
                $.each(dataset.images, function(index, image) {
                    var src = _.expandUrl(imagePath, _.extend(that.descriptor, dataset, image));
                    var d = $.Deferred();
                    var $img = $("<img />").attr("id", image.id).attr("src", src);
                    $img.data("index", index);
                    $img.data("timestamp", new Date(image.time));
                    $img.css({
                        display: "none"
                    });
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
                var imagePath = queryString.addQuery(this.descriptor.imagePath, _.extend({}, this.descriptor.commands, {
                    width: width,
                    height: height
                }));
                this._preloadImages(imagePath, dataset).done(function() {
                    this._renderTopBar();
                    this._renderImages(dataset);
                    this.slider = new Slider({
                        container: this.$container,
                        controlArea: ".iw-topbar"
                    });
                    this.slider.addListener("slideChanged", this, this._updateTopBar);
                    this.slider.play();
                });
            },
            _defaults: {
                imageHost: "https://gfx1.intelliweather.net",
                imagePath: "{imageHost}/c/{channel}/{id}.{format}",
                defaultSequenceLength: 12,
                pollInterval: 60,
                pollDuration: 60 * 10,
                poll: true
            },
            destroy: function destroy() {
                this.$container.empty();
                this.dataset = null;
                this.$images = [];
                if (this.slider) {
                    this.slider.destroy();
                    this.slider = null;
                }
            }
        });
        return IntelliWeather;
    }();
    (function() {
        "use strict";
        var dataKey = "iw", methods;
        methods = {
            initialize: function initialize(o) {
                var $container = $(this);
                return this.each(attach);
                function fail() {
                    console.log("failed retrieving the remote descriptor");
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
                            type: "GET",
                            dataType: "json",
                            context: this
                        }).done(handleRemoteResponse);
                    } else {
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
})(window.jQuery);