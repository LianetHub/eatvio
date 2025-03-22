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
});