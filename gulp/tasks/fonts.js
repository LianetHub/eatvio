import fs from "fs";
import fonter from "gulp-fonter";
import ttf2woff2 from "gulp-ttf2woff2";

export const otf2ttf = () => {
    return app.gulp
        .src(`${app.path.srcFolder}/fonts/*.otf`, {})
        .pipe(
            app.plugins.plumber(
                app.plugins.notify.onError({
                    title: "FONTS",
                    message: "Error: <%= error.message %>",
                })
            )
        )
        .pipe(
            fonter({
                formats: ["ttf"],
            })
        )
        .pipe(app.gulp.dest(`${app.path.srcFolder}/fonts/`));
};

export const articleOtf2ttf = () => {
    return app.gulp
        .src(`${app.path.srcFolder}/articles/fonts/*.otf`, {})
        .pipe(
            app.plugins.plumber(
                app.plugins.notify.onError({
                    title: "FONTS",
                    message: "Error: <%= error.message %>",
                })
            )
        )
        .pipe(
            fonter({
                formats: ["ttf"],
            })
        )
        .pipe(app.gulp.dest(`${app.path.srcFolder}/articles/fonts/`));
};

export const ttfToWoff = () => {
    return app.gulp
        .src(`${app.path.srcFolder}/fonts/*.ttf`, {})
        .pipe(
            app.plugins.plumber(
                app.plugins.notify.onError({
                    title: "FONTS",
                    message: "Error: <%= error.message %>",
                })
            )
        )
        .pipe(
            fonter({
                formats: ["woff"],
            })
        )
        .pipe(app.gulp.dest(`${app.path.build.fonts}`))
        .pipe(app.gulp.src(`${app.path.srcFolder}/fonts/*.ttf`))
        .pipe(ttf2woff2())
        .pipe(app.gulp.dest(`${app.path.build.fonts}`));
};

export const articleTtfToWoff = () => {
    return app.gulp
        .src(`${app.path.srcFolder}/articles/fonts/*.ttf`, {})
        .pipe(
            app.plugins.plumber(
                app.plugins.notify.onError({
                    title: "FONTS",
                    message: "Error: <%= error.message %>",
                })
            )
        )
        .pipe(
            fonter({
                formats: ["woff"],
            })
        )
        .pipe(app.gulp.dest(`${app.path.build.articlesFonts}`))
        .pipe(app.gulp.src(`${app.path.srcFolder}/articles/fonts/*.ttf`))
        .pipe(ttf2woff2())
        .pipe(app.gulp.dest(`${app.path.build.articlesFonts}`));
};

export const copyWoff = () => {
    return app.gulp
        .src(`${app.path.srcFolder}/fonts/*.woff`)
        .pipe(app.gulp.dest(`${app.path.build.fonts}`))
        .pipe(app.gulp.src(`${app.path.srcFolder}/fonts/*.woff2`))
        .pipe(app.gulp.dest(`${app.path.build.fonts}`));
};

export const fontsStyle = () => {
    let fontsFile = `${app.path.srcFolder}/scss/fonts.scss`;

    fs.readdir(app.path.build.fonts, function (err, fontsFiles) {
        if (fontsFiles) {
            if (!fs.existsSync(fontsFile)) {
                fs.writeFile(fontsFile, "", cb);
                let newFileOnly;

                for (let i = 0; i < fontsFiles.length; i++) {
                    let fontFileName = fontsFiles[i].split(".")[0];
                    if (newFileOnly !== fontFileName) {
                        let fontName = fontFileName.split("-")[0]
                            ? fontFileName.split("-")[0]
                            : fontFileName;
                        let fontWeight = fontFileName.split("-")[1]
                            ? fontFileName.split("-")[1]
                            : fontFileName;
                        if (fontWeight.toLowerCase() === "thin") {
                            fontWeight = 100;
                        } else if (fontWeight.toLowerCase() === "extralight") {
                            fontWeight = 200;
                        } else if (fontWeight.toLowerCase() === "light") {
                            fontWeight = 300;
                        } else if (fontWeight.toLowerCase() === "book") {
                            fontWeight = 350;
                        } else if (fontWeight.toLowerCase() === "medium") {
                            fontWeight = 500;
                        } else if (fontWeight.toLowerCase() === "semibold" ||
                            fontWeight.toLowerCase() === "demi") {
                            fontWeight = 600;
                        } else if (fontWeight.toLowerCase() === "bold") {
                            fontWeight = 700;
                        } else if (
                            fontWeight.toLowerCase() === "extrabold" ||
                            fontWeight.toLowerCase() === "heavy"
                        ) {
                            fontWeight = 800;
                        } else if (fontWeight.toLowerCase() === "black") {
                            fontWeight = 900;
                        } else {
                            fontWeight = 400;
                        }
                        fs.appendFile(
                            fontsFile,
                            `@font-face {
                                font-family: ${fontName};
                                font-display: swap;
                                src: url("../fonts/${fontFileName}.woff") format("woff"), url("../fonts/${fontFileName}.woff2") format("woff2");
                                font-weight: ${fontWeight};
                                font-style: normal;
                            }\r\n`,
                            cb
                        );
                        newFileOnly = fontFileName;
                    }
                }
            } else {
                console.log(
                    "Файл scss/fonts.scss уже существует. Для обновления его нужно удалить!"
                );
            }
        }
    });

    return app.gulp.src(`${app.path.srcFolder}`);
    function cb() { }
};

export const articlesFonts = () => {
    let fontsFile = `${app.path.srcFolder}/articles/scss/fonts.scss`;

    fs.readdir(app.path.build.articlesFonts, function (err, fontsFiles) {
        if (fontsFiles) {
            if (!fs.existsSync(fontsFile)) {
                fs.writeFile(fontsFile, "", cb);
                let newFileOnly;

                for (let i = 0; i < fontsFiles.length; i++) {
                    let fontFileName = fontsFiles[i].split(".")[0];
                    if (newFileOnly !== fontFileName) {
                        let fontName = fontFileName.split("-")[0]
                            ? fontFileName.split("-")[0]
                            : fontFileName;
                        let fontWeight = fontFileName.split("-")[1]
                            ? fontFileName.split("-")[1]
                            : fontFileName;
                        if (fontWeight.toLowerCase() === "thin") {
                            fontWeight = 100;
                        } else if (fontWeight.toLowerCase() === "extralight") {
                            fontWeight = 200;
                        } else if (fontWeight.toLowerCase() === "light") {
                            fontWeight = 300;
                        } else if (fontWeight.toLowerCase() === "book") {
                            fontWeight = 350;
                        } else if (fontWeight.toLowerCase() === "medium") {
                            fontWeight = 500;
                        } else if (fontWeight.toLowerCase() === "semibold" ||
                            fontWeight.toLowerCase() === "demi") {
                            fontWeight = 600;
                        } else if (fontWeight.toLowerCase() === "bold") {
                            fontWeight = 700;
                        } else if (
                            fontWeight.toLowerCase() === "extrabold" ||
                            fontWeight.toLowerCase() === "heavy"
                        ) {
                            fontWeight = 800;
                        } else if (fontWeight.toLowerCase() === "black") {
                            fontWeight = 900;
                        } else {
                            fontWeight = 400;
                        }
                        fs.appendFile(
                            fontsFile,
                            `@font-face {
                                font-family: ${fontName};
                                font-display: swap;
                                src: url("../fonts/${fontFileName}.woff") format("woff"), url("../fonts/${fontFileName}.woff2") format("woff2");
                                font-weight: ${fontWeight};
                                font-style: normal;
                            }\r\n`,
                            cb
                        );
                        newFileOnly = fontFileName;
                    }
                }
            } else {
                console.log(
                    "Файл articles/scss/fonts.scss уже существует. Для обновления его нужно удалить!"
                );
            }
        }
    });

    return app.gulp.src(`${app.path.srcFolder}/articles/`);
    function cb() { }
};
