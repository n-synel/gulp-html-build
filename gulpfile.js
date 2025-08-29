const gulp = require('gulp');
const gulpClean = require('gulp-clean');
const gulpIf = require('gulp-if');
const sass = require('gulp-sass')(require('sass'));
const prefix = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const dotenv = require('dotenv');
const bSync = require('browser-sync');

// Загружаем переменные среды
const dotenvConfig = dotenv.config();

if (dotenvConfig.error) {
    throw dotenvConfig.error;
}

// Check mode
let isProd = process.env.MODE == 'production' ? true : false;

// HTML
function html() {
    return gulp.src('./src/*.html')
        .pipe(gulp.dest('./dist/'))
        .pipe(bSync.stream());
}

// SCSS
function scss() {
    return gulp.src('./src/scss/**/*.scss')
        .pipe(gulpIf(!isProd, sourcemaps.init()))
        .pipe(gulpIf(isProd, prefix()))
        .pipe(sass({ style: 'compressed' }).on('error', sass.logError))
        .pipe(gulpIf(!isProd, sourcemaps.write()))
        .pipe(gulp.dest('./dist/assets/css/'))
        .pipe(bSync.stream());
}

// Images
function images() {
    return gulp.src('./src/img/**/*.{jpg,png,svg}')
        .pipe(gulp.dest('./dist/assets/img/'));
}

// Fonts
function fonts() {
    return gulp.src('./src/fonts/*.{woff2,woff}', { encoding: false })
        .pipe(gulp.dest('./dist/assets/fonts/'));
}

// Scripts
function scripts() {
    return gulp.src('./src/js/**/*.js')
        .pipe(gulp.dest('./dist/assets/js/'))
        .pipe(bSync.stream());
}

// Delete folder ./dist
function clean() {
    return gulp.src('./dist/', { read: false, allowEmpty: true })
        .pipe(gulpClean());
}

// Watcher
function watcher() {
    gulp.watch('./src/*.html', gulp.series(html));
    gulp.watch('./src/scss/**/*.scss', gulp.series(scss));
    gulp.watch('./src/img/**/*.{jpg,png,svg}', gulp.series(images));
    gulp.watch('./src/fonts/*.{woff2,woff}', gulp.series(fonts));
    gulp.watch('./src/js/*.js', gulp.series(scripts));
}

// Local Server
function serv() {
    bSync.init({
        notify: false,
        ui: false,
        open: false,
        server: {
            baseDir: './dist/'
        },
        port: 5500
    });
}

// Exports
exports.clean = clean;
exports.dev = gulp.series(clean, html, scss, images, scripts, fonts, gulp.parallel(watcher, serv));