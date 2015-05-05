var browserSync = require('browser-sync'),
    concat      = require('gulp-concat'),
    del         = require('del'),
    footer      = require('gulp-footer'),
    gulp        = require('gulp'),
    header      = require('gulp-header'),
    jshint      = require('gulp-jshint'),
    pkg         = require('./package.json'),
    reload      = browserSync.reload,
    rename      = require('gulp-rename'),
    uglify      = require('gulp-uglifyjs');

var baseDir = './';
var buildDir = baseDir + 'build';
var distDir = buildDir + '/dist';

var banner = [
  '/*!',
  ' * <%= name %> <%= version %>',
  ' * <%= homePage %>',
  ' * Copyright 2014 <%= author %>',
  ' */\n\n'
].join('\n');

var bundle = [
  'src/utils.js',
  'src/css.js',
  'src/html.js',
  'src/modal.js',
  'src/carousel.js',
  'src/timezone.js',
  'src/query_string.js',
  'src/poller.js',
  'src/intelliweather.js',
  'src/plugin.js'
];

gulp.task('watch', function() {
  gulp.watch(['src/*.js'], ['build', function() {
    return gulp.src(['build/jquery.intelliweather.js'])
               .pipe(reload({stream:true}));
  }]);

  gulp.watch(['test/index.html', 'test/**/*.css', 'test/**/*.js'], function() {
    return gulp.src(['test/index.html', 'test/**/*.css', 'test/**/*.js'])
               .pipe(reload({stream:true}));
  });
});

gulp.task('server', function() {
  browserSync({
    server: {
      baseDir: baseDir,
      directory: true,
      https: true
    }
  });
});

gulp.task('dev', ['server', 'watch']);

gulp.task('dist', ['build'], function() {
  return gulp.src(buildDir + '/jquery.intelliweather.js')
             .pipe(rename('jquery.intelliweather-' + pkg.version + '.js'))
             .pipe(gulp.dest(distDir))
             .pipe(uglify())
             .pipe(rename('jquery.intelliweather-' + pkg.version + '.min.js'))
             .pipe(header(banner, {
               name: pkg.name,
               version: pkg.version,
               homePage: pkg.author.url,
               author: pkg.author.name
             }))
             .pipe(gulp.dest(distDir));
});

gulp.task('build', ['clean', 'lint'], function() {
  return gulp.src(bundle)
             .pipe(concat('jquery.intelliweather.js'))
             .pipe(header('(function($) {'))
             .pipe(footer('})(window.jQuery);'))
             .pipe(uglify({
               mangle: false,
               compress: false,
               output: {
                 beautify: true
               }
             }))
             .pipe(header(banner, {
               name: pkg.name,
               version: pkg.version,
               homePage: pkg.author.url,
               author: pkg.author.name
             }))
             .pipe(gulp.dest(buildDir));
});

gulp.task('lint', function() {
  return gulp.src(['gulpfile.js', 'src/*.js'])
             .pipe(jshint())
             .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('clean', function(cb) {
  del([buildDir], cb);
});

gulp.task('default', ['build', 'dist']);
