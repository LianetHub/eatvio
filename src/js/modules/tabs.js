export const tabs = () => {

    let tabs = []

    if (document.querySelectorAll('[data-tabs]').length > 0) {
        document.querySelectorAll('[data-tabs]').forEach(tabSection => {
            tabs = Array.from(tabSection.querySelectorAll('[role="tab"]'));
            initTabs(tabs)
        });
        return
    }
    tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    initTabs(tabs)



    function initTabs(tabs) {
        const hideTabpanel = 'tabpanel--hidden'
        let firstTab = null
        let lastTab = null
        let tabpanels = []

        tabpanels = tabs.map((tab) => {
            const tabpanel = document.getElementById(tab.getAttribute('aria-controls'))
            tab.tabIndex = -1
            tab.setAttribute('aria-selected', 'false')
            tab.addEventListener('keydown', onKeydown)
            tab.addEventListener('click', onClick)

            if (!firstTab) {
                firstTab = tab
            }

            lastTab = tab

            return tabpanel
        })

        setSelectedTab(firstTab, false)

        function setSelectedTab(currentTab, setFocus = true) {
            tabs.forEach((tab, i) => {
                if (currentTab === tab) {
                    tab.setAttribute('aria-selected', 'true')
                    tab.removeAttribute('tabindex')
                    tabpanels[i].classList.remove('tabpanel--hidden')

                    if (setFocus) {
                        tab.focus()
                    }
                }

                else {
                    tab.setAttribute('aria-selected', 'false')
                    tab.tabIndex = -1
                    tabpanels[i].classList.add('tabpanel--hidden')
                }
            })
        }

        function setSelectedToPreviousTab(currentTab) {
            const index = tabs.indexOf(currentTab)
            setSelectedTab(index === 0 ? lastTab : tabs[index - 1])
        }

        function setSelectedToNextTab(currentTab) {
            const index = tabs.indexOf(currentTab)
            setSelectedTab(index === tabs.length - 1 ? firstTab : tabs[index + 1])
        }

        function onKeydown(event) {
            const target = event.currentTarget
            let flag = false

            switch (event.key) {
                case 'ArrowLeft':
                    setSelectedToPreviousTab(target)
                    flag = true
                    break
                case 'ArrowRight':
                    setSelectedToNextTab(target)
                    flag = true
                    break
                default:
                    break
            }

            if (flag) {
                event.stopPropagation()
                event.preventDefault()
            }
        }

        function onClick(event) {
            setSelectedTab(event.currentTarget)
        }
    }



}