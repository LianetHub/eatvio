import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import rename from 'gulp-rename';

import cleanCss from 'gulp-clean-css';
import webpcss from 'gulp-webpcss';
import autoprefixer from 'gulp-autoprefixer';
import groupCssMediaQueries from 'gulp-group-css-media-queries';
import shorthand from 'gulp-shorthand';
import postcss from 'gulp-postcss';
import tailwindcss from 'tailwindcss';
import fs from 'fs';
import path from 'path';
import merge from 'merge-stream';


const sass = gulpSass(dartSass);



export const scss = () => {

    if (app.isDev) {
        return app.gulp.src(app.path.src.scssDev, { sourcemaps: true })
            .pipe(app.plugins.plumber(
                app.plugins.notify.onError({
                    title: "SCSS",
                    message: "Error: <%= error.message %>"
                })
            ))
            .pipe(sass({ outputStyle: 'expanded' }))
            .pipe(autoprefixer({
                grid: true,
                overrideBrowserslist: ['last 3 versions'],
                cascade: true
            }))
            .pipe(app.plugins.replace(/@img\//g, '../img/'))
            .pipe(app.gulp.dest(app.path.build.css))
            .pipe(app.plugins.browsersync.stream());
    }

    const scssDir = path.dirname(app.path.src.scss);
    let scssFiles = [];

    if (fs.existsSync(scssDir)) {
        scssFiles = fs.readdirSync(scssDir).filter(file => file.endsWith('.scss'));
    }

    if (scssFiles.length === 0) {
        console.log('Нет SCSS файлов для обработки.');
        return;
    }

    const streams = scssFiles.map(() => {
        return app.gulp.src(app.path.src.scss, { sourcemaps: app.isDev })
            .pipe(app.plugins.plumber(
                app.plugins.notify.onError({
                    title: "SCSS",
                    message: "Error: <%= error.message %>"
                })
            ))
            .pipe(sass({ outputStyle: 'expanded' }))
            .pipe(
                app.plugins.if(
                    app.isBuild,
                    groupCssMediaQueries()
                )
            )
            .pipe(
                app.plugins.if(
                    app.isBuild,
                    autoprefixer({
                        grid: true,
                        overrideBrowserslist: ['last 3 versions'],
                        cascade: true
                    })
                )
            )
            .pipe(app.plugins.replace(/@img\//g, '../img/'))
            .pipe(app.gulp.dest(app.path.build.css))
            .pipe(
                app.plugins.if(
                    app.isBuild,
                    cleanCss()
                )
            )
            .pipe(rename({ extname: ".min.css" }))
            .pipe(app.gulp.dest(app.path.build.css))
            .pipe(app.plugins.browsersync.stream());
    });

    return merge(streams);
};

export const articlesScss = () => {
    return app.gulp.src(app.path.src.articlesScss, { sourcemaps: app.isDev })
        .pipe(app.plugins.plumber(
            app.plugins.notify.onError({
                title: "SCSS",
                message: "Error: <%= error.message %>"
            })
        ))
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(
            app.plugins.if(
                app.isBuild,
                groupCssMediaQueries()
            )
        )
        .pipe(
            app.plugins.if(
                app.isBuild,
                autoprefixer({
                    grid: true,
                    overrideBrowserslist: ['last 3 versions'],
                    cascade: true
                })
            )
        )
        .pipe(app.plugins.replace(/@img\//g, '../../img/'))
        .pipe(app.gulp.dest(app.path.build.css))
        .pipe(
            app.plugins.if(
                app.isBuild,
                cleanCss()
            )
        )
        .pipe(rename({ extname: ".min.css" }))
        .pipe(app.gulp.dest(app.path.build.articlesCss))
        .pipe(app.plugins.browsersync.stream());
};




export const normalize = () => {
    return app.gulp.src(app.path.src.normalize, { sourcemaps: app.isDev })
        .pipe(app.plugins.plumber(
            app.plugins.notify.onError({
                title: "SCSS RESET",
                message: "Error: <%= error.message %>"
            }))
        )
        .pipe(app.plugins.replace(/@img\//g, '../img/'))
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(
            app.plugins.if(
                app.isBuild,
                autoprefixer({
                    grid: true,
                    overrideBrowserslist: ['last 3 versions'],
                    cascade: true
                })
            )
        )
        .pipe(
            app.plugins.if(
                app.isBuild,
                shorthand()
            )
        )
        .pipe(app.gulp.dest(app.path.build.normalize))
        .pipe(
            app.plugins.if(
                app.isBuild,
                cleanCss()
            )
        )
        .pipe(rename({
            extname: ".min.css"
        }))
        .pipe(app.gulp.dest(app.path.build.normalize))
        .pipe(app.plugins.browsersync.stream());
}

export const tailwindTask = () => {
    return app.gulp.src(app.path.src.tailwind, { sourcemaps: app.isDev })
        .pipe(app.plugins.plumber(
            app.plugins.notify.onError({
                title: "SCSS Tailwind Error",
                message: "Error: <%= error.message %>"
            }))
        )
        .pipe(postcss([
            tailwindcss,
            autoprefixer
        ]))
        .pipe(app.gulp.dest(app.path.build.css))
        .pipe(
            app.plugins.if(
                app.isBuild,
                cleanCss()
            )
        )
        .pipe(rename({
            extname: ".min.css"
        }))
        .pipe(app.gulp.dest(app.path.build.css))
        .pipe(app.plugins.browsersync.stream());
}