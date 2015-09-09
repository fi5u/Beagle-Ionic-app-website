var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    Grunticon = require('grunticon-lib'),
    browserSync = require('browser-sync').create(),

    paths = {
        sass: './assets/sass',
        css: './assets/css',
        images: './assets/img',
        icons: './assets/img/icons'
    };

gulp.task('sass', function() {
    gulp.src(paths.sass + '/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 3 versions']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.css))
        .pipe(browserSync.stream());
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



gulp.task('watch', ['sass'/*, 'icons'*/], function() {
    browserSync.init({
        server: './',
        browser: ['google chrome'],
        notify: false
    });

    gulp.watch(paths.sass + '/*.scss', ['sass']);
    gulp.watch([paths.images + '/**/*.svg', paths.images + '/icons/_custom-selectors.json'], ['icons']);
    gulp.watch('**/*.html').on('change', browserSync.reload);
});

gulp.task('default', ['watch']);