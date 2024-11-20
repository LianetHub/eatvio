"use strict";

import * as devFunctions from "./modules/functions.js";

document.addEventListener("DOMContentLoaded", () => {
    devFunctions.popup();
    devFunctions.initTooltips();
    devFunctions.maxlength();
    devFunctions.checking();
    devFunctions.slider();
    devFunctions.burger();
    devFunctions.fixedTable();
    devFunctions.slide();
    devFunctions.spollers();
    devFunctions.tabs();


    document.addEventListener('click', (e) => {


        if (e.target.classList.contains('header__user-btn')) {
            e.target.classList.toggle('active');
            e.target.nextElementSibling?.classList.toggle('active');
        }

        if (e.target.classList.contains('header__notification-btn')) {
            e.preventDefault()
            e.target.classList.toggle('active');
            e.target.nextElementSibling?.classList.toggle('active');
        }

        if (e.target.classList.contains('announcement__actions-btn') || e.target.classList.contains('chat__actions-btn')) {
            e.target.classList.toggle('active');
            e.target.nextElementSibling?.classList.toggle('active');
        }

        if (e.target.classList.contains('spoller-mobile')) {
            e.target.classList.toggle('active');
            e.target.nextElementSibling?.classList.toggle('active');
        }


        if (e.target.closest('.chat__contacts-item')) {

            let currentIndexChat = getIndexInParent(e.target.closest('.chat__contacts-item'));

            hideCurrentChat();

            document.querySelectorAll('.chat__contacts-item')[currentIndexChat].classList.add('active');
            document.querySelectorAll('.chat__block')[currentIndexChat].classList.add('active');
            document.querySelector('.chat__container').classList.add('active');

        }

        if (e.target.classList.contains('chat__back')) {
            document.querySelector('.chat__container').classList.remove('active');
            hideCurrentChat()
        }

        if (e.target.classList.contains('diary__product-edit')) {
            e.target.classList.toggle('active');
            e.target.closest('.diary__product-item').classList.toggle('edit');
            e.target.closest('.diary__product-item').querySelector('[data-product-more]').slideToggle();
        }

        if (e.target.classList.contains('diary__tooltip-close')) {
            e.target.closest('.diary__tooltip').classList.add('closed');
            e.target.closest('.diary__tooltip').classList.remove('visible');
        }

        if (e.target.classList.contains('diary__tooltip-item')) {
            document.querySelector('[name="product-name"]').value = e.target.textContent;
            e.target.closest('.diary__tooltip').classList.remove('visible')
        }

        if (e.target.classList.contains('subscribers__search-filters-btn')) {
            e.target.classList.toggle('active');
            e.target.nextElementSibling?.classList.toggle('active');
        }


        if (e.target.classList.contains('diet__desc-full')) {
            e.target.classList.toggle('active');
            if (e.target.classList.contains('active')) {
                e.target.textContent = "Свернуть";
            } else {
                e.target.textContent = "Развернуть";
            }
            e.target.previousElementSibling?.classList.toggle('active');
        }

        if (e.target.classList.contains('search__bar-close')) {
            document.querySelector('.search').classList.remove('open');
        }
        if (e.target.classList.contains('search-mobile-btn')) {
            document.querySelector('.search').classList.add('open');
        }

        if (e.target.classList.contains('person__menu-btn')) {
            e.target.classList.toggle('active');
            e.target.nextElementSibling?.classList.toggle('active');
        }

        if (e.target.hasAttribute('data-popover-close')) {
            const popover = e.target.closest('[data-popover]');
            if (popover) {
                popover.classList.add('invisible', 'opacity-0');
            }
        }

        if (e.target.classList.contains('diet__favorite')) {
            e.target.classList.toggle('active')
        }

        if (e.target.classList.contains('diet__save')) {
            e.target.classList.toggle('active')
        }

        if (e.target.classList.contains('settings__person-menu-btn')) {
            e.target.classList.toggle('active');
            e.target.nextElementSibling?.classList.toggle('active');
        }

        if (e.target.classList.contains('chat__banner-remove')) {
            e.target.closest('.chat__banner').remove()
        }

        if (e.target.classList.contains('chat-notification-btn')) {
            e.target.classList.toggle('active');
            if (e.target.classList.contains('active')) {
                e.target.textContent = "Включить оповещения";
            } else {
                e.target.textContent = "Отключить оповещения";
            }
        }

        if (e.target.closest('.plan__type-btn')) {

            const button = e.target.closest('.plan__type-btn');
            const tooltip = button.closest('.plan__type').querySelector('.plan__type-tootlip');

            const isOpen = tooltip?.classList.contains('open');
            document.querySelectorAll('.plan__type-tootlip.open').forEach((openTooltip) => {
                const openButton = openTooltip.closest('.plan__type').querySelector('.plan__type-btn');
                openTooltip.classList.remove('open');
                openButton?.classList.remove('active');
            });

            if (!isOpen) {
                button.classList.add('active');
                tooltip?.classList.add('open');
            }

        }

        if (e.target.classList.contains('plan__type-tootlip-close')) {
            const tooltip = e.target.closest('.plan__type-tootlip');
            const button = tooltip.closest('.plan__type').querySelector('.plan__type-btn');
            tooltip.classList.remove('open');
            button?.classList.remove('active');
        }

        if (!e.target.closest('.plan__type')) {
            document.querySelectorAll('.plan__type-tootlip.open').forEach((tooltip) => {
                const button = tooltip.closest('.plan__type').querySelector('.plan__type-btn');

                tooltip.classList.remove('open');
                button?.classList.remove('active');
            });
        }

    })

    if (document.querySelector('.content__recipes-select')) {
        document.querySelector('.content__recipes-select').addEventListener('change', (e) => {
            let idSection = e.target.value;
            document.querySelectorAll(".content__recipes").forEach(contentRecipeBlock => {
                contentRecipeBlock.classList.remove('active');
            })
            document.getElementById(idSection)?.classList.add('active');
        })
    }

    if (document.querySelector('.diary__product-slider')) {
        new Swiper('.diary__product-slider', {
            speed: 800,
            slidesPerView: 1,
            loop: true,
            navigation: {
                nextEl: '.diary__product-next',
                prevEl: '.diary__product-prev',
            },
        });
    }

    if (document.querySelectorAll('[name="product-name"]').length > 0) {

        document.querySelectorAll('[name="product-name"]').forEach(productNameInput => {

            productNameInput.addEventListener('input', (e) => {

                if (e.target.value.length > 0) {
                    e.target.nextElementSibling?.classList.add('visible');
                } else {
                    e.target.nextElementSibling?.classList.remove('visible');
                    e.target.nextElementSibling?.classList.remove('closed');
                }
            })
        })
    }

    if (document.querySelector('.person__side-checklist')) {

        new Swiper('.person__side-checklist', {
            speed: 800,
            slidesPerView: "auto",
            spaceBetween: 8,
            grabCursor: true
        });


    }

    if (document.querySelector('.person__certs')) {

        const thumbSlider = new Swiper('.person__certs-thumbs-slider', {
            slidesPerView: 4,
            spaceBetween: 12,
            direction: "vertical",
            navigation: {
                nextEl: '.person__certs-next',
                prevEl: '.person__certs-prev',
            },
        })

        const mainSlider = new Swiper('.person__certs-main', {
            speed: 800,
            slidesPerView: 1,
            navigation: {
                nextEl: '.person__certs-next',
                prevEl: '.person__certs-prev',
            },
            thumbs: {
                swiper: thumbSlider
            }
        });


    }

    if (document.querySelectorAll('.diary__tooltip').length > 0) {

        document.querySelectorAll('.diary__tooltip').forEach(slider => {

            const prev = slider.querySelector('.diary__tooltip-prev');
            const next = slider.querySelector('.diary__tooltip-next');
            const content = slider.querySelector('.diary__tooltip-content');

            new Swiper(content, {
                speed: 800,
                slidesPerView: 5,
                direction: "vertical",
                navigation: {
                    nextEl: next,
                    prevEl: prev,
                },
            });

        })


    }

    if (document.querySelectorAll('.diary__product-item.edit').length > 0) {
        document.querySelectorAll('.diary__product-item.edit').forEach(productItem => {
            productItem.querySelectorAll('.diary__product-edit').forEach(editBtn => {
                editBtn.classList.add('active');
            })
            productItem.querySelector('[data-product-more]').slideDown(0);
        })
    }


    function getIndexInParent(node) {
        var children = node.parentNode.childNodes;
        var num = 0;
        for (var i = 0; i < children.length; i++) {
            if (children[i] == node) return num;
            if (children[i].nodeType == 1) num++;
        }
        return -1;
    }

    function hideCurrentChat() {
        document.querySelectorAll('.chat__contacts-item').forEach(contact => contact.classList.remove('active'));
        document.querySelectorAll('.chat__block').forEach(chatBlock => chatBlock.classList.remove('active'));
    }


    if (document.querySelector('.search__input')) {

        document.querySelector('.search__input').addEventListener('focus', (e) => {
            document.querySelector('.search').classList.add('open');
        });
        document.querySelector('.search__bar').addEventListener('mouseleave', (e) => {
            document.querySelector('.search').classList.remove('open');
        });
    }



    // badges

    if (document.querySelector('.arm__badges-selected')) {
        const checkboxes = document.querySelectorAll('.arm__table input[type="checkbox"]');
        const selectAllCheckbox = document.querySelector('input[type="checkbox"][value="all"]');
        const badgesSelectedBlock = document.querySelector('.arm__badges-selected');
        const selectedQuantitySpan = document.querySelectorAll('.arm__badges-selected-quantity');
        const badgesAppointmentBlock = document.querySelector('.arm__badges-appointment');
        const badgesSelectedMain = document.querySelector('.arm__badges-selected-main');
        const addBadgesBtn = document.querySelector('.add-badges-btn');
        const backBtns = document.querySelectorAll('.arm__badges-appointment-back');
        const badgesSelect = document.querySelector('select[name="badges"]');
        const applyBtn = document.querySelector('.arm__badges-appointment-btn');

        function updateSelectedConsultants() {
            const selectedCheckboxes = document.querySelectorAll('.arm__table input[type="checkbox"]:checked:not([value="all"])');
            const selectedCount = selectedCheckboxes.length;


            selectedQuantitySpan.forEach(span => {
                span.textContent = selectedCount;
            });


            if (selectedCount > 0) {
                badgesSelectedBlock.classList.add('visible');
            } else {
                badgesSelectedBlock.classList.remove('visible');
            }
        }


        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {

                if (this.value === 'all') {
                    const allChecked = this.checked;
                    checkboxes.forEach(cb => {
                        if (cb !== selectAllCheckbox) {
                            cb.checked = allChecked;
                        }
                    });
                }

                updateSelectedConsultants();
            });
        });


        addBadgesBtn?.addEventListener('click', function () {
            badgesSelectedMain.classList.add('hidden');
            badgesAppointmentBlock.classList.remove('hidden');
        });


        backBtns?.forEach(btn => {
            btn.addEventListener('click', function () {
                badgesSelectedMain.classList.remove('hidden');
                badgesAppointmentBlock.classList.add('hidden');
            });
        });

        badgesSelect?.addEventListener('change', function () {
            if (badgesSelect.value === "0") {
                applyBtn.setAttribute('disabled', 'disabled');
            } else {
                applyBtn.removeAttribute('disabled');
            }
        });
    }

    // создание приёма пиши - страница diet.html
    document.querySelectorAll('.diet__day-form')?.forEach(form => {
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            const name = form.elements.name.value.trim();
            const portion = form.elements.ccal.value.trim();
            const unit = form.elements.unit.value;


            if (name && portion) {

                const newRow = document.createElement('div');
                newRow.classList.add('diet__day-row');

                newRow.innerHTML = `
                    <span>${name}</span>
                    <span>${portion} ${unit}</span>
                    <button type="button" class="remove-row icon-delete"></button>
                `;

                form.insertBefore(newRow, form.firstChild);


                form.elements.name.value = '';
                form.elements.ccal.value = '';

                newRow.querySelector('.remove-row').addEventListener('click', function () {
                    newRow.remove();
                });
            } else {
                alert("Заполните все поля!");
            }
        });
    });





});

