document.addEventListener("DOMContentLoaded", function () {

    if (document.querySelector('.content__nav')) {
        getMobileSlider('.content__nav', {
            slidesPerView: "auto",
            spaceBetween: 12,
        })
    }


    function getMobileSlider(sliderName, options) {

        let init = false;
        let swiper = null;

        function getSwiper() {
            if (window.innerWidth <= 767.98) {
                if (!init) {
                    init = true;
                    swiper = new Swiper(sliderName, options);
                }
            } else if (init) {
                swiper.destroy();
                swiper = null;
                init = false;
            }
        }
        getSwiper();
        window.addEventListener("resize", getSwiper);
    }



    document.querySelectorAll('.autocomplete-block')?.forEach(block => {
        const input = block.querySelector('.autocomplete-block__input');

        const list = block.querySelector('.autocomplete-block__list');
        console.log(block);


        const items = Array.from(block.querySelectorAll('.autocomplete-block__list-item'));

        const notFoundEl = document.createElement('div');
        notFoundEl.className = 'autocomplete-block__not-found hidden';
        notFoundEl.textContent = 'Ничего не найдено';
        list.appendChild(notFoundEl);

        items.forEach(item => {
            item.dataset.originalText = item.textContent.trim();
        });

        input.addEventListener('focus', function () {
            block.classList.add('focused');
            input.dispatchEvent(new Event('input'));
        });

        input.addEventListener('input', function () {
            const value = input.value.trim().toLowerCase();
            let visibleCount = 0;

            items.forEach(function (item) {
                const originalText = item.dataset.originalText;
                const lowerText = originalText.toLowerCase();

                if (value && lowerText.includes(value)) {
                    const start = lowerText.indexOf(value);
                    const end = start + value.length;

                    const highlighted =
                        originalText.slice(0, start) +
                        '<mark>' + originalText.slice(start, end) + '</mark>' +
                        originalText.slice(end);

                    item.innerHTML = highlighted;
                    item.classList.remove('hidden');
                    visibleCount++;
                } else if (!value) {
                    item.innerHTML = originalText;
                    item.classList.remove('hidden');
                    visibleCount++;
                } else {
                    item.classList.add('hidden');
                }
            });

            if (visibleCount === 0) {
                notFoundEl.classList.remove('hidden');
            } else {
                notFoundEl.classList.add('hidden');
            }
        });

        document.addEventListener('click', function (e) {
            if (!block.contains(e.target)) {
                block.classList.remove('focused');
            }
        });

        items.forEach(function (item) {
            item.addEventListener('click', function () {
                input.value = item.dataset.originalText;
                block.classList.remove('focused');
            });
        });
    });


    const headerContainer = document.querySelector('.header__container');
    const headerLogin = document.querySelector('.header__login');
    const body = document.body;

    if (headerContainer && headerLogin) {
        headerContainer.addEventListener('click', (event) => {
            const target = event.target.closest('a, button');

            if (target && target.classList.contains('header__action--login')) {
                event.preventDefault();
                headerLogin.classList.add('active');
                body.classList.add('open-login-form');
                return;
            }

            if (target && target.classList.contains('header__login-close')) {
                event.preventDefault();
                headerLogin.classList.remove('active');
                body.classList.remove('open-login-form');
                return;
            }
        });


        headerLogin.addEventListener('click', (event) => {

            if (event.target.classList.contains('.header__login.active')) {

                headerLogin.classList.remove('active');
                body.classList.remove('open-login-form');
            }
        });

        document.addEventListener('click', (event) => {
            const loginButton = document.querySelector('.header__action--login');
            if (
                headerLogin.classList.contains('active') &&
                !headerLogin.contains(event.target) &&
                !loginButton.contains(event.target)
            ) {
                headerLogin.classList.remove('active');
                body.classList.remove('open-login-form');
            }
        });
    }



});