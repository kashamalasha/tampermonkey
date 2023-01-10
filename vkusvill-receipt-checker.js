// ==UserScript==
// @name         Vkusvill receipt check
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Script helps to control items in your receipts
// @author       kashamalasha
// @include      /^https:\/\/vkusvill\.ru\/personal*/
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
    .receipt-item-checked {
      background-color: lightgreen;
    }`, sheet.cssRules.length);

    const addButtonsHandler = () => {
      const buttons = document.querySelectorAll(`.receipt-check-button`);
      Array.from(buttons).forEach(button => {
          button.addEventListener(`click`, (evt) => {
            let parent = '';

            if (evt.target.parentElement.tagName != `TD`) {
              parent = evt.target.parentElement;
            } else {
              parent = evt.target.parentElement.parentElement;
            }
              parent.classList.toggle(`receipt-item-checked`);
              evt.target.innerText = (evt.target.innerText === `+`) ? `-` : `+`;
          });
      });
    }

    const checkButton = document.createElement(`button`);
    checkButton.classList.add(`receipt-check-button`);
    checkButton.innerText = `+`;

    const receiptOrder = document.querySelectorAll(`.lk-order-detail-products-list__item`);

    if (receiptOrder.length > 0) {
      Array.from(receiptOrder).forEach(item => {
        item.append(checkButton.cloneNode(true));
      });
      addButtonsHandler();
    }

    let receiptModal = document.querySelector(`#js-lk-modal-check`);

    const modalObserver = new IntersectionObserver((entries) => {
      if(entries[0].isIntersecting) {
        const receiptItemRows = receiptModal.querySelectorAll(`.js-datalayer-catalog-list-item`);
        const receiptButtonCell = document.createElement(`td`);
        receiptButtonCell.append(checkButton.cloneNode(true));
        
        Array.from(receiptItemRows).forEach(item => {
          item.append(receiptButtonCell.cloneNode(true));
        });
        
        addButtonsHandler();
      }
    });

    modalObserver.observe(receiptModal);

})();
