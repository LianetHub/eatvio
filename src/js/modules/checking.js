export const checking = () => {

    const checkingItems = document.querySelectorAll('[data-checking-item]');

    if (!checkingItems.length > 0) return;

    const checkingLabel = document.querySelector('[data-checking-value]');
    checkingLabel.innerHTML = getCheckQuantity();

    function getCheckQuantity() {
        let checking = 0;

        checkingItems.forEach(checkingItem => {
            if (checkingItem.checked) {
                checking++
            }

        });

        return checking;
    }

    checkingItems.forEach(checkingItem => {
        checkingItem.addEventListener('change', () => {
            checkingLabel.innerHTML = getCheckQuantity();
        })

    });



}