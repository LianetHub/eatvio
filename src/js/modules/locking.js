const body = document.body;

export function bodyLocking(lockClass) {
    let className = lockClass ? lockClass : "lock";
    let lockPaddingValue = body.classList.contains(className)
        ? "0px"
        : window.innerWidth -
        document.querySelector(".wrapper").offsetWidth +
        "px";
    body.style.setProperty('--lock-padding', lockPaddingValue);
    body.classList.toggle(className);
}
