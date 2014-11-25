var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('gulp-browserify');
var livereload = require('gulp-livereload');

// Basic usage
gulp.task('scripts', function() {
    // Single entry point to browserify
    gulp.src('src/js/app.js')
        .pipe(browserify({
            debug : true,
            transform : ['brfs']
//          shim : {
//            contextMenu : {
//              path : 'bower_components/jQuery-contextMenu/src/jquery.contextMenu.js',
//              exports: 'jQuery.contextMenu',
//              depends: {
//                jquery: 'jQuery',
//              }
//            }
//          }
        }).on('error', gutil.log))
        .pipe(gulp.dest('./src/'))
        .pipe(livereload());
});

gulp.task('watch', function() {
    gulp.watch(['src/**/*.js', 'src/**/*.html', '!src/app.js'], ['scripts']);
});

gulp.task('server', function() {
    // auto run server
    require('./test_server');
});

gulp.task('default', ['scripts', 'watch', 'server']);