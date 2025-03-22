import * as nodePath from 'path';
const rootFolder = nodePath.basename(nodePath.resolve());

const buildFolder = `./${rootFolder}`;
const srcFolder = `./src`;

export const path = {
	build: {
		files: `${buildFolder}/files/`,
		html: `${buildFolder}/`,
		css: `${buildFolder}/css/`,
		normalize: `${buildFolder}/css/`,
		js: `${buildFolder}/js/`,
		images: `${buildFolder}/img/`,
		fonts: `${buildFolder}/fonts/`,
		json: `${buildFolder}/json/`,
		php: `${buildFolder}/`,

		articles: `${buildFolder}/articles/`,
		articlesCss: `${buildFolder}/articles/css/`,
		articlesJs: `${buildFolder}/articles/js/`,
		articlesImages: `${buildFolder}/articles/img/`,
		articlesFonts: `${buildFolder}/articles/fonts/`,
	},
	src: {
		files: `${srcFolder}/files/**/*.*`,
		html: `${srcFolder}/*.html`,
		scssDev: `${srcFolder}/scss/dev.scss`,
		scss: `${srcFolder}/scss/pages/*.scss`,
		tailwind: `${srcFolder}/scss/tailwind.css`,
		normalize: `${srcFolder}/scss/reset.scss`,
		js: `${srcFolder}/js/app.js`,
		images: `${srcFolder}/img/**/*.{jpg,jpeg,png,gif,webp}`,
		svg: `${srcFolder}/img/**/*.svg`,
		json: `${srcFolder}/json/*.*`,
		php: `${srcFolder}/*.php`,

		articlesHtml: `${srcFolder}/articles/*.html`,
		articlesScss: `${srcFolder}/articles/scss/style.scss`,
		articlesJs: `${srcFolder}/articles/js/app.js`,
		articlesImages: `${srcFolder}/articles/img/**/*.{jpg,jpeg,png,svg,gif,webp}`,
	},
	watch: {
		files: `${srcFolder}/files/**/*.*`,
		html: `${srcFolder}/**/*.html`,
		scss: `${srcFolder}/scss/**/*.scss`,
		normalize: `${srcFolder}/scss/reset.scss`,
		js: `${srcFolder}/js/**/*.js`,
		images: `${srcFolder}/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}`,
		json: `${srcFolder}/json/*.*`,
		php: `${srcFolder}/**/*.php`,

		articlesHtml: `${srcFolder}/articles/**/*.html`,
		articlesCss: `${srcFolder}/articles/scss/**/*.scss`,
		articlesJs: `${srcFolder}/articles/js/**/*.js`,
		articlesImages: `${srcFolder}/articles/img/**/*.{jpg,jpeg,png,svg,gif,webp}`,

	},
	clean: buildFolder,
	srcFolder: srcFolder,
	rootFolder: rootFolder,
	ftp: ``
};
