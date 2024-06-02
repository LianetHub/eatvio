export const formSubmit = () => {


	const forms = document.querySelectorAll('form');

	forms.forEach(form => {
		form.addEventListener('submit', formSend);
	})

	async function formSend(e) {
		const form = e.target;
		e.preventDefault();

		let formData = new FormData(form);

		for (let [name, value] of formData) {
			console.log(`${name} = ${value}`);
		}

		let xhr = new XMLHttpRequest();

		xhr.open('POST', 'sendmail.php', true);
		xhr.send(formData);

		form.reset();
	}







}
