export const maxlength = () => {

    const maxlengthItems = document.querySelectorAll('[data-maxlength]');

    if (!maxlengthItems.length > 0) return;

    maxlengthItems.forEach(maxlengthItem => {
        const maxlengthValue = maxlengthItem.getAttribute("maxlength");
        const quantityBlock = document.getElementById(maxlengthItem.dataset.maxlength);
        const current = quantityBlock.querySelector('.label__quantity-current');
        const total = quantityBlock.querySelector('.label__quantity-total');

        total.innerHTML = maxlengthValue;

        maxlengthItem.addEventListener('input', (e) => {
            current.innerHTML = e.target.value.length;
            e.target.value.slice(0, maxlengthValue);
        });
    })

}