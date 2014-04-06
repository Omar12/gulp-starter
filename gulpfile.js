"use strict";

var gulp         = require('gulp'),
    gutil        = require('gulp-util'),
    compass      = require('gulp-compass'),
    refresh      = require('gulp-livereload'),
    prefix       = require('gulp-autoprefixer'),
    minify       = require('gulp-minify-css'),
    imagemin     = require('gulp-imagemin'),
    uglify       = require('gulp-uglify'),
    clean        = require('gulp-rimraf'),
    tinylr       = require('tiny-lr'),
    express      = require('express'),
    path         = require('path'),
    processhtml  = require('processhtml'),
    info         = require('./package.json'),
    lr;

// Configuration

var Config = {
  port: 8080,
  livereload_port: 35729,
  images: {
    compression: 3,
    progressive: true,
    interlaced: true
  }
}

// Paths

var paths = {
  app:   {
    root:   './app',
    js:     './app/js',
    scss:   './app/scss',
    css:    './app/css',
    images: './app/img',
    lib:    './app/lib'
  },
  build: {
    root:   './build',
    js:     './build/js',
    css:    './build/css',
    images: './build/img',
    lib:    './build/js/lib.js'
  }
}

// Tasks

gulp.task('styles', function(){
  return gulp.src(paths.app.scss + '/**/*.scss')
    .pipe(compass({
      config_file: './config.rb',
      css: paths.app.css,
      sass: paths.app.scss
    }))
    // .pipe(prefix('last 2 version', '> 5%', 'safari 5', 'ie 8', 'ie 7', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest(paths.app.css));
});

gulp.task('server', function(){
  var server = express()
    .use(express.static(path.resolve(paths.app.root)))
    .listen(Config.port);
  gutil.log('Server listening on port', Config.port);
});

gulp.task('livereload', function(){
  lr = tinylr();
  lr.listen(Config.livereload_port, function(err) {
    if(err) gutil.log('Livereload error:', err);
  })
});

gulp.task('watch', function(){
  gulp.watch(paths.app.scss + '/**/*.scss', ['styles']);
  gulp.watch([paths.app.css + '/**/*', paths.app.root + '/**/*.html'], function(evt){
    refresh(lr).changed(evt.path);
  })
});

gulp.task('clean', function(){
  gulp.src([ paths.build.root + '/**/*', paths.build.root + '/*' ], { read: false })
    .pipe(clean());
});

gulp.task('build', ['clean'], function(){

  // Scripts
  gulp.src(paths.app.js + '/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(paths.build.js));

  // Styles
  gulp.src(paths.app.scss + '/**/*.scss')
    .pipe(compass({
      config_file: './config.rb',
      css: paths.app.css,
      sass: paths.app.scss
    }))
    // .pipe(prefix('last 2 version', '> 5%', 'safari 5', 'ie 8', 'ie 7', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(minify())
    .pipe(gulp.dest(paths.build.css));

  // Images
  gulp.src(paths.app.images + '/**/*')
    .pipe(imagemin({ optimizationLevel: Config.images.compression, progressive: Config.images.progressive, interlaced: Config.images.interlaced }))
    .pipe(gulp.dest(paths.build.images));

  // Libraries
  gulp.src(paths.app.lib + '/**/*.js')
    .pipe(uglyfy())
    .pipe(gulp.dest(paths.build.lib));

  // HTML files
  gulp.src(paths.app.root + '/**/*.html')
    .pipe(gulp.dest(paths.build.root));

});

gulp.task('default', ['server', 'livereload', 'styles', 'watch']);
