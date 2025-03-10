import fileinclude from "gulp-file-include";
import htmlBeautify from "gulp-html-beautify";


export const html = () => {
    return app.gulp
        .src(app.path.src.html)
        .pipe(
            app.plugins.if(
                app.isBuild,
                htmlBeautify({
                    indent_size: 4,
                    indent_with_tabs: false,
                    preserve_newlines: false,
                    max_preserve_newlines: 0,
                    wrap_line_length: 0,
                    end_with_newline: true
                })
            )
        )
        .pipe(
            app.plugins.plumber(
                app.plugins.notify.onError({
                    title: "HTML",
                    message: "Error: <%= error.message %>",
                })
            )
        )
        .pipe(fileinclude())
        .pipe(app.plugins.replace(/@img\//g, "img/"))
        .pipe(app.gulp.dest(app.path.build.html))
        .pipe(app.plugins.browsersync.stream());
};

export const articlesHtml = () => {
    return app.gulp
        .src(app.path.src.articlesHtml)
        .pipe(
            app.plugins.if(
                app.isBuild,
                htmlBeautify({
                    indent_size: 4,
                    indent_with_tabs: false,
                    preserve_newlines: false,
                    max_preserve_newlines: 0,
                    wrap_line_length: 0,
                    end_with_newline: true
                })
            )
        )
        .pipe(
            app.plugins.plumber(
                app.plugins.notify.onError({
                    title: "Articles HTML",
                    message: "Error: <%= error.message %>",
                })
            )
        )
        .pipe(fileinclude())
        .pipe(app.plugins.replace(/@img\//g, "../img/"))
        .pipe(app.gulp.dest(app.path.build.articles))
        .pipe(app.plugins.browsersync.stream());
};
