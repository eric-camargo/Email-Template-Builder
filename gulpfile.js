import browserSync from 'browser-sync'
import log from 'fancy-log'
import gulp from 'gulp'
import changed from 'gulp-changed'
import imagemin from 'gulp-imagemin'
import inlineCss from 'gulp-inline-css'
import pug from 'gulp-pug'
import rename from 'gulp-rename'
import replace from 'gulp-replace'
import gulpSass from 'gulp-sass'
import dartSaas from 'sass'
const sass = gulpSass(dartSaas)
const bs = browserSync.create()

const baseDir = './dist'

gulp.task('compileSass', function () {
  return gulp.src('./src/sass/**/*.scss').pipe(sass().on('error', sass.logError)).pipe(gulp.dest('./src/css'))
})

gulp.task('copyImages', function () {
  var imgSrc = 'src/images/*.+(png|jpg|gif)'
  var imgDst = 'dist/images'
  return gulp.src(imgSrc).pipe(changed(imgDst)).pipe(imagemin()).pipe(gulp.dest(imgDst))
})

gulp.task(
  'build',
  gulp.series('compileSass', 'copyImages', function () {
    return gulp
      .src('./src/emails/**/*.template.pug')
      .pipe(replace(new RegExp('/sass/(.+).scss', 'ig'), '/css/$1.css'))
      .pipe(pug())
      .pipe(inlineCss())
      .pipe(rename({ dirname: '' }))
      .on('end', function () {
        log('Building')
      })
      .pipe(gulp.dest('dist'))
  })
)

gulp.task('browserSync', function (cb) {
  bs.init({
    port: 3009,
    server: {
      baseDir: baseDir,
      directory: true
    }
  })
  cb()
})

gulp.task('reloadBrowserSync', function (cb) {
  bs.reload()
  cb()
})

gulp.task(
  'watch',
  gulp.series('build', 'browserSync', function () {
    return gulp.watch(['./src/**/*', '!./src/**/*.css'], gulp.series('build', 'reloadBrowserSync'))
  })
)
