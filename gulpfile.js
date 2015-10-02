var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('gulp-browserify');
var livereload = require('gulp-livereload');
var rename = require('gulp-rename');

// Basic usage
gulp.task('scripts', function() {
    // Single entry point to browserify
    gulp.src('src/js/app.js')
        .pipe(browserify({
            debug: true,
            transform: [[ {externalHelpers: true}, 'babelify'], 'brfs']
        }).on('error', gutil.log))
        .pipe(rename('bundle.js'))
        .pipe(gulp.dest('./src/'))
        .pipe(livereload());
});

gulp.task('watch', function() {
    gulp.watch(['src/**/*.js', 'src/**/*.html', '!src/bundle.js'], ['scripts']);
});

gulp.task('server', function() {
    require('./test_server');
});

gulp.task('default', ['scripts', 'watch', 'server']);
