'use strict';

const gulp = require('gulp');
const jscs = require('gulp-jscs');
const jshint = require('gulp-jshint');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const less = require('gulp-less');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const glob = require('glob');
const path = require('path');
const minify = require('gulp-minify-css');
const autoprefixer = require('autoprefixer-core');
const postcss = require('gulp-postcss');

gulp.task('javascript', function () {
    // set up common bundle
    const commonLibs = ['jquery'];
    const commonBundle = browserify({noParse: commonLibs})
        .require(commonLibs)
        .bundle()
        .pipe(source('common.js'))
        .pipe(buffer())
        .pipe(gulp.dest('./static/js'));

    // set up page bundles
    const jsSources = glob.sync('./pages/*/page.js');
    for (let i = 0; i < jsSources.length; i++) {
        const b = browserify({
            entries: jsSources[i]
        });

        const pathParse = path.parse(jsSources[i]);
        const pagename = pathParse.dir.substring(pathParse.dir.lastIndexOf('/') + 1);

        b.external(commonLibs);

        b.bundle()
            .pipe(source('page.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./static/js/' + pagename));
    }
});

gulp.task('less', function () {
    return gulp.src(['./pages/common.less', './pages/*/page.less'])
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(postcss([autoprefixer({browsers: ['last 2 versions']})]))
        .pipe(minify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./static/css'));
});

gulp.task('watch', function () {
    gulp.watch(['./pages/common.less', './pages/*/page.less', './components/**/*.less'], ['less']);
    gulp.watch('./pages/*/page.js', ['javascript']);
});

gulp.task('default', ['javascript', 'less', 'watch']);
