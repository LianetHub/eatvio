import { bodyLocking } from "./locking.js";

export const popup = () => {


	document.addEventListener('click', (e) => {

		const target = e.target;

		if (target.closest('[data-modal]')) {
			const targetBtn = target.closest('[data-modal]');
			const popupName = targetBtn.getAttribute('href').replace("#", '');
			const modal = document.getElementById(popupName);
			if (modal) {
				popupOpen(modal, targetBtn);
			}
			e.preventDefault();

		}

		if (target.closest('[data-close-modal]')) {
			popupClose(target.closest('.popup'));
			e.preventDefault();
		}

		if (target.classList.contains('popup__content')) {
			popupClose(target.closest('.popup'));
		}

	});

	function popupOpen(modal, modalBtn) {
		const popupActive = document.querySelector('.popup.open');
		if (popupActive) {
			popupClose(popupActive);
		} else {
			bodyLocking();
		}
		modal.classList.add('open');
		modal.setAttribute('aria-hidden', false);
		modal.setAttribute('tabindex', '-1');
		modalBtn.setAttribute('aria-expanded', false);
		modalBtn.setAttribute('data-modal', 'open');
	}

	function popupClose(popupActive) {

		const modalBtn = document.querySelector('[data-modal="open"]');

		popupActive.classList.remove('open');
		popupActive.removeAttribute('tabindex');
		popupActive.setAttribute('aria-hidden', true);

		modalBtn.setAttribute('aria-expanded', true);
		modalBtn.setAttribute('data-modal', '');

		bodyLocking();
	}


	document.addEventListener('keydown', function (e) {
		if (e.key === "Escape") {
			const popupActive = document.querySelector('.popup.open');
			if (popupActive) {
				popupClose(popupActive);
			}
		}
		if (e.key === "Enter") {
			const popupActive = document.querySelector('.popup.open');
			if (popupActive) {
				e.preventDefault()
			}
		}
	});
}

