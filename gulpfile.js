var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    minifyCss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    Grunticon = require('grunticon-lib'),
    q = require('q'),
    fs = require('fs'),
    path = require('path'),
    browserSync = require('browser-sync').create(),
    del = require('del'),
    fs = require('fs-extra'),
    htmlreplace = require('gulp-html-replace'),

    paths = {
        sass: './assets/sass',
        css: './assets/css',
        js: './assets/js',
        images: './assets/img',
        icons: './assets/img/icons',
        dist: './dist'
    };

gulp.task('sass', function() {
    gulp.src(paths.sass + '/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 3 versions']
        }))
        .pipe(minifyCss())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.css))
        .pipe(browserSync.stream());
});

gulp.task('jsVendor', function() {
    gulp.src(paths.js + '/vendor/*.js')
        .pipe(concat('vendors.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.js));
});

gulp.task('icons', function() {
    var deferred = q.defer(),
        iconDir = paths.images + '/',
        options = { enhanceSVG: true, customselectors: require(paths.images + '/icons/_custom-selectors.json') };

        var files = fs.readdirSync(iconDir).map(function (fileName) {
            return path.join(iconDir, fileName);
        });

        var grunticon = new Grunticon(files, paths.images + '/icons', options);

        grunticon.process(function () {
            deferred.resolve();
        });

        return deferred.promise;
});

gulp.task('cleanBuild', function() {
    return del([paths.dist + '/**/*']);
});


gulp.task('watch', ['sass', 'jsVendor', 'icons'], function() {
    browserSync.init({
        server: './',
        browser: ['google chrome'],
        notify: false
    });

    gulp.watch(paths.sass + '/**/*.scss', ['sass']);
    gulp.watch(paths.js + '/vendor/*', ['jsVendor']);
    gulp.watch([paths.images + '/**/*.svg', paths.images + '/icons/_custom-selectors.json'], ['icons']);
    gulp.watch('**/*.html').on('change', browserSync.reload);
});

gulp.task('build', ['cleanBuild'], function() {
    fs.copy('./apple-touch-icon.png', paths.dist + '/apple-touch-icon.png', function () {});
    fs.copy('./favicon.icns', paths.dist + '/favicon.icns', function () {});
    fs.copy('./favicon.ico', paths.dist + '/favicon.ico', function () {});
    fs.copy(paths.images, paths.dist + '/assets/img', function () {});
    fs.copy(paths.js + '/vendors.min.js', paths.dist + '/assets/js/vendors.min.js', function () {});
    fs.copy(paths.css + '/style.css', paths.dist + '/assets/css/style.css', function () {});

    gulp.src('./index.html')
        .pipe(htmlreplace({
            'bs': ''
        }))
        .pipe(gulp.dest(paths.dist));
});

gulp.task('default', ['watch']);