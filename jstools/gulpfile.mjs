import gulp from "gulp";
import postcss from "gulp-postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import rev from "gulp-rev";
import rollupEach from "gulp-rollup-each";
import path from "path";
import { fileURLToPath } from "url";
import { deleteAsync } from "del";
import merge from "gulp-merge-json";
import jeditor from "gulp-json-editor";
import atImport from "postcss-import";
import assets from "postcss-assets";

const __filename = fileURLToPath(import.meta.url);
const BASE_DIR = path.dirname(path.dirname(__filename));
const PROJECT_DIR = path.join(BASE_DIR, "website");
const BUILD_DIR = `${PROJECT_DIR}/static/dist`;
const CSS_DEST_DIR = `${BUILD_DIR}/css`;
const JS_DEST_DIR = `${BUILD_DIR}/js`;
const MANIFEST_FILENAME = "manifest.json";

const STYLESHEETS = ["/website/static/css/base.css"];

// Should be relative to the PROJECT_DIR
const SCRIPTS = ["/website/static/js/base.js"];

/* Process specified css stylesheets */

const postcss_plugins = [assets, atImport, tailwindcss, autoprefixer, cssnano];

gulp.task("css", () => {
  return gulp
    .src(STYLESHEETS, { root: BASE_DIR })
    .pipe(postcss(postcss_plugins))
    .pipe(rev())
    .pipe(gulp.dest(CSS_DEST_DIR))
    .pipe(rev.manifest(MANIFEST_FILENAME))
    .pipe(gulp.dest(CSS_DEST_DIR));
});

gulp.task("cleanCSS", () => {
  return deleteAsync(CSS_DEST_DIR, { force: true });
});

gulp.task("js", () => {
  return gulp
    .src(SCRIPTS, { root: BASE_DIR })
    .pipe(
      rollupEach({
        output: {
          format: "es",
        },
      })
    )
    .pipe(rev())
    .pipe(gulp.dest(JS_DEST_DIR))
    .pipe(rev.manifest(MANIFEST_FILENAME))
    .pipe(gulp.dest(JS_DEST_DIR));
});

gulp.task("cleanJS", () => {
  return deleteAsync(JS_DEST_DIR, { force: true });
});

gulp.task("clean", gulp.series("cleanCSS", "cleanJS"));

function normalizeManifest(data) {
  let ret = {};
  for (let [key, val] of Object.entries(data)) {
    let tokens = key.split(".");
    let assetType = tokens.pop();
    key = tokens.join();
    if (!ret.hasOwnProperty(key)) {
      ret[key] = {};
    }
    ret[key][assetType] = val;
  }
  return ret;
}

gulp.task("manifest", () => {
  return gulp
    .src("/{css,js}/manifest.json", { root: BUILD_DIR })
    .pipe(merge({ fileName: MANIFEST_FILENAME }))
    .pipe(jeditor(normalizeManifest))
    .pipe(gulp.dest(BUILD_DIR));
});

gulp.task(
  "build",
  gulp.series("clean", gulp.parallel("css", "js"), "manifest")
);
gulp.task("default", gulp.series("build"));

gulp.task("watchCSS", () => {
  gulp.watch(
    ["../**/static/css/**/*.css", "../**/*.html"],
    gulp.series("cleanCSS", "css", "manifest")
  );
});

gulp.task("watchJS", () => {
  gulp.watch(
    "../**/static/js/**/*.js",
    gulp.series(gulp.series("cleanJS", "js"), "manifest")
  );
});

gulp.task("watch", gulp.parallel("watchCSS", "watchJS"));
