'use strict';

const gulp = require('gulp');
const jscs = require('gulp-jscs');
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');
const less = require('gulp-less');
const browserify = require('browserify');
const babelify = require('babelify');
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
    const jsSources = glob.sync('./pages/*/page.js');

    for (let i = 0; i < jsSources.length; i++) {
        const pathParse = path.parse(jsSources[i]);
        const pagename = pathParse.dir.substring(pathParse.dir.lastIndexOf('/') + 1);

        browserify({entries: jsSources[i]})
            .transform(babelify)
            .bundle()
            .pipe(source('page.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(`./static/js/${pagename}`));
    }
});

gulp.task('less', function () {
    return gulp.src(['./pages/*/page.less'])
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(postcss([autoprefixer({browsers: ['last 2 versions']})]))
        .pipe(minify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./static/css'));
});

gulp.task('lint', function () {
    return gulp.src(['./**/*.js', '!./node_modules/**', '!./static/**', '!./**/*.marko.js', '!./vendor/**/*.js', '!./server.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jscs());
});

gulp.task('watch', function () {
    gulp.watch(['./**/*.js', '!./node_modules/**', '!./static/**', '!./**/*.marko.js', '!./vendor/**/*.js', '!./server.js'], ['lint']);
    gulp.watch(['./pages/common.less', './pages/*/page.less', './components/**/*.less'], ['less']);
    gulp.watch('./pages/*/page.js', ['javascript']);
});

gulp.task('default', ['lint', 'javascript', 'less', 'watch']);
