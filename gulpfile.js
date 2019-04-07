var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cssnano     = require('gulp-cssnano');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var cp          = require('child_process');

var messages = {
  jekyllDev: 'Running: $ jekyll build for dev',
  jekyllProd: 'Running: $ jekyll build for prod'
};

gulp.task('jekyll-dev', function (done) {
  browserSync.notify(messages.jekyllDev);
  return cp.spawn('jekyll', ['build', '--drafts', '--config', '_config.yml,_config_dev.yml'], {stdio: 'inherit'})
 .on('close', done);
});

gulp.task('jekyll-rebuild', ['jekyll-dev'], function () {
  browserSync.reload();
});

gulp.task('browser-sync', ['sass', 'scripts', 'jekyll-dev'], function() {
  browserSync.init({
    server: "_site",
    port: 1234
  });
});

gulp.task('sass', function () {
  return gulp.src('_sass/kruspanek.scss')
  .pipe(sass({
    includePaths: ['scss'],
    onError: browserSync.notify
  }))
  .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
  .pipe(gulp.dest('_site/assets/css'))
  .pipe(browserSync.reload({stream:true}))
  .pipe(gulp.dest('css'));
});

gulp.task('scripts', function() {
  return gulp.src(['_js/*.js'])
  .pipe(concat('kruspanek.js'))
  .pipe(gulp.dest('_site/assets/js'))
  .pipe(browserSync.reload({stream:true}))
  .pipe(gulp.dest('js'));
});

gulp.task('watch', function () {
  gulp.watch(['_sass/**/*.scss','_sass/*.scss'], ['sass']);
  gulp.watch(['_js/**/*.js'], ['scripts']);
  gulp.watch(['index.html', '_layouts/*.html', '_posts/*', '_includes/*.html', '_drafts/*', '_photogalleries/*', '**/*.html'], ['jekyll-rebuild']);
});

gulp.task('jekyll-prod', function (done) {
  browserSync.notify(messages.jekyllProd);
  return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
  .on('close', done);
});

gulp.task('default', ['browser-sync', 'watch']);
gulp.task('build', ['jekyll-prod']);