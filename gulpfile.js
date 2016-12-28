var gulp = require('gulp'),
	sass = require('gulp-ruby-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	cssnano = require('gulp-cssnano'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	notify = require('gulp-notify'),
	cache = require('gulp-cache'),
	livereload = require('gulp-livereload'),
	del = require('del');

var directory = {
		build: {
			css: 'build/css',
			js: 'build/js',
		},
		dist: {
			css: 'dist/css',
			js: 'dist/js'
		},
		sassfile: 'src/sass/app.scss',
		jsfile: 'src/js/**/*.js',
	},
	name = "jquery.wizardry";

/*
| # Scss
|
| The sass files to be converted as css
| and saved to different folders.
|
| @run  gulp sass
|
*/
gulp.task('sass', function () {
	return sass(directory.sassfile, { style: 'expanded' })
		.pipe(rename(name+".css"))
		.pipe(autoprefixer('last 2 version'))
		.pipe(gulp.dest(directory.dist.css))
		.pipe(rename({suffix: '.min'}))
		.pipe(cssnano())
		.pipe(gulp.dest(directory.dist.css))
		.pipe(notify({ message: 'Completed compiling SASS Files' }));
});

/*
| # Scripts
|
| The js files to be concatinated
| and saved to different folders.
|
| @run  gulp scripts
|
*/
gulp.task('scripts', function () {
	return gulp.src([directory.jsfile])
		.pipe(concat(name+".js"))
		.pipe(gulp.dest(directory.dist.js))
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest(directory.dist.js))
		.pipe(notify({ message: 'Completed compiling JS Files' }));
});

/*
| # Clean
|
| @run  gulp clean
*/
gulp.task('clean', function () {
	return del(['sass', 'scripts']);
});

/*
| # Default Task
|
| @run  gulp default
*/
gulp.task('default', ['clean'], function () {
	gulp.start('sass', 'scripts');
});

/*
| # Watcher
|
| @run  gulp watch
*/
gulp.task('watch', function () {
	// Watch .scss files
	gulp.watch('src/sass/**/*.scss', ['sass']);
	// Watch .js files
	gulp.watch('src/js/**/*.js', ['scripts']);
});