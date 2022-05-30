// ==UserScript==
// @name         Jira Report Highlighter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @updateURL    https://raw.githubusercontent.com/kashamalasha/tampermonkey/master/jira-report-highlighter.js
// @downloadURL  https://raw.githubusercontent.com/kashamalasha/tampermonkey/master/jira-report-highlighter.js
// @description  Script helps to highlight rows in Jira report
// @author       You
// @include      /^https:\/\/jira\.tcsbank\.ru\/secure\/TimesheetReport\.jspa.*/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=attlassian.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const sheet = window.document.styleSheets[0];

    sheet.insertRule(`
    .context-menu {
      display: none;
      position: absolute;
      z-index: 10;
      padding: 12px 0;
      width: 180px;
      background-color: #fff;
      border: solid 1px #dfdfdf;
      border-radius: 5px;
      box-shadow: 5px 5px 5px #cfcfcf;
      font-family: inherit;
      font-size: inherit;
    }`, sheet.cssRules.length);

    sheet.insertRule(`
    .context-menu--active {
      display: block;
    }`, sheet.cssRules.length);

    sheet.insertRule(`
    .context-menu__items {
      list-style: none;
      margin: 0;
      padding: 0;
    }`, sheet.cssRules.length);

    sheet.insertRule(`
    .context-menu__item {
      display: block;
      margin-bottom: 4px;
    }`, sheet.cssRules.length);

    sheet.insertRule(`
    .context-menu__item:last-child {
      margin-bottom: 0;
    }`, sheet.cssRules.length);

    sheet.insertRule(`
    .context-menu__link {
      display: block;
      padding: 4px 12px;
      color: #0052cc;
      text-decoration: none;
    }`, sheet.cssRules.length);

    sheet.insertRule(`
    .context-menu__link:hover {
      color: #fff;
      background-color: #0066aa;
      text-decoration: none;
    }`, sheet.cssRules.length);

    sheet.insertRule(`
    .list-to-yellow {
      background-color: #fafa6a !important;
    }`, sheet.cssRules.length);

    sheet.insertRule(`
    .list-to-green {
       background-color: #b2fa6a !important;
    }`, sheet.cssRules.length);


    const popup = document.createElement("nav");
    popup.classList.add('context-menu');

    popup.innerHTML = `
    <ul class="context-menu__items">
        <li class="context-menu__item">
            <a href="#" class="context-menu__link" data-action="To-Yellow">
                <i class="fa fa-eye"></i> Подсветить желтым
            </a>
        </li>
        <li class="context-menu__item">
            <a href="#" class="context-menu__link" data-action="To-Green">
                <i class="fa fa-edit"></i> Подсветить зеленым
            </a>
        </li>
        <li class="context-menu__item">
            <a href="#" class="context-menu__link" data-action="Clear">
                <i class="fa fa-times"></i> Очистить подсветку
            </a>
        </li>
    </ul>`;

    const body = document.querySelector('body');
    body.append(popup);

    const record = document.querySelector('.rowAlternate');
    const table = record.parentElement;
    const records = Array.from(table.children);
    records.forEach(element => element.classList.add('record'));

    ///////////////////////////////////
    ///////////////////////////////////
    //
    // H E L P E R   F U N C T I O N S
    //
    ///////////////////////////////////
    ///////////////////////////////////

    /**
     * some helper functions here
     */

    function clickInsideElement(e, className) {
        var el = e.srcElement || e.target;

        if (el.classList.contains(className)) {
            return el;
        } else {
            while (el.parentNode) {
                el = el.parentNode;
                if (el.classList && el.classList.contains(className)) {
                    return el;
                }
            }
        }
        return false;
    }

    function getPosition(e) {
        var posx = 0,
            posy = 0;

        if (!e) {
            e = window.event;
        }

        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft +
                document.dElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop +
                document.dElement.scrollTop;
        }

        return {
            x: posx,
            y: posy
        };
    }

    ///////////////////////////////////
    ///////////////////////////////////
    //
    // C O R E   F U N C T I O N S
    //
    ///////////////////////////////////
    ///////////////////////////////////

    /**
     * Variables
     */

    var listItemClassName = "record",
        listItemRowAlternate = false,
        listItemInContext,

        contextMenuClassName = "context-menu",
        contextMenuItemClassName = "context-menu__item",
        contextMenuLinkClassName = "context-menu__link",
        contextMenuActive = "context-menu--active",

        // issueLinkClassName = "issue-link",

        menu = document.querySelector(".context-menu"),
        menuItems = menu.querySelectorAll(".context-menu__item"),
        menuState = false,
        menuPosition,
        menuPositionX,
        menuPositionY,
        menuWidth,
        menuHeight,

        windowWidth,
        windowHeight;

    /**
     * Positioning the menu
     */

    function positionMenu(e) {
        menuPosition = getPosition(e);

        menu.style.left = menuPosition.x;
        menu.style.top = menuPosition.y;

        menuWidth = menu.offsetWidth + 4;
        menuHeight = menu.offsetHeight + 4;

        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;

        if ((windowWidth - menuPosition.x) < menuWidth) {
            menu.style.left = windowWidth - menuWidth + "px";
        } else {
            //TODO: -- ошибка позиционирования - проверить
            menu.style.left = menuPosition.x + "px";
        }

        // поправка на скролл документа
        windowHeight += window.scrollY;

        if ((windowHeight - menuPosition.y) < menuHeight) {
            menu.style.top = windowHeight - menuHeight + "px";
        } else {
            menu.style.top = menuPosition.y + "px";
        }
    }

    /**
     * Turns the custom menu ON
     */

    function toggleMenuOn() {
        if (!menuState) {
            menuState = true;
            menu.classList.add(contextMenuActive);
        }
    }

    /**
     * Turns the custom menu OFF
     */

    function toggleMenuOff() {
        if (menuState) {
            menuState = false;
            menu.classList.remove(contextMenuActive);
        }
    }


    /**
     * Listens the context menu items
     */

    function menuItemListener(link) {

        var dataAction = link.getAttribute("data-action");

        const removeRowAlternate = function() {
            if (listItemInContext.classList.contains("rowAlternate")) {
                listItemRowAlternate = true;
                listItemInContext.classList.remove("rowAlternate");
            }
        }

        const addRowAlternate = function() {
            if (listItemRowAlternate) {
                listItemInContext.classList.add("rowAlternate");
                listItemRowAlternate = false;
            }
        }

        if (dataAction === "To-Yellow") {
            removeRowAlternate();
            listItemInContext.classList.remove("list-to-green");
            listItemInContext.classList.add("list-to-yellow");
        } else if (dataAction === "To-Green") {
            removeRowAlternate();
            listItemInContext.classList.remove("list-to-yellow");
            listItemInContext.classList.add("list-to-green");
        } else {
            addRowAlternate();
            listItemInContext.classList.remove("list-to-yellow");
            listItemInContext.classList.remove("list-to-green");
        }

        toggleMenuOff();
    }

    /**
     * Listens for contextmenu events
     */

    function contextListener() {
        document.addEventListener("contextmenu", function (e) {
            listItemInContext = clickInsideElement(e, listItemClassName);

            if (listItemInContext) {
                e.preventDefault();
                toggleMenuOn();
                positionMenu(e);
            } else {
                listItemInContext = null;
                toggleMenuOff();
            }
        });
    }

    /**
     * Listens for click events
     */

    function clickListener() {
        document.addEventListener("click", function (e) {
            const clickElIsLink = clickInsideElement(e, contextMenuLinkClassName);
            let button;

            if (clickElIsLink) {
                e.preventDefault();
                menuItemListener(clickElIsLink);
            } else {
                button = e.which || e.button;
                if (button === 1) {
                    toggleMenuOff();
                }
            }
        });
    }

    /**
     * Listens for keyup events
     */

    function keyupListener() {
        window.onkeyup = function (e) {
            if (e.key === 'Escape') {
                toggleMenuOff();
            }
        };
    }

    /**
     * Listens for resize of screen
     */

    function resizeListener() {
        window.onresize = function (e) {
            toggleMenuOff();
        };
    }

    /**
     * Initialise application code
     */

    contextListener();
    clickListener();
    keyupListener();
    resizeListener();

})();