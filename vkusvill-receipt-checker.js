// ==UserScript==
// @name         Vkusvill receipt check
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Script helps to control items in your order
// @author       kashamalasha
// @include      /^https:\/\/vkusvill\.ru\/personal\/orders\/\?id*/
// @icon         https://vkusvill.ru/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const sheet = window.document.styleSheets[0];

    sheet.insertRule(`
    .receipt-check-button {
      width: 20px;
      height: 20px;

      margin: 5px;

      border: none;
      border-radius: 5px;
      background-color: var(--blue1);
      color: white;
      font-weight: 800;
    }`, sheet.cssRules.length);

    sheet.insertRule(`
    .receipt-check-button:hover {
      background-color: var(--berry4);
    }`, sheet.cssRules.length);

    sheet.insertRule(`
    .receipt-check-button:active {
      background-color: var(--green500);
    }`, sheet.cssRules.length);

    sheet.insertRule(`
    .lk-order-detail-products-list__item--checked {
      background-color: lightgreen;
    }`, sheet.cssRules.length);

    const checkButton = document.createElement(`button`);
    checkButton.classList.add(`receipt-check-button`);
    checkButton.innerText = `+`;

    const products = document.querySelectorAll(`.lk-order-detail-products-list__item`);

    Array.from(products).forEach(i => {
        i.append(checkButton.cloneNode(true));
    });

    const buttons = document.querySelectorAll(`.receipt-check-button`);

    Array.from(buttons).forEach(button => {
        button.addEventListener(`click`, (evt) => {
            evt.target.parentElement.classList.toggle(`lk-order-detail-products-list__item--checked`);
            evt.target.innerText = (evt.target.innerText === `+`) ? `-` : `+`;
        });
    });

})();