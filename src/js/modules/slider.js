export const slider = () => {

    const slider = document.querySelector(".announcement__carousel");

    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener("pointerdown", (e) => {
        isDown = true;
        slider.classList.add("active");
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener("pointerleave", () => {
        isDown = false;
        slider.classList.remove("active");
    });
    slider.addEventListener("pointerup", () => {
        isDown = false;
        slider.classList.remove("active");
    });
    slider.addEventListener("pointermove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; //scroll-fast
        slider.scrollLeft = scrollLeft - walk;
        // console.log(walk);
    });
}

