import gulp from "gulp";
import postcss from "gulp-postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import rev from "gulp-rev";


const BUILD_DIR = '../static/dist'

gulp.task("css", () => {
  const stylesheets = ["/website/static/css/base.css"];
  const plugins = [tailwindcss, autoprefixer, cssnano];
  const dest = BUILD_DIR + '/css'

  return gulp
    .src(stylesheets, { root: "../" })
    .pipe(postcss(plugins))
    .pipe(rev())
    .pipe(gulp.dest(dest))
    .pipe(rev.manifest())
    .pipe(gulp.dest(dest));
});

gulp.task("default", gulp.series("css"));
