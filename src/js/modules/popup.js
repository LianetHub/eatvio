import { bodyLocking } from "./locking.js";

export const popup = () => {

	document.addEventListener('click', (e) => {
		const target = e.target;

		if (target.closest('[data-modal]')) {
			e.preventDefault();




			const targetBtn = target.closest('[data-modal]');
			const popupName = targetBtn.tagName === 'A' && targetBtn.hasAttribute('href')
				? targetBtn.getAttribute('href').replace("#", '')
				: targetBtn.getAttribute('data-href');


			const modal = document.getElementById(popupName);

			if (modal) {
				popupOpen(modal, targetBtn);
			}
		}

		if (target.closest('[data-close-modal]')) {
			e.preventDefault();
			const activePopup = target.closest('.popup');
			if (activePopup) popupClose(activePopup);
		}

		if (target.classList.contains('popup__content')) {
			const activePopup = target.closest('.popup');
			if (activePopup) popupClose(activePopup);
		}
	});

	document.addEventListener('keydown', (e) => {
		const activePopup = document.querySelector('.popup.open');

		if (e.key === "Escape" && activePopup) {
			popupClose(activePopup);
		}

		if (e.key === "Enter" && activePopup) {
			e.preventDefault();
		}
	});

	function popupOpen(modal, modalBtn) {
		const popupActive = document.querySelector('.popup.open');

		if (popupActive) {
			popupClose(popupActive, false);
		} else {
			bodyLocking();
		}

		modal.classList.add('open');
		setAttributes(modal, {
			'aria-hidden': 'false',
			'tabindex': '-1'
		});

		setAttributes(modalBtn, {
			'aria-expanded': 'true',
			'data-modal': 'open'
		});

		modal.dispatchEvent(new CustomEvent('popupOpen', { detail: { modal, modalBtn } }));
	}

	function popupClose(modal, unlockBody = true) {
		const modalBtn = document.querySelector('[data-modal="open"]');

		modal.classList.remove('open');
		setAttributes(modal, {
			'aria-hidden': 'true',
			'tabindex': null
		});

		if (modalBtn) {
			setAttributes(modalBtn, {
				'aria-expanded': 'false',
				'data-modal': ''
			});
		}

		if (unlockBody) {
			bodyLocking();
		}


		modal.dispatchEvent(new CustomEvent('popupClose', { detail: { modal } }));
	}

	function setAttributes(element, attributes) {
		Object.keys(attributes).forEach(key => {
			const value = attributes[key];
			if (value === null) {
				element.removeAttribute(key);
			} else {
				element.setAttribute(key, value);
			}
		});
	}
};
