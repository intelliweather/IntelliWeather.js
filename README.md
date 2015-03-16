
intelliweather.js
=================

Created by [IntelliWeather], intelliweather.js is a flexible JavaScript library
that provides a strong foundation for building robust satellite radar web pages, 
by talking to the IntelliWeather Image API.

<!-- section links -->

[IntelliWeather]: http://www.intelliweather.com/

Usage
-----

The plugin needs a container to build it's UI within.

```html
<div class="iw"></div>
```

Then at the bottom in a script element, use jQuery to find your container
element and then call intelliWeather on it, passing in a descriptor. View
[test/fixtures/descriptors.js][descriptor-examples] for example descriptors.

```javascript
$('.iw').intelliWeather({
  local: {
    channel: 1
  }
});
```

[descriptor-examples]: https://github.com/intelliweather/IntelliWeather.js/blob/master/test/fixtures/descriptors.js

You can also download a descriptor using an id for the descriptor.

```javascript
$('.iw').intelliWeather({
  remote: 'https://gfx1.intelliweather.net/api/descriptors/{descriptor-id}'
});
```

Versioning
----------

For transparency and insight into our release cycle, releases will be numbered
with the following format:

`<major>.<minor>.<patch>`

And constructed with the following guidelines:

* Breaking backwards compatibility bumps the major
* New additions without breaking backwards compatibility bumps the minor
* Bug fixes and misc changes bump the patch

For more information on semantic versioning, please visit http://semver.org/.

Developers
-----------

The dev environment uses the [node.js] platform. In order to build and test
intelliweather.js, you'll need to install its dev dependencies by running
(`$ npm install`). Below is an overview of the available Gulp tasks that'll be
useful in development.

* `gulp build`
 - Builds *intelliweather.js* from source.
* `gulp clean`
 - Cleans the build artifacts.
* `gulp lint`
 - Runs source and test files through JSHint.
* `gulp watch`
 - Rebuilds *intelliweather.js* whenever a source file is modified.
* `gulp server`
 - Serves files from the root of intelliweather.js on localhost:3000. Useful for
   using *test/index.html* for debugging/testing.
* `gulp dev`
 - Runs `gulp watch` and `gulp server` in parallel.

<!-- section links -->

[node.js]: http://nodejs.org/
[gulp]: https://github.com/gulpjs/gulp/

Testing
-------

The only tests available is an integration testing page, run (`$ gulp dev`) and 
a browser window will launch. After, it launches, navigate to the 
[integration test page][integration].

<!-- section links -->

[integration]: https://localhost:3000/test/index.html

License
-------

Copyright 2014 IntelliWeather, Inc.
