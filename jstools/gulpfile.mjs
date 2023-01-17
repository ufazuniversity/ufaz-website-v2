import gulp from "gulp";
import postcss from "gulp-postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import rev from "gulp-rev";
import rollup from "rollup-stream";
import path from "path";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import { fileURLToPath } from "url";
import { deleteAsync } from "del";
import merge from "gulp-merge-json";
import jeditor from "gulp-json-editor";

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

gulp.task("clean", () => {
  return deleteAsync(BUILD_DIR, { force: true });
});

/* Process specified css stylesheets */
gulp.task("css", () => {
  const plugins = [tailwindcss, autoprefixer, cssnano];

  return gulp
    .src(STYLESHEETS, { root: "../" })
    .pipe(postcss(plugins))
    .pipe(rev())
    .pipe(gulp.dest(CSS_DEST_DIR))
    .pipe(rev.manifest(MANIFEST_FILENAME))
    .pipe(gulp.dest(CSS_DEST_DIR));
});

function js(done) {
  const tasks = SCRIPTS.map((script) => {
    script = `${BASE_DIR}${script}`;
    let filename = path.basename(script);

    function bundleJS() {
      return rollup({
        input: script,
        format: "es",
      })
        .pipe(source(filename))
        .pipe(buffer())
        .pipe(rev())
        .pipe(gulp.dest(JS_DEST_DIR))
        .pipe(rev.manifest(MANIFEST_FILENAME))
        .pipe(gulp.dest(JS_DEST_DIR));
    }
    bundleJS.displayName = `bundle_${filename}`;
    return bundleJS;
  });

  return gulp.parallel(...tasks, (parallelDone) => {
    parallelDone();
    done();
  })();
}

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

gulp.task("singleManifest", () => {
  return gulp
    .src("/**/manifest.json", { root: BUILD_DIR })
    .pipe(merge({ fileName: MANIFEST_FILENAME }))
    .pipe(jeditor(normalizeManifest))
    .pipe(gulp.dest(BUILD_DIR));
});

gulp.task("build", gulp.series(gulp.parallel(js, "css"), "singleManifest"));
gulp.task("default", gulp.series("clean", "build"));
