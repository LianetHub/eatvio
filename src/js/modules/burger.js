export const burger = () => {

	const iconMenu = document.querySelector('.icon-menu');
	const menuBody = document.querySelector('.header__menu');

	if (iconMenu) {
		iconMenu.addEventListener("click", function (e) {
			document.body.classList.toggle("lock");
			iconMenu.classList.toggle("active");
			menuBody.classList.toggle("active");

		});
	}


}


