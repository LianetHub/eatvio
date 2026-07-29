import { Datepicker } from 'vanillajs-datepicker';
import ru from 'vanillajs-datepicker/locales/ru';

Object.assign(Datepicker.locales, ru);

const DEFAULT_OPTIONS = {
	language: 'ru',
	format: 'dd.mm.yyyy',
	autohide: true,
	todayHighlight: true,
	weekStart: 1,
};

/**
 * Creates a Datepicker instance on the given input.
 * @param {HTMLInputElement} el
 * @param {object} [options]
 * @returns {Datepicker}
 */
export function createDatepicker(el, options = {}) {
	if (!el || el._datepicker) return el?._datepicker;

	const instance = new Datepicker(el, {
		...DEFAULT_OPTIONS,
		...options,
	});
	el._datepicker = instance;
	return instance;
}

/**
 * Initializes all `input.date` fields (skips `[data-datepicker-manual]`).
 */
export function datepicker() {
	document.querySelectorAll('input.date:not([data-datepicker-manual])').forEach((el) => {
		createDatepicker(el);
	});
}

export { Datepicker };
